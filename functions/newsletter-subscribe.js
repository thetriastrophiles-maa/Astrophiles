const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Helper function to store subscription in Google Sheets
async function storeInGoogleSheets(name, email) {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY;
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (!apiKey || !sheetId) {
        console.log('Google Sheets not configured, skipping storage');
        return null;
    }

    try {
        const subscriptionData = {
            name,
            email,
            subscribedAt: new Date().toISOString(),
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: new Date().toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
        };

        // Initialize Google Sheets API with API key
        const sheets = google.sheets({ version: 'v4', auth: apiKey });
        
        // Prepare the row data
        const values = [[
            subscriptionData.date,
            subscriptionData.time,
            subscriptionData.name,
            subscriptionData.email,
            subscriptionData.subscribedAt
        ]];

        // Check if sheet has headers, if not add them
        try {
            const headerCheck = await sheets.spreadsheets.values.get({
                spreadsheetId: sheetId,
                range: 'A1:E1',
            });

            // If no headers exist, add them
            if (!headerCheck.data.values || headerCheck.data.values.length === 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId: sheetId,
                    range: 'A1:E1',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [['Date', 'Time', 'Name', 'Email', 'Timestamp']],
                    },
                });
            }
        } catch (headerError) {
            // If range doesn't exist, create headers
            console.log('Adding headers to sheet');
            await sheets.spreadsheets.values.update({
                spreadsheetId: sheetId,
                range: 'A1:E1',
                valueInputOption: 'RAW',
                resource: {
                    values: [['Date', 'Time', 'Name', 'Email', 'Timestamp']],
                },
            });
        }

        // Append the new subscription data
        await sheets.spreadsheets.values.append({
            spreadsheetId: sheetId,
            range: 'A:E', // Append to columns A through E
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values,
            },
        });

        console.log('Subscription stored in Google Sheets successfully');
        return subscriptionData;
    } catch (error) {
        console.error('Error storing subscription in Google Sheets:', error.message);
        // Don't fail the subscription if Google Sheets fails
        // Just log the error and continue
        return null;
    }
}

// Helper function to send admin notification email
async function sendAdminNotification(name, email, transporter, fromEmail) {
    const adminEmail = process.env.ADMIN_EMAIL || fromEmail;
    
    if (!adminEmail) {
        console.log('Admin email not configured, skipping notification');
        return;
    }

    const adminMailOptions = {
        from: `"Astrophiles Newsletter" <${fromEmail}>`,
        to: adminEmail,
        subject: `New Newsletter Subscription: ${name}`,
        html: `
            <h2>New Newsletter Subscription</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
        `,
        text: `
            New Newsletter Subscription
            
            Name: ${name}
            Email: ${email}
            Subscribed at: ${new Date().toLocaleString()}
        `,
    };

    try {
        await transporter.sendMail(adminMailOptions);
        console.log('Admin notification sent');
    } catch (error) {
        console.error('Failed to send admin notification:', error);
        // Don't fail the subscription if admin email fails
    }
}

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: '',
        };
    }

    try {
        const { name, email } = JSON.parse(event.body);

        // Validate input
        if (!name || !email) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: 'Name and email are required' }),
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ error: 'Invalid email format' }),
            };
        }

        // Get SMTP configuration from environment variables
        const smtpConfig = {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };

        const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;

        // Store subscription data in Google Sheets (always try, even if email fails)
        const storedInSheets = await storeInGoogleSheets(name, email);

        // Check if email credentials are configured
        if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
            console.error('SMTP credentials not configured');
            // Still return success if stored in sheets
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ 
                    success: true,
                    message: storedInSheets 
                        ? 'Subscription received and stored! (Email sending not configured)' 
                        : 'Subscription received! (Email and storage not configured)'
                }),
            };
        }

        // Create transporter
        const transporter = nodemailer.createTransport(smtpConfig);

        // Send admin notification email (if configured)
        await sendAdminNotification(name, email, transporter, fromEmail);

        // Email content
        const mailOptions = {
            from: `"Astrophiles" <${fromEmail}>`,
            to: email,
            subject: 'Thank You for Subscribing to Astrophiles Newsletter!',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background: linear-gradient(to bottom, #020617, #0f172a);
                            color: #cbd5e1;
                        }
                        .container {
                            background: rgba(30, 41, 59, 0.8);
                            padding: 30px;
                            border-radius: 10px;
                            border: 1px solid rgba(99, 102, 241, 0.3);
                        }
                        h1 {
                            color: #6366f1;
                            text-align: center;
                        }
                        p {
                            margin: 15px 0;
                        }
                        .footer {
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 1px solid rgba(99, 102, 241, 0.3);
                            text-align: center;
                            font-size: 0.9em;
                            color: #94a3b8;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>🌟 Welcome to Astrophiles! 🌟</h1>
                        <p>Dear ${name},</p>
                        <p>Thank you for subscribing to our newsletter! We're thrilled to have you join our cosmic community.</p>
                        <p>You'll now receive:</p>
                        <ul>
                            <li>✨ Latest space news and discoveries</li>
                            <li>🔭 Astronomical events and viewing opportunities</li>
                            <li>🌌 Fascinating articles about the universe</li>
                            <li>🚀 Updates on space missions and research</li>
                        </ul>
                        <p>Get ready to explore the wonders of the universe with us!</p>
                        <p>Clear skies and happy stargazing!</p>
                        <div class="footer">
                            <p>Best regards,<br>The Astrophiles Team</p>
                            <p>Exploring the cosmos together 🌌</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            text: `
                Welcome to Astrophiles!

                Dear ${name},

                Thank you for subscribing to our newsletter! We're thrilled to have you join our cosmic community.

                You'll now receive:
                - Latest space news and discoveries
                - Astronomical events and viewing opportunities
                - Fascinating articles about the universe
                - Updates on space missions and research

                Get ready to explore the wonders of the universe with us!

                Clear skies and happy stargazing!

                Best regards,
                The Astrophiles Team
                Exploring the cosmos together
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ 
                success: true,
                message: 'Thank you for subscribing! Check your email for confirmation.'
            }),
        };

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ 
                error: 'Failed to process subscription',
                message: error.message 
            }),
        };
    }
};


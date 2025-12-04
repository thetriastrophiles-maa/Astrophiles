const nodemailer = require('nodemailer');

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

        // Check if email credentials are configured
        if (!smtpConfig.auth.user || !smtpConfig.auth.pass) {
            console.error('SMTP credentials not configured');
            // Still return success to user, but log the error
            // In production, you might want to store the subscription in a database
            return {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ 
                    success: true,
                    message: 'Subscription received (email sending not configured)'
                }),
            };
        }

        // Create transporter
        const transporter = nodemailer.createTransport(smtpConfig);

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


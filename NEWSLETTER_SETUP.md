# Newsletter Email Setup Guide

To enable email sending for newsletter subscriptions, you need to configure SMTP settings in your Netlify environment variables.

## Where Subscriptions Are Stored:

1. **Netlify Function Logs**: All subscriptions are logged in Netlify function logs (accessible in your Netlify dashboard under Functions → Logs)

2. **Admin Email Notifications**: You'll receive an email notification for each new subscription (if configured)

3. **Optional: Google Sheets** (for easy viewing/managing):
   - You can integrate Google Sheets API to store subscriptions in a spreadsheet
   - See "Google Sheets Integration" section below

## Steps to Configure:

1. **Go to your Netlify Dashboard**
   - Navigate to your site
   - Go to **Site settings** → **Environment variables**

2. **Add the following environment variables:**

   **Required for email sending:**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

   **Optional - Admin notifications:**
   ```
   ADMIN_EMAIL=admin@yourdomain.com
   ```
   (If not set, notifications will be sent to FROM_EMAIL)

   **Note:** For Gmail, you'll need to:
   - Enable 2-Step Verification on your Google account
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password (not your regular password) for `SMTP_PASS`

   For **Other SMTP Services** (SendGrid, Mailgun, etc.):
   ```
   SMTP_HOST=your-smtp-host.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Redeploy your site** after adding the environment variables

## Viewing Subscriptions:

### Option 1: Netlify Function Logs
- Go to your Netlify Dashboard
- Navigate to **Functions** → **newsletter-subscribe**
- Click on **Logs** tab
- You'll see all subscription data logged there

### Option 2: Admin Email Notifications
- Check your ADMIN_EMAIL inbox for notifications about each new subscription

### Option 3: Google Sheets Integration (Optional)
To store subscriptions in Google Sheets for easy viewing:

1. Create a Google Sheet
2. Get your Google Sheets API credentials
3. Add these environment variables:
   ```
   GOOGLE_SHEETS_API_KEY=your-api-key
   GOOGLE_SHEET_ID=your-sheet-id
   ```
4. Uncomment the Google Sheets code in `functions/newsletter-subscribe.js`

## Testing:

After deployment, test the newsletter subscription form. Users will receive a thank you email when they subscribe, and you'll receive an admin notification.

## Troubleshooting:

- If emails aren't sending, check the Netlify function logs in your dashboard
- Make sure all environment variables are set correctly
- For Gmail, ensure you're using an App Password, not your regular password
- Check that your SMTP service allows connections from Netlify's servers
- View subscription logs in Netlify Dashboard → Functions → Logs


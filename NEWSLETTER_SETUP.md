# Newsletter Email Setup Guide

To enable email sending for newsletter subscriptions, you need to configure SMTP settings in your Netlify environment variables.

## Steps to Configure:

1. **Go to your Netlify Dashboard**
   - Navigate to your site
   - Go to **Site settings** → **Environment variables**

2. **Add the following environment variables:**

   For **Gmail** (recommended for testing):
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FROM_EMAIL=your-email@gmail.com
   ```

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

## Testing:

After deployment, test the newsletter subscription form. Users will receive a thank you email when they subscribe.

## Troubleshooting:

- If emails aren't sending, check the Netlify function logs in your dashboard
- Make sure all environment variables are set correctly
- For Gmail, ensure you're using an App Password, not your regular password
- Check that your SMTP service allows connections from Netlify's servers


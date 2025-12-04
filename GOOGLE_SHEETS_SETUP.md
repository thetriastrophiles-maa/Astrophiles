# Google Sheets Setup Guide

This guide will help you set up Google Sheets to store newsletter subscriptions.

## Prerequisites

1. A Google account
2. A Google Sheet created for storing subscriptions

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Newsletter Subscriptions" or similar
4. The sheet will automatically have headers added: Date, Time, Name, Email, Timestamp

## Step 2: Get Your Sheet ID

1. Open your Google Sheet
2. Look at the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
3. Copy the `SHEET_ID_HERE` part - this is your Sheet ID
4. Add it to Netlify environment variables as `GOOGLE_SHEET_ID`

## Step 3: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 4: Create API Credentials

### Option A: API Key (Simpler, for public sheets)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. **Important**: Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Save
5. Add the API key to Netlify environment variables as `GOOGLE_SHEETS_API_KEY`

**Note**: API keys work best if your sheet is publicly editable. For private sheets, use Option B.

### Option B: Service Account (More secure, for private sheets)

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "Service Account"
3. Fill in the service account details
4. Click "Create and Continue"
5. Grant the service account access (optional for now)
6. Click "Done"
7. Click on the created service account
8. Go to "Keys" tab → "Add Key" → "Create new key"
9. Choose "JSON" format
10. Download the JSON file
11. Share your Google Sheet with the service account email (found in the JSON file)
12. Add the JSON content to Netlify environment variable as `GOOGLE_SERVICE_ACCOUNT` (if implementing this)

## Step 5: Configure Netlify

1. Go to Netlify Dashboard → Your Site → Site settings → Environment variables
2. Add:
   - `GOOGLE_SHEETS_API_KEY` = Your API key from Step 4
   - `GOOGLE_SHEET_ID` = Your Sheet ID from Step 2
3. Redeploy your site

## Step 6: Test

1. Submit a test subscription through your newsletter form
2. Check your Google Sheet - you should see a new row with:
   - Date
   - Time
   - Name
   - Email
   - Timestamp

## Troubleshooting

### "The caller does not have permission" error

- **Solution**: Make sure your Google Sheet is shared with the service account email (if using Service Account) OR make it publicly editable (if using API key)

### "API key not valid" error

- **Solution**: Check that:
  - The API key is correct
  - Google Sheets API is enabled in Google Cloud Console
  - The API key restrictions allow Google Sheets API

### "Unable to parse range" error

- **Solution**: The sheet should be empty or have headers. The function will automatically add headers if the sheet is empty.

### Subscriptions not appearing in sheet

- Check Netlify function logs for errors
- Verify environment variables are set correctly
- Make sure the Sheet ID is correct (from the URL)

## Viewing Your Subscriptions

Simply open your Google Sheet to see all subscriptions in real-time. The sheet will have:
- **Column A**: Date (e.g., "January 15, 2025")
- **Column B**: Time (e.g., "02:30 PM")
- **Column C**: Name
- **Column D**: Email
- **Column E**: Full ISO timestamp

You can sort, filter, and export this data as needed!


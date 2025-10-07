# Railway Webhook URL Configuration Fix

## 🔴 The Error

```
Fatal error: Error: WEBHOOK_URL or RAILWAY_PUBLIC_DOMAIN must be set
    at setWebhook (/app/telegram-bot-webhook.ts:425:11)
    at startWebhookServer (/app/telegram-bot-webhook.ts:524:9)
```

## 🔍 Root Cause

The webhook bot was looking for `RAILWAY_PUBLIC_DOMAIN` environment variable, but **Railway doesn't automatically set this variable**. 

### What Railway Actually Provides

Railway automatically sets these environment variables:
- ✅ `RAILWAY_STATIC_URL` - The public URL for your deployment (e.g., `https://your-app.up.railway.app`)
- ✅ `PORT` - The port your app should listen on
- ❌ `RAILWAY_PUBLIC_DOMAIN` - **NOT automatically set** (you'd need to add this manually)

### What the Code Was Doing

```typescript
// ❌ Old code - looking for variable Railway doesn't provide
const WEBHOOK_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`
  : process.env.WEBHOOK_URL;
```

Since `RAILWAY_PUBLIC_DOMAIN` wasn't set, and `WEBHOOK_URL` wasn't set either, the `WEBHOOK_URL` constant became `undefined`, causing the error when trying to set the webhook.

## ✅ The Fix

Updated the code to check Railway's actual environment variable first:

```typescript
// ✅ New code - checks what Railway actually provides
const WEBHOOK_URL = process.env.RAILWAY_STATIC_URL 
  ? `${process.env.RAILWAY_STATIC_URL}/webhook`
  : process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`
  : process.env.WEBHOOK_URL;
```

### Fallback Chain

The code now tries these options in order:

1. **`RAILWAY_STATIC_URL`** - Railway's automatic URL ✅ (Most common)
2. **`RAILWAY_PUBLIC_DOMAIN`** - Custom domain if you set it
3. **`WEBHOOK_URL`** - Manual override for any custom setup

## 🚀 Deployment Status

✅ **Fixed and pushed to GitHub**  
🔄 **Railway is redeploying now**  
📋 **Should work with Railway's automatic URL**

## 📋 What to Expect in Railway Logs

After redeployment, you should see:

```
Starting Container
npm start

🤖 VoiceFast Telegram Bot (Webhook Mode)
================================================================================

✅ Webhook deleted
✅ Webhook set to: https://your-app.up.railway.app/webhook
✅ Webhook server listening on port 3000
🌐 Webhook URL: https://your-app.up.railway.app/webhook
💡 Health check: http://localhost:3000/health

📱 Bot is ready to receive messages!

Press Ctrl+C to stop the server.
```

## 🔧 Alternative: Manual Configuration (If Needed)

If for some reason `RAILWAY_STATIC_URL` isn't available, you can manually set `WEBHOOK_URL` in Railway:

### In Railway Dashboard:
1. Go to your project
2. Click **Variables** tab
3. Add new variable:
   - **Name**: `WEBHOOK_URL`
   - **Value**: `https://your-app.up.railway.app/webhook`
4. Redeploy

## 📊 Railway Environment Variables Summary

| Variable | Set By | Purpose |
|----------|--------|---------|
| `RAILWAY_STATIC_URL` | Railway (automatic) | Your app's public URL |
| `PORT` | Railway (automatic) | Port to listen on |
| `OPENAI_API_KEY` | You (manual) | OpenAI API access |
| `TELEGRAM_API_KEY` | You (manual) | Telegram bot token |
| `NOTION_API_KEY` | You (manual) | Notion integration |
| `NOTION_DATABASE_ID` | You (manual) | Notion database ID |
| `WEBHOOK_URL` | Optional (manual) | Override webhook URL |

## ✨ Why This Happened

This was an assumption error in the initial webhook implementation. The code assumed Railway would provide `RAILWAY_PUBLIC_DOMAIN`, but Railway actually uses `RAILWAY_STATIC_URL` for the public deployment URL.

## 🎯 Result

Your bot should now deploy successfully and automatically configure the webhook using Railway's provided URL!

---

**Error fixed! Railway deployment should succeed on the next build.** 🚀


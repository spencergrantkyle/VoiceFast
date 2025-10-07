# Getting Started with VoiceFast

Quick setup guide to get your bot running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- OpenAI API key
- Telegram bot token  
- Notion integration setup

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Required variables:
- `OPENAI_API_KEY` - From [OpenAI Platform](https://platform.openai.com/api-keys)
- `TELEGRAM_API_KEY` - From [@BotFather](https://t.me/BotFather) on Telegram
- `NOTION_API_KEY` - From [Notion Integrations](https://www.notion.so/my-integrations)
- `NOTION_DATABASE_ID` - Your Notion database ID

### 3. Get Your Telegram Chat ID (Optional)

```bash
npm run get-chat-id
```

Send any message to your bot, and the script will show your chat ID.

### 4. Start the Bot

```bash
npm run bot
```

You should see:
```
🤖 VoiceFast Telegram Bot Server Starting...
✅ Bot is online and listening for NEW messages only!
```

### 5. Test It

1. Open Telegram and find your bot
2. Send a voice message describing a problem
3. Bot will:
   - Transcribe your voice
   - Extract problems and details
   - Research solutions
   - Save to Notion
   - Send you results + Notion link

## Common Issues

### "Bot is not responding"
- Check `TELEGRAM_API_KEY` is correct
- Verify bot is running (see console)
- Make sure you're messaging the correct bot

### "Transcription failed"
- Verify `OPENAI_API_KEY` is valid
- Check your OpenAI account has credits
- Ensure voice message isn't too long

### "Notion save failed"
- Run setup test: `npm run test-notion-save`
- Verify `NOTION_DATABASE_ID` is correct
- Ensure database is shared with your integration

## Next Steps

- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md) for Railway setup
- **Full Documentation**: Check `docs/` folder for detailed guides
- **Customization**: Modify `agent.ts` to change analysis behavior

## Quick Commands

```bash
npm run bot        # Start the bot
npm run bot:dev    # Start in dev mode (auto-reload)
npm run get-chat-id # Get your Telegram chat ID
npm run type-check # Check TypeScript
```

## Support

- Check [README.md](README.md) for full documentation
- Review `docs/` for detailed setup guides
- Check console logs for error details

---

**You're all set!** 🎉 Send a voice message to see the magic happen.


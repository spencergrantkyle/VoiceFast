# 🤖 VoiceFast Telegram Bot Guide

Your agent is now a fully automated Telegram bot that listens for voice messages 24/7!

## 🎯 What It Does

1. **📱 Receives voice messages** from Telegram
2. **🎤 Transcribes** audio using OpenAI Whisper
3. **🤖 Analyzes** with your AI agent
4. **📊 Sends results** back to you instantly

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the Bot Server

```bash
npm run bot
```

You should see:
```
================================================================================
🤖 VoiceFast Telegram Bot Server Starting...
================================================================================

✅ Bot is online and listening for messages!
📱 Send a voice message to your bot to get started.

💡 Tip: Send /start to your bot for instructions

Press Ctrl+C to stop the bot.
```

### Step 3: Send a Voice Message

1. Open Telegram
2. Find your bot (search for it)
3. **Record and send a voice message** describing a business conversation
4. Wait for the bot to process it

### Step 4: Get Results

The bot will:
1. ✅ Confirm receipt
2. 🎤 Transcribe your audio
3. 📝 Show you the transcription
4. 🤖 Run the AI agent
5. 📊 Send detailed results

## 📱 Example Conversation

**You (voice message):** 
> "Hi, my name is John Smith, you can reach me on WhatsApp at +1-555-1234. I run a small e-commerce company called ShopFast. We're struggling with three main issues: our checkout process is too complicated and we're losing customers, our inventory management is manual and error-prone, and we don't have good analytics to understand customer behavior. We have a budget of about $15,000 and need solutions within 2 months. Our stack is Python and Vue.js with a team of 3 developers."

**Bot responds:**
```
🎤 Received your voice message! Processing...

⏳ Transcribing audio...

✅ Transcription:
"Hi, my name is John Smith, you can reach me on WhatsApp at..."

🤖 Running AI agent analysis...
```

Then sends:
```
🤖 VoiceFast Agent Report

📅 Generated: 1/15/2025, 2:30 PM

👤 Contact Information
• Name: John Smith
• Company: ShopFast
• Handle: +1-555-1234
• Platform: whatsapp

🚨 Problems Identified (3)
1. Checkout process too complicated leading to customer loss
2. Manual inventory management causing errors
3. Lack of analytics for customer behavior insights

📋 Constraints
• Budget: $15,000
• Deadline: 2 months
• Team Size: 3 developers
• Stack: Python and Vue.js

🔍 Research Items
1. Stripe Checkout
   https://stripe.com/checkout
   Impact: 9/10 | Effort: 2/10

2. Inventory Management Software
   ...

✨ Full report saved to output directory
```

## 🎙️ What Voice Messages Should Include

For best results, mention:
- **Your name** and contact info (WhatsApp/Telegram/Discord handle)
- **Company name** (if applicable)
- **Problems** you're facing (as many as possible)
- **Constraints**: budget, timeline, team size, tech stack

Example phrases:
- "We're struggling with..."
- "Our main problem is..."
- "We need help with..."
- "Our budget is around..."
- "We need this done by..."

## 💬 Text Messages Work Too!

You can also send regular text messages instead of voice notes:

**You:** 
```
Hey, I'm Sarah from TechCorp. We need help with our mobile app performance - it's really slow and users are complaining. Budget is $20k, need it fixed in 3 weeks.
```

**Bot:** Processes the same way and sends results!

## 🎮 Bot Commands

Send these commands to interact with the bot:

- `/start` - Welcome message and instructions
- `/help` - Detailed help and usage guide
- `/status` - Check if bot is online and working

## 🛠️ Technical Details

### How It Works

```
Voice Message → Telegram API → Download Audio
    ↓
Whisper API → Transcribe to Text
    ↓
AI Agent → Analyze & Extract Info
    ↓
Format Results → Send to Telegram
    ↓
Save to Files (JSON + Markdown)
```

### Audio Transcription

- **Model**: OpenAI Whisper-1
- **Supported formats**: OGG, MP3, M4A, WAV (Telegram sends OGG)
- **Language**: English (configurable)
- **Max duration**: Up to 25MB file size

### Storage

All results are saved locally in the `output/` directory:
- `agent-output-[timestamp].json` - Full structured data
- JSON files can be queried later

### Processing Time

Typical times:
- 📥 Download: < 1 second
- 🎤 Transcription: 2-5 seconds (for 1-minute audio)
- 🤖 Agent analysis: 10-30 seconds
- 📱 Send results: < 1 second

**Total**: ~15-40 seconds depending on voice length and complexity

## 🔧 Running in Production

### Option 1: Keep Terminal Open

```bash
npm run bot
```

Leave this running. Press Ctrl+C to stop.

### Option 2: Run in Background

```bash
# Using nohup (Linux/Mac)
nohup npm run bot > bot.log 2>&1 &

# Check if running
ps aux | grep telegram-bot

# View logs
tail -f bot.log

# Stop
pkill -f telegram-bot
```

### Option 3: Using PM2 (Recommended for Production)

```bash
# Install PM2
npm install -g pm2

# Start bot
pm2 start npm --name "voicefast-bot" -- run bot

# View status
pm2 status

# View logs
pm2 logs voicefast-bot

# Restart
pm2 restart voicefast-bot

# Stop
pm2 stop voicefast-bot

# Auto-start on system reboot
pm2 startup
pm2 save
```

### Option 4: Docker (for Railway/Cloud Deployment)

Create `Dockerfile`:
```dockerfile
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "bot"]
```

Deploy to Railway, Heroku, or any cloud platform.

## 📊 Monitoring

### Console Output

The bot logs everything:
```
================================================================================
📱 Received voice message from John Smith (Chat ID: 123456789)
   Duration: 45s
================================================================================

📥 Downloaded voice file (523,142 bytes)
🎤 Transcribing audio...
✅ Transcription complete
📝 Transcription: "Hi, my name is John Smith..."

🤖 Running agent workflow...
💾 Output saved to: output/agent-output-2025-01-15T14-30-45-123Z.json
📱 Sending results to Telegram...
✅ Complete! Results sent to user.
```

### Check Logs

```bash
# If running with PM2
pm2 logs voicefast-bot

# If running in background
tail -f bot.log
```

## ⚠️ Troubleshooting

### Bot Not Responding

1. **Check bot is running**
   ```bash
   ps aux | grep telegram-bot
   ```

2. **Verify environment variables**
   - `OPENAI_API_KEY` - For transcription and agent
   - `TELEGRAM_API_KEY` - For Telegram bot

3. **Test bot token**
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

### Transcription Fails

- Check `OPENAI_API_KEY` is valid
- Ensure you have Whisper API access
- Voice message must be < 25MB
- Check OpenAI API credits/quota

### Agent Errors

- Verify agent has access to GPT-5 (or change to GPT-4o)
- Check OpenAI API quota
- Review console logs for specific errors

### "No updates" / Bot Not Receiving Messages

- Make sure you've started a conversation with the bot (send /start)
- Bot token must be correct
- Check network connectivity

## 🎨 Customization

### Change Transcription Language

Edit `telegram-bot.ts`:
```typescript
const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream(tempFilePath),
  model: "whisper-1",
  language: "es", // Change to: es, fr, de, etc.
});
```

### Modify Response Format

Edit the `formatAgentResultsForTelegram()` function in `telegram.ts`.

### Add More Commands

In `telegram-bot.ts`, add to `processTextMessage()`:
```typescript
if (text === "/mycommand") {
  await sendTelegramMessage(
    TELEGRAM_BOT_TOKEN,
    chatId,
    "Your custom response"
  );
}
```

## 🔐 Security

- ✅ Bot token stored in `.env` (not committed)
- ✅ Only processes messages sent directly to the bot
- ✅ Each user gets their own isolated processing
- ✅ No data shared between users
- ✅ Temporary audio files deleted after transcription

## 💡 Pro Tips

1. **Speak clearly** - Better transcription accuracy
2. **Include context** - More details = better analysis
3. **Use bullet points** - "First problem... Second problem..."
4. **Mention numbers** - Budget, timeline, team size
5. **Say contact info slowly** - Phone numbers, emails
6. **Review transcription** - Bot shows it before analyzing

## 📈 Scaling

**Single bot handles:**
- Multiple users simultaneously
- Unlimited messages (rate limited by Telegram)
- Concurrent processing with async operations

**To scale further:**
- Deploy multiple bot instances
- Use a queue system (Bull, Redis)
- Implement webhook mode instead of polling

## 🆚 Comparison: CLI vs Bot Mode

### CLI Mode (`npm run run`)
- ✅ Manual control
- ✅ Direct text input
- ✅ Good for testing
- ❌ Requires terminal access

### Bot Mode (`npm run bot`)
- ✅ 24/7 automated
- ✅ Voice message support
- ✅ Works from anywhere
- ✅ No terminal needed
- ✅ Multiple users
- ✅ Mobile-friendly

## 🚀 Next Steps

1. **Start the bot**: `npm run bot`
2. **Send test voice message**: Record a quick test
3. **Verify results**: Check Telegram response
4. **Deploy to production**: Use PM2 or Docker
5. **Share bot**: Give bot username to team/clients

---

**Your agent is now accessible via Telegram anytime, anywhere! 📱🤖**


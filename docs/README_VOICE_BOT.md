# 🎙️ VoiceFast Voice Bot - Complete Setup

Your AI agent now accepts voice messages via Telegram, transcribes them, and returns detailed analysis!

## 🎯 What's New

**Before:** Manual CLI tool (`npm run run`) with text input
**Now:** 24/7 Telegram bot that processes voice messages automatically!

## ✨ Features

- 🎤 **Voice Message Processing** - Send audio, get analysis
- 🗣️ **Auto Transcription** - OpenAI Whisper converts speech to text  
- 🤖 **AI Analysis** - Your agent extracts contacts, problems, insights
- 📱 **Instant Results** - Get formatted reports in Telegram
- 💾 **Auto Save** - All results saved to `output/` directory
- 🌍 **Works Anywhere** - Use from phone, desktop, anywhere with Telegram

## 🚀 Quick Start

### 1. Start the Bot

```bash
npm run bot
```

### 2. Send Voice Message

1. Open Telegram
2. Find your bot
3. Record & send a voice message

### 3. Get Results

Bot automatically:
- Transcribes audio
- Runs agent analysis  
- Sends detailed report
- Saves to files

**See `VOICE_BOT_QUICKSTART.md` for detailed steps**

## 📁 New Files Created

| File | Purpose |
|------|---------|
| `telegram-bot.ts` | Main bot server (long-polling) |
| `BOT_GUIDE.md` | Comprehensive bot documentation |
| `VOICE_BOT_QUICKSTART.md` | Quick start guide |
| `README_VOICE_BOT.md` | This file - overview |

## 🔧 Setup Requirements

### Environment Variables (`.env`)

```env
# Required
OPENAI_API_KEY=sk-proj-your-key-here
TELEGRAM_API_KEY=your-bot-token-here

# Optional (for sending results back)
TELEGRAM_CHAT_ID=your-chat-id
```

### Dependencies

All installed with `npm install`:
- `openai` - Whisper transcription + Agent API
- `@openai/agents` - Agent SDK
- `dotenv` - Environment variables
- `zod` - Type validation

## 🎮 Available Commands

```bash
# Start voice bot (long-running)
npm run bot

# Start bot in watch mode (auto-restart on changes)
npm run bot:dev

# Get your Telegram Chat ID
npm run get-chat-id

# Run agent manually with text
npm run run

# Run in watch mode
npm run dev

# Type check
npm run type-check
```

## 🔄 Complete Workflow

```
📱 User sends voice message to Telegram bot
          ↓
🤖 Bot receives update via long-polling
          ↓
📥 Downloads audio file from Telegram
          ↓
🎤 Transcribes with OpenAI Whisper
          ↓
📝 Shows transcription to user
          ↓
🤖 Runs your AI agent (agent.ts)
          ↓
📊 Formats results for Telegram
          ↓
💾 Saves JSON + Markdown to output/
          ↓
📱 Sends formatted report to user
```

## 📊 What Gets Extracted

From your voice message, the agent extracts:

- 👤 **Contact Info**: Name, handle, platform, company
- 🚨 **Problems**: All pain points mentioned
- 📋 **Constraints**: Budget, deadline, team size, tech stack
- 🎯 **Priorities**: Impact/effort scores
- 🔍 **Research**: Solutions, tools, resources with URLs
- 📝 **Report**: Markdown summary

## 🌟 Use Cases

### 1. **Sales Conversations**
Record client calls, extract needs, get instant analysis

### 2. **Support Tickets**
Voice notes from customers → structured problem reports

### 3. **Team Meetings**
Record discussions → extract action items and constraints

### 4. **Client Intake**
Quick voice notes → complete client profiles

### 5. **Research Notes**
Record thoughts → organized research items

## 💡 Best Practices

### Voice Message Tips

1. **Speak clearly** - Better transcription
2. **Include names** - "My name is..." or "Contact John at..."
3. **List problems** - "First issue... Second issue..."
4. **Mention constraints** - Budget, timeline, team size
5. **State company/context** - "We're a startup..." or "At Company X..."

### Example Voice Script

> "Hi, this is Sarah Johnson from TechStart Inc. You can reach me on WhatsApp at +1-555-0123. We have three main problems: first, our customer onboarding takes 2 weeks which is too long. Second, we don't have proper analytics to track user behavior. Third, our mobile app crashes frequently on Android devices. We have a budget of $15,000, need solutions within 6 weeks, our team has 4 developers, and we're using React Native and Firebase. Oh, and the app crashes are our highest priority since we're losing users."

This will extract:
- Contact: Sarah Johnson, +1-555-0123, WhatsApp, TechStart Inc
- 3 Problems with details
- All constraints
- Priority indication

## 🔐 Security & Privacy

- ✅ Bot token in `.env` (not committed to git)
- ✅ Temporary audio files deleted after transcription
- ✅ No data stored on Telegram servers long-term
- ✅ Each user's messages processed independently
- ✅ Results only visible to sender
- ✅ All data saved locally under your control

## 📈 Performance

Typical processing times:
- Voice download: < 1s
- Transcription (30s audio): ~3-5s
- Agent analysis: ~15-30s
- Total: **~20-40 seconds**

Supports:
- Multiple concurrent users
- Any audio length (up to 25MB)
- All languages (configure in code)

## 🆚 Mode Comparison

### CLI Mode (`npm run run`)
- ✅ Manual control
- ✅ Direct text input
- ❌ No voice support
- ❌ Requires terminal

### Bot Mode (`npm run bot`)
- ✅ Voice messages
- ✅ Text messages
- ✅ 24/7 automated
- ✅ Mobile friendly
- ✅ Multi-user
- ✅ No terminal needed after starting

## 🚀 Deployment Options

### Local Development
```bash
npm run bot
# Keep terminal open
```

### Background (nohup)
```bash
nohup npm run bot > bot.log 2>&1 &
```

### PM2 (Recommended)
```bash
pm2 start npm --name "voicefast-bot" -- run bot
pm2 save
pm2 startup
```

### Docker
```bash
docker build -t voicefast-bot .
docker run -d --env-file .env voicefast-bot
```

### Cloud Platforms
- Railway
- Heroku  
- DigitalOcean
- AWS EC2
- Google Cloud Run

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| `VOICE_BOT_QUICKSTART.md` | ⚡ Get started in 3 steps |
| `BOT_GUIDE.md` | 📖 Complete bot documentation |
| `TELEGRAM_SETUP.md` | 📱 Telegram configuration |
| `AGENT_SETUP.md` | 🤖 Agent setup & customization |
| `OUTPUT_GUIDE.md` | 📂 Working with output files |
| `QUICKSTART.md` | ⚡ General quick start |

## ⚠️ Troubleshooting

### Bot Not Starting
- Check `OPENAI_API_KEY` in `.env`
- Check `TELEGRAM_API_KEY` in `.env`
- Run `npm install` to ensure dependencies

### Voice Not Transcribing
- Verify OpenAI API key has Whisper access
- Check API quota/credits
- Ensure voice file < 25MB

### No Telegram Response
- Verify bot token is correct
- Make sure you've sent `/start` to bot
- Check bot is running (`ps aux | grep telegram-bot`)

### See Full Troubleshooting
Check `BOT_GUIDE.md` for detailed troubleshooting steps.

## 🎉 You're All Set!

Your Telegram bot is ready to:
1. ✅ Accept voice messages
2. ✅ Transcribe automatically
3. ✅ Analyze with AI
4. ✅ Return detailed reports
5. ✅ Save everything locally

**Start now:**
```bash
npm run bot
```

Then send a voice message to your bot! 🎤

---

**Need help?** See `BOT_GUIDE.md` for the complete guide.


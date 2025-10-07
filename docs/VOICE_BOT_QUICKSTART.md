# 🎤 Voice Bot Quick Start

Transform your Telegram into an AI-powered voice assistant in 3 steps!

## ⚡ Quick Setup

### 1️⃣ Start the Bot Server

```bash
npm run bot
```

Expected output:
```
================================================================================
🤖 VoiceFast Telegram Bot Server Starting...
================================================================================

✅ Bot is online and listening for messages!
📱 Send a voice message to your bot to get started.
```

### 2️⃣ Open Telegram & Send Voice

1. Open Telegram (phone or desktop)
2. Search for your bot
3. **Hold the microphone button** and record:

> "Hi, my name is Alex from StartupXYZ. We're struggling with slow customer support response times. We're getting about 200 tickets a day but only have 2 support agents. We need a solution within a month and have a budget of $10,000. Our stack is Node.js and React."

4. Release to send

### 3️⃣ Get Instant Results

The bot will:
1. ✅ Confirm receipt
2. 🎤 Transcribe your voice
3. 📝 Show transcription
4. 🤖 Analyze with AI
5. 📊 Send detailed report

**That's it!** 🎉

## 📱 What You'll Receive

```
🤖 VoiceFast Agent Report

📅 Generated: [timestamp]

👤 Contact Information
• Name: Alex
• Company: StartupXYZ

🚨 Problems Identified (1)
1. Slow customer support response times with 200 daily tickets and only 2 agents

📋 Constraints
• Budget: $10,000
• Deadline: within a month
• Stack: Node.js and React

🔍 Research Items
[Solutions with URLs and scores]

✨ Full report saved to output directory
```

## 💬 Can Also Send Text

Don't want to record? Send a text message instead:

**You:** "Need help with database performance issues. Budget $5k."

**Bot:** Processes it the same way!

## 🎮 Useful Commands

- `/start` - Instructions
- `/help` - Full help
- `/status` - Check if online

## 🛑 Stop the Bot

Press `Ctrl+C` in the terminal.

## 🚀 Run in Background

Want it to run 24/7?

```bash
# Install PM2
npm install -g pm2

# Start bot in background
pm2 start npm --name "voicefast-bot" -- run bot

# Check status
pm2 status

# View logs
pm2 logs voicefast-bot
```

## 📚 Need More Help?

- **Full Guide**: See `BOT_GUIDE.md`
- **Telegram Setup**: See `TELEGRAM_SETUP.md`
- **General Setup**: See `AGENT_SETUP.md`

---

**🎤 Your voice-powered AI agent is ready!**

Just keep `npm run bot` running and send voice messages anytime, from anywhere.


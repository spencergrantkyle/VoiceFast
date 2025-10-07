# VoiceFast - AI-Powered Voice Analysis Bot

VoiceFast is an intelligent Telegram bot that transcribes voice messages, extracts key information, conducts automated research, and saves structured contact details to Notion.

## 🎯 What It Does

1. **Receives** voice or text messages via Telegram
2. **Transcribes** audio using OpenAI Whisper
3. **Analyzes** the conversation to extract:
   - Contact information (name, company, handle, platform)
   - Problems and pain points
   - Project constraints (budget, deadline, team size, tech stack)
4. **Researches** relevant solutions using web search
5. **Prioritizes** recommendations by impact and effort
6. **Saves** everything to a Notion database with full context
7. **Sends** formatted results and Notion link back to the user

## 🏗️ Architecture

```
Telegram Voice/Text → Whisper Transcription → OpenAI Agent Analysis → Web Research → Notion Database
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Telegram Bot Token
- Notion Integration with database access

### Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Create a `.env` file with:

```bash
# OpenAI API Key (required)
OPENAI_API_KEY=sk-...

# Telegram Bot Token (required)
TELEGRAM_API_KEY=123456789:ABC...

# Notion Integration (required)
NOTION_API_KEY=ntn_...
NOTION_DATABASE_ID=your-database-id

# Optional: Telegram Chat ID for direct messages
TELEGRAM_CHAT_ID=your-chat-id
```

### Running

```bash
# Start the Telegram bot
npm run bot

# Development mode (auto-restart)
npm run bot:dev
```

## 📋 Available Scripts

```bash
npm run bot          # Start Telegram bot
npm run bot:dev      # Start in development mode with auto-reload
npm run get-chat-id  # Get your Telegram chat ID
npm test-notion-save # Test Notion integration
npm run build        # Compile TypeScript
```

## 🔧 Setup Guides

Detailed setup instructions are available in the `docs/` directory:

- **[Telegram Setup](docs/TELEGRAM_SETUP.md)** - Creating and configuring your Telegram bot
- **[Notion Setup](docs/NOTION_SETUP_COMPLETE.md)** - Setting up Notion integration and database
- **[Deployment Guide](DEPLOYMENT.md)** - Deploying to Railway or other platforms

## 📊 Notion Database Schema

The bot saves contacts with the following properties:

| Property | Type | Description |
|----------|------|-------------|
| Name | Title | Contact name |
| Company | Rich Text | Company name |
| Contact Handle | Rich Text | Username/handle |
| Platform | Select | Communication platform |
| Problems Count | Number | Number of problems identified |
| Research Count | Number | Number of research items found |
| Status | Status | Contact status (default: "New") |
| Source | Select | Voice or Text |
| Created At | Date | Timestamp |
| Budget | Rich Text | Budget constraints |
| Deadline | Rich Text | Timeline constraints |
| Team Size | Rich Text | Team size information |
| Tech Stack | Rich Text | Technology stack |
| Top Solution | Rich Text | Highest-impact recommendation |
| Problems | Rich Text | Summary of problems |
| Local File | Rich Text | Path to audio file (voice only) |

Each page also includes rich content blocks with:
- Complete problems list
- Prioritized recommendations (impact/effort scores)
- Research items with URLs and relevance explanations
- Full analysis report in markdown

## 🛠️ Tech Stack

- **Runtime**: Node.js with TypeScript
- **AI/ML**: OpenAI GPT-4 (Agents API)
- **Transcription**: OpenAI Whisper
- **Bot Framework**: Telegram Bot API
- **Database**: Notion API
- **Deployment**: Railway (auto-deploy from GitHub)

## 📁 Project Structure

```
VoiceFast/
├── agent.ts                 # OpenAI agent workflow
├── telegram-bot.ts          # Telegram bot server
├── telegram.ts              # Telegram utilities
├── notion-integration.ts    # Notion API integration
├── run-agent.ts             # Standalone agent runner
├── get-telegram-chat-id.ts  # Utility to get chat ID
├── test-notion-save.ts      # Notion integration test
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── railway.json             # Railway deployment config
├── static/                  # Web interface (optional)
│   ├── index.html
│   └── app.js
└── docs/                    # Documentation
    ├── TELEGRAM_SETUP.md
    ├── NOTION_SETUP_COMPLETE.md
    ├── WORKFLOW_COMPLETE.md
    └── ...
```

## 🔐 Security

- **Never commit** `.env` files (already in `.gitignore`)
- API keys are loaded from environment variables
- Notion integration uses scoped permissions
- Telegram bot validates message sources

## 🚢 Deployment

### Railway (Recommended)

1. Push to GitHub
2. Connect repository to Railway
3. Railway will auto-detect Node.js and deploy
4. Set environment variables in Railway dashboard
5. Bot starts automatically

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 📝 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run bot:dev

# Type check
npm run type-check

# Build for production
npm run build
```

## 🧪 Testing

```bash
# Test Notion integration
npm run test-notion-save

# Get your Telegram chat ID
npm run get-chat-id
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Complete Workflow Guide](docs/WORKFLOW_COMPLETE.md)
- [Notion Integration Details](docs/NOTION_SETUP_COMPLETE.md)
- [Telegram Bot Guide](docs/BOT_GUIDE.md)
- [Live Updates Feature](docs/LIVE_UPDATES_GUIDE.md)

## 🤝 Contributing

This is a production application. For development:

1. Create a feature branch
2. Test thoroughly with `npm run test-notion-save`
3. Ensure TypeScript compiles without errors
4. Update documentation as needed
5. Submit pull request

## 📄 License

See [LICENSE.md](LICENSE.md) for details.

## 🆘 Troubleshooting

### Bot doesn't respond
- Check that `TELEGRAM_API_KEY` is correct
- Verify bot is running with `npm run bot`
- Check console logs for errors

### Notion save fails
- Verify `NOTION_DATABASE_ID` matches your database
- Ensure database is shared with your integration
- Run `npm run test-notion-save` to diagnose

### Transcription errors
- Check `OPENAI_API_KEY` is valid
- Ensure audio file is in a supported format
- Verify audio duration is under Whisper limits

## 📧 Support

For issues, check the documentation in `docs/` or review console logs for detailed error messages.

---

**Built with OpenAI Agents, Notion, and Telegram** 🚀

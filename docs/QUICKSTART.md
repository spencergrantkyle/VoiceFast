# ⚡ Quick Start - VoiceFast Agent

## 🎯 Ready to Run!

Your environment is fully set up. Follow these simple steps:

## Step 1: Add Your OpenAI API Key

Edit the `.env` file and replace `sk-proj-your-key-here` with your actual key:

```bash
# Open in your editor
code .env
# or
nano .env
# or
vim .env
```

Make it look like:
```env
OPENAI_API_KEY=sk-proj-abc123your-real-key-here
```

## Step 2: Run the Agent

```bash
npm run run
```

That's it! The agent will:
- Process the example conversation
- Extract problems and contact info
- Generate research insights
- Output structured JSON results

## 🎨 Custom Input

Pass your own conversation text:

```bash
npm run run -- "Hi, I'm Alex from Startup XYZ. We're having trouble with..."
```

## 📁 What Was Set Up

✅ **package.json** - Node.js dependencies
✅ **tsconfig.json** - TypeScript configuration  
✅ **run-agent.ts** - Agent runner script
✅ **.env** - Environment variables (add your API key here!)
✅ **.gitignore** - Updated with Node.js entries
✅ **node_modules/** - All dependencies installed

## 🔑 Project Structure

```
VoiceFast/
├── agent.ts              # 🤖 Your AI agent (3-step workflow)
├── run-agent.ts          # ▶️ Runner script
├── package.json          # 📦 Dependencies
├── tsconfig.json         # ⚙️ TypeScript config
├── .env                  # 🔐 API keys (add yours!)
├── AGENT_SETUP.md        # 📚 Full documentation
├── QUICKSTART.md         # ⚡ This file
│
├── main.py               # 🐍 FastAPI voice server
├── requirements.txt      # 🐍 Python deps
└── static/               # 🌐 Web interface
    ├── index.html
    └── app.js
```

## 🎯 Common Commands

```bash
# Run the agent with example input
npm run run

# Run with custom input
npm run run -- "Your conversation text"

# Development mode (auto-reload on changes)
npm run dev

# Build for production
npm run build

# Type check without running
npm run type-check
```

## 🚨 Need Help?

See **AGENT_SETUP.md** for detailed documentation, troubleshooting, and customization options.

## 💡 Next Steps

1. **Add your API key** to `.env`
2. **Run the agent**: `npm run run`
3. **Customize** the agent instructions in `agent.ts`
4. **Integrate** with the VoiceFast voice API in `main.py`

---

**Pro Tip**: The agent expects GPT-5 by default. If you don't have access yet, edit `agent.ts` and change `model: "gpt-5"` to `model: "gpt-4o"` on lines 98, 121, and 140.


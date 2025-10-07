# 🤖 VoiceFast Agent Setup Guide

This guide will help you set up and run the TypeScript agent (`agent.ts`) locally.

## 📋 Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)

## 🚀 Quick Setup

### 1. Install Node.js Dependencies

```bash
npm install
```

This will install:
- `@openai/agents` - OpenAI's Agents SDK
- `zod` - Type validation library
- `typescript` - TypeScript compiler
- `tsx` - TypeScript execution engine
- `dotenv` - Environment variable management

### 2. Set Up Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
# Create .env file
cp .env.example .env
```

Then edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-proj-your-actual-key-here
```

⚠️ **Important**: Make sure you have access to GPT-5 (or update the model in `agent.ts` to `gpt-4o` if needed)

### 3. Run the Agent

You can run the agent in several ways:

#### Option A: Quick Run (Recommended for Development)
```bash
npm run run
```

#### Option B: Development Mode with Auto-Reload
```bash
npm run dev
```

#### Option C: Build and Run Production
```bash
npm run build
npm start
```

## 🎯 Usage

### Using the Default Example

The `run-agent.ts` script includes a default example conversation. Simply run:

```bash
npm run run
```

### Custom Input via Command Line

You can pass your own input text as a command-line argument:

```bash
npm run run -- "Your custom conversation text here. I'm John from ABC Corp and we have issues with..."
```

### Programmatic Usage

You can also import and use the agent in your own TypeScript files:

```typescript
import { runWorkflow } from "./agent.js";

const result = await runWorkflow({
  input_as_text: "Your conversation transcript here..."
});

console.log(result);
```

## 📊 What the Agent Does

The agent processes conversation transcripts and:

1. **Identifies Problems** - Extracts all pain points and challenges mentioned
2. **Collects Contact Info** - Captures name, handle, platform (WhatsApp/Telegram/Discord)
3. **Gathers Context** - Budget, deadline, team size, tech stack
4. **Generates Research** - Creates search prompts and finds relevant solutions
5. **Produces Report** - Outputs structured JSON with all findings

## 🔧 Workflow Structure

The agent runs a 3-step workflow:

```
Input Text
    ↓
[Agent 1] Identify Problems & Extract Details
    ↓ (outputs structured JSON)
[Agent 2] Search Prompt Generation
    ↓ (creates optimized search query)
[Agent 3] Web Search with Prompt
    ↓
Final Output
```

## 🛠️ Customization

### Modify Agent Instructions

Edit the instructions in `agent.ts`:

```typescript
const identifyProblemsExtractDetails = new Agent({
  name: "identify problems & extract details",
  instructions: `Your custom instructions here...`,
  model: "gpt-5",
  // ...
});
```

### Change the Model

Update the model field to use different OpenAI models:

```typescript
model: "gpt-4o"  // or "gpt-4", "gpt-3.5-turbo", etc.
```

### Adjust Reasoning Effort

Modify the `modelSettings.reasoning.effort`:

```typescript
modelSettings: {
  reasoning: {
    effort: "low"    // Options: "low", "medium", "high"
  }
}
```

## 📝 Output Format

The agent returns structured JSON with:

```json
{
  "contact_name": "Sarah Johnson",
  "contact_handle": "+1-555-0123",
  "contact_platform": "whatsapp",
  "company": "TechStart Inc",
  "problems": [
    "Customer support overwhelmed with repetitive questions",
    "No system for tracking customer feedback",
    "Onboarding process takes too long"
  ],
  "constraints": {
    "budget": "$10k",
    "deadline": "within the next month",
    "team_size": "5 people",
    "stack": "Node.js and React"
  },
  "priorities": [...],
  "research_items": [...],
  "report_markdown": "..."
}
```

## 🐛 Troubleshooting

### "OPENAI_API_KEY not set" Error

Make sure you've:
1. Created a `.env` file in the project root
2. Added your API key: `OPENAI_API_KEY=sk-proj-...`
3. The key is valid and has sufficient credits

### "Agent result is undefined" Error

This usually means:
- The agent didn't complete successfully
- Check your API key permissions
- Ensure you have access to the model specified (GPT-5)
- Try switching to `gpt-4o` if GPT-5 isn't available

### Import/Module Errors

Make sure you've run:
```bash
npm install
```

If issues persist, delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [OpenAI Agents SDK Documentation](https://github.com/openai/openai-node)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev/)

## 🤝 Integration with VoiceFast

This agent can be integrated with the VoiceFast voice API:

1. The FastAPI backend (`main.py`) handles real-time voice conversations
2. After a conversation ends, the transcript is sent to this agent
3. The agent processes and extracts structured information
4. Results can be stored, sent to the contact, or used for follow-up

---

Built with ❤️ using OpenAI Agents SDK and TypeScript


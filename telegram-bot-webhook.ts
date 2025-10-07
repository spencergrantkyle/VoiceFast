#!/usr/bin/env tsx
/**
 * VoiceFast Telegram Bot Server (Webhook Mode for Railway)
 * 
 * Uses webhooks instead of polling for production deployment.
 * Webhooks prevent conflicts and work better in cloud environments.
 */

import { runWorkflow } from "./agent.js";
import { sendTelegramMessage, formatAgentResultsForTelegram } from "./telegram.js";
import { saveToNotionWithRetry } from "./notion-integration.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";
import * as http from "http";

dotenv.config();

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY not found in .env");
  process.exit(1);
}

if (!process.env.TELEGRAM_API_KEY) {
  console.error("❌ Error: TELEGRAM_API_KEY not found in .env");
  process.exit(1);
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_API_KEY;
const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get PORT from environment (Railway sets this)
const PORT = process.env.PORT || 3000;

// Get webhook URL from environment
const WEBHOOK_URL = process.env.RAILWAY_PUBLIC_DOMAIN 
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}/webhook`
  : process.env.WEBHOOK_URL;

interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
  };
  from?: {
    id: number;
    username?: string;
    first_name?: string;
  };
  date: number;
  text?: string;
  voice?: {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
  };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * Run workflow with live progress updates to Telegram
 */
async function runWorkflowWithUpdates(
  input: { input_as_text: string },
  chatId: string,
  botToken: string
) {
  // Import the workflow components
  const { Agent, Runner } = await import("@openai/agents");
  const { z } = await import("zod");

  // Step 1: Extract problems and details
  console.log("📊 Step 1/3: Extracting problems and contact details...");
  await sendTelegramMessage(
    botToken,
    chatId,
    "🔍 *Step 1/3:* Analyzing conversation and extracting information\\.\\.\\."
  );

  const result = await runWorkflow(input);

  // Show extracted problems
  if (result.full_report?.problems && result.full_report.problems.length > 0) {
    const problemsList = result.full_report.problems
      .slice(0, 5)
      .map((p: string, i: number) => {
        // Escape special Markdown characters for Telegram
        const escaped = p.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
        return `${i + 1}\\. ${escaped}`;
      })
      .join('\n');

    await sendTelegramMessage(
      botToken,
      chatId,
      `✅ *Problems Identified:* ${result.full_report.problems.length}\n\n${problemsList}\n\n🔎 Moving to research phase\\.\\.\\.`
    );
    console.log(`✅ Extracted ${result.full_report.problems.length} problems`);
  }

  // Step 2: Generate search prompts
  console.log("🔎 Step 2/3: Generating research prompts...");
  await sendTelegramMessage(
    botToken,
    chatId,
    "🔎 *Step 2/3:* Generating targeted research queries\\.\\.\\."
  );

  // Give a moment for search prompt generation
  await new Promise(resolve => setTimeout(resolve, 2000));

  await sendTelegramMessage(
    botToken,
    chatId,
    "✅ Research queries generated\\!\n\n🌐 Searching for solutions and best practices\\.\\.\\."
  );

  // Step 3: Web search
  console.log("🌐 Step 3/3: Performing web research...");
  await sendTelegramMessage(
    botToken,
    chatId,
    "🌐 *Step 3/3:* Conducting web research for relevant solutions\\.\\.\\."
  );

  return result;
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioPath: string): Promise<string> {
  console.log(`🎤 Transcribing audio file: ${audioPath}`);
  
  try {
    const audioFile = fs.createReadStream(audioPath);
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    console.log(`✅ Transcription complete: "${transcription.text.substring(0, 100)}..."`);
    return transcription.text;
  } catch (error) {
    console.error("❌ Transcription error:", error);
    throw error;
  }
}

/**
 * Download file from Telegram
 */
async function downloadTelegramFile(fileId: string): Promise<string> {
  try {
    // Get file path from Telegram
    const fileInfoUrl = `${TELEGRAM_BASE_URL}/getFile?file_id=${fileId}`;
    const fileInfoResponse = await fetch(fileInfoUrl);
    const fileInfo = await fileInfoResponse.json() as any;

    if (!fileInfo.ok) {
      throw new Error(`Failed to get file info: ${fileInfo.description}`);
    }

    const filePath = fileInfo.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

    // Download the file
    const fileResponse = await fetch(fileUrl);
    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save to temp directory
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const localPath = path.join(tempDir, `voice_${Date.now()}.ogg`);
    fs.writeFileSync(localPath, buffer);

    console.log(`✅ File downloaded to: ${localPath}`);
    return localPath;
  } catch (error) {
    console.error("❌ Error downloading file:", error);
    throw error;
  }
}

/**
 * Process voice message
 */
async function processVoiceMessage(message: TelegramMessage) {
  const chatId = message.chat.id.toString();
  const username = message.from?.username || message.from?.first_name || "User";

  console.log(`\n${"=".repeat(80)}`);
  console.log(`🎤 New voice message from ${username} (Chat ID: ${chatId})`);
  console.log(`${"=".repeat(80)}\n`);

  try {
    // Send initial acknowledgment
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      "🎤 *Voice message received\\!*\n\n⏳ Transcribing your message\\.\\.\\."
    );

    // Download and transcribe the voice message
    if (!message.voice) {
      throw new Error("No voice data in message");
    }

    const audioPath = await downloadTelegramFile(message.voice.file_id);
    const transcribedText = await transcribeAudio(audioPath);

    // Clean up temp file
    fs.unlinkSync(audioPath);

    console.log(`📝 Transcribed text: "${transcribedText}"`);

    // Send transcription to user
    const escapedTranscription = transcribedText.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `✅ *Transcription:*\n\n_"${escapedTranscription}"_\n\n🤖 Now analyzing with AI agent\\.\\.\\.`
    );

    // Run the workflow with live updates
    const agentResult = await runWorkflowWithUpdates(
      { input_as_text: transcribedText },
      chatId,
      TELEGRAM_BOT_TOKEN
    );

    // Format and send final results
    const finalMessage = formatAgentResultsForTelegram(agentResult, transcribedText);
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      finalMessage
    );

    console.log("✅ Results sent to Telegram");

    // Save to Notion if configured
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      console.log("\n💾 Saving to Notion...");
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        "💾 Saving to Notion database\\.\\.\\."
      );

      try {
        await saveToNotionWithRetry(agentResult, transcribedText);
        console.log("✅ Successfully saved to Notion");
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          "✅ Results saved to Notion\\!"
        );
      } catch (notionError) {
        console.error("⚠️  Failed to save to Notion:", notionError);
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          "⚠️ Could not save to Notion\\. Check logs for details\\."
        );
      }
    }

    console.log(`\n${"=".repeat(80)}`);
    console.log(`✅ Voice message processing complete`);
    console.log(`${"=".repeat(80)}\n`);
  } catch (error) {
    console.error("❌ Error processing voice message:", error);
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `❌ Error processing your voice message\\. Please try again\\.\n\nError: ${String(error).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}`
    );
  }
}

/**
 * Process text message
 */
async function processTextMessage(message: TelegramMessage) {
  const chatId = message.chat.id.toString();
  const text = message.text || "";
  const username = message.from?.username || message.from?.first_name || "User";

  console.log(`\n💬 Text message from ${username}: "${text}"`);

  // Handle commands
  if (text.startsWith('/')) {
    const command = text.split(' ')[0].toLowerCase();

    switch (command) {
      case '/start':
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          `👋 *Welcome to VoiceFast\\!*\n\n🎤 Send me a voice message describing your problems or customer feedback, and I'll:\n\n1️⃣ Transcribe your message\n2️⃣ Extract key problems and details\n3️⃣ Research solutions online\n4️⃣ Generate a comprehensive report\n5️⃣ Save everything to Notion\n\n💡 *Try it now\\!* Record a voice message and send it to me\\.\n\n📝 You can also send text messages, and I'll analyze them the same way\\!`
        );
        break;

      case '/help':
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          `🤖 *VoiceFast Help*\n\n*Available Commands:*\n• /start \\- Show welcome message\n• /help \\- Show this help\n• /info \\- Show bot info\n\n*How to use:*\n1\\. Record a voice message\n2\\. Send it to this bot\n3\\. Wait for transcription\n4\\. Get AI\\-powered analysis\n5\\. Results saved to Notion\n\n*Features:*\n✅ Voice transcription\n✅ Problem extraction\n✅ Web research\n✅ Notion integration`
        );
        break;

      case '/info':
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          `ℹ️ *Bot Information*\n\n🤖 *Name:* VoiceFast Agent\n🔧 *Version:* 1\\.0\\.0\n🌐 *Mode:* Webhook \\(Production\\)\n📊 *Features:*\n• OpenAI Whisper transcription\n• AI problem analysis\n• Web research\n• Notion database integration\n\nChat ID: \`${chatId}\``
        );
        break;

      default:
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          `❓ Unknown command: ${text.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}\n\nUse /help to see available commands\\.`
        );
    }
  } else {
    // Regular text - process like transcribed voice
    console.log(`📝 Processing text as input: "${text}"`);
    
    try {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        "🤖 *Analyzing your message\\.\\.\\.*"
      );

      // Run the workflow
      const agentResult = await runWorkflowWithUpdates(
        { input_as_text: text },
        chatId,
        TELEGRAM_BOT_TOKEN
      );

      // Format and send results
      const finalMessage = formatAgentResultsForTelegram(agentResult, text);
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        finalMessage
      );

      // Save to Notion if configured
      if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
        console.log("\n💾 Saving to Notion...");
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          "💾 Saving to Notion database\\.\\.\\."
        );

        try {
          await saveToNotionWithRetry(agentResult, text);
          console.log("✅ Successfully saved to Notion");
          await sendTelegramMessage(
            TELEGRAM_BOT_TOKEN,
            chatId,
            "✅ Results saved to Notion\\!"
          );
        } catch (notionError) {
          console.error("⚠️  Failed to save to Notion:", notionError);
        }
      }

      console.log("✅ Text message processing complete\n");
    } catch (error) {
      console.error("❌ Error processing text message:", error);
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `❌ Error processing your message\\. Please try again\\.\n\nError: ${String(error).replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}`
      );
    }
  }
}

/**
 * Handle incoming webhook update
 */
async function handleUpdate(update: TelegramUpdate) {
  try {
    if (update.message) {
      if (update.message.voice) {
        await processVoiceMessage(update.message);
      } else if (update.message.text) {
        await processTextMessage(update.message);
      }
    }
  } catch (error) {
    console.error("Error handling update:", error);
  }
}

/**
 * Set webhook
 */
async function setWebhook() {
  if (!WEBHOOK_URL) {
    throw new Error("WEBHOOK_URL or RAILWAY_PUBLIC_DOMAIN must be set");
  }

  const url = `${TELEGRAM_BASE_URL}/setWebhook`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: WEBHOOK_URL })
  });

  const data = await response.json() as any;
  
  if (!data.ok) {
    throw new Error(`Failed to set webhook: ${data.description}`);
  }

  console.log(`✅ Webhook set to: ${WEBHOOK_URL}`);
}

/**
 * Delete webhook (useful for cleanup)
 */
async function deleteWebhook() {
  const url = `${TELEGRAM_BASE_URL}/deleteWebhook`;
  const response = await fetch(url);
  const data = await response.json() as any;
  
  if (data.ok) {
    console.log("✅ Webhook deleted");
  }
}

/**
 * Create HTTP server for webhooks
 */
function createWebhookServer() {
  const server = http.createServer(async (req, res) => {
    // Health check endpoint
    if (req.url === '/health' || req.url === '/') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'ok', 
        bot: 'VoiceFast',
        mode: 'webhook',
        timestamp: new Date().toISOString()
      }));
      return;
    }

    // Webhook endpoint
    if (req.url === '/webhook' && req.method === 'POST') {
      let body = '';
      
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const update = JSON.parse(body) as TelegramUpdate;
          console.log(`📨 Received webhook update #${update.update_id}`);
          
          // Process update asynchronously
          handleUpdate(update).catch(err => {
            console.error("Error handling update:", err);
          });

          // Respond immediately to Telegram
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (error) {
          console.error("Error parsing webhook:", error);
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
      return;
    }

    // 404 for other routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  });

  return server;
}

/**
 * Start webhook server
 */
async function startWebhookServer() {
  console.log("\n" + "=".repeat(80));
  console.log("🤖 VoiceFast Telegram Bot (Webhook Mode)");
  console.log("=".repeat(80) + "\n");

  // Delete any existing webhook first
  await deleteWebhook();

  // Set new webhook
  await setWebhook();

  // Create and start HTTP server
  const server = createWebhookServer();
  
  server.listen(PORT, () => {
    console.log(`\n✅ Webhook server listening on port ${PORT}`);
    console.log(`🌐 Webhook URL: ${WEBHOOK_URL}`);
    console.log(`💡 Health check: http://localhost:${PORT}/health`);
    console.log(`\n📱 Bot is ready to receive messages!`);
    console.log(`\nPress Ctrl+C to stop the server.\n`);
  });
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\n👋 Shutting down webhook server...");
  await deleteWebhook();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n\n👋 Shutting down webhook server...");
  await deleteWebhook();
  process.exit(0);
});

// Start the webhook server
startWebhookServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


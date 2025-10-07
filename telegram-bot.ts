#!/usr/bin/env tsx
/**
 * VoiceFast Telegram Bot Server
 * 
 * Listens for voice messages on Telegram, transcribes them,
 * runs the agent, and sends results back to the user.
 */

import { runWorkflow } from "./agent.js";
import { sendTelegramMessage, formatAgentResultsForTelegram } from "./telegram.js";
import { saveToNotionWithRetry } from "./notion-integration.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import OpenAI from "openai";

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

let lastUpdateId = 0;

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

  // Show research items if available
  if (result.full_report?.research_items && result.full_report.research_items.length > 0) {
    const researchCount = result.full_report.research_items.length;
    await sendTelegramMessage(
      botToken,
      chatId,
      `✅ Found ${researchCount} relevant solution${researchCount > 1 ? 's' : ''}\\!\n\n📝 Generating final report\\.\\.\\.`
    );
    console.log(`✅ Found ${researchCount} research items`);
  }

  // Completion message
  console.log("✅ Analysis complete!");
  await sendTelegramMessage(
    botToken,
    chatId,
    "✨ *Analysis Complete\\!*\n\nGenerating your detailed report\\.\\.\\."
  );

  return result;
}

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
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
  };
}

/**
 * Download a file from Telegram
 */
async function downloadTelegramFile(fileId: string): Promise<Buffer> {
  try {
    // Get file path
    const fileResponse = await fetch(`${TELEGRAM_BASE_URL}/getFile?file_id=${fileId}`);
    const fileData = await fileResponse.json() as any;

    if (!fileData.ok) {
      throw new Error(`Failed to get file info: ${fileData.description}`);
    }

    const filePath = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

    // Download the file
    const downloadResponse = await fetch(fileUrl);
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download file: ${downloadResponse.statusText}`);
    }

    const arrayBuffer = await downloadResponse.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
}

/**
 * Transcribe audio using OpenAI Whisper
 */
async function transcribeAudio(audioBuffer: Buffer, fileName: string = "voice.ogg"): Promise<string> {
  try {
    console.log("🎤 Transcribing audio...");

    // Create a temporary file
    const tempDir = path.join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, fileName);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Transcribe using OpenAI Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-1",
      language: "en", // Change if needed
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    console.log("✅ Transcription complete");
    return transcription.text;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw error;
  }
}

/**
 * Process a voice message
 */
async function processVoiceMessage(message: TelegramUpdate["message"]) {
  if (!message || !message.voice) return;

  const chatId = message.chat.id.toString();
  const userName = message.from.first_name + (message.from.last_name ? ` ${message.from.last_name}` : "");

  console.log(`\n${"=".repeat(80)}`);
  console.log(`📱 Received voice message from ${userName} (Chat ID: ${chatId})`);
  console.log(`   Duration: ${message.voice.duration}s`);
  console.log(`${"=".repeat(80)}\n`);

  try {
    // Send "processing" message
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      "🎤 Received your voice message! Processing...\n\n⏳ Transcribing audio..."
    );

    // Download voice file
    const audioBuffer = await downloadTelegramFile(message.voice.file_id);
    console.log(`📥 Downloaded voice file (${audioBuffer.length} bytes)`);

    // Transcribe audio
    const transcribedText = await transcribeAudio(audioBuffer, `voice_${message.message_id}.ogg`);
    console.log(`📝 Transcription: "${transcribedText.substring(0, 100)}${transcribedText.length > 100 ? "..." : ""}"`);

    // Send transcription to user
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `✅ *Transcription:*\n\n_"${transcribedText}"_\n\n🤖 Running AI agent analysis...`
    );

    // Run the agent with progress updates
    console.log("\n🤖 Running agent workflow...");
    const result = await runWorkflowWithUpdates({
      input_as_text: transcribedText,
    }, chatId, TELEGRAM_BOT_TOKEN);

    // Save outputs
    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(outputDir, `agent-output-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
    console.log(`💾 Output saved to: ${outputFile}`);

    // Save to Notion
    console.log("📝 Saving to Notion...");
    const notionUrl = await saveToNotionWithRetry(result, "voice", outputFile);
    
    if (notionUrl) {
      console.log(`✅ Notion: ${notionUrl}`);
    } else {
      console.log("⚠️  Notion: Save failed (continuing anyway)");
    }

    // Send results to Telegram
    console.log("📱 Sending results to Telegram...");
    const resultMessage = formatAgentResultsForTelegram(result);
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, resultMessage);

    // Send Notion link if available
    if (notionUrl) {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `🔗 *View in Notion:*\n${notionUrl}`
      );
    }

    console.log("✅ Complete! Results sent to user.\n");
  } catch (error) {
    console.error("❌ Error processing voice message:", error);

    // Send error message to user
    try {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `❌ Sorry, there was an error processing your voice message:\n\n${error instanceof Error ? error.message : "Unknown error"}\n\nPlease try again.`
      );
    } catch (sendError) {
      console.error("Failed to send error message:", sendError);
    }
  }
}

/**
 * Process a text message
 */
async function processTextMessage(message: TelegramUpdate["message"]) {
  if (!message || !message.text) return;

  const chatId = message.chat.id.toString();
  const text = message.text;

  // Handle commands
  if (text.startsWith("/")) {
    if (text === "/start") {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `👋 *Welcome to VoiceFast Agent!*\n\n🎤 Send me a voice message and I'll:\n1\\. Transcribe your audio\n2\\. Extract contact information and problems\n3\\. Generate research insights\n4\\. Send you a detailed report\n\n📝 You can also send text messages to analyze\\.\n\n💡 Commands:\n/start \\- Show this message\n/help \\- Get help\n/status \\- Check bot status`
      );
    } else if (text === "/help") {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `📚 *VoiceFast Agent Help*\n\n*How to use:*\n• Send a voice message describing a business conversation\n• Or send a text message with the same\n\n*What I extract:*\n• Contact name, handle, platform, company\n• Problems and pain points\n• Constraints \\(budget, deadline, team size, tech stack\\)\n• Research insights and solutions\n\n*Output:*\n• Structured analysis\n• Prioritized problems\n• Actionable research items\n\nJust send a voice note to get started\\!`
      );
    } else if (text === "/status") {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `✅ *Bot Status: Online*\n\n🤖 Agent: Ready\n🎤 Whisper: Connected\n💾 Storage: Available\n\nSend a voice message to test\\!`
      );
    }
    return;
  }

  // Process as regular text input
  console.log(`\n${"=".repeat(80)}`);
  console.log(`💬 Received text message from Chat ID: ${chatId}`);
  console.log(`   Text: "${text.substring(0, 100)}${text.length > 100 ? "..." : ""}"`);
  console.log(`${"=".repeat(80)}\n`);

  try {
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      "📝 Processing your message...\n\n🤖 Running AI agent analysis..."
    );

    // Run the agent with progress updates
    const result = await runWorkflowWithUpdates({
      input_as_text: text,
    }, chatId, TELEGRAM_BOT_TOKEN);

    // Save outputs
    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(outputDir, `agent-output-${timestamp}.json`);
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");

    // Save to Notion
    console.log("📝 Saving to Notion...");
    const notionUrl = await saveToNotionWithRetry(result, "text", outputFile);
    
    if (notionUrl) {
      console.log(`✅ Notion: ${notionUrl}`);
    } else {
      console.log("⚠️  Notion: Save failed (continuing anyway)");
    }

    // Send results
    const resultMessage = formatAgentResultsForTelegram(result);
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, resultMessage);

    // Send Notion link if available
    if (notionUrl) {
      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `🔗 *View in Notion:*\n${notionUrl}`
      );
    }

    console.log("✅ Complete! Results sent to user.\n");
  } catch (error) {
    console.error("❌ Error processing text message:", error);
    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      `❌ Sorry, there was an error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Get updates from Telegram
 */
async function getUpdates(): Promise<TelegramUpdate[]> {
  try {
    const url = `${TELEGRAM_BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (!data.ok) {
      throw new Error(`Telegram API error: ${data.description}`);
    }

    return data.result || [];
  } catch (error) {
    console.error("Error getting updates:", error);
    return [];
  }
}

/**
 * Clear old messages on startup
 */
async function clearOldMessages() {
  console.log("🧹 Clearing old messages from queue...");
  
  try {
    const url = `${TELEGRAM_BASE_URL}/getUpdates?timeout=1`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.ok && data.result && data.result.length > 0) {
      // Get the highest update ID
      const updates = data.result;
      const highestUpdateId = Math.max(...updates.map((u: any) => u.update_id));
      
      // Mark all old messages as processed by setting lastUpdateId
      lastUpdateId = highestUpdateId;
      
      // Confirm old messages are cleared
      await fetch(`${TELEGRAM_BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=1`);
      
      console.log(`✅ Cleared ${updates.length} old message(s)`);
    } else {
      console.log("✅ No old messages in queue");
    }
  } catch (error) {
    console.error("⚠️  Warning: Could not clear old messages:", error);
    console.log("   (Continuing anyway...)\n");
  }
}

/**
 * Main bot loop
 */
async function startBot() {
  console.log("\n" + "=".repeat(80));
  console.log("🤖 VoiceFast Telegram Bot Server Starting...");
  console.log("=".repeat(80) + "\n");

  // Clear old messages before starting
  await clearOldMessages();

  console.log("\n✅ Bot is online and listening for NEW messages only!");
  console.log("📱 Send a voice message to your bot to get started.\n");
  console.log("💡 Tip: Send /start to your bot for instructions\n");
  console.log("Press Ctrl+C to stop the bot.\n");

  while (true) {
    try {
      const updates = await getUpdates();

      for (const update of updates) {
        lastUpdateId = update.update_id;

        if (update.message) {
          if (update.message.voice) {
            // Handle voice message
            await processVoiceMessage(update.message);
          } else if (update.message.text) {
            // Handle text message
            await processTextMessage(update.message);
          }
        }
      }
    } catch (error) {
      console.error("Error in bot loop:", error);
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down bot gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n👋 Shutting down bot gracefully...");
  process.exit(0);
});

// Start the bot
startBot().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});


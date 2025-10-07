import * as https from "https";

interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: "Markdown" | "HTML";
  disable_web_page_preview?: boolean;
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string,
  parseMode: "Markdown" | "HTML" = "Markdown"
): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

  const payload: TelegramMessage = {
    chat_id: chatId,
    text: message,
    parse_mode: parseMode,
    disable_web_page_preview: true,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json() as any;
    console.log("✅ Message sent to Telegram successfully!");
  } catch (error) {
    console.error("❌ Failed to send Telegram message:");
    throw error;
  }
}

/**
 * Escape special characters for Telegram MarkdownV2
 */
function escapeMarkdown(text: string): string {
  // Escape special characters for MarkdownV2
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

/**
 * Format agent results for Telegram message
 */
export function formatAgentResultsForTelegram(result: any): string {
  const contactName = result.full_report.contact_name || "Unknown";
  const company = result.full_report.company || "Not specified";
  const problemCount = result.full_report.problems?.length || 0;
  const problems = result.full_report.problems || [];
  
  // Telegram has a 4096 character limit per message
  let message = `🤖 *VoiceFast Agent Report*\n\n`;
  message += `📅 *Generated:* ${escapeMarkdown(new Date().toLocaleString())}\n\n`;
  
  message += `👤 *Contact Information*\n`;
  message += `• Name: ${escapeMarkdown(contactName)}\n`;
  message += `• Company: ${escapeMarkdown(company)}\n`;
  
  if (result.full_report.contact_handle) {
    message += `• Handle: ${escapeMarkdown(result.full_report.contact_handle)}\n`;
  }
  if (result.full_report.contact_platform) {
    message += `• Platform: ${escapeMarkdown(result.full_report.contact_platform)}\n`;
  }
  message += `\n`;
  
  message += `🚨 *Problems Identified* \\(${problemCount}\\)\n`;
  if (problems.length > 0) {
    problems.slice(0, 5).forEach((problem: string, idx: number) => {
      const escapedProblem = escapeMarkdown(problem);
      message += `${idx + 1}\\. ${escapedProblem}\n`;
    });
    if (problems.length > 5) {
      message += `_\\.\\.\\.and ${problems.length - 5} more_\n`;
    }
  }
  message += `\n`;
  
  // Add constraints if available
  if (result.full_report.constraints) {
    const constraints = result.full_report.constraints;
    if (constraints.budget || constraints.deadline || constraints.team_size || constraints.stack) {
      message += `📋 *Constraints*\n`;
      if (constraints.budget) message += `• Budget: ${escapeMarkdown(constraints.budget)}\n`;
      if (constraints.deadline) message += `• Deadline: ${escapeMarkdown(constraints.deadline)}\n`;
      if (constraints.team_size) message += `• Team Size: ${escapeMarkdown(constraints.team_size)}\n`;
      if (constraints.stack) message += `• Stack: ${escapeMarkdown(constraints.stack)}\n`;
      message += `\n`;
    }
  }
  
  // Add research items if available
  if (result.full_report.research_items && result.full_report.research_items.length > 0) {
    message += `🔍 *Research Items*\n`;
    result.full_report.research_items.slice(0, 3).forEach((item: any, idx: number) => {
      message += `${idx + 1}\\. *${escapeMarkdown(item.title)}*\n`;
      message += `   ${escapeMarkdown(item.url)}\n`;
      message += `   Impact: ${item.impact}/10 \\| Effort: ${item.effort}/10\n`;
    });
    if (result.full_report.research_items.length > 3) {
      message += `_\\.\\.\\.and ${result.full_report.research_items.length - 3} more_\n`;
    }
  }
  
  message += `\n✨ _Full report saved to output directory_`;
  
  return message;
}

/**
 * Send agent results via Telegram
 */
export async function sendAgentResultsToTelegram(
  result: any,
  botToken?: string,
  chatId?: string
): Promise<void> {
  // Get credentials from environment if not provided
  const token = botToken || process.env.TELEGRAM_API_KEY;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;

  if (!token) {
    throw new Error("TELEGRAM_API_KEY not found in environment variables");
  }

  if (!chat) {
    throw new Error("TELEGRAM_CHAT_ID not found in environment variables");
  }

  const message = formatAgentResultsForTelegram(result);
  await sendTelegramMessage(token, chat, message);
}

/**
 * Get your Telegram chat ID by sending a message to your bot
 * Run this function and send any message to your bot to get the chat ID
 */
export async function getTelegramChatId(botToken: string): Promise<void> {
  const url = `https://api.telegram.org/bot${botToken}/getUpdates`;

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.ok && data.result.length > 0) {
      console.log("\n📱 Recent Telegram chats:");
      data.result.forEach((update: any) => {
        if (update.message) {
          console.log(`Chat ID: ${update.message.chat.id}`);
          console.log(`From: ${update.message.from.first_name} ${update.message.from.last_name || ""}`);
          console.log(`Username: @${update.message.from.username || "N/A"}`);
          console.log("---");
        }
      });
    } else {
      console.log("No messages found. Send a message to your bot first!");
    }
  } catch (error) {
    console.error("Error getting chat ID:", error);
  }
}


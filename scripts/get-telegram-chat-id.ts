#!/usr/bin/env tsx
/**
 * Helper script to get your Telegram Chat ID
 * 
 * Steps:
 * 1. Create a bot via @BotFather on Telegram and get your bot token
 * 2. Add your bot token to .env as TELEGRAM_API_KEY
 * 3. Send a message to your bot (anything like "hello")
 * 4. Run this script: npm run get-chat-id
 * 5. Copy the Chat ID to your .env as TELEGRAM_CHAT_ID
 */

import * as dotenv from "dotenv";

dotenv.config();

async function getChatId() {
  const botToken = process.env.TELEGRAM_API_KEY;

  if (!botToken) {
    console.error("❌ Error: TELEGRAM_API_KEY not found in .env file");
    console.error("\nSteps to set up:");
    console.error("1. Open Telegram and search for @BotFather");
    console.error("2. Send /newbot and follow instructions to create a bot");
    console.error("3. Copy the bot token you receive");
    console.error("4. Add it to .env: TELEGRAM_API_KEY=your-bot-token");
    process.exit(1);
  }

  const url = `https://api.telegram.org/bot${botToken}/getUpdates`;

  try {
    console.log("🔍 Fetching recent messages from your Telegram bot...\n");

    const response = await fetch(url);
    const data = await response.json() as any;

    if (!data.ok) {
      console.error("❌ Error:", data.description);
      console.error("\nMake sure your bot token is correct!");
      process.exit(1);
    }

    if (data.result.length === 0) {
      console.log("📱 No messages found yet!");
      console.log("\nTo get your Chat ID:");
      console.log("1. Open Telegram");
      console.log("2. Search for your bot");
      console.log("3. Send any message to your bot (like 'hello')");
      console.log("4. Run this script again");
      process.exit(0);
    }

    console.log("✅ Found recent messages!\n");
    console.log("=" .repeat(60));

    const uniqueChats = new Map();

    data.result.forEach((update: any) => {
      if (update.message) {
        const chat = update.message.chat;
        if (!uniqueChats.has(chat.id)) {
          uniqueChats.set(chat.id, {
            id: chat.id,
            type: chat.type,
            firstName: update.message.from.first_name,
            lastName: update.message.from.last_name || "",
            username: update.message.from.username || "N/A",
          });
        }
      }
    });

    uniqueChats.forEach((chat: any) => {
      console.log(`\n📱 Chat ID: ${chat.id}`);
      console.log(`   Type: ${chat.type}`);
      console.log(`   Name: ${chat.firstName} ${chat.lastName}`.trim());
      console.log(`   Username: @${chat.username}`);
      console.log("\n   Add this to your .env file:");
      console.log(`   TELEGRAM_CHAT_ID=${chat.id}`);
      console.log("=" .repeat(60));
    });

    console.log("\n✨ Done! Copy the TELEGRAM_CHAT_ID to your .env file");
  } catch (error) {
    console.error("❌ Error fetching updates:", error);
    process.exit(1);
  }
}

getChatId();


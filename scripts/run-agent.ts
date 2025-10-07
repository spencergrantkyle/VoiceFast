#!/usr/bin/env tsx
import { runWorkflow } from "./agent.js";
import { sendAgentResultsToTelegram } from "./telegram.js";
import { saveToNotionWithRetry } from "./notion-integration.js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
dotenv.config();

// Check if OPENAI_API_KEY is set
if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is not set");
  console.error("Please create a .env file with your OpenAI API key:");
  console.error("  OPENAI_API_KEY=sk-proj-your-key-here");
  process.exit(1);
}

async function main() {
  console.log("🚀 Starting VoiceFast Agent Workflow...\n");

  // Example input - you can modify this or accept it from command line args
  const exampleInput = process.argv[2] || `
    Hi, my name is Sarah Johnson, you can reach me on WhatsApp at +1-555-0123.
    I work at TechStart Inc, and we're struggling with a few issues:
    
    First, our customer support team is overwhelmed with repetitive questions, 
    taking up to 3 hours per day just answering the same basic queries.
    
    Second, we don't have a good system for tracking customer feedback - 
    it's scattered across emails, Slack, and support tickets.
    
    Third, our onboarding process for new customers takes too long, 
    about 2 weeks, and we're losing customers because of it.
    
    We have a budget of around $10k, need solutions within the next month, 
    and our tech stack is Node.js and React. Our team is small - just 5 people.
  `.trim();

  try {
    console.log("📝 Input text:");
    console.log(exampleInput);
    console.log("\n" + "=".repeat(80) + "\n");

    // Run the workflow
    const result = await runWorkflow({
      input_as_text: exampleInput,
    });

    console.log("\n" + "=".repeat(80));
    console.log("✅ Workflow completed successfully!");
    console.log("\n📊 Result:");
    console.log(JSON.stringify(result, null, 2));

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log("\n📁 Created output directory");
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputFile = path.join(outputDir, `agent-output-${timestamp}.json`);

    // Save the result to file
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2), "utf-8");
    console.log(`\n💾 Output saved to: ${outputFile}`);

    // Also save a human-readable markdown version
    const markdownFile = path.join(outputDir, `agent-report-${timestamp}.md`);
    const markdown = generateMarkdownReport(result, exampleInput);
    fs.writeFileSync(markdownFile, markdown, "utf-8");
    console.log(`📄 Markdown report saved to: ${markdownFile}`);

    // Save to Notion if configured
    if (process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID) {
      console.log("\n📝 Saving to Notion...");
      try {
        const notionUrl = await saveToNotionWithRetry(result, "text", outputFile);
        if (notionUrl) {
          console.log(`✅ Notion page created: ${notionUrl}`);
        }
      } catch (notionError) {
        console.error("⚠️  Failed to save to Notion:", notionError);
        console.log("   (Continuing anyway - results are saved locally)");
      }
    } else {
      console.log("\n💡 Tip: Set NOTION_API_KEY and NOTION_DATABASE_ID to save to Notion");
    }

    // Send results to Telegram if configured
    if (process.env.TELEGRAM_API_KEY && process.env.TELEGRAM_CHAT_ID) {
      console.log("\n📱 Sending results to Telegram...");
      try {
        await sendAgentResultsToTelegram(result);
      } catch (telegramError) {
        console.error("⚠️  Failed to send Telegram message:", telegramError);
        console.log("   (Continuing anyway - results are saved locally)");
      }
    } else {
      console.log("\n💡 Tip: Set TELEGRAM_API_KEY and TELEGRAM_CHAT_ID to receive notifications");
    }

  } catch (error) {
    console.error("\n❌ Error running workflow:");
    console.error(error);
    process.exit(1);
  }
}

function generateMarkdownReport(result: any, input: string): string {
  const timestamp = new Date().toLocaleString();
  
  return `# VoiceFast Agent Report

**Generated:** ${timestamp}

---

## 📝 Original Input

\`\`\`
${input}
\`\`\`

---

## 👤 Contact Information

- **Name:** ${result.full_report.contact_name || "Not provided"}
- **Handle:** ${result.full_report.contact_handle || "Not provided"}
- **Platform:** ${result.full_report.contact_platform || "Not provided"}
- **Company:** ${result.full_report.company || "Not provided"}

---

## 🚨 Problems Identified

${result.full_report.problems && result.full_report.problems.length > 0 
  ? result.full_report.problems.map((p: string, i: number) => `${i + 1}. ${p}`).join('\n')
  : "No problems identified"}

---

## 📋 Constraints

${result.full_report.constraints 
  ? `- **Budget:** ${result.full_report.constraints.budget || "Not specified"}
- **Deadline:** ${result.full_report.constraints.deadline || "Not specified"}
- **Team Size:** ${result.full_report.constraints.team_size || "Not specified"}
- **Tech Stack:** ${result.full_report.constraints.stack || "Not specified"}`
  : "No constraints provided"}

---

## 🎯 Priorities

${result.full_report.priorities && result.full_report.priorities.length > 0
  ? result.full_report.priorities.map((p: any, i: number) => 
      `### Priority ${i + 1}
- **Summary:** ${p.summary}
- **Impact:** ${p.impact}/10
- **Effort:** ${p.effort}/10`
    ).join('\n\n')
  : "No priorities identified"}

---

## 🔍 Research Items

${result.full_report.research_items && result.full_report.research_items.length > 0
  ? result.full_report.research_items.map((item: any, i: number) => 
      `### ${i + 1}. ${item.title}

- **URL:** ${item.url}
- **Why Relevant:** ${item.why_relevant}
- **Impact:** ${item.impact}/10
- **Effort:** ${item.effort}/10`
    ).join('\n\n')
  : "No research items generated"}

---

## 📊 Search Prompt Generated

\`\`\`
${result.search_prompt || "No search prompt generated"}
\`\`\`

---

## 🌐 Web Search Results

\`\`\`
${result.web_search_results || "No web search results"}
\`\`\`

---

## 📝 Full Report

${result.full_report.report_markdown || "No report markdown generated"}

---

*Generated by VoiceFast Agent*
`;
}

// Run the main function
main();


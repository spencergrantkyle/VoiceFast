import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";

dotenv.config();

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Notion API Limits (as per official documentation)
const NOTION_LIMITS = {
  RICH_TEXT_MAX_LENGTH: 2000,
  URL_MAX_LENGTH: 2000,
  EMAIL_MAX_LENGTH: 200,
  PHONE_MAX_LENGTH: 200,
  ARRAY_MAX_ELEMENTS: 100,
  BLOCK_MAX_ELEMENTS: 1000,
  PAYLOAD_MAX_SIZE: 500 * 1024, // 500KB
} as const;

/**
 * Truncate text to fit within Notion's character limits
 */
function truncateText(text: string, maxLength: number = NOTION_LIMITS.RICH_TEXT_MAX_LENGTH): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Split long text into chunks that fit within Notion's limits
 */
function splitTextIntoChunks(text: string, maxLength: number = NOTION_LIMITS.RICH_TEXT_MAX_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const chunks: string[] = [];
  let currentPosition = 0;

  while (currentPosition < text.length) {
    // Find a good breaking point (newline, period, or space) near the limit
    let endPosition = currentPosition + maxLength;

    if (endPosition >= text.length) {
      chunks.push(text.substring(currentPosition));
      break;
    }

    // Try to break at a newline
    let breakPoint = text.lastIndexOf("\n", endPosition);
    
    // If no newline, try to break at a period
    if (breakPoint <= currentPosition) {
      breakPoint = text.lastIndexOf(". ", endPosition);
      if (breakPoint > currentPosition) {
        breakPoint += 2; // Include the period and space
      }
    }

    // If no period, try to break at a space
    if (breakPoint <= currentPosition) {
      breakPoint = text.lastIndexOf(" ", endPosition);
    }

    // If still no good break point, just cut at the limit
    if (breakPoint <= currentPosition) {
      breakPoint = endPosition;
    }

    chunks.push(text.substring(currentPosition, breakPoint));
    currentPosition = breakPoint;
  }

  return chunks;
}

/**
 * Truncate URL to fit within Notion's limits
 */
function truncateUrl(url: string): string {
  return truncateText(url, NOTION_LIMITS.URL_MAX_LENGTH);
}

/**
 * Limit array to maximum elements
 */
function limitArray<T>(arr: T[], maxElements: number = NOTION_LIMITS.ARRAY_MAX_ELEMENTS): T[] {
  return arr.slice(0, maxElements);
}

interface AgentResult {
  contact_details?: any;
  search_prompt?: string;
  web_search_results?: string;
  full_report: {
    contact_name?: string;
    contact_handle?: string;
    contact_platform?: string;
    company?: string;
    problems: string[];
    constraints?: {
      budget?: string;
      deadline?: string;
      team_size?: string;
      stack?: string;
    };
    priorities?: Array<{
      impact: number;
      effort: number;
      summary: string;
    }>;
    research_items?: Array<{
      title: string;
      url: string;
      why_relevant: string;
      impact: number;
      effort: number;
    }>;
    report_markdown?: string;
  };
}

/**
 * Save agent results to Notion database
 */
export async function saveToNotion(
  result: AgentResult,
  source: "voice" | "text" = "voice",
  localFilePath?: string
): Promise<string> {
  if (!process.env.NOTION_API_KEY) {
    throw new Error("NOTION_API_KEY not found in environment variables");
  }

  if (!NOTION_DATABASE_ID) {
    throw new Error("NOTION_DATABASE_ID not found in environment variables");
  }

  const { full_report } = result;

  // Prepare page title (truncate to fit Notion limits)
  const pageTitle = truncateText(
    full_report.contact_name ||
    full_report.company ||
    "New Contact",
    100 // Keep titles short
  );

  // Prepare properties
  const properties: any = {
    Name: {
      title: [
        {
          text: {
            content: pageTitle,
          },
        },
      ],
    },
  };

  // Add optional text properties (with truncation)
  if (full_report.company) {
    properties.Company = {
      rich_text: [{ text: { content: truncateText(full_report.company, 200) } }],
    };
  }

  if (full_report.contact_handle) {
    properties["Contact Handle"] = {
      rich_text: [{ text: { content: truncateText(full_report.contact_handle, NOTION_LIMITS.PHONE_MAX_LENGTH) } }],
    };
  }

  if (full_report.contact_platform) {
    properties.Platform = {
      select: {
        name: full_report.contact_platform.charAt(0).toUpperCase() + full_report.contact_platform.slice(1),
      },
    };
  }

  // Add problems count
  if (full_report.problems && full_report.problems.length > 0) {
    properties["Problems Count"] = {
      number: full_report.problems.length,
    };
  }

  // Add constraints as text fields (with truncation)
  if (full_report.constraints) {
    if (full_report.constraints.budget) {
      properties.Budget = {
        rich_text: [{ text: { content: truncateText(full_report.constraints.budget, 200) } }],
      };
    }

    if (full_report.constraints.deadline) {
      properties.Deadline = {
        rich_text: [{ text: { content: truncateText(full_report.constraints.deadline, 200) } }],
      };
    }

    if (full_report.constraints.team_size) {
      properties["Team Size"] = {
        rich_text: [{ text: { content: truncateText(full_report.constraints.team_size, 200) } }],
      };
    }

    if (full_report.constraints.stack) {
      properties["Tech Stack"] = {
        rich_text: [{ text: { content: truncateText(full_report.constraints.stack, 500) } }],
      };
    }
  }

  // Add research count (limit to max array size)
  if (full_report.research_items && full_report.research_items.length > 0) {
    properties["Research Count"] = {
      number: Math.min(full_report.research_items.length, NOTION_LIMITS.ARRAY_MAX_ELEMENTS),
    };

    // Add top solution (truncated)
    properties["Top Solution"] = {
      rich_text: [{ text: { content: truncateText(full_report.research_items[0].title, 200) } }],
    };
  }

  // Add source
  properties.Source = {
    select: {
      name: source.charAt(0).toUpperCase() + source.slice(1),
    },
  };

  // Add status (default to New)
  properties.Status = {
    status: {
      name: "New",
    },
  };

  // Add created at date
  properties["Created At"] = {
    date: {
      start: new Date().toISOString(),
    },
  };

  // Add local file path if provided (truncated)
  if (localFilePath) {
    properties["Local File"] = {
      rich_text: [{ text: { content: truncateText(localFilePath, 500) } }],
    };
  }
  
  // Add problems description (first 3 problems as summary)
  if (full_report.problems && full_report.problems.length > 0) {
    const problemsSummary = full_report.problems.slice(0, 3).join("; ");
    properties.Problems = {
      rich_text: [{ text: { content: truncateText(problemsSummary, 500) } }],
    };
  }

  // Prepare page content blocks
  const children: any[] = [];

  // Add problems section (limit to 100 items and truncate each)
  if (full_report.problems && full_report.problems.length > 0) {
    children.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "🚨 Problems Identified",
            },
          },
        ],
      },
    });

    // Limit to first 100 problems
    const limitedProblems = limitArray(full_report.problems, 50); // Use 50 to save room for other content
    
    // Add each problem as a bulleted list item (truncated to 2000 chars)
    limitedProblems.forEach((problem) => {
      children.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              text: {
                content: truncateText(problem),
              },
            },
          ],
        },
      });
    });

    // Add note if there are more problems
    if (full_report.problems.length > limitedProblems.length) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `... and ${full_report.problems.length - limitedProblems.length} more problems (see local file for full list)`,
              },
              annotations: {
                italic: true,
                color: "gray",
              },
            },
          ],
        },
      });
    }
  }

  // Add constraints section (with truncation)
  if (full_report.constraints) {
    children.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "📋 Constraints",
            },
          },
        ],
      },
    });

    const constraintsText: string[] = [];
    if (full_report.constraints.budget)
      constraintsText.push(`💰 Budget: ${truncateText(full_report.constraints.budget, 200)}`);
    if (full_report.constraints.deadline)
      constraintsText.push(`⏰ Deadline: ${truncateText(full_report.constraints.deadline, 200)}`);
    if (full_report.constraints.team_size)
      constraintsText.push(`👥 Team Size: ${truncateText(full_report.constraints.team_size, 200)}`);
    if (full_report.constraints.stack)
      constraintsText.push(`🔧 Tech Stack: ${truncateText(full_report.constraints.stack, 500)}`);

    if (constraintsText.length > 0) {
      const constraintsFullText = constraintsText.join("\n");
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: truncateText(constraintsFullText),
              },
            },
          ],
        },
      });
    }
  }

  // Add priorities section (limit to 50 items, truncate each)
  if (full_report.priorities && full_report.priorities.length > 0) {
    children.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "🎯 Priorities",
            },
          },
        ],
      },
    });

    const limitedPriorities = limitArray(full_report.priorities, 50);

    limitedPriorities.forEach((priority) => {
      const priorityText = `${priority.summary} (Impact: ${priority.impact}/10, Effort: ${priority.effort}/10)`;
      children.push({
        object: "block",
        type: "bulleted_list_item",
        bulleted_list_item: {
          rich_text: [
            {
              text: {
                content: truncateText(priorityText),
              },
            },
          ],
        },
      });
    });

    if (full_report.priorities.length > limitedPriorities.length) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `... and ${full_report.priorities.length - limitedPriorities.length} more priorities`,
              },
              annotations: {
                italic: true,
                color: "gray",
              },
            },
          ],
        },
      });
    }
  }

  // Add research items section (limit to 20 items max, truncate URLs and text)
  if (full_report.research_items && full_report.research_items.length > 0) {
    children.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "🔍 Research Items",
            },
          },
        ],
      },
    });

    // Limit research items to 20 to keep under block limit
    const limitedResearch = limitArray(full_report.research_items, 20);

    limitedResearch.forEach((item) => {
      // Add item title as heading (truncated)
      children.push({
        object: "block",
        type: "heading_3",
        heading_3: {
          rich_text: [
            {
              text: {
                content: truncateText(item.title, 200),
              },
            },
          ],
        },
      });

      // Truncate URL to Notion's limit
      const truncatedUrl = truncateUrl(item.url);
      const relevanceText = truncateText(item.why_relevant, 1500); // Leave room for other text

      // Add item details (keeping total under 2000 chars)
      const detailsText = `🔗 URL: ${truncatedUrl}\n💡 Why Relevant: ${relevanceText}\n📊 Impact: ${item.impact}/10 | Effort: ${item.effort}/10`;
      
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: truncateText(detailsText),
                link: truncatedUrl.startsWith("http") ? { url: truncatedUrl } : undefined,
              },
            },
          ],
        },
      });
    });

    if (full_report.research_items.length > limitedResearch.length) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `... and ${full_report.research_items.length - limitedResearch.length} more research items (see local file)`,
              },
              annotations: {
                italic: true,
                color: "gray",
              },
            },
          ],
        },
      });
    }
  }

  // Add full report section (split into multiple blocks if needed)
  if (full_report.report_markdown) {
    children.push({
      object: "block",
      type: "heading_2",
      heading_2: {
        rich_text: [
          {
            text: {
              content: "📝 Full Report",
            },
          },
        ],
      },
    });

    // Split the report into chunks that fit within Notion's 2000 char limit
    const reportChunks = splitTextIntoChunks(full_report.report_markdown);

    // Add each chunk as a separate paragraph block
    reportChunks.forEach((chunk, index) => {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: chunk,
              },
            },
          ],
        },
      });
    });

    // If report was very long, add a note
    if (reportChunks.length > 5) {
      children.push({
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [
            {
              text: {
                content: `(Report split into ${reportChunks.length} sections due to length. See local file for complete report.)`,
              },
              annotations: {
                italic: true,
                color: "gray",
              },
            },
          ],
        },
      });
    }
  }

  // Add divider
  children.push({
    object: "block",
    type: "divider",
    divider: {},
  });

  // Add metadata footer
  children.push({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          text: {
            content: `Generated by VoiceFast Agent\nSource: ${source}\nTimestamp: ${new Date().toISOString()}`,
          },
          annotations: {
            color: "gray",
          },
        },
      ],
    },
  });

  try {
    // Create the page
    const response = await notion.pages.create({
      parent: {
        database_id: NOTION_DATABASE_ID,
      },
      properties: properties,
      children: children,
    });

    // Return the Notion page URL
    const pageId = response.id.replace(/-/g, "");
    const pageUrl = `https://www.notion.so/${pageId}`;

    return pageUrl;
  } catch (error: any) {
    console.error("Error creating Notion page:", error);
    throw new Error(`Failed to save to Notion: ${error.message}`);
  }
}

/**
 * Save to Notion with retry logic
 */
export async function saveToNotionWithRetry(
  result: AgentResult,
  source: "voice" | "text" = "voice",
  localFilePath?: string,
  maxRetries: number = 3
): Promise<string | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = await saveToNotion(result, source, localFilePath);
      console.log(`✅ Saved to Notion (attempt ${attempt}/${maxRetries}): ${url}`);
      return url;
    } catch (error) {
      console.error(`⚠️  Notion save attempt ${attempt}/${maxRetries} failed:`, error);
      
      if (attempt === maxRetries) {
        console.error("❌ All Notion save attempts failed");
        return null;
      }

      // Wait before retrying (exponential backoff)
      const waitTime = 1000 * attempt;
      console.log(`   Retrying in ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  return null;
}

/**
 * Test Notion connection
 */
export async function testNotionConnection(): Promise<boolean> {
  try {
    if (!NOTION_DATABASE_ID) {
      console.error("❌ NOTION_DATABASE_ID not set");
      return false;
    }

    const response = await notion.databases.retrieve({
      database_id: NOTION_DATABASE_ID,
    });

    console.log("✅ Notion connection successful!");
    console.log(`   Database ID: ${NOTION_DATABASE_ID}`);
    return true;
  } catch (error: any) {
    console.error("❌ Notion connection failed:", error.message);
    return false;
  }
}


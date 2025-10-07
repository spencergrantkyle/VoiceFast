import { z } from "zod";
import { Agent, RunContext, AgentInputItem, Runner } from "@openai/agents";

const IdentifyProblemsExtractDetailsSchema = z.object({ contact_name: z.string(), contact_handle: z.string(), contact_platform: z.enum(["whatsapp", "telegram", "discord"]), company: z.string(), problems: z.array(z.string()), constraints: z.object({ budget: z.string(), deadline: z.string(), team_size: z.string(), stack: z.string() }), priorities: z.array(z.object({ impact: z.number(), effort: z.number(), summary: z.string() })), research_items: z.array(z.object({ title: z.string(), url: z.string(), why_relevant: z.string(), effort: z.number(), impact: z.number() })), report_markdown: z.string() });
const identifyProblemsExtractDetails = new Agent({
  name: "identify problems & extract details",
  instructions: `You are a contact collection and opportunity scout. Your main objective is to process short live audio conversations, extract important contact and business information, and especially identify a list of problems which will be provided to our deep research agent to investigate the most relevant and practical solutions to each problem. Note: All fields to extract are optional except for the list of problems, which must be extracted as thoroughly as possible from the conversation.

Extract the following information from each conversation:
- contact_name (string) [optional]
- contact_handle (string) [optional]
- contact_platform (enum: whatsapp, telegram, discord) [optional]
- company (string) [optional]
- problems (list of strings) [REQUIRED]: extract every problem, pain point, obstacle, or need discussed.
- constraints (object: budget, deadline, team_size, stack) [optional]
- priorities (list of objects: { impact:int, effort:int, summary:string }) [optional]
- research_items (list of objects: { title, url, why_relevant, effort, impact }) [optional]
- report_markdown (string) [optional; summary is auto-generated after other fields]

Workflow:
1. Transcribe the short live audio accurately.
2. Confirm and extract the person’s name and contact handle if mentioned.
3. Extract ALL problems, issues, or challenges explicitly or implicitly mentioned; this is the only required output field.
4. Optionally extract associated constraints, business context, priorities, and any other relevant state variables if discussed.
5. For each identified problem in the list, prepare the problem list to be sent to the research agent for solution-finding.
6. If relevant, use web search and reasoning to identify possible high-impact, low-cost solutions (research_items), but prioritize listing the problems clearly.
7. Summarize findings in report_markdown.
8. Compose and plan a message for the contact (via WhatsApp) outlining 3 to 5 enticing options for their consideration, drawn from the research phase if possible.

State Variables (for output):
- contact_name: string | null
- contact_handle: string | null
- contact_platform: string | null (\"whatsapp\" | \"telegram\" | \"discord\")
- company: string | null
- problems: list[string] (REQUIRED)
- constraints: { budget?: string, deadline?: string, team_size?: string, stack?: string }
- priorities: list[{ impact: int, effort: int, summary: string }]
- research_items: list[{ title: string, url: string, why_relevant: string, effort: int, impact: int }]
- report_markdown: string

All fields are optional except \"problems\", which must always be populated with any issues, pain points, or challenges that can be identified. These will be routed to a deep research agent to discover solutions for each.

# Steps

1. Transcribe the live audio to text if source is audio.
2. Analyze the transcript, extracting the contact fields (as available), but prioritize gathering the complete problem list.
3. Structure the output into the specified state variable fields.
4. For the problems identified, list each one as a separate entry. 
5. Optionally, for each problem, supply context fields if available.
6. Summarize your findings in 'report_markdown'.
7. If instructed, compose an outreach message as described.

# Output Format

Output a single JSON object containing all state variables. Only \"problems\" is required; include other fields if information is present in the transcript. Example structure:

{
  \"contact_name\": \"[string or null]\",
  \"contact_handle\": \"[string or null]\",
  \"contact_platform\": \"[whatsapp|telegram|discord|null]\",
  \"company\": \"[string or null]\",
  \"problems\": [ \"[problem 1]\", \"[problem 2]\", ... ],
  \"constraints\": {
    \"budget\": \"[string or null]\",
    \"deadline\": \"[string or null]\",
    \"team_size\": \"[string or null]\",
    \"stack\": \"[string or null]\"
  },
  \"priorities\": [
    {
      \"impact\": [int],
      \"effort\": [int],
      \"summary\": \"[string]\"
    }
  ],
  \"research_items\": [
    {
      \"title\": \"[string]\",
      \"url\": \"[string]\",
      \"why_relevant\": \"[string]\",
      \"effort\": [int],
      \"impact\": [int]
    }
  ],
  \"report_markdown\": \"[string]\"
}

# Notes

- The model should always attempt to extract the problem list, as this field is required for downstream research.
- Do not fabricate information; leave fields null or empty if no information is given.
- Use best judgment for implicit problem statements or pain points in conversation.
- If audio is provided, handle transcription step prior to extraction.
- Problems from the conversation will be sent to a research agent for detailed solution finding.
- Make all other field extraction opportunistic, but do not omit the problems list.

Important: Your primary and required output is the comprehensive extraction of problems; all other information is secondary and optional. Output must always be in the JSON structure detailed above.`,
  model: "gpt-5",
  outputType: IdentifyProblemsExtractDetailsSchema,
  modelSettings: {
    reasoning: {
      effort: "low"
    },
    store: true
  }
});

interface SearchPromptContext {
  inputResult: string;
}
const searchPromptInstructions = (runContext: RunContext<SearchPromptContext>, _agent: Agent<SearchPromptContext>) => {
  const { inputResult } = runContext.context;
  return `Use the  ${inputResult} to identify an appropriate web and deep research prompt that we will use to prompt our agent to find the most useful solution to the problem described in ${inputResult}.  

We need to find practical solutions, ready apps, comparable companies, and active communities that can help our new contact get maximum benefit from AI as it is applied to their business or goal.
`
}
const searchPrompt = new Agent({
  name: "Search Prompt",
  instructions: searchPromptInstructions,
  model: "gpt-5",
  modelSettings: {
    reasoning: {
      effort: "medium"
    },
    store: true
  }
});

interface WebSearchWithPromptContext {
  inputOutputText: string;
}
const webSearchWithPromptInstructions = (runContext: RunContext<WebSearchWithPromptContext>, _agent: Agent<WebSearchWithPromptContext>) => {
  const { inputOutputText } = runContext.context;
  return `Use the results in the ${inputOutputText} to perform a web search with the most relevant data to solve the problem. `
}
const webSearchWithPrompt = new Agent({
  name: "Web search with prompt",
  instructions: webSearchWithPromptInstructions,
  model: "gpt-5",
  modelSettings: {
    reasoning: {
      effort: "low"
    },
    store: true
  }
});

type WorkflowInput = { input_as_text: string };


// Main code entrypoint
export const runWorkflow = async (workflow: WorkflowInput) => {
  const state = {

  };
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text
        }
      ]
    }
  ];
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68e41ee3db488190910a615020a91b3507c03d3adee95802"
    }
  });
  const identifyProblemsExtractDetailsResultTemp = await runner.run(
    identifyProblemsExtractDetails,
    [
      ...conversationHistory
    ]
  );
  conversationHistory.push(...identifyProblemsExtractDetailsResultTemp.newItems.map((item) => item.rawItem));

  if (!identifyProblemsExtractDetailsResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const identifyProblemsExtractDetailsResult = {
    output_text: JSON.stringify(identifyProblemsExtractDetailsResultTemp.finalOutput),
    output_parsed: identifyProblemsExtractDetailsResultTemp.finalOutput
  };
  
  // Safely access research items with fallback
  const firstResearchItem = identifyProblemsExtractDetailsResult.output_parsed.research_items?.[0];
  const transformResult = {
    result: firstResearchItem 
      ? `${firstResearchItem.title} - ${firstResearchItem.why_relevant}`
      : identifyProblemsExtractDetailsResult.output_parsed.problems?.[0] || "General business consultation"
  };
  const searchPromptResultTemp = await runner.run(
    searchPrompt,
    [
      ...conversationHistory
    ],
    {
      context: {
        inputResult: transformResult.result
      }
    }
  );
  conversationHistory.push(...searchPromptResultTemp.newItems.map((item) => item.rawItem));

  if (!searchPromptResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const searchPromptResult = {
    output_text: searchPromptResultTemp.finalOutput ?? ""
  };
  const webSearchWithPromptResultTemp = await runner.run(
    webSearchWithPrompt,
    [
      ...conversationHistory
    ],
    {
      context: {
        inputOutputText: searchPromptResult.output_text
      }
    }
  );
  conversationHistory.push(...webSearchWithPromptResultTemp.newItems.map((item) => item.rawItem));

  if (!webSearchWithPromptResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
  }

  const webSearchWithPromptResult = {
    output_text: webSearchWithPromptResultTemp.finalOutput ?? ""
  };

  // Return all results
  return {
    contact_details: identifyProblemsExtractDetailsResult.output_parsed,
    search_prompt: searchPromptResult.output_text,
    web_search_results: webSearchWithPromptResult.output_text,
    full_report: {
      contact_name: identifyProblemsExtractDetailsResult.output_parsed.contact_name,
      contact_handle: identifyProblemsExtractDetailsResult.output_parsed.contact_handle,
      contact_platform: identifyProblemsExtractDetailsResult.output_parsed.contact_platform,
      company: identifyProblemsExtractDetailsResult.output_parsed.company,
      problems: identifyProblemsExtractDetailsResult.output_parsed.problems,
      constraints: identifyProblemsExtractDetailsResult.output_parsed.constraints,
      priorities: identifyProblemsExtractDetailsResult.output_parsed.priorities,
      research_items: identifyProblemsExtractDetailsResult.output_parsed.research_items,
      report_markdown: identifyProblemsExtractDetailsResult.output_parsed.report_markdown
    }
  };
}

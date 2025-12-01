# 🤖 AGENT_ARCHITECTURE.md

# 🤖 Philosoph-AI — Multi-Agent Architecture

This document defines the **multi-agent system** for Philosoph-AI.

It specifies:

- Agent types and responsibilities  
- Orchestration flows (sequential + parallel + loop)  
- Tools and how agents call them  
- Sessions, memory, and context compaction  
- Observability (logging, metrics)  
- How all of this plugs into `/api/ask` and the existing stack  

This file is written for **GitHub Copilot** and other AI assistants to use as a reference when generating code.

---

## 1. High-Level Design

Philosoph-AI uses a **multi-agent architecture** to answer user questions in a philosophical, multi-perspective way.

Core ideas:

- Each **agent** has a clear role (classify, select, answer, synthesize, summarize, etc.).
- An **Orchestrator** coordinates agents in **sequential** and **parallel** patterns.
- Agents call **tools** (RAG search, logging, linking, recommendations).
- All state (sessions, memory, logs) is stored in **Firestore**.
- The entire system runs on **serverless infra** (Cloud Run + Firebase + Vertex AI).

Agents are implemented in TypeScript (e.g., in `lib/agents/`).

---

## 2. Core Agents

### 2.1 ThemeClassifierAgent

**Purpose:**  
Take a raw user question and infer:

- Themes (ethics, justice, meaning, etc.)
- Intent (single perspective vs multi-perspective vs exploration)
- Mode: `persona`, `general`, `compare`, `explore`

**Input:**

```ts
type ThemeClassifierInput = {
  question: string;
  sessionContextSummary?: string; // optional short summary of prior conversation
};
Output:

ts
Copy code
type ThemeClassifierOutput = {
  themes: { name: string; score: number }[];
  inferredMode: "persona" | "general" | "compare" | "explore";
};
Tools used:

May call a small Vertex model or embeddings to classify themes.

Uses themes.json mapping for normalization.

2.2 PhilosopherSelectorAgent
Purpose:
Given themes, user filters (region, century), and possibly a chosen philosopher, decide:

Single philosopher → persona mode

3–6 philosophers → general/multi-perspective mode

Input:

ts
Copy code
type PhilosopherSelectorInput = {
  themes: { name: string; score: number }[];
  userSelectedPhilosopherId?: string | null;
  regionFilter?: string | null;
  centuryFilter?: number | null;
};
Output:

ts
Copy code
type PhilosopherSelectorOutput = {
  mode: "single" | "multi";
  philosophers: string[]; // e.g. ["plato", "kant", "nietzsche"]
};
Data sources:

philosophy_data/themes.json

philosophy_data/theme_to_philosophers.json

philosophy_data/philosophers.json (region, century, themes)

2.3 RAGRetrieverAgent (optional, can be a tool instead)
Purpose:
Retrieve the most relevant text chunks from Firestore embeddings for each philosopher.

Input:

ts
Copy code
type RAGRetrieverInput = {
  question: string;
  philosopherId: string;
  topK?: number;
};
Output:

ts
Copy code
type RAGRetrieverOutput = {
  chunks: {
    chunkIndex: number;
    content: string;
    chapterName?: string;
    chapterId?: string;
    sourceFile?: string;
    positionInChapter?: number;
  }[];
};
Tools used:

RAGSearchTool (vector similarity over Firestore embeddings)

2.4 PerspectiveAgent
Purpose:
Given a philosopher and a question (plus optional RAG context), generate:

A perspective in that philosopher’s style

Optional quote and chapter reference

Clear, modern explanation

This is the main “persona” agent.

Input:

ts
Copy code
type PerspectiveAgentInput = {
  philosopherId: string;
  question: string;
  ragChunks?: RAGChunk[]; // from RAGRetrieverAgent or tool
  sessionContextSummary?: string;
};
Output:

ts
Copy code
type PerspectiveAgentOutput = {
  philosopherId: string;
  answer: string;
  quote?: string | null;
  source?: {
    chapter?: string | null;
    chapterLink?: string | null;
    chunkIndex?: number | null;
  };
};
LLM:

Uses Vertex AI (Gemini).

System prompt includes philosopher style guide and RAG content.

2.5 SynthesisAgent (Multi-Perspective Overview)
Purpose:
Combine multiple philosopher responses into a coherent, comparative summary.

Input:

ts
Copy code
type SynthesisAgentInput = {
  question: string;
  perspectives: PerspectiveAgentOutput[];
};
Output:

ts
Copy code
type SynthesisAgentOutput = {
  overview: string; // general summary
  comparison: string; // key similarities/differences
  recommendations: string[]; // philosopherIds to explore next
};
2.6 SummarizerAgent (Session Summarizer)
Purpose:
Maintain a short, evolving summary of a user’s session to keep prompts light.

Input:

ts
Copy code
type SummarizerAgentInput = {
  sessionId: string;
  recentMessages: { role: "user" | "assistant"; content: string }[];
  existingSummary?: string;
};
Output:

ts
Copy code
type SummarizerAgentOutput = {
  updatedSummary: string;
};
Writes back to Firestore in a sessionSummaries collection or inside sessions.

2.7 RecommendationAgent (Optional)
Purpose:
Suggest which philosopher(s), works, or chapters the user should explore next.

Input:

ts
Copy code
type RecommendationAgentInput = {
  question: string;
  themes: { name: string; score: number }[];
  philosophersUsed: string[];
};
Output:

ts
Copy code
type RecommendationAgentOutput = {
  recommendedPhilosophers: string[];
  recommendedWorks?: {
    philosopherId: string;
    workName: string;
    reason: string;
  }[];
};
3. Tools
Tools are small functions that agents can call. They are defined in lib/tools/.

3.1 RAGSearchTool
Purpose:
Perform vector similarity search over embeddings stored in Firestore.

Signature:

ts
Copy code
type RAGSearchToolInput = {
  question: string;
  philosopherId?: string;
  topK?: number;
};

type RAGSearchToolOutput = RAGRetrieverOutput; // see above
3.2 GutenbergLinkTool
Purpose:
Given philosopher, work, and chapter metadata, produce a link to the relevant Project Gutenberg HTML anchor.

Input:

ts
Copy code
type GutenbergLinkToolInput = {
  philosopherId: string;
  workId: string;
  chapterId?: string;
};
Output:

ts
Copy code
type GutenbergLinkToolOutput = {
  url: string | null; // null if mapping not found
};
Uses static JSON maps like:

/philosophy_data/gutenberg_links.json

/philosophy_data/work_chapter_anchors.json

3.3 AnalyticsLogTool
Purpose:
Log question/answer pairs and agent traces to Firestore for analytics.

Input:

ts
Copy code
type AnalyticsLogToolInput = {
  sessionId: string;
  question: string;
  finalAnswer: string;
  philosophersUsed: string[];
  mode: "persona" | "general" | "compare" | "explore";
  themes?: string[];
  agentTrace?: AgentTraceEntry[];
};
Output:

ts
Copy code
type AnalyticsLogToolOutput = {
  success: boolean;
  logId?: string;
};
AgentTraceEntry includes:

ts
Copy code
type AgentTraceEntry = {
  agentName: string;
  inputSummary: string;
  outputSummary: string;
  latencyMs?: number;
  error?: string | null;
};
3.4 RecommendationTool
Purpose:
Assist RecommendationAgent by querying metadata to find similar philosophers/works.

4. Orchestrator
The Orchestrator coordinates agents for each /api/ask call.

Implement in a module like lib/orchestrator.ts.

4.1 Orchestrator Input / Output
Input:

ts
Copy code
type OrchestratorInput = {
  sessionId: string;
  question: string;
  selectedPhilosopherId?: string | null;
  regionFilter?: string | null;
  centuryFilter?: number | null;
};
Output:

ts
Copy code
type OrchestratorOutput = {
  mode: "persona" | "general" | "compare" | "explore";
  overview?: string;
  perspectives?: PerspectiveAgentOutput[];
  synthesis?: SynthesisAgentOutput;
  themeInfo?: ThemeClassifierOutput;
};
4.2 Orchestration Flow — Persona Mode (Single Philosopher)
When user picks a specific philosopher:

SummarizerAgent (optional, background) → update session summary.

Bypass ThemeClassifierAgent if user explicitly chose philosopher.

Call PerspectiveAgent once with:

question

philosopherId

small RAG context from RAGSearchTool

Log results using AnalyticsLogTool.

Flow:

ts
Copy code
// pseudo-code
const rag = await RAGSearchTool.execute({ question, philosopherId });
const perspective = await PerspectiveAgent.run({ question, philosopherId, ragChunks: rag.chunks });
4.3 Orchestration Flow — General Mode (No Philosopher Selected)
ThemeClassifierAgent → get themes + inferred mode.

PhilosopherSelectorAgent → choose 3–6 philosophers.

Parallel calls to PerspectiveAgent for each philosopher:

Each may call RAGSearchTool internally.

SynthesisAgent → build overview + comparison.

RecommendationAgent (optional) → “Who to read next?”

Log everything via AnalyticsLogTool.

Flow pattern:

ts
Copy code
const themeInfo = await ThemeClassifierAgent.run(...);
const selection = await PhilosopherSelectorAgent.run(...);

const perspectives = await Promise.all(
  selection.philosophers.map(p =>
    PerspectiveAgent.run({ philosopherId: p, question, ragChunks: ... })
  )
);

const synthesis = await SynthesisAgent.run({ question, perspectives });
4.4 Loop Agent Pattern (Optional Refinement)
For deep mode:

Draft answer

Call tools to improve citations/quotes

Refine answer

Simple loop:

ts
Copy code
let state = initialInput;
for (let step = 0; step < MAX_STEPS; step++) {
  const result = await SomeAgent.run(state);
  if (result.done) break;
  state = { ...state, ...result.nextInput };
}
Use this sparingly to keep cost low.

5. Sessions, Memory & Context
5.1 Session Storage
Collection: sessions

json
Copy code
{
  "sessionId": "abc123",
  "createdAt": "...",
  "lastActiveAt": "...",
  "preferredRegion": null,
  "preferredCentury": null,
  "notes": "User likes Stoics and practical advice."
}
Messages collection (optional): sessionMessages.

5.2 Short-Term Summary (Session Summary)
Collection: sessionSummaries or sub-document of sessions.

json
Copy code
{
  "sessionId": "abc123",
  "summary": "User is struggling with meaning in work, interested in Stoics and Existentialists.",
  "updatedAt": "..."
}
SummarizerAgent updates this periodically.

5.3 Long-Term Memory (Memory Bank)
If userId is ever added (future), store:

json
Copy code
{
  "userId": "xyz",
  "topPhilosophers": ["stoics", "nietzsche"],
  "favoriteThemes": ["meaning", "ethics"],
  "stylePreferences": {
    "concise": true,
    "useQuotes": true
  }
}
Agents can read from this to personalize responses.

6. Observability & Metrics
All agent operations should generate trace-like logs that can be surfaced in the /admin dashboard.

6.1 Agent-Level Logs
Collection: agentTraces

json
Copy code
{
  "sessionId": "abc123",
  "agentName": "ThemeClassifierAgent",
  "inputSummary": "Question about justice at work",
  "outputSummary": "themes=['justice','ethics']; mode='general'",
  "latencyMs": 230,
  "timestamp": "...",
  "error": null
}
Dashboard can aggregate:

Latency per agent

Error rate per agent

How often general mode is triggered

Most used philosophers

7. Integration with /api/ask
The /api/ask Next.js route should:

Parse input → OrchestratorInput.

Load session info + summary from Firestore.

Call orchestrateQuestion(input, sessionSummary) from lib/orchestrator.ts.

Return structured OrchestratorOutput to the frontend.

Orchestrator internally calls agents & tools as defined above.

Log analytics and traces.

Example handler skeleton:

ts
Copy code
// app/api/ask/route.ts
import { orchestrateQuestion } from "@/lib/orchestrator";

export async function POST(req: Request) {
  const body = await req.json();
  const { sessionId, question, selectedPhilosopherId, regionFilter, centuryFilter } = body;

  const sessionSummary = await getSessionSummary(sessionId);

  const result = await orchestrateQuestion({
    sessionId,
    question,
    selectedPhilosopherId,
    regionFilter,
    centuryFilter
  }, sessionSummary);

  return new Response(JSON.stringify(result), { status: 200 });
}
8. Folder Structure for Agents & Tools
Recommended structure:

txt
Copy code
lib/
  agents/
    themeClassifierAgent.ts
    philosopherSelectorAgent.ts
    perspectiveAgent.ts
    synthesisAgent.ts
    summarizerAgent.ts
    recommendationAgent.ts
  tools/
    ragSearchTool.ts
    gutenbergLinkTool.ts
    analyticsLogTool.ts
    recommendationTool.ts
  orchestrator.ts
  sessions.ts
  memory.ts
  analytics.ts
Each agent file should:

Export a run() function

Optionally export a AGENT_NAME constant

Use typed inputs/outputs as defined above

9. Implementation Priorities
Implement a minimal Orchestrator with:

ThemeClassifierAgent (can be rule-based at first)

PhilosopherSelectorAgent (mapping-based)

PerspectiveAgent (LLM-backed)

AnalyticsLogTool

Add RAGSearchTool and integrate simple RAG into PerspectiveAgent.

Add SynthesisAgent for multi-perspective answers.

Add SummarizerAgent + session summaries.

Add RecommendationAgent and optional deep dive modes.

Add rich agent-level logging for the admin dashboard.

End of AGENT_ARCHITECTURE.md.

makefile
Copy code

::contentReference[oaicite:0]{index=0}
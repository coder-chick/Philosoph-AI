# 📘 Philosoph-AI — Master Systems Architecture & Implementation Plan

This is the unified, comprehensive, all-in-one architectural plan that merges:

✔ the original **AGENT_ARCHITECTURE.md**
✔ the extended **AGENT_ARCHITECTURE_ADDITIONS.md**
✔ modern Google papers on agents (Sessions, Memory, MCP, Productionization)
✔ full-stack system design (frontend → backend → orchestration → data → infra)
✔ UI/UX, RAG, evaluation, safety, deployment, and future evolution

This document is formatted for **GitHub Copilot**, **Cursor**, and high‑level architecture planning.

---

# 🧠 0. SYSTEM OVERVIEW

**Philosoph-AI** is an AI-native, multi-agent philosophical reasoning platform that:

* ingests **public-domain philosopher texts** (Project Gutenberg)
* provides answers in classical + modernized forms
* supports multi-perspective comparative reasoning
* uses a tool-augmented multi-agent system
* maintains short- and long-term memory per session
* offers grounding through RAG with accurate citations
* exposes a public, login-free UI with an admin-only dashboard
* runs fully on Google Cloud (Cloud Run, Firebase, Vertex AI)

The result is:

* interactive
* research-grade
* grounded
* highly scalable
* evolvable
* safe

---

# ⚙️ 1. TECH STACK SUMMARY

### **Frontend:**

* Next.js 14+ (App Router)
* Tailwind CSS (UI/UX)
* shadcn/ui components
* Clerk-free (no login)
* Firebase Analytics (optional user tracking)

### **Backend:**

* Next.js API Routes deployed to Cloud Run
* Orchestrator + Agents (TypeScript)
* Tools layer
* RAG pipeline

### **Database (Firebase):**

* Firestore (sessions, logs, traces, settings)
* Storage (philosopher .txt files)
* Embeddings index (FireStore-based or Vertex Matching Engine optional)

### **AI Model Layer (Vertex AI):**

* Gemini 1.5 Flash for most tasks
* Gemini 1.5 Pro for deep analysis
* Embeddings API for RAG
* Vertex Evaluations

### **Optional External Tools:**

* Google Search
* Wikipedia API
* MCP-enabled tools
* OpenAPI integrations

---

# 🧠 2. MULTI-AGENT SYSTEM (FULL SET)

The system follows Google’s **Level 2–3 Agent Architecture**.

## **2.1 Required Agents**

### 1. **ThemeClassifierAgent**

Maps user questions → philosophical domains.

* Ethics, metaphysics, political, existential, logic, etc.
* Outputs: top themes + confidence scores.

### 2. **PhilosopherSelectorAgent**

Chooses 1 or multiple philosophers.

* Based on themes, century filters, region filters.
* Outputs: `{ mode, philosophers[] }`.

### 3. **RetrievalAgent (RAG)**

Retrieves relevant chunks of text per philosopher.

* Vector similarity search
* Chunk scoring
* Quote detection
* Chapter anchor identification

### 4. **PerspectiveAgent**

Constructs an answer in the voice/style of a specific philosopher.

* Takes RAG context + style rules
* Produces: answer + quote + chapter link

### 5. **SynthesisAgent**

Combines multiple philosopher answers.

* Overview
* Compare/contrast
* Meta-analysis

### 6. **StyleAgent (optional)**

Rewrites output in:

* Jane Austen corporate voice
* Nietzsche motivational tone
* Stoic calm tone

### 7. **SummarizerAgent**

Maintains short-term context.

* Session summaries
* Context compaction

### 8. **RecommendationAgent**

Suggests next philosophers, eras, or readings.

### 9. **SafetyAgent / IntegrityAgent**

Prevents hallucinations + enforces academic grounding.

* Verifies quotes
* Cross-checks chunks
* Rejects unsafe content

### 10. **OrchestratorAgent**

Runs the Think → Act → Observe loop.

* Sequential + parallel agent calls
* Tool selection
* Loop control
* Failure recovery

---

# 🧩 3. TOOLS LAYER (MCP-COMPATIBLE)

Agents can call tools via function-calling or MCP.

### **3.1 Internal Tools**

* `RAGSearchTool`
* `QuoteAnchorTool`
* `GutenbergLinkTool`
* `AnalyticsLogTool`
* `SessionStateTool`
* `CostTrackerTool`
* `ChunkExplainerTool`

### **3.2 External Tools**

* Google Search API
* Wikipedia API
* OpenAPI-defined sources
* MCP-compatible fetcher tools

### **3.3 System Tools**

* Logging
* Tracing (OpenTelemetry)
* Metrics export
* Token usage estimator
* Rate limiter

---

# 🧠 4. CONTEXT ENGINEERING & MEMORY

### **4.1 Short-Term Memory (Session Context)**

Stored in Firestore:

* last few turns
* session summary
* user-selected constraints

### **4.2 Long-Term Memory (Memory Bank)**

Stored in Firestore:

* preferred themes
* avoided philosophers
* writing tone preferences
* repeated topic embeddings

### **4.3 Context Compaction**

Uses SummarizerAgent to:

* compress history
* maintain stable session identity
* reduce prompt inflation

### **4.4 Structured Context Windows**

Every LLM call includes:

* system identity
* mission
* short-term memory
* long-term memory
* RAG chunks
* relevant rules
* safety constraints
* evaluation feedback

---

# 🔄 5. ORCHESTRATION PIPELINES (MODES)

### **Mode 1: Persona Mode (single philosopher)**

* Skip theme classification
* Select specific philosopher
* PerspectiveAgent (+ RAGSearchTool)
* SafetyAgent
* Return final answer

### **Mode 2: General Overview**

* ThemeClassifierAgent
* PhilosopherSelectorAgent
* Parallel PerspectiveAgents
* SynthesisAgent
* SafetyAgent

### **Mode 3: Compare & Contrast**

* Same as above but with 2–3 philosophers explicitly

### **Mode 4: Exploration Mode**

User asks a vague question → system produces:

* topic breakdown
* recommended philosophers per topic
* overview across centuries

### **Mode 5: Deep Dive (Looped)**

Orchestrator enters:

* multi-step refinement
* quote verification
* chapter linking

---

# 📚 6. PHILOSOPHER TEXT INGESTION PIPELINE

### Steps:

1. Download `.txt` books from Project Gutenberg.
2. Normalize encoding + clean formatting.
3. Split into sections (chapters or logical segments).
4. Chunk into ~600 tokens per piece.
5. Generate embeddings.
6. Store in Firestore:

   * chunk text
   * philosopher
   * work
   * chapter
   * chunk index
   * embedding vector

### Optional Upgrade:

* Use Vertex Matching Engine for fast vector search.

---

# 📊 7. ANALYTICS & OBSERVABILITY

### Firestore collections:

* `agentTraces`
* `questions`
* `sessions`
* `sessionSummaries`
* `analytics`

### Metrics:

* latency
* hallucination rate
* grounding accuracy
* tool usage
* cost per question

### Logging:

* detailed chain-of-thought traces (internal only)
* tool calls
* retries
* loop steps

### Tracing:

* OpenTelemetry exporting to Cloud Monitoring

---

# 🛡 8. SAFETY & QUALITY EVALUATION

### **8.1 Evaluation Agents**

* LLM-as-a-Judge for outputs
* Hallucination checker
* Groundedness critic

### **8.2 Automated Evaluation (Vertex Evaluations)**

* Golden dataset of philosophical questions
* Daily/weekly scheduled evaluation runs
* Score regression tracking

### **8.3 Deployment Gates**

* Do not deploy if:

  * groundedness < threshold
  * hallucinations increase
  * latency regressions

---

# 🧱 9. INFRASTRUCTURE (GOOGLE CLOUD)

### Cloud Run

* host Next.js app
* scalable
* cold-start optimized

### Firebase

* Firestore
* Storage
* Hosting optional
* Analytics

### Vertex AI

* Gemini Flash / Pro
* Embeddings
* Evaluation

### Monitoring

* Logging
* Metrics
* Alerts

### Networking

* Rate limiting
* Per-route quotas

---

# 🖥️ 10. UI/UX ARCHITECTURE

### Components:

* Chat UI (references Rewind/Shadcn aesthetics)
* Philosopher cards
* Multi-panel comparison view
* Quote-link cards (with anchors to Gutenberg)
* Themes explorer (grid of philosophical topics)
* Century/Region filters

### Admin Dashboard:

* Cost summary
* Per-agent latency
* Tool usage heatmap
* Hallucination rate
* Analytics export

---

# 🗂 11. PROJECT FOLDER STRUCTURE

```
app/
  page.tsx
  layout.tsx
  api/
    ask/route.ts
    admin/metrics/route.ts
    admin/sessions/route.ts
lib/
  orchestrator/
    index.ts
    plan.ts
  agents/
    themeClassifier.ts
    philosopherSelector.ts
    retrieval.ts
    perspective.ts
    synthesis.ts
    summarizer.ts
    recommendation.ts
    safety.ts
  tools/
    ragSearch.ts
    gutenbergLink.ts
    analyticsLog.ts
    memory.ts
    quoteExtraction.ts
  data/
    philosophers.json
    themes.json
    links.json
philosophy_corpus/
  raw_txt/
  cleaned/
  chunks/
  embeddings/
```

---

# 🛣 12. DEVELOPMENT ROADMAP

### **Phase 1 — Core MVP**

* Persona mode
* 1–20 philosophers
* Basic RAG
* Clean UI

### **Phase 2 — Multi-Agent Upgrade**

* Theme classification
* Multi-perspective panels
* SynthesisAgent
* Summarizer

### **Phase 3 — Advanced Features**

* Quote linking
* Preferences memory
* Region/Century explorer
* SafetyAgent

### **Phase 4 — V3 Evolution**

* MCP tools
* External APIs
* Self-improving evaluation loops
* Research-grade citations

---

# ✔ END OF MASTER PLAN

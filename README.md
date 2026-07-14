# Nexus AI: Multi-Agent Autonomous Workspace & Intelligence Marketplace

Nexus AI is a state-of-the-art, high-performance platform that coordinates autonomous specialized AI agents (Router, Planner, Memory, Coder, Researcher, Vision) to solve complex, multi-step engineering and research problems. 

The system is built on a full-stack, decoupled architecture comprising a modern **React + Vite + Tailwind CSS** frontend, an **Express.js proxy gateway** for secure server-side Gemini API calls, and an enterprise-grade **FastAPI (Python) backend** powered by **ChromaDB** for vector storage, **SQLAlchemy** with **MySQL/SQLite** for relational metrics, and **Ollama** + **Groq** for high-performance inference.

---

## 📂 Repository Directory Tree

Below is the structured catalog of all files and folders in this repository:

```text
.
├── .env.example                # Template for core environment keys (e.g., GROQ_API_KEY)
├── api/                        # Vercel serverless functions (chat + health endpoints)
├── .gitignore                  # Git exclusion rules for node_modules, build outputs, and credentials
├── docker-compose.yml          # multi-container system deployment orchestration definition
├── index.html                  # Standard entry point for Vite React client-side hydration
├── metadata.json               # Platform configuration parameters and capabilities for AI Studio
├── package-lock.json           # Locked npm packages dependencies graph
├── package.json                # Frontend package configuration, scripts (build, dev, start, lint)
├── server.ts                   # Full-Stack Express.js gateway server proxing Gemini completions
├── tsconfig.json               # Strict compiler rules configuration for TypeScript
├── vite.config.ts              # Vite asset compiler, bundler, and local proxy setup
│
├── assets/                     # Graphic resources and SVG launcher icons
│
├── backend/                    # Python FastAPI Multi-Agent Microservice
│   ├── Dockerfile              # Python Docker runtime builder leveraging debian-slim layers
│   ├── requirements.txt        # Backend dependencies (FastAPI, SQLAlchemy, ChromaDB, httpx, JWT, etc.)
│   └── app/                    # Primary application package
│       ├── main.py             # FastAPI entrypoint, Middlewares, and SQLite/MySQL auto-sync
│       ├── agents/             # Intelligent Orchestrators
│       │   └── graph.py        # NexusOrchestrator sequential & parallel routing state machine
│       ├── api/                # HTTP Endpoints routing controllers
│       │   └── endpoints.py    # Auth, Projects, Chats, Stream (SSE), Documents RAG, Memory, Admin Logs
│       ├── core/               # System Configurations
│       │   ├── config.py       # Pydantic Settings management and defaults loader
│       │   └── security.py     # Password hashing, verification, and HS256 JWT utilities
│       ├── database/           # Persistent SQL Session Managers
│       │   └── session.py      # SQLAlchemy connection pooling and SQLite graceful fallbacks
│       ├── models/             # Relational Database Tables schemas
│       │   └── models.py       # User, Chat, Message, Document, Project, Memory, Settings, Logs, Session
│       ├── schemas/            # Data validation and serialization DTO definitions
│       │   └── schemas.py      # Pydantic Schemas mapping models to network responses safely
│       └── services/           # External integration service adapters
│           ├── groq_ollama.py  # LLM query manager with smart streaming (SSE) and Ollama failover fallback
│           └── rag.py          # Document processor (PDF, Word, TXT, CSV extraction, chunking, Chroma)
│
└── src/                        # React Frontend Workspace
    ├── App.tsx                 # Main SPA orchestrator, navigation routers, state manager
    ├── index.css               # Tailwind CSS declarations with custom neon & glassmorphic classes
    ├── main.tsx                # Client-side entry bootstrapper mounting React inside DOM
    ├── types.ts                # Shared TypeScript type signatures (AgentType, MessageType, ThreadType, etc.)
    └── components/             # Reusable UI component modules
        ├── Sidebar.tsx         # Left-side navigator with thread logs and avatar preferences
        ├── MarketplaceView.tsx # Showcase panel listing agents, capabilities, and telemetry metrics
        ├── ChatView.tsx        # Conversation center supporting rich code renderers and thought process logs
        ├── WorkspaceView.tsx   # Visual grid detail for project engineering environments
        ├── SystemView.tsx      # Diagnostic logs monitoring latencies and concurrent queues
        └── SettingsView.tsx    # Configuration control for personal prompts and accounts
```

---

## 🛠️ File-by-File Technical Directory

### 🌐 Root Configuration Files
* **`package.json`**: Manages all frontend and server compilation tasks. Includes specific production scripts:
  * `dev`: Runs `tsx server.ts` to spin up the local Express gateway with Vite middleware active.
  * `build`: Pre-compiles the React application to static files inside `/dist`, then bundles `server.ts` into a unified, secure CommonJS module (`dist/server.cjs`) via `esbuild`.
  * `start`: Runs `node dist/server.cjs` to launch the self-contained full-stack container.
* **`server.ts`**: The full-stack Express proxy used for local development and self-hosted/Docker deployments. It serves the built SPA in production and routes chat completions through the server. When a valid `GROQ_API_KEY` is present, it calls the Groq API (`llama-3.3-70b-versatile`, with automatic fallback to `qwen/qwen3-32b` and `deepseek-r1-distill-llama-70b`) with structured system instructions to format output schemas dynamically; if keyless, it gracefully fires standard offline high-fidelity simulator outputs.
* **`api/chat.ts` / `api/health.ts`**: Vercel serverless functions exposing the same `/api/chat` and `/api/health` behavior for production deployments on Vercel (no Express server involved). Both share their core logic with `server.ts` via `api/_lib/chat-logic.ts` so behavior never drifts between environments.
* **`vercel.json`**: Vercel project configuration — builds the Vite SPA into `dist`, auto-deploys everything under `api/` as serverless functions, and rewrites non-API routes to `index.html` for client-side routing.
* **`docker-compose.yml`**: Orchestrates a 4-tier local server architecture:
  * **`db`**: MySQL 8.0 relational database containing all session files, user profiles, and logs.
  * **`chroma`**: Persistent high-density Chroma vector database for instant similarity lookups.
  * **`ollama`**: Standard local LLM runner allowing complete privacy for offline inference fallbacks.
  * **`backend`**: Our FastAPI python microservice linking all models together.

### 🐍 Python Backend Microservice (`/backend`)
* **`app/main.py`**: Boots the FastAPI app, attaches CORS middleware, implements timing logs to record latencies, and triggers SQLAlchemy's auto-generation engine (`Base.metadata.create_all`) to ensure all tables exist in the target database.
* **`app/core/config.py`**: System settings module. Configures connections to databases, fallback hosts, and declares supported Groq enterprise models (`llama-3.3-70b-versatile`, `qwen/qwen3-32b`, `deepseek-r1-distill-llama-70b`) along with local Ollama models.
* **`app/core/security.py`**: Generates cryptographic secure signatures. Leverages `passlib` bcrypt hashing for safe password storage and `jose` JWT utilities to mint timed bearer access and refresh tokens.
* **`app/database/session.py`**: Initializes the database engine. If connected to MySQL, configures optimized connection pooling (`pool_pre_ping`, `pool_size=10`, `max_overflow=20`) to handle massive client concurrencies. If connection fails or runs in a sandbox, it falls back seamlessly to a local `sqlite3` driver.
* **`app/models/models.py`**: Structured SQL relationships tracking:
  * `User` & `UserSession`: User register registries and JWT session rotators.
  * `Chat` & `Message`: Thread logging, agent nodes, and JSON containers for nested `thought_process` and `code_block` keys.
  * `Document` & `Memory`: Storage paths and RAG variables.
  * `APILog`: Server telemetry registers detailing latency timings (ms) and status codes.
* **`app/schemas/schemas.py`**: Pydantic validation decorators preventing malformed JSON structures from entering the application context.
* **`app/services/groq_ollama.py`**: Inference orchestration adapter. Handles secure connections to Groq. Provides streaming generators via Server-Sent Events (SSE) and includes automatic hardware failover: if Groq is overloaded or offline, it falls back instantly to local Ollama nodes (`deepseek-r1` or `llama3.2`).
* **`app/services/rag.py`**: Core indexing service. Uses `pdfplumber`, `python-docx`, and `pandas` to extract raw texts from attachments. Segments documents using a token-boundary overlap chunker and saves embeddings into ChromaDB collection `nexus_documents`.
* **`app/agents/graph.py`**: Multi-agent routing graph (`NexusOrchestrator`). Based on user intent, it triggers specific agent blocks:
  * **Router**: Classifies prompt keywords to dispatch to appropriate nodes.
  * **Planner**: Decomposes requests into precise sequential milestones.
  * **Coding Agent**: Returns full-fledged code scripts structured in unified JSON objects.
  * **Research / Vision / Tool**: Simulates specific research citations, vision layout coordinates, and sandboxed mathematics.
* **`app/api/endpoints.py`**: Exposes secure REST endpoints. Supports multipart uploads for document ingesters, custom SSE streams for chat completions, and administrative log retrieval.

### ⚛️ React UI Workspace (`/src`)
* **`App.tsx`**: SPA orchestrator. Keeps track of active workspaces, chats, configurations, and metric counters. Routes state transitions beautifully and executes API fetch dispatches to the `/api/chat` Express proxy.
* **`types.ts`**: Unified TypeScript signatures, making sure there are zero type-casting conflicts across components.
* **`components/Sidebar.tsx`**: Collapsible left navigation drawer tracking active chat sessions, profiles, and workspace directories.
* **`components/MarketplaceView.tsx`**: Display card registry for the premium agent ecosystem. Includes live telemetry tracking, progress metrics, and controls to deploy customized configurations.
* **`components/ChatView.tsx`**: Complete interactive messenger. Supports real-time thought-process expansion boxes, responsive typing animations, and custom code cards featuring dark IDE mock designs.
* **`components/SystemView.tsx`**: Interactive hardware diagnostics screen. Renders responsive SVG latency charts, active job queues, and token burn thresholds.

---

## 🚀 Quickstart and Setup Instructions

### Option A: Standard Full-Stack Development Mode
Suitable for fast iterations on the React frontend and server.

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Variables**:
   Create a `.env` file at the root and provide your parameters (copy `.env.example`):
   ```env
   GROQ_API_KEY="your-groq-api-key"
   APP_URL="http://localhost:3000"
   ```
   Without a real key, the app still runs fully in offline simulation mode.
3. **Boot the App**:
   ```bash
   npm run dev
   ```
   The Express proxy and Vite compilation will activate on `http://localhost:3000`.

---

### Option B: Deploy to Vercel (Recommended for Production)
The React frontend and the Groq-backed chat API deploy as a single zero-config Vercel project — no Express server or Docker stack required. (The `backend/` FastAPI microservice and `docker-compose.yml` stack are an optional, separate self-hosted architecture and are **not** used by this deployment path.)

1. **Push this repository to GitHub/GitLab/Bitbucket**, then [import it into Vercel](https://vercel.com/new).
2. **Framework detection**: Vercel reads `vercel.json` and auto-detects Vite. Build command (`vite build`) and output directory (`dist`) are already configured — no changes needed.
3. **Set environment variables** in your Vercel Project → Settings → Environment Variables:
   * `GROQ_API_KEY` — your Groq API key (get one at [console.groq.com](https://console.groq.com)). Without it, `/api/chat` automatically falls back to simulation mode instead of failing.
4. **Deploy**. Vercel builds the static SPA into `dist/` and automatically deploys everything under `api/` (`api/chat.ts`, `api/health.ts`) as serverless functions.
5. **Verify**: once deployed, visit `https://<your-project>.vercel.app/api/health` — it should return `{"status":"ok", ...}`.

You can also deploy from your machine with the Vercel CLI:
```bash
npm install -g vercel
vercel        # preview deployment
vercel --prod # production deployment
```
When prompted, add `GROQ_API_KEY` to the project's environment variables (or run `vercel env add GROQ_API_KEY`).

---

### Option C: High-Density Containerized Deployment (Docker Compose)
Suitable for deploying the complete multi-service stack with persistent databases and vector indexing.

1. **Prerequisites**: Ensure Docker and Docker Compose are installed and running locally.
2. **Launch the Containers**:
   ```bash
   docker-compose up --build -d
   ```
3. **Verify running containers**:
   ```bash
   docker ps
   ```
   * **React/Express**: Accessible on `http://localhost:3000`
   * **FastAPI Backend**: Running on `http://localhost:8000`
   * **Chroma DB**: Exposing interface on `http://localhost:8001`
   * **MySQL Server**: Listening on port `3306`

4. **Shutdown the stack**:
   ```bash
   docker-compose down -v
   ```

---

## 💡 System Design Highlights

* **Automatic Provider Fallback**: The backend queries Groq API for speed. If keys are missing or a server timeout occurs, requests fall back instantly to local Ollama endpoints so that service is never interrupted.
* **State-Machine Routing**: Every query goes through `NexusOrchestrator` to classify intent first. It plans steps sequentially, generating dynamic markdown code files or research tables custom-made for the task.
* **Adaptive Glass UI**: Fully responsive layouts built on a deep slate base (`#13131b`) and bordered by Zinc lines, producing a striking modern workspace design.

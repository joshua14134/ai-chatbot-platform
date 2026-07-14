# Nexus AI Backend: Python FastAPI Multi-Agent Microservice

This directory contains the core intelligence behind the Nexus AI platform: a scalable **FastAPI** application orchestrating autonomous specialized agents, handling secure user authentication, managing project resources, and processing document ingestions via a **ChromaDB** retrieval-augmented generation (RAG) pipeline.

---

## 📂 Backend File Structure

```text
/backend
├── Dockerfile              # Docker runtime builder using lightweight python:3.12-slim
├── requirements.txt        # Backend dependencies (FastAPI, SQLAlchemy, ChromaDB, httpx, etc.)
└── app/                    # Primary Application module
    ├── main.py             # FastAPI entrypoint, CORS configuration, and DB table synchronization
    ├── agents/             # Autonomous Agent Nodes
    │   └── graph.py        # NexusOrchestrator sequence routing state machine
    ├── api/                # Network Endpoints Routing
    │   └── endpoints.py    # Authentication, chats, document uploading, vector querying, and admin logs
    ├── core/               # Shared Global Configurations
    │   ├── config.py       # Pydantic Settings loader for environment parameters
    │   └── security.py     # JWT token encoders and bcrypt password hash wrappers
    ├── database/           # Relational Database connection manager
    │   └── session.py      # SQLAlchemy connection pool with SQLite backup fallback
    ├── models/             # SQL Table Declarations
    │   └── models.py       # SQL schemas (Users, Chats, Messages, Projects, Documents, APILogs)
    ├── schemas/            # Data Validation DTO Models
    │   └── schemas.py      # Pydantic schemas mapping REST input/output formats
    └── services/           # External API & Local Service Modules
        ├── groq_ollama.py  # Dual-provider LLM connector with streaming support and Ollama fallback
        └── rag.py          # Document parsers, token chunker, and ChromaDB vector store wrapper
```

---

## 🔑 Environment Configuration

Ensure the following variables are configured in your `.env` file or exported in your terminal context:

| Variable Name | Description | Default Value |
|:---|:---|:---|
| `DATABASE_URL` | SQLAlchemy relational database link | `mysql+pymysql://nexus_user:nexus_secure_password@localhost:3306/nexus_chatbot` |
| `SECRET_KEY` | Hex-encoded key for application-level encryption | `09d25e094faa6ca2556c818166...` |
| `JWT_SECRET` | Hex-encoded key used to sign session JWTs | `09d25e094faa6ca2556c818166...` |
| `CHROMA_SERVER_HOST` | Host address of Chroma vector database server | `localhost` |
| `CHROMA_SERVER_PORT` | Port of Chroma vector database server | `8001` |
| `GROQ_API_KEY` | API Key for high-speed Groq inference nodes | (Optional) |
| `OLLAMA_URL` | Endpoint for local offline models execution | `http://localhost:11434` |

---

## 🗄️ Relational Database Schema (`SQLAlchemy`)

The backend initializes and synchronizes the following tables inside the relational database (MySQL or SQLite) on startup:

1. **`users`**: Contains email, hashed password, name, admin flag, and account creation dates.
2. **`user_settings`**: Stores custom parameters for users, including preferred theme, system prompts, temperature tuning, and selected active agent nodes.
3. **`projects`**: Simple groups of associated chat threads, documents, and memories.
4. **`chats`**: Individual interactive threads, detailing which LLM model is selected.
5. **`messages`**: Raw logs for all user/assistant turns. Houses JSON fields storing exact thought process paths and compiled code block payloads.
6. **`documents`**: Attachment indexer tracking names, file types, sizes, and disk paths.
7. **`memories`**: Key-value pairs tracking semantic context and user preferences over time.
8. **`user_sessions`**: Rotating JWT refresh token registry preventing session theft.
9. **`api_logs`**: Telemetry register logging route names, latencies (ms), and HTTP status codes.

---

## 🧬 Multi-Agent Orchestrator (`NexusOrchestrator`)

At the core of `app/agents/graph.py` is the state-machine router. It processes user instructions sequentially:

```text
               ┌───────────────┐
               │  User Prompt  │
               └───────┬───────┘
                       │
                       ▼
             ┌───────────────────┐
             │   Intent Router   │
             └─────────┬─────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
  (Complex Prompt)          (Simple Prompt)
┌──────────────────┐               │
│  Master Planner  │               │
└─────────┬────────┘               │
          │                        │
          ▼                        ▼
┌────────────────────────────────────────────────────────┐
│             Dispatched Specialized Agent               │
├──────────────┬──────────────┬─────────────┬────────────┤
│ Coding Agent │ Research Agt │ Vision Agt  │ Tool Agent │
└──────┬───────┴──────┬───────┴──────┬──────┴─────┬──────┘
       │              │              │            │
       └──────────────┼──────────────┴────────────┘
                      ▼
            ┌──────────────────┐
            │ Response Builder │
            └──────────────────┘
```

---

## 📡 Key REST Endpoints

All core API routes are prefixed by `/api/v1` (configured in `config.py`):

### 🔐 Session & Profile Management
* `POST /api/v1/auth/register`: Create a new account and instantiate default settings.
* `POST /api/v1/auth/login`: Validate credentials and issue timed Access and Refresh JWTs.
* `POST /api/v1/auth/refresh`: Refresh expired sessions using the rotating token registry.
* `GET /api/v1/users/me`: Fetch active user profile information.

### 💬 Chat & Streaming AI
* `POST /api/v1/chats`: Initiate a new conversation session.
* `POST /api/v1/chats/{chat_id}/messages`: Submit user messages to trigger the Multi-Agent orchestrator pipeline synchronously.
* `GET /api/v1/chats/{chat_id}/stream`: Establishes a server-sent event (SSE) stream returning markdown chunks in real-time.

### 📂 Document Retrieval-Augmented Generation (RAG)
* `POST /api/v1/documents/upload`: Accepts files (PDF, docx, CSV, txt), parses their contents asynchronously on a background thread, segments text chunks, and saves vector embeddings inside ChromaDB.

---

## 🚀 Independent Backend Launch

To spin up the Python FastAPI backend directly (without Docker):

1. **Create Virtual Environment**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. **Install requirements**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Launch Server**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend will start and synchronize database tables. Interactive Swagger API documentation can be accessed on `http://localhost:8000/docs`.

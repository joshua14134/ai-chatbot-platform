import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { handleChatRequest, isGroqReady, type ChatRequestBody } from "./api/_lib/chat-logic.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  if (isGroqReady()) {
    console.log("Groq API key detected. Chat requests will be routed to Groq.");
  } else {
    console.log("No GROQ_API_KEY provided or using placeholder. Running in high-fidelity simulation mode.");
  }

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      provider: "groq",
      hasApiKey: isGroqReady(),
      timestamp: new Date().toISOString()
    });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const result = await handleChatRequest(req.body as ChatRequestBody);
      res.json(result);
    } catch (err: any) {
      const statusCode = err?.statusCode ?? 500;
      console.error("Error handling /api/chat:", err);
      res.status(statusCode).json({ error: err?.message || "Internal server error" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexus AI backend server active on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});

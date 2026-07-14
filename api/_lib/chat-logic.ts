export const GROQ_MODELS = [
  "llama-3.3-70b-versatile",
  "qwen/qwen3-32b",
  "deepseek-r1-distill-llama-70b"
];

export function isGroqReady(): boolean {
  const key = process.env.GROQ_API_KEY;
  return !!key && key !== "MY_GROQ_API_KEY";
}

export async function callGroq(model: string, systemInstruction: string, prompt: string) {
  const groqApiKey = process.env.GROQ_API_KEY;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${groqApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned an empty response");
  }
  return content as string;
}

export interface ChatRequestBody {
  prompt?: string;
  model?: string;
  history?: unknown[];
  agentId?: string;
}

export function getAgentSteps(agentId: string | undefined) {
  let steps = ["Router", "Planner", "Analysis Agent"];
  let defaultThought = "Analyzing query... decomposing task... formulating comprehensive answer.";
  let defaultFilename = "";
  let defaultCode = "";
  let defaultLanguage = "";

  if (agentId === "router") {
    steps = ["Router", "Synthesizer"];
    defaultThought = "Routing prompt across specialized node nodes... validating network routes.";
  } else if (agentId === "planner") {
    steps = ["Router", "Planner", "Coordinator"];
    defaultThought = "Analyzing project roadmap... decomposing requirements into sprints... structuring tasks.";
  } else if (agentId === "coding") {
    steps = ["Router", "Planner", "Coding Agent"];
    defaultThought = "Parsing requirements... locating hotspots... generating production-grade implementation.";
    defaultFilename = "src/utils/optimize.ts";
    defaultCode = `export function optimizeCache<T>(key: string, value: T): void {\n  // Implementation here\n}`;
    defaultLanguage = "typescript";
  } else if (agentId === "research") {
    steps = ["Router", "Web Search", "Research Agent"];
    defaultThought = "Initiating academic crawler... fetching recent web data... filtering scholarly journals.";
  } else if (agentId === "memory") {
    steps = ["Router", "Vector Database", "Memory Controller"];
    defaultThought = "Querying semantic database... computing cosine similarity... expanding sliding context window.";
  } else if (agentId === "vision") {
    steps = ["Router", "Spatial Analyzer", "Vision Pipeline"];
    defaultThought = "Parsing coordinate vectors... rendering depth map buffers... detecting structural features.";
  }

  return { steps, defaultThought, defaultFilename, defaultCode, defaultLanguage };
}

export function getSimulationResponse(userPrompt: string, agentId: string | undefined) {
  const { steps, defaultThought, defaultFilename, defaultCode, defaultLanguage } = getAgentSteps(agentId);
  const promptLower = userPrompt.toLowerCase();

  if (promptLower.includes("auth") || promptLower.includes("optimize") || promptLower.includes("middleware")) {
    return {
      text: "Optimizing authentication at scale requires a multi-layered caching approach. By shifting JWT validation from a database hit to a Redis-backed lookup, we can reduce latency by up to 85%. Here is the recommended Express middleware that caches sessions securely with a 15-minute TTL.",
      code: {
        filename: "middleware/auth.ts",
        language: "typescript",
        content: `import { Request, Response, NextFunction } from 'express';\nimport redis from './redis-client';\nimport jwt from 'jsonwebtoken';\n\nexport const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'Unauthorized' });\n\n  try {\n    // Check Redis cache first\n    const cachedSession = await redis.get(\`session:\${token}\`);\n    if (cachedSession) {\n      req.user = JSON.parse(cachedSession);\n      return next();\n    }\n\n    // Fallback to verification\n    const decoded = jwt.verify(token, process.env.JWT_SECRET!);\n    req.user = decoded;\n\n    // Cache session payload for 15 minutes\n    await redis.setex(\`session:\${token}\`, 900, JSON.stringify(decoded));\n    next();\n  } catch (err) {\n    res.status(401).json({ error: 'Invalid token' });\n  }\n};`
      },
      thoughtProcess: {
        steps: ["Router", "Planner", "Coding Agent"],
        text: "Analyzing performance bottlenecks... constructing Redis-backed caching strategy... generating optimized middleware implementation."
      }
    };
  }

  if (promptLower.includes("weather") || promptLower.includes("forecast")) {
    return {
      text: "Here is the localized weather intelligence model. System telemetry shows a stable maritime environment with warm temperatures. For customized alerts, consider deploying the Cron Scheduler agent.",
      code: {
        filename: "weather-service.ts",
        language: "typescript",
        content: `export interface WeatherReport {\n  city: string;\n  tempCelsius: number;\n  condition: 'Sunny' | 'Rainy' | 'Cloudy';\n}\n\nexport async function getLiveReport(city: string): Promise<WeatherReport> {\n  return {\n    city,\n    tempCelsius: 24,\n    condition: 'Sunny'\n  };\n}`
      },
      thoughtProcess: {
        steps: ["Router", "Web Search", "Research Agent"],
        text: "Geolocating coordinates... fetching satellite telemetry buffers... compiling regional meteorological data."
      }
    };
  }

  return {
    text: `Hello! I am the **Nexus Multi-Agent System**, operating with full capabilities. I have received your request: "${userPrompt}".\n\nHow would you like me to coordinate specialized agents (Router, Planner, Coder, Researcher) to solve this challenge? Let me know if you need code architectures, web crawling, or vector retrieval!`,
    code: defaultCode ? {
      filename: defaultFilename,
      language: defaultLanguage,
      content: defaultCode
    } : undefined,
    thoughtProcess: {
      steps,
      text: defaultThought
    }
  };
}

export async function handleChatRequest(body: ChatRequestBody) {
  const { prompt, model, agentId } = body;

  if (!prompt) {
    throw Object.assign(new Error("Prompt is required"), { statusCode: 400 });
  }

  const { steps, defaultThought } = getAgentSteps(agentId);
  const groqReady = isGroqReady();

  if (!groqReady) {
    return getSimulationResponse(prompt, agentId);
  }

  const requestedModel = typeof model === "string" && GROQ_MODELS.includes(model)
    ? model
    : GROQ_MODELS[0];

  const systemInstruction = `You are the Nexus Multi-Agent System (Nexus AI).
You are extremely professional, helpful, and technically sophisticated.
You are responding to the user's prompt: "${prompt}".
The active agent selected is "${agentId || 'general'}".
You MUST generate a response in the following JSON format:
{
  "thoughtProcessText": "A 1-sentence thought process explaining what you did, e.g. 'Analyzing project metrics... synthesizing token benchmarks...'",
  "explanationText": "A well-written, elegant explanation answering the user's query with rich Markdown. Do not include markdown codeblocks here, instead put your main code inside the 'codeContent' field.",
  "codeFilename": "A file path for the primary code file, e.g., 'src/components/MetricCard.tsx', or empty string if no code is needed",
  "codeContent": "The actual full text of the code snippet, or empty string if no code is needed",
  "codeLanguage": "The language identifier, e.g. 'typescript', 'javascript', 'json', 'python', 'bash', or empty string if no code is needed"
}
Ensure your response is valid JSON conforming exactly to this structure.`;

  const modelsToTry = [requestedModel, ...GROQ_MODELS.filter((m) => m !== requestedModel)];
  let lastError: unknown = null;

  for (const groqModel of modelsToTry) {
    try {
      const rawContent = await callGroq(groqModel, systemInstruction, prompt);
      const parsed = JSON.parse(rawContent.trim());

      return {
        text: parsed.explanationText,
        code: parsed.codeContent ? {
          filename: parsed.codeFilename || "index.ts",
          content: parsed.codeContent,
          language: parsed.codeLanguage || "typescript"
        } : undefined,
        thoughtProcess: {
          steps,
          text: parsed.thoughtProcessText || defaultThought
        }
      };
    } catch (err) {
      console.error(`Groq API error on model ${groqModel}:`, err);
      lastError = err;
    }
  }

  console.error("All Groq models failed, falling back to simulated output:", lastError);
  return getSimulationResponse(prompt, agentId);
}

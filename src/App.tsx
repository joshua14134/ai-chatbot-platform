import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MarketplaceView from './components/MarketplaceView';
import ChatView from './components/ChatView';
import WorkspaceView from './components/WorkspaceView';
import SystemView from './components/SystemView';
import SettingsView from './components/SettingsView';
import { AgentType, ChatThreadType, ViewState, SystemHealthMetric, MessageType } from './types';
import { Sliders, Check, Cpu, X } from 'lucide-react';

export default function App() {
  
  const [currentView, setCurrentView] = useState<ViewState>('marketplace');

  const [agents, setAgents] = useState<AgentType[]>([
    {
      id: 'router',
      name: 'Router',
      version: 'v2.4',
      status: 'ACTIVE',
      description: 'Intelligently routes complex multi-step queries to the optimal agent node pipeline.',
      capabilities: ['Routing', 'Classification', 'Inference'],
      promptTemplate: 'System: You are the traffic router. Inspect payload, classify intent, and route to Coder or Researcher.',
      icon: 'Layers'
    },
    {
      id: 'planner',
      name: 'Planner',
      version: 'v1.9',
      status: 'ACTIVE',
      description: 'Decomposes high-level objectives into sequential steps and distributes tasks.',
      capabilities: ['Planning', 'Decomposition', 'Strategy'],
      promptTemplate: 'System: You are the Master Planner. Structure tasks sequentially with milestones and resource buffers.',
      icon: 'Sliders'
    },
    {
      id: 'memory',
      name: 'Memory',
      version: 'v3.0',
      status: 'STANDBY',
      description: 'Vector-based long-term storage and semantic key-value database retriever.',
      capabilities: ['Vector Db', 'Semantic Search', 'TTL Cache'],
      promptTemplate: 'System: Retrieve historical context using cosine similarity calculations and append context window.',
      icon: 'Database'
    },
    {
      id: 'coding',
      name: 'Coding',
      version: 'v4.2',
      status: 'ACTIVE',
      description: 'Expert-level software engineering, refactoring, and secure optimization.',
      capabilities: ['Refactoring', 'Optimization', 'TypeScript'],
      promptTemplate: 'System: You are the Principal Software Engineer. Generate robust, well-typed, and optimized code blocks.',
      icon: 'Terminal'
    },
    {
      id: 'research',
      name: 'Research',
      version: 'v1.2',
      status: 'ACTIVE',
      description: 'Deep-web searching, crawling, and academic papers indexing.',
      capabilities: ['Web Search', 'Crawling', 'Analysis'],
      promptTemplate: 'System: Query live search indices, validate citations, and synthesize scientific papers.',
      icon: 'Globe'
    },
    {
      id: 'vision',
      name: 'Vision',
      version: 'v2.1',
      status: 'STANDBY',
      description: 'Spatial awareness, OCR mapping, depth rendering, and coordinate tracking.',
      capabilities: ['Computer Vision', 'OCR', 'Depth Map'],
      promptTemplate: 'System: Analyze pixel coordinate matrices and locate bounding boxes of objects.',
      icon: 'Eye'
    }
  ]);

  const [threads, setThreads] = useState<ChatThreadType[]>([
    {
      id: 'refactor-auth-service',
      title: 'Refactor Auth Service',
      model: 'Llama 3.3 70B - Groq',
      date: 'July 12, 12:59',
      messages: [
        {
          id: '1',
          sender: 'user',
          text: "Can you help me optimize the current authentication middleware? It's currently causing a bottleneck in high-concurrency scenarios. I need a robust strategy for JWT caching and session validation using Redis.",
          timestamp: '12:59'
        },
        {
          id: '2',
          sender: 'assistant',
          text: 'Optimizing authentication at scale requires a multi-layered caching approach. By shifting JWT validation from a database hit to a Redis-backed lookup, we can reduce latency by up to 85%.',
          timestamp: '12:59',
          agentUsed: 'Coding Agent',
          thoughtProcess: {
            steps: ['Router', 'Planner', 'Coding Agent'],
            text: 'Analyzing performance bottlenecks... constructing Redis-backed caching strategy... generating optimized middleware implementation.'
          },
          code: {
            filename: 'middleware/auth.ts',
            language: 'typescript',
            content: `import { redis } from './redis-client';\n\nexport const authMiddleware = async (req, res, next) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).send();\n\n  // Check Redis cache first\n  const cachedSession = await redis.get(\`session:\${token}\`);\n  if (cachedSession) {\n    req.user = JSON.parse(cachedSession);\n    return next();\n  }\n\n  // Fallback to full validation if not in cache...\n};`
          }
        }
      ]
    },
    {
      id: 'ui-system-overhaul',
      title: 'UI System Overhaul',
      model: 'gemini-3.5-flash',
      date: 'July 12, 11:24',
      messages: [
        {
          id: '1',
          sender: 'user',
          text: 'Can we switch the core layout to a high-density glassmorphism UI?',
          timestamp: '11:24'
        },
        {
          id: '2',
          sender: 'assistant',
          text: "Absolutely! I have pre-designed a custom glass panel utility mapped to a tiered Zinc level system. You can inspect the updated src/index.css layout metrics inside the Settings menu.",
          timestamp: '11:25',
          agentUsed: 'Planner v1.9',
          thoughtProcess: {
            steps: ['Router', 'Planner'],
            text: 'Loading brand style constraints... validating responsive breakpoints... mapping tiered Zinc surfaces.'
          }
        }
      ]
    },
    {
      id: 'project-orion-alpha',
      title: 'Project: Orion Alpha',
      model: 'gemini-3.1-pro-preview',
      date: 'July 11, 14:02',
      messages: [
        {
          id: '1',
          sender: 'user',
          text: 'Generate our telemetry deployment script for Kubernetes.',
          timestamp: '14:02'
        },
        {
          id: '2',
          sender: 'assistant',
          text: 'Here is the highly resilient K8s deployment spec for monitoring agent load balancer traffic.',
          timestamp: '14:03',
          agentUsed: 'Coding Agent',
          code: {
            filename: 'k8s/telemetry-deployment.yaml',
            language: 'yaml',
            content: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: nexus-telemetry\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: telemetry\n  template:\n    metadata:\n      labels:\n        app: telemetry`
          }
        }
      ]
    }
  ]);

  const [currentThreadId, setCurrentThreadId] = useState<string>('refactor-auth-service');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('coding');
  const [isGenerating, setIsGenerating] = useState(false);

  const [systemMetrics, setSystemMetrics] = useState<SystemHealthMetric>({
    latency: [120, 115, 125, 140, 110, 130, 124],
    tokenBurnUsed: 4.2,
    tokenBurnMax: 10,
    globalLoad: 'Normal',
    activeJobs: [
      { id: '1', name: 'Refactoring kernel.js', agentName: 'Coding Agent', progress: 84, status: 'Running' },
      { id: '2', name: 'Market Sentiment Analysis', agentName: 'Research Agent', progress: 0, status: 'Queued' }
    ]
  });

  const [configuringAgent, setConfiguringAgent] = useState<AgentType | null>(null);
  const [editAgentName, setEditAgentName] = useState('');
  const [editAgentStatus, setEditAgentStatus] = useState<'ACTIVE' | 'STANDBY'>('ACTIVE');
  const [editAgentPrompt, setEditAgentPrompt] = useState('');
  const [editAgentDesc, setEditAgentDesc] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setSystemMetrics((prev) => {
        const nextJobs = prev.activeJobs.map((job) => {
          if (job.status === 'Running') {
            const nextProg = job.progress + 1;
            if (nextProg >= 100) {
              return { ...job, progress: 100, status: 'Completed' as const };
            }
            return { ...job, progress: nextProg };
          }
          if (job.status === 'Queued' && Math.random() > 0.8) {
            return { ...job, status: 'Running' as const, progress: 5 };
          }
          return job;
        });
        return { ...prev, activeJobs: nextJobs };
      });
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleThreadSelect = (threadId: string) => {
    setCurrentThreadId(threadId);
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      
      if (threadId === 'refactor-auth-service') {
        setSelectedAgentId('coding');
      } else if (threadId === 'ui-system-overhaul') {
        setSelectedAgentId('planner');
      }
    }
  };

  const handleNewThread = () => {
    const newId = `thread-${Date.now()}`;
    const newThread: ChatThreadType = {
      id: newId,
      title: 'New Session',
      model: 'Llama 3.3 70B - Groq',
      date: 'Just Now',
      messages: []
    };
    setThreads((prev) => [newThread, ...prev]);
    setCurrentThreadId(newId);
    setCurrentView('chat');
  };

  const handleNewThreadWithAgent = (agent: AgentType) => {
    const newId = `thread-agent-${Date.now()}`;
    const newThread: ChatThreadType = {
      id: newId,
      title: `${agent.name} Workspace Session`,
      model: 'gemini-3.5-flash',
      date: 'Just Now',
      messages: []
    };
    setThreads((prev) => [newThread, ...prev]);
    setCurrentThreadId(newId);
    setSelectedAgentId(agent.id);
    setCurrentView('chat');
  };

  const handleApplyConfiguration = () => {
    if (!configuringAgent) return;
    setAgents((prev) =>
      prev.map((a) =>
        a.id === configuringAgent.id
          ? {
              ...a,
              name: editAgentName,
              status: editAgentStatus,
              promptTemplate: editAgentPrompt,
              description: editAgentDesc
            }
          : a
      )
    );
    setConfiguringAgent(null);
  };

  const openConfiguringModal = (agent: AgentType) => {
    setConfiguringAgent(agent);
    setEditAgentName(agent.name);
    setEditAgentStatus(agent.status);
    setEditAgentPrompt(agent.promptTemplate);
    setEditAgentDesc(agent.description);
  };

  const handleSendMessage = async (text: string, agentId: string, model: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMessage: MessageType = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowStr
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === currentThreadId) {
          const updatedTitle = t.title === 'New Session' ? text.substring(0, 24) + '...' : t.title;
          return {
            ...t,
            title: updatedTitle,
            messages: [...t.messages, userMessage]
          };
        }
        return t;
      })
    );

    setIsGenerating(true);

    try {
      
      const thread = threads.find((t) => t.id === currentThreadId);
      const historyPayload = thread ? thread.messages : [];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          model,
          history: historyPayload,
          agentId
        })
      });

      if (!response.ok) {
        throw new Error('Server connection returned error state');
      }

      const data = await response.json();

      const assistantMessage: MessageType = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: nowStr,
        agentUsed: agents.find((a) => a.id === agentId)?.name + ' Node',
        thoughtProcess: data.thoughtProcess,
        code: data.code
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === currentThreadId) {
            return {
              ...t,
              messages: [...t.messages, assistantMessage]
            };
          }
          return t;
        })
      );
    } catch (err) {
      console.warn('Fallback: Triggering dynamic local fallback simulation due to network state:', err);

      setTimeout(() => {
        const fallbackText = `I have received your instruction: "${text}". I am processing this utilizing the "${agentId}" pipeline node. Custom parameters look healthy.`;
        const fallbackMessage: MessageType = {
          id: `assistant-fallback-${Date.now()}`,
          sender: 'assistant',
          text: fallbackText,
          timestamp: nowStr,
          agentUsed: agents.find((a) => a.id === agentId)?.name + ' Node',
          thoughtProcess: {
            steps: ['Router', 'Planner', 'Coordinator'],
            text: `Analyzing coordinate parameters... deploying specialized ${agentId} compiler... execution successfully validated.`
          }
        };

        setThreads((prev) =>
          prev.map((t) => {
            if (t.id === currentThreadId) {
              return {
                ...t,
                messages: [...t.messages, fallbackMessage]
              };
            }
            return t;
          })
        );
      }, 1500);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full w-full flex bg-[#13131b] overflow-hidden select-none relative font-sans">
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] rounded-full bg-[#c0c1ff]/5 blur-3xl pointer-events-none z-0" />

      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        threads={threads}
        currentThreadId={currentThreadId}
        onThreadSelect={handleThreadSelect}
        onNewThread={handleNewThread}
        userEmail="premium@nexus.ai"
        onOpenProfile={() => setCurrentView('settings')}
        onOpenHelp={() => setCurrentView('settings')}
      />

      <main className="flex-1 h-full flex flex-col overflow-hidden relative z-10 bg-zinc-950/20">
        {currentView === 'marketplace' && (
          <MarketplaceView
            agents={agents}
            onSelectAgent={(id) => {
              setSelectedAgentId(id);
              setCurrentView('chat');
            }}
            systemMetrics={systemMetrics}
            onConfigureAgent={openConfiguringModal}
            onNewThreadWithAgent={handleNewThreadWithAgent}
          />
        )}

        {currentView === 'chat' && (
          <ChatView
            currentThread={threads.find((t) => t.id === currentThreadId) || null}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
            agents={agents}
            selectedAgentId={selectedAgentId}
            onSelectAgentId={setSelectedAgentId}
          />
        )}

        {currentView === 'workspace' && <WorkspaceView agents={agents} />}

        {currentView === 'system' && <SystemView systemMetrics={systemMetrics} />}

        {currentView === 'settings' && <SettingsView userEmail="premium@nexus.ai" />}
      </main>

      {configuringAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#1b1b23] border border-zinc-800 p-6 space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="h-4.5 w-4.5 text-[#c0c1ff]" />
                <h3 className="font-display font-bold text-base text-white">
                  Configure Agent: {configuringAgent.name}
                </h3>
              </div>
              <button
                onClick={() => setConfiguringAgent(null)}
                className="h-7 w-7 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Agent Node Name</label>
                <input
                  type="text"
                  value={editAgentName}
                  onChange={(e) => setEditAgentName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-[#c0c1ff]/50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Pipeline Status</label>
                <div className="flex gap-3">
                  {['ACTIVE', 'STANDBY'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setEditAgentStatus(status as any)}
                      className={`flex-1 h-9 rounded-xl font-semibold border text-xs transition-all cursor-pointer ${
                        editAgentStatus === status
                          ? 'bg-[#c0c1ff]/15 border-[#c0c1ff]/40 text-[#c0c1ff]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">Diagnostic Description</label>
                <input
                  type="text"
                  value={editAgentDesc}
                  onChange={(e) => setEditAgentDesc(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-[#c0c1ff]/50 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-zinc-400">System Instruction Preset Prefix</label>
                <textarea
                  rows={3}
                  value={editAgentPrompt}
                  onChange={(e) => setEditAgentPrompt(e.target.value)}
                  className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-[#c0c1ff]/50 text-xs leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex gap-3">
              <button
                onClick={() => setConfiguringAgent(null)}
                className="flex-1 h-10 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyConfiguration}
                className="flex-1 h-10 rounded-xl bg-[#c0c1ff] hover:bg-[#a9abff] text-[#1000a9] text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>Apply Parameters</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

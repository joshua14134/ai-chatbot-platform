import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Paperclip, ChevronDown, Share2, MoreVertical, Copy, Check, Terminal, Play, Cpu, Server, Database, Globe, HelpCircle, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';
import { AgentType, ChatThreadType, MessageType } from '../types';

interface ChatViewProps {
  currentThread: ChatThreadType | null;
  onSendMessage: (text: string, agentId: string, model: string) => void;
  isGenerating: boolean;
  agents: AgentType[];
  selectedAgentId: string;
  onSelectAgentId: (id: string) => void;
}

export default function ChatView({
  currentThread,
  onSendMessage,
  isGenerating,
  agents,
  selectedAgentId,
  onSelectAgentId
}: ChatViewProps) {
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('Llama 3.3 70B - Groq');
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showAgentSelection, setShowAgentSelection] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [enabledTools, setEnabledTools] = useState<string[]>(['web', 'node']);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages, isGenerating]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText, selectedAgentId, selectedModel);
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools(prev => 
      prev.includes(toolId) ? prev.filter(t => t !== toolId) : [...prev, toolId]
    );
  };

  const models = [
    'Llama 3.3 70B - Groq',
    'gemini-3.5-flash',
    'gemini-3.1-pro-preview',
    'DeepSeek-V3 - API',
    'Claude 3.5 Sonnet'
  ];

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  return (
    <div className="flex flex-1 h-full overflow-hidden text-[#e4e1ed] font-sans">
      <div className="flex-1 flex flex-col h-full bg-[#13131b] overflow-hidden relative">
        <header className="h-16 border-b border-zinc-800/60 px-6 flex items-center justify-between bg-zinc-950/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="h-9 px-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs font-semibold text-[#c0c1ff] flex items-center gap-2 hover:bg-zinc-850 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{selectedModel}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {showModelDropdown && (
                <div className="absolute top-10 left-0 w-56 rounded-xl bg-[#1b1b23] border border-zinc-800 p-1.5 shadow-2xl z-20 animate-fade-in">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model);
                        setShowModelDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="h-4 w-px bg-zinc-800" />

            <div>
              <h2 className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                Thread: {currentThread?.title || 'New Workspace Session'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="h-9 w-9 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all cursor-pointer">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="h-9 w-9 rounded-lg bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800/40 transition-all cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              title="Toggle Agent Context Sidebar"
              className={`h-9 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                isSidebarOpen
                  ? 'bg-[#c0c1ff]/10 border-[#c0c1ff]/20 text-[#c0c1ff] hover:bg-[#c0c1ff]/15'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <span>Context</span>
              <span className={`h-1.5 w-1.5 rounded-full ${isSidebarOpen ? 'bg-[#c0c1ff]' : 'bg-zinc-600'}`} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {currentThread ? (
            currentThread.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 max-w-4xl mx-auto ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'assistant' && (
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#c0c1ff] border border-[#c0c1ff]/30 flex items-center justify-center text-[#1000a9] shadow-md flex-shrink-0">
                    <Cpu className="h-4.5 w-4.5" />
                  </div>
                )}

                <div className={`max-w-[85%] flex flex-col space-y-3`}>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 px-1 font-semibold">
                    <span>{message.sender === 'user' ? 'You' : 'Nexus Multi-Agent System'}</span>
                    <span>•</span>
                    <span className="font-mono">{message.timestamp}</span>
                    {message.agentUsed && (
                      <>
                        <span>•</span>
                        <span className="text-[#c0c1ff] bg-[#c0c1ff]/10 px-1.5 py-0.5 rounded text-[10px] font-mono">
                          {message.agentUsed}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl p-4.5 border text-sm leading-relaxed ${
                      message.sender === 'user'
                        ? 'bg-[#1b1b23] border-zinc-800 text-zinc-200'
                        : 'bg-[#15151f] border-zinc-850/80 text-zinc-200'
                    }`}
                  >
                    {message.sender === 'assistant' && message.thoughtProcess && (
                      <div className="mb-4 border border-zinc-800/80 bg-zinc-950/60 rounded-xl p-3.5 space-y-2.5">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5 text-[#c0c1ff]" />
                          <span>Thought Process</span>
                        </div>

                        <div className="flex items-center flex-wrap gap-2 py-1">
                          {message.thoughtProcess.steps.map((step, idx) => (
                            <React.Fragment key={step}>
                              <div className="flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg text-xs border border-zinc-800/60 font-mono text-zinc-300">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                <span>{step}</span>
                              </div>
                              {idx < message.thoughtProcess!.steps.length - 1 && (
                                <ChevronRight className="h-3.5 w-3.5 text-zinc-600 flex-shrink-0" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <p className="text-xs italic text-[#c0c1ff] font-medium bg-zinc-900/40 p-2.5 rounded-lg border-l-2 border-[#c0c1ff] leading-relaxed">
                          "{message.thoughtProcess.text}"
                        </p>
                      </div>
                    )}

                    <p className="whitespace-pre-line text-[14px] leading-relaxed text-zinc-100 font-sans">
                      {message.text}
                    </p>

                    {message.code && (
                      <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/90 overflow-hidden font-mono text-xs">
                        <div className="flex items-center justify-between bg-zinc-900/80 px-4 py-2 border-b border-zinc-800/80 text-zinc-400">
                          <span className="text-[11px] font-semibold text-zinc-300">{message.code.filename}</span>
                          <button
                            onClick={() => copyToClipboard(message.code!.content, message.id)}
                            className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="p-4 overflow-x-auto text-zinc-300 leading-relaxed text-left whitespace-pre">
                          <code>{message.code.content}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 flex-shrink-0">
                    <UserIcon />
                  </div>
                )}
              </div>
            ))
          ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#8083ff] to-[#c0c1ff] flex items-center justify-center text-[#1000a9] shadow-xl glow-indigo animate-bounce">
                <Cpu className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-extrabold text-2xl text-white tracking-tight">
                  Nexus AI Agent Sandbox
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You are inside the live sandboxed agent workspace. Instruct the specialized <strong>{selectedAgent.name}</strong> or trigger multi-agent pipelines to refactor, search, code, or vector-retrieve info.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3.5 w-full pt-4">
                {[
                  { title: "Optimize auth middleware bottlenecks", icon: "🔑" },
                  { title: "Create a web scraper to index research articles", icon: "🌐" },
                  { title: "Decompose building a secure payment endpoint", icon: "💳" }
                ].map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(p.title)}
                    className="w-full p-4 text-left rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:bg-[#1b1b26] hover:border-[#c0c1ff]/30 text-xs text-zinc-300 transition-all flex items-center gap-3 cursor-pointer"
                  >
                    <span className="text-lg">{p.icon}</span>
                    <span className="flex-1 font-medium">{p.title}</span>
                    <ChevronRight className="h-4 w-4 text-zinc-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="flex gap-4 max-w-4xl mx-auto items-start">
              <div className="h-9 w-9 rounded-xl bg-[#c0c1ff]/20 flex items-center justify-center text-[#c0c1ff] shadow-md border border-[#c0c1ff]/10 animate-spin">
                <RefreshCw className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-semibold">
                  <span>Nexus Multi-Agent System is working...</span>
                </div>
                <div className="bg-[#15151f] border border-zinc-850 p-4 rounded-2xl max-w-[85%] space-y-3.5">
                  <div className="h-2 w-1/3 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-10 w-full bg-zinc-900 rounded-lg animate-pulse border border-zinc-850/40 flex items-center px-4">
                    <span className="text-[10px] font-mono text-[#c0c1ff] animate-pulse">Running {selectedAgent.name} pipeline...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="p-4 border-t border-zinc-800/60 bg-zinc-950/20">
          <div className="max-w-4xl mx-auto space-y-3">
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/50 focus-within:border-[#c0c1ff]/50 focus-within:ring-2 focus-within:ring-[#c0c1ff]/10 transition-all flex items-center">
              
              <button className="h-11 w-11 flex items-center justify-center text-zinc-500 hover:text-white cursor-pointer transition-colors">
                <Paperclip className="h-4.5 w-4.5" />
              </button>

              <textarea
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask ${selectedAgent.name} or type command...`}
                className="flex-1 py-3 px-1.5 text-sm bg-transparent border-none text-white placeholder-zinc-500 focus:outline-none resize-none max-h-24 h-11"
              />

              <div className="flex items-center gap-2 px-3.5">
                <div className="relative">
                  <button
                    onClick={() => setShowAgentSelection(!showAgentSelection)}
                    className="h-8 px-2.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-800/60 border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Agent: <span className="text-[#c0c1ff]">{selectedAgent.name}</span></span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </button>

                  {showAgentSelection && (
                    <div className="absolute bottom-10 right-0 w-56 rounded-xl bg-[#1b1b23] border border-zinc-800 p-1.5 shadow-2xl z-20 animate-fade-in space-y-1">
                      <div className="text-[9px] font-bold text-zinc-500 px-2 py-1 uppercase tracking-widest border-b border-zinc-800/40">Select Deploy Node</div>
                      {agents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => {
                            onSelectAgentId(agent.id);
                            setShowAgentSelection(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between ${
                            selectedAgentId === agent.id
                              ? 'bg-[#c0c1ff]/10 text-white font-medium'
                              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                          }`}
                        >
                          <span>{agent.name}</span>
                          <span className="text-[9px] font-mono opacity-50">{agent.version}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isGenerating}
                  className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    inputText.trim() && !isGenerating
                      ? 'bg-[#c0c1ff] text-[#1000a9] hover:scale-105 active:scale-95'
                      : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-3.5 w-3.5 fill-current" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-2">
              <span className="flex items-center gap-1">
                <span>⚡ System is fully reactive. Try asking to <code>optimize auth middleware</code>!</span>
              </span>
              <span className="font-mono">CTRL + ENTER to send</span>
            </div>
          </div>
        </footer>
      </div>

      {isSidebarOpen && (
        <aside className="w-[300px] bg-[#0d0d15] border-l border-zinc-800/60 flex flex-col h-full text-zinc-300 font-sans p-6 overflow-y-auto space-y-6 animate-slide-in">
          <div>
            <h2 className="font-display font-semibold text-xs uppercase tracking-wider text-white mb-4">
              Agent Context
            </h2>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Active Agents
            </h3>
            
            <div className="space-y-2">
              <div className="p-3 bg-[#1b1b23] rounded-xl border border-zinc-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-white">Llama 3.3 Router</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Idle</span>
              </div>

              <div className="p-3 bg-[#1b1b23] rounded-xl border border-zinc-800/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
                  <span className="font-medium text-white">Python Interpreter</span>
                </div>
                <span className="text-[10px] text-blue-400 font-semibold animate-pulse font-mono">Computing...</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Resource Usage
            </h3>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-zinc-400">
                  <span>Token Consumption</span>
                  <span className="font-mono">1.2k / 128k</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full w-[1.5%] bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-medium text-zinc-400">
                  <span>Memory Utilization</span>
                  <span className="font-mono">420MB</span>
                </div>
                <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full w-[35%] bg-gradient-to-r from-orange-400 to-[#ffb783] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Available Tools
            </h3>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'web', name: 'Web Search', icon: <Globe className="h-4 w-4" /> },
                { id: 'node', name: 'Node.js', icon: <Terminal className="h-4 w-4" /> },
                { id: 'json', name: 'JSON Parser', icon: <Database className="h-4 w-4" /> },
                { id: 'ssh', name: 'SSH Shell', icon: <Server className="h-4 w-4" /> }
              ].map((tool) => {
                const isEnabled = enabledTools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-[85px] transition-all cursor-pointer ${
                      isEnabled
                        ? 'bg-[#c0c1ff]/10 border-[#c0c1ff]/30 text-white'
                        : 'bg-zinc-900/40 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                    }`}
                  >
                    <div className={isEnabled ? 'text-[#c0c1ff]' : 'text-zinc-600'}>
                      {tool.icon}
                    </div>
                    <span className="text-[10px] font-semibold tracking-tight leading-none block pt-2">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <div className="rounded-xl bg-gradient-to-br from-indigo-950 via-[#1b1b2c] to-zinc-950 p-4 border border-[#c0c1ff]/20 text-center relative overflow-hidden flex flex-col justify-between h-[130px]">
              <div className="absolute top-0 right-0 h-10 w-10 bg-[#c0c1ff]/10 rounded-full blur-lg" />
              <div>
                <span className="bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 text-[9px] font-extrabold px-2 py-0.5 rounded uppercase tracking-widest mb-2 inline-block">
                  Nexus Pro
                </span>
                <h4 className="text-xs font-bold text-white mb-1">
                  Unlimited Token Deployment
                </h4>
                <p className="text-[10px] text-zinc-400">
                  Upgrade to unlock continuous real-time execution pipelines.
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

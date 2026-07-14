import React, { useState, useEffect } from 'react';
import { Search, Bell, Activity, Sparkles, BookOpen, Settings, Play, Pause, RefreshCw, Layers, Sliders, Check, Terminal, ExternalLink } from 'lucide-react';
import { AgentType, SystemHealthMetric } from '../types';

interface MarketplaceViewProps {
  agents: AgentType[];
  onSelectAgent: (agentId: string) => void;
  systemMetrics: SystemHealthMetric;
  onConfigureAgent: (agent: AgentType) => void;
  onNewThreadWithAgent: (agent: AgentType) => void;
}

export default function MarketplaceView({
  agents,
  onSelectAgent,
  systemMetrics,
  onConfigureAgent,
  onNewThreadWithAgent
}: MarketplaceViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Capabilities');
  const [apiLatency, setApiLatency] = useState<number[]>([120, 115, 125, 140, 110, 130, 124]);
  const [activeTab, setActiveTab] = useState<'all' | 'installed' | 'updates'>('all');
  
  const [selectedDocAgent, setSelectedDocAgent] = useState<AgentType | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setApiLatency(prev => {
        const next = [...prev.slice(1)];
        const newVal = Math.floor(100 + Math.random() * 50);
        next.push(newVal);
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const filterChips = [
    'All Capabilities',
    'Reasoning',
    'Coding',
    'Analysis',
    'Vision',
    'PDF Extraction'
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'All Capabilities') return matchesSearch;
    
    const matchesFilter = agent.capabilities.some(cap => 
      cap.toLowerCase().includes(selectedFilter.toLowerCase()) ||
      selectedFilter.toLowerCase().includes(cap.toLowerCase())
    );
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-1 h-full overflow-hidden text-[#e4e1ed] font-sans">
      <div className="flex-1 flex flex-col h-full overflow-y-auto px-8 py-6 bg-[#13131b]">
        <header className="flex items-center justify-between gap-4 mb-8">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-sm placeholder-zinc-500 focus:outline-none focus:border-[#c0c1ff]/50 transition-all focus:ring-2 focus:ring-[#c0c1ff]/10"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span className="hover:text-white transition-colors cursor-pointer">History</span>
              <span className="hover:text-white transition-colors cursor-pointer">Projects</span>
              <span className="hover:text-white transition-colors cursor-pointer">Context</span>
            </div>

            <div className="bg-[#adc6ff]/10 text-[#adc6ff] border border-[#adc6ff]/20 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#adc6ff] animate-pulse" />
              <span>Tokens: 1.2k</span>
            </div>

            <button className="h-10 w-10 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-center hover:bg-zinc-900/80 transition-all text-zinc-400 hover:text-white relative cursor-pointer">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            </button>
          </div>
        </header>

        <div className="mb-8">
          <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight mb-2 flex items-center gap-3">
            Agent Marketplace
          </h1>
          <p className="text-zinc-400 max-w-xl text-sm leading-relaxed">
            Deploy specialized autonomous entities to your workspace. Each agent is pre-configured with industry-standard benchmarks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 items-center">
          {filterChips.map((chip) => {
            const isActive = selectedFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => setSelectedFilter(chip)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#c0c1ff] text-[#1000a9]'
                    : 'bg-zinc-900/60 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-850'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => {
            const isActive = agent.status === 'ACTIVE';
            return (
              <div
                key={agent.id}
                className="group rounded-2xl glass-panel p-5 flex flex-col justify-between hover:border-[#c0c1ff]/30 hover:bg-[#1b1b26]/95 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute -top-12 -right-12 h-24 w-24 bg-[#c0c1ff]/5 rounded-full blur-xl group-hover:bg-[#c0c1ff]/10 transition-all duration-300" />
                
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-300 group-hover:text-[#c0c1ff] transition-all duration-300">
                      <Terminal className="h-5 w-5" />
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider uppercase ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-zinc-800/80 text-zinc-500 border border-zinc-700/60'
                      }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-1 group-hover:text-[#c0c1ff] transition-colors flex items-center gap-1.5">
                    {agent.name}
                    <span className="text-[10px] font-mono font-medium text-zinc-500">{agent.version}</span>
                  </h3>
                  
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {agent.capabilities.slice(0, 3).map((cap, i) => (
                      <span key={i} className="text-[9px] font-mono bg-zinc-950/60 px-2 py-0.5 rounded text-zinc-500">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/40">
                  <button
                    onClick={() => setSelectedDocAgent(agent)}
                    className="flex-1 h-9 rounded-lg bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 hover:text-white hover:bg-zinc-850 hover:border-zinc-700 font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>View Docs</span>
                  </button>

                  <button
                    onClick={() => onConfigureAgent(agent)}
                    className="flex-1 h-9 rounded-lg bg-zinc-800/80 hover:bg-zinc-750 text-xs text-white hover:text-white hover:border-[#c0c1ff]/30 font-semibold border border-transparent transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Configure</span>
                  </button>

                  <button
                    onClick={() => onNewThreadWithAgent(agent)}
                    title="Launch instant Chat with agent"
                    className="h-9 w-9 rounded-lg bg-[#c0c1ff]/10 hover:bg-[#c0c1ff]/20 text-[#c0c1ff] flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-[#c0c1ff]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <aside className="w-[340px] bg-[#0d0d15] border-l border-zinc-800/60 flex flex-col h-full text-zinc-300 font-sans overflow-y-auto">
        <div className="p-6 border-b border-zinc-800/40">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4.5 w-4.5 text-[#c0c1ff]" />
            <h2 className="font-display font-semibold text-sm uppercase tracking-wide text-white">
              System Health
            </h2>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs text-zinc-500">API Latency</span>
            <span className="text-xs font-mono font-bold text-white">{apiLatency[apiLatency.length - 1]}ms</span>
          </div>

          <div className="h-20 flex items-end justify-between gap-1 px-1 bg-zinc-950/40 rounded-xl p-3 border border-zinc-900">
            {apiLatency.map((val, idx) => {
              const maxVal = Math.max(...apiLatency);
              const pct = (val / maxVal) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    style={{ height: `${pct}%` }}
                    className="w-full rounded-sm bg-gradient-to-t from-[#c0c1ff]/30 to-[#c0c1ff] transition-all duration-500 ease-out"
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-b border-zinc-800/40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Token Burn (24h)
            </h3>
            <span className="text-xs font-mono font-extrabold text-white">4.2M</span>
          </div>

          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-2">
            <div className="h-full w-[42%] bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] rounded-full" />
          </div>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>TIER: PREMIUM</span>
            <span>NEXT RESET: 12H</span>
          </div>
        </div>

        <div className="p-6 border-b border-zinc-800/40 flex-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
            Active Jobs
          </h3>

          <div className="space-y-4">
            {systemMetrics.activeJobs.map((job) => (
              <div key={job.id} className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-900/80 transition-all">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <h4 className="text-xs font-semibold text-white truncate max-w-[180px]">
                      {job.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500">
                      {job.agentName} • {job.status}
                    </p>
                  </div>
                  {job.status === 'Running' ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mt-1" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-zinc-600 mt-1" />
                  )}
                </div>

                {job.status === 'Running' && (
                  <div className="space-y-1 mt-2">
                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${job.progress}%` }}
                        className="h-full bg-[#c0c1ff] transition-all duration-1000"
                      />
                    </div>
                    <div className="flex justify-end text-[9px] font-mono text-zinc-500">
                      {job.progress}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-zinc-950/40 border-t border-zinc-800/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Global System Load</span>
            <span className="text-xs font-bold text-[#c0c1ff]">Normal</span>
          </div>

          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((seg) => (
              <div
                key={seg}
                className={`h-2 flex-1 rounded-sm ${
                  seg <= 4 ? 'bg-[#c0c1ff]' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>
      </aside>

      {selectedDocAgent && (
        <div className="fixed inset-y-0 right-0 w-[550px] bg-[#0d0d15] border-l border-zinc-800 shadow-2xl z-50 flex flex-col animate-slide-in">
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#c0c1ff]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display font-extrabold text-lg text-white">
                  {selectedDocAgent.name} Documentation
                </h2>
                <p className="text-xs text-zinc-500">Node version {selectedDocAgent.version}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedDocAgent(null)}
              className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Description</h3>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-xl border border-zinc-900">
                {selectedDocAgent.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Configured Capabilities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedDocAgent.capabilities.map((cap, i) => (
                  <span key={i} className="text-xs bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/10 px-3 py-1 rounded-full">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Prompt Orchestration Template</h3>
              <pre className="text-xs font-mono bg-zinc-950 p-4 rounded-xl border border-zinc-900 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                {selectedDocAgent.promptTemplate}
              </pre>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Integration Documentation</h3>
              <div className="text-sm text-zinc-400 leading-relaxed space-y-3">
                <p>
                  To programmatically deploy the <strong>{selectedDocAgent.name}</strong>, leverage the following REST architecture or instantiate a direct websocket routing connection:
                </p>
                <div className="bg-zinc-950 p-3 rounded-lg font-mono text-xs text-zinc-300 border border-zinc-900">
                  POST /api/agents/{selectedDocAgent.id}/route
                </div>
                <p>
                  Parameters include: <code>temperature</code>, <code>max_context_tokens</code>, and <code>system_prefix</code> constraints. View the workspace terminal log to verify pipeline responses.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-zinc-800 bg-zinc-950/40 flex gap-3">
            <button
              onClick={() => {
                onNewThreadWithAgent(selectedDocAgent);
                setSelectedDocAgent(null);
              }}
              className="flex-1 h-11 rounded-xl bg-[#c0c1ff] hover:bg-[#a9abff] text-[#1000a9] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              <span>Instantiate Thread</span>
            </button>
            <button
              onClick={() => {
                onConfigureAgent(selectedDocAgent);
                setSelectedDocAgent(null);
              }}
              className="h-11 px-5 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-sm hover:bg-zinc-850 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="h-4 w-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

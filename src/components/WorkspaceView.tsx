import React, { useState, useEffect } from 'react';
import { Cpu, Play, Terminal, HelpCircle, RefreshCw, Send, Plus, Check, Trash2, ArrowRight } from 'lucide-react';
import { AgentType } from '../types';

interface WorkspaceViewProps {
  agents: AgentType[];
}

interface SimulatedLog {
  id: string;
  time: string;
  source: string;
  message: string;
  type: 'info' | 'success' | 'warn';
}

export default function WorkspaceView({ agents }: WorkspaceViewProps) {
  const [activeNodes, setActiveNodes] = useState<string[]>(['router', 'planner']);
  const [logs, setLogs] = useState<SimulatedLog[]>([
    { id: '1', time: '12:59:01', source: 'System', message: 'Workspace sandbox initialized.', type: 'info' },
    { id: '2', time: '12:59:04', source: 'Router v2.4', message: 'Ready to receive orchestrator triggers.', type: 'success' },
    { id: '3', time: '12:59:10', source: 'Planner v1.9', message: 'Connected to local context directory.', type: 'info' }
  ]);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineLogIdx, setPipelineLogIdx] = useState(0);

  const toggleNode = (nodeId: string) => {
    setActiveNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const runSimulatedPipeline = () => {
    if (isRunningPipeline) return;
    setIsRunningPipeline(true);
    setPipelineProgress(0);
    setPipelineLogIdx(0);
    
    const addLog = (source: string, message: string, type: 'info' | 'success' | 'warn' = 'info') => {
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: now, source, message, type }
      ]);
    };

    addLog('Orchestrator', 'Starting multi-agent execution pipeline...', 'info');
  };

  useEffect(() => {
    if (!isRunningPipeline) return;

    const interval = setInterval(() => {
      setPipelineProgress(prev => {
        const next = prev + 5;
        if (next >= 100) {
          setIsRunningPipeline(false);
          const now = new Date().toLocaleTimeString();
          setLogs(prevLogs => [
            ...prevLogs,
            { id: Math.random().toString(), time: now, source: 'Orchestrator', message: 'Pipeline successfully completed. Metrics exported to monitor.', type: 'success' }
          ]);
          return 100;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isRunningPipeline]);

  useEffect(() => {
    if (!isRunningPipeline) return;

    const addLog = (source: string, message: string, type: 'info' | 'success' | 'warn' = 'info') => {
      const now = new Date().toLocaleTimeString();
      setLogs(prev => [
        ...prev,
        { id: Math.random().toString(), time: now, source, message, type }
      ]);
    };

    if (pipelineProgress === 10 && pipelineLogIdx === 0) {
      addLog('Router v2.4', 'Routing package request to active agents...', 'info');
      setPipelineLogIdx(1);
    } else if (pipelineProgress === 35 && pipelineLogIdx === 1) {
      if (activeNodes.includes('planner')) {
        addLog('Planner v1.9', 'Decomposing task parameters into 4 segments...', 'success');
      } else {
        addLog('Orchestrator', 'Warning: Planner is offline. Substituting generic planner fallback.', 'warn');
      }
      setPipelineLogIdx(2);
    } else if (pipelineProgress === 65 && pipelineLogIdx === 2) {
      if (activeNodes.includes('coding')) {
        addLog('Coding v4.2', 'Compiling modules... optimized auth payload generated.', 'success');
      } else {
        addLog('Orchestrator', 'Error: Coding node is offline. Terminating compilation task.', 'warn');
      }
      setPipelineLogIdx(3);
    } else if (pipelineProgress === 85 && pipelineLogIdx === 3) {
      if (activeNodes.includes('memory')) {
        addLog('Memory v3.0', 'Writing session cache state keys to vector store...', 'info');
      }
      setPipelineLogIdx(4);
    }
  }, [pipelineProgress, isRunningPipeline, activeNodes, pipelineLogIdx]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#13131b] overflow-hidden">
      <header className="h-16 border-b border-zinc-800/60 px-8 flex items-center justify-between bg-zinc-950/20">
        <div>
          <h1 className="text-base font-semibold text-white">Agent Sandbox</h1>
          <p className="text-[11px] text-zinc-500">Deploy, toggle, and trigger complex multi-agent network pipelines</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={runSimulatedPipeline}
            disabled={isRunningPipeline}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              isRunningPipeline
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-[#c0c1ff] text-[#1000a9] hover:bg-[#a9abff] active:scale-95'
            }`}
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Trigger Pipeline</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 flex flex-col overflow-hidden relative border-r border-zinc-800/40">
          <div className="mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Network Orchestrator Topology</h2>
          </div>

          <div className="flex-1 bg-zinc-950/40 rounded-2xl border border-zinc-900 flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b1b24_1px,transparent_1px),linear-gradient(to_bottom,#1b1b24_1px,transparent_1px)] bg-[size:32px_32px] opacity-25" />

            {isRunningPipeline && (
              <div className="absolute inset-0 z-0 flex items-center justify-center">
                <div className="h-[280px] w-[280px] rounded-full border border-[#c0c1ff]/10 animate-ping absolute" />
                <div className="h-[400px] w-[400px] rounded-full border border-[#c0c1ff]/5 animate-ping absolute" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-x-16 gap-y-12 max-w-xl w-full z-10 relative">
              {agents.map((agent) => {
                const isDeployed = activeNodes.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleNode(agent.id)}
                    className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-2 relative group cursor-pointer ${
                      isDeployed
                        ? 'bg-[#1b1b2c] border-[#c0c1ff]/40 text-white shadow-lg glow-indigo'
                        : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {isDeployed && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-zinc-950 animate-pulse" />
                    )}

                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all ${
                      isDeployed ? 'bg-zinc-900 border-[#c0c1ff]/20 text-[#c0c1ff]' : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                    }`}>
                      <Cpu className="h-4.5 w-4.5" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold leading-none">{agent.name}</h3>
                      <span className="text-[9px] font-mono opacity-50 block pt-1">{agent.version}</span>
                    </div>

                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      isDeployed ? 'bg-[#c0c1ff]/10 text-[#c0c1ff]' : 'bg-zinc-950 text-zinc-600'
                    }`}>
                      {isDeployed ? 'DEPLOYED' : 'OFFLINE'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {isRunningPipeline && (
            <div className="mt-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-850 flex items-center gap-4 animate-fade-in">
              <span className="text-xs font-mono font-bold text-[#c0c1ff]">{pipelineProgress}%</span>
              <div className="flex-1 h-2 bg-zinc-950 rounded-full overflow-hidden">
                <div
                  style={{ width: `${pipelineProgress}%` }}
                  className="h-full bg-gradient-to-r from-[#8083ff] to-[#c0c1ff] rounded-full"
                />
              </div>
              <span className="text-xs font-semibold text-zinc-400">Executing Node Rules...</span>
            </div>
          )}
        </div>

        <div className="w-[380px] p-6 flex flex-col overflow-hidden bg-zinc-950/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Terminal className="h-4 w-4 text-zinc-400" />
              <span>Workspace Logs</span>
            </h2>
            <button
              onClick={clearLogs}
              className="text-[10px] font-mono text-zinc-500 hover:text-white transition-colors cursor-pointer"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 bg-zinc-950 rounded-2xl border border-zinc-900 p-4 font-mono text-xs overflow-y-auto space-y-3 shadow-inner text-left select-text scrollbar-thin">
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed border-b border-zinc-900/30 pb-2">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 mb-0.5">
                  <span>[{log.time}]</span>
                  <span className="text-[#c0c1ff] font-bold">{log.source}</span>
                </div>
                <p className={`text-[11px] ${
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warn' ? 'text-orange-400' : 'text-zinc-300'
                }`}>
                  {log.message}
                </p>
              </div>
            ))}
            {isRunningPipeline && (
              <div className="flex items-center gap-2 text-[#c0c1ff] text-[11px] animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c0c1ff] animate-ping" />
                <span>Streaming system socket...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

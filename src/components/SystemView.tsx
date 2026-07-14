import React, { useState, useEffect } from 'react';
import { Activity, Cpu, Server, Shield, Zap, Sparkles, RefreshCw, Layers } from 'lucide-react';
import { SystemHealthMetric } from '../types';

interface SystemViewProps {
  systemMetrics: SystemHealthMetric;
}

export default function SystemView({ systemMetrics }: SystemViewProps) {
  const [networkLoad, setNetworkLoad] = useState(48);
  const [memoryUsage, setMemoryUsage] = useState(4.2);
  const [cpuUsage, setCpuUsage] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setCpuUsage(Math.floor(15 + Math.random() * 30));
      setNetworkLoad(Math.floor(40 + Math.random() * 20));
      setMemoryUsage(parseFloat((4.0 + Math.random() * 0.5).toFixed(2)));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#13131b] overflow-y-auto p-8 text-[#e4e1ed] font-sans">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight mb-2 flex items-center gap-3">
          System Monitor
        </h1>
        <p className="text-zinc-400 max-w-xl text-sm">
          Real-time diagnostics and telemetry parameters for local LLM pipelines and specialized agent instances.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
        <div className="rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Node CPU</span>
            <Cpu className="h-4.5 w-4.5 text-[#c0c1ff]" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-white">{cpuUsage}%</div>
            <p className="text-[10px] text-zinc-500 pt-1">4 Dedicated physical cores active</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div style={{ width: `${cpuUsage}%` }} className="h-full bg-[#c0c1ff] transition-all duration-500" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Memory Allocation</span>
            <Server className="h-4.5 w-4.5 text-orange-400" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-white">{memoryUsage} GB</div>
            <p className="text-[10px] text-zinc-500 pt-1">Allocated of 16 GB max heap limit</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div style={{ width: `${(memoryUsage / 16) * 100}%` }} className="h-full bg-orange-400 transition-all duration-500" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">API Throughput</span>
            <Zap className="h-4.5 w-4.5 text-yellow-400" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-white">{networkLoad} rps</div>
            <p className="text-[10px] text-zinc-500 pt-1">Active load balancer distribution</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div style={{ width: `${networkLoad}%` }} className="h-full bg-yellow-400 transition-all duration-500" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 space-y-4">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-xs font-bold uppercase tracking-wider">Security State</span>
            <Shield className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-display font-bold text-white">Active</div>
            <p className="text-[10px] text-zinc-500 pt-1">JWT Tokens cryptographically signed</p>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full w-full bg-emerald-400" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl glass-panel p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Router Performance Analysis</h3>
            <p className="text-xs text-zinc-500">Displays response timeline parameters in milliseconds (ms)</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="h-2 w-2 rounded-full bg-[#c0c1ff]" />
              <span>Query Latency</span>
            </span>
          </div>
        </div>

        <div className="h-64 w-full bg-zinc-950/40 rounded-xl border border-zinc-900 p-4 relative overflow-hidden flex items-end">
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#c0c1ff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#1e1e2d" strokeDasharray="4,4" />
            <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#1e1e2d" strokeDasharray="4,4" />
            <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#1e1e2d" strokeDasharray="4,4" />
            <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#1e1e2d" strokeDasharray="4,4" />

            <path
              d="M 0,180 Q 80,120 160,200 T 320,100 T 480,150 T 640,80 T 800,120 T 960,90 L 1200,120 L 1200,300 L 0,300 Z"
              fill="url(#chartGlow)"
            />

            <path
              d="M 0,180 Q 80,120 160,200 T 320,100 T 480,150 T 640,80 T 800,120 T 960,90 L 1200,120"
              fill="none"
              stroke="#c0c1ff"
              strokeWidth="3.5"
            />
          </svg>

          <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] font-mono text-zinc-600">
            <span>12:59:00</span>
            <span>12:59:15</span>
            <span>12:59:30</span>
            <span>12:59:45</span>
            <span>13:00:00</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl glass-panel p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Active Deploy Node Instances</h3>
          
          <div className="space-y-3.5">
            {[
              { name: 'Router Node v2.4', type: 'System Router', status: 'Online', load: '12% load', color: 'emerald-500' },
              { name: 'Task Planner v1.9', type: 'Objective Decomposer', status: 'Online', load: '5% load', color: 'emerald-500' },
              { name: 'Software Engineer v4.2', type: 'Compilation Coder', status: 'Busy', load: '84% load', color: 'blue-500' },
              { name: 'Crawler Researcher v1.2', type: 'Academic Indexer', status: 'Standby', load: '0% load', color: 'zinc-500' }
            ].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-950/20 border border-zinc-900 hover:bg-zinc-950/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full bg-${node.color}`} />
                  <div>
                    <h4 className="text-xs font-bold text-white">{node.name}</h4>
                    <p className="text-[10px] text-zinc-500">{node.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono text-white font-semibold block">{node.status}</span>
                  <span className="text-[10px] font-mono text-zinc-500">{node.load}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Pipeline Benchmark Parameters</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400 font-medium">Warm Start Time</span>
                <span className="text-xs font-mono font-bold text-white">12ms</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400 font-medium">Average Embedding Search</span>
                <span className="text-xs font-mono font-bold text-white">45ms</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                <span className="text-xs text-zinc-400 font-medium">JWT Check Cryptography Overhead</span>
                <span className="text-xs font-mono font-bold text-white">1.2ms</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-zinc-400 font-medium">Average Token Processing Rate</span>
                <span className="text-xs font-mono font-bold text-white">124 tokens/sec</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-[#c0c1ff]/10 text-[#c0c1ff] border border-[#c0c1ff]/20 rounded-xl text-center text-xs font-semibold flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Telemetry calibrated to Google Cloud Run container constraints</span>
          </div>
        </div>
      </div>
    </div>
  );
}

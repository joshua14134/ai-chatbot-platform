import React, { useState } from 'react';
import { Settings, Shield, Sliders, RefreshCw, Server, HelpCircle, Check, Database } from 'lucide-react';

interface SettingsViewProps {
  userEmail: string;
}

export default function SettingsView({ userEmail }: SettingsViewProps) {
  const [temperature, setTemperature] = useState(0.2);
  const [systemPrefix, setSystemPrefix] = useState('You are operating inside the Nexus Multi-Agent premium cluster.');
  const [simulateLatency, setSimulateLatency] = useState(true);
  const [maxContextTokens, setMaxContextTokens] = useState(128000);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#13131b] overflow-y-auto p-8 text-[#e4e1ed] font-sans">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-white tracking-tight mb-2 flex items-center gap-3">
          System Settings
        </h1>
        <p className="text-zinc-400 max-w-xl text-sm">
          Customize active inference parameters, routing presets, and security attributes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 rounded-2xl glass-panel p-6 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
            <Sliders className="h-4.5 w-4.5 text-[#c0c1ff]" />
            <h3 className="font-semibold text-white text-sm">Inference Tuning Parameters</h3>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-zinc-400">Node Temperature (Deterministic vs Creative)</span>
                <span className="font-mono text-[#c0c1ff]">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-[#c0c1ff] h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
                <span>0.0 (STRICT DETERMINISTIC)</span>
                <span>1.0 (CREATIVE EXPLORATION)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400">Global Orchestrator System Prefix</label>
              <textarea
                rows={3}
                value={systemPrefix}
                onChange={(e) => setSystemPrefix(e.target.value)}
                className="w-full rounded-xl bg-zinc-900/60 border border-zinc-850 p-3.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#c0c1ff]/50 transition-all focus:ring-2 focus:ring-[#c0c1ff]/10 leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400">Max Context Window Tokens</label>
              <select
                value={maxContextTokens}
                onChange={(e) => setMaxContextTokens(parseInt(e.target.value))}
                className="w-full h-10 px-3.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs text-white focus:outline-none focus:border-[#c0c1ff]/50 transition-all"
              >
                <option value={16000}>16,000 (Local lightweight)</option>
                <option value={32000}>32,000 (Medium capacity)</option>
                <option value={128000}>128,000 (Premium context flow)</option>
                <option value={1000000}>1,000,000 (Gemini hyper-scale)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-zinc-900/30 rounded-xl border border-zinc-900 text-xs">
              <div>
                <h4 className="font-semibold text-white">Network Latency Calibration Simulation</h4>
                <p className="text-[10px] text-zinc-500">Introduces structural delays to match real cluster telemetry.</p>
              </div>
              <button
                onClick={() => setSimulateLatency(!simulateLatency)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                  simulateLatency ? 'bg-[#c0c1ff]' : 'bg-zinc-800'
                }`}
              >
                <span className={`absolute top-1 left-1 bg-zinc-950 w-4 h-4 rounded-full transition-transform ${
                  simulateLatency ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex justify-end">
            <button
              onClick={handleSave}
              className="h-10 px-6 rounded-xl bg-[#c0c1ff] hover:bg-[#a9abff] text-[#1000a9] text-xs font-bold transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Configuration Applied</span>
                </>
              ) : (
                <span>Save Parameters</span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Shield className="h-4.5 w-4.5 text-[#c0c1ff]" />
              <h3 className="font-semibold text-white text-sm">Security & Auth</h3>
            </div>

            <div className="space-y-3.5 text-xs text-zinc-400">
              <div>
                <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">User Identifier</span>
                <span className="font-mono text-white text-xs bg-zinc-900 px-2 py-1 rounded block truncate">{userEmail}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Active Cluster</span>
                <span className="text-white">Cloud Run Ingress (asia-east1)</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Gemini Secret Key</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  ✓ Configured via Secrets
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-900">
              <Database className="h-4.5 w-4.5 text-orange-400" />
              <h3 className="font-semibold text-white text-sm">Environment Variables</h3>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Ensure the following parameters are present inside your deployment:
            </p>

            <pre className="text-[10px] font-mono bg-zinc-950 p-3.5 rounded-xl border border-zinc-900 text-zinc-500 text-left overflow-x-auto select-all leading-relaxed">
              # .env.example<br />
              GEMINI_API_KEY="KEY"<br />
              APP_URL="URL"
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

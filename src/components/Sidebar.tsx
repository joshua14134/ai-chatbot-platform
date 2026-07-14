import React from 'react';
import { MessageSquare, ShoppingBag, LayoutGrid, Activity, Settings, Plus, User, HelpCircle, Terminal, Cpu } from 'lucide-react';
import { ViewState, ChatThreadType } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
  threads: ChatThreadType[];
  currentThreadId: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  userEmail?: string;
  onOpenProfile: () => void;
  onOpenHelp: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  threads,
  currentThreadId,
  onThreadSelect,
  onNewThread,
  userEmail = 'premium@nexus.ai',
  onOpenProfile,
  onOpenHelp
}: SidebarProps) {
  return (
    <div className="w-[280px] bg-[#0d0d15] border-r border-zinc-800/60 flex flex-col h-full text-[#e4e1ed] relative select-none">
      <div className="p-5 flex items-center gap-3 border-b border-zinc-800/40">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#8083ff] to-[#c0c1ff] flex items-center justify-center glow-indigo animate-pulse-slow">
          <Cpu className="h-5 w-5 text-[#1000a9]" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white via-[#e4e1ed] to-[#c0c1ff] bg-clip-text text-transparent">
            Nexus AI
          </h1>
          <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">
            Premium Agent Workspace
          </p>
        </div>
      </div>

      <div className="p-4">
        <button
          onClick={onNewThread}
          className="w-full h-11 rounded-xl bg-[#c0c1ff] hover:bg-[#a9abff] text-[#1000a9] font-medium flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span className="text-sm font-semibold tracking-tight">New Thread</span>
        </button>
      </div>

      <nav className="px-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] px-3 py-2 text-zinc-500 font-bold uppercase tracking-widest">
          Core Workspace
        </div>
        
        <button
          onClick={() => onViewChange('chat')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all relative ${
            currentView === 'chat'
              ? 'bg-[#1b1b23] text-white font-medium border-l-2 border-[#c0c1ff]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageSquare className={`h-4.5 w-4.5 ${currentView === 'chat' ? 'text-[#c0c1ff]' : 'text-zinc-500'}`} />
            <span>Chat Workspace</span>
          </div>
          {threads.length > 0 && currentView !== 'chat' && (
            <span className="h-2 w-2 rounded-full bg-[#c0c1ff]" />
          )}
        </button>

        <button
          onClick={() => onViewChange('marketplace')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            currentView === 'marketplace'
              ? 'bg-[#1b1b23] text-white font-medium border-l-2 border-[#c0c1ff]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <ShoppingBag className={`h-4.5 w-4.5 ${currentView === 'marketplace' ? 'text-[#c0c1ff]' : 'text-zinc-500'}`} />
          <span>Marketplace</span>
        </button>

        <button
          onClick={() => onViewChange('workspace')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            currentView === 'workspace'
              ? 'bg-[#1b1b23] text-white font-medium border-l-2 border-[#c0c1ff]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <LayoutGrid className={`h-4.5 w-4.5 ${currentView === 'workspace' ? 'text-[#c0c1ff]' : 'text-zinc-500'}`} />
          <span>Agent Sandbox</span>
        </button>

        <button
          onClick={() => onViewChange('system')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            currentView === 'system'
              ? 'bg-[#1b1b23] text-white font-medium border-l-2 border-[#c0c1ff]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <Activity className={`h-4.5 w-4.5 ${currentView === 'system' ? 'text-[#c0c1ff]' : 'text-zinc-500'}`} />
          <span>System Monitor</span>
        </button>

        <button
          onClick={() => onViewChange('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
            currentView === 'settings'
              ? 'bg-[#1b1b23] text-white font-medium border-l-2 border-[#c0c1ff]'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/40'
          }`}
        >
          <Settings className={`h-4.5 w-4.5 ${currentView === 'settings' ? 'text-[#c0c1ff]' : 'text-zinc-500'}`} />
          <span>System Settings</span>
        </button>

        {threads.length > 0 && (
          <div className="pt-6">
            <div className="text-[10px] px-3 py-2 text-zinc-500 font-bold uppercase tracking-widest flex items-center justify-between">
              <span>Thread History</span>
              <span className="text-[9px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{threads.length}</span>
            </div>
            <div className="space-y-1 max-h-[180px] overflow-y-auto px-1">
              {threads.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => {
                    onViewChange('chat');
                    onThreadSelect(thread.id);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-all ${
                    currentThreadId === thread.id && currentView === 'chat'
                      ? 'bg-zinc-800/80 text-white font-medium border-r-2 border-[#c0c1ff]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse" />
                    <span className="truncate">{thread.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-zinc-800/40 bg-zinc-950/40 space-y-2">
        <button
          onClick={onOpenProfile}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 text-left transition-all group"
        >
          <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-700 group-hover:border-[#c0c1ff]/50 transition-all">
            <User className="h-4.5 w-4.5 text-zinc-400" />
          </div>
          <div className="truncate flex-1">
            <div className="text-xs font-semibold text-white truncate">Josh Colaco</div>
            <div className="text-[10px] text-zinc-500 truncate">{userEmail}</div>
          </div>
        </button>

        <button
          onClick={onOpenHelp}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900/50 text-left text-zinc-400 hover:text-white transition-all text-xs"
        >
          <HelpCircle className="h-4 w-4 text-zinc-500" />
          <span>Help & System Documentation</span>
        </button>
      </div>
    </div>
  );
}

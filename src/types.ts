export type ViewState = 'chat' | 'marketplace' | 'workspace' | 'system' | 'settings';

export interface AgentType {
  id: string;
  name: string;
  version: string;
  status: 'ACTIVE' | 'STANDBY';
  description: string;
  capabilities: string[];
  docContent: string;
  promptTemplate: string;
  icon: string; 
}

export interface CodeBlockType {
  filename: string;
  content: string;
  language: string;
}

export interface ThoughtProcessStep {
  name: string;
  status: 'idle' | 'running' | 'completed';
}

export interface ThoughtProcessType {
  steps: string[];
  text: string;
}

export interface MessageType {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  code?: CodeBlockType;
  thoughtProcess?: ThoughtProcessType;
  timestamp: string;
  modelUsed?: string;
  agentUsed?: string;
}

export interface ChatThreadType {
  id: string;
  title: string;
  messages: MessageType[];
  model: string;
  date: string;
}

export interface SystemHealthMetric {
  latency: number[];
  tokenBurnUsed: number;
  tokenBurnMax: number;
  activeJobs: {
    id: string;
    name: string;
    agentName: string;
    progress: number;
    status: 'Running' | 'Queued' | 'Completed';
  }[];
  globalLoad: 'Normal' | 'High' | 'Critical';
}

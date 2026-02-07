export type AgentType = 
  | 'vision'
  | 'text'
  | 'crop'
  | 'weather'
  | 'soil'
  | 'recommend'
  | 'market'
  | 'orchestrator';

export type AgentStatus = 'idle' | 'thinking' | 'working' | 'complete' | 'error';

export interface Agent {
  id: AgentType;
  name: string;
  description: string;
  icon: string;
  status: AgentStatus;
  color: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
  agentsInvolved?: AgentType[];
  sources?: string[];
  language?: string;
}

export interface AgentActivity {
  agentId: AgentType;
  action: string;
  timestamp: Date;
}

export const AGENTS: Agent[] = [
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    description: 'Manages agent communication and routes tasks',
    icon: '🎯',
    status: 'idle',
    color: 'agent-orchestrator',
  },
  {
    id: 'vision',
    name: 'Vision Agent',
    description: 'Analyzes crop images for diseases and pests',
    icon: '👁️',
    status: 'idle',
    color: 'agent-vision',
  },
  {
    id: 'text',
    name: 'Text/NLP Agent',
    description: 'Understands farmer queries and questions',
    icon: '💬',
    status: 'idle',
    color: 'agent-text',
  },
  {
    id: 'crop',
    name: 'Crop Intelligence',
    description: 'Makes agronomic decisions and diagnoses diseases',
    icon: '🌾',
    status: 'idle',
    color: 'agent-crop',
  },
  {
    id: 'weather',
    name: 'Weather & Climate',
    description: 'Fetches and analyzes weather data',
    icon: '🌤️',
    status: 'idle',
    color: 'agent-weather',
  },
  {
    id: 'soil',
    name: 'Soil & Sensor',
    description: 'Analyzes soil data and IoT sensor readings',
    icon: '🌍',
    status: 'idle',
    color: 'agent-soil',
  },
  {
    id: 'recommend',
    name: 'Recommendation',
    description: 'Generates actionable farming advice',
    icon: '💡',
    status: 'idle',
    color: 'agent-recommend',
  },
  {
    id: 'market',
    name: 'Market & Price',
    description: 'Predicts crop prices and market trends',
    icon: '📈',
    status: 'idle',
    color: 'agent-market',
  },
];

export type AgentType = 
  | "orchestrator" 
  | "vision" 
  | "text" 
  | "crop" 
  | "weather" 
  | "soil" 
  | "recommend" 
  | "market";

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AgentOutput {
  agentId: AgentType;
  content: string;
  confidence?: number;
}

export interface RequestBody {
  message: string;
  imageBase64?: string;
  hasImage: boolean;
  language?: string;
  conversationHistory: ConversationMessage[];
  activeAgents?: AgentType[];
}

export interface ChatResponse {
  response: string;
  sources?: string[];
  agentOutputs?: AgentOutput[];
  clarifyingQuestions?: string[];
  detectedLanguage?: string;
}

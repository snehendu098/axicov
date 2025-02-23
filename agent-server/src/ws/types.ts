export interface WSMessage {
  type: "initialize" | "message";
  threadId: string;
  toolNumbers?: number[];
  message?: string;
}

export interface ToolEvent {
  tool: string;
  status: string;
  message: string;
  timestamp: string;
  threadId: string;
}

export interface ChatMessage {
  type: "userMessage" | "agentResponse";
  threadId: string;
  content: string;
  timestamp: string;
}

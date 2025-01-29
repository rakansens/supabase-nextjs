export interface Message {
  role: "user" | "assistant";
  content: string;
  id: string;
  createdAt: Date;
  metadata?: {
    type?: "code" | "command" | "text";
    language?: string;
    executable?: boolean;
    context?: {
      files?: string[];
      dependencies?: string[];
      environment?: string;
    };
  };
}

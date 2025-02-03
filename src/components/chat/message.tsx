"use client";

import { Message } from "@/types/chat";
import { User, Bot } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { TypingAnimation } from "./typing-animation";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
  onExecuteCommand?: (command: string) => void;
  onPreview?: (code: string, language: string) => void;
}

interface CodeBlock {
  language: string;
  content: string;
}

const parseCodeBlocks = (content: string): (string | CodeBlock)[] => {
  const parts: (string | CodeBlock)[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    parts.push({
      language: match[1] || "plaintext",
      content: match[2].trim(),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts;
};

const isCommand = (content: string): boolean => {
  return content.startsWith("$") || content.startsWith(">");
};

export function ChatMessage({ message, onExecuteCommand, onPreview }: ChatMessageProps) {
  const parts = parseCodeBlocks(message.content);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  return (
    <div className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
      <div className={`w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center ${
        message.role === "user" ? "text-blue-500" : "text-green-500"
      }`}>
        {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex-1 space-y-4 ${message.role === "user" ? "text-right" : "text-left"}`}>
        {message.role === "assistant" && !isTypingComplete ? (
          <TypingAnimation 
            text={message.content} 
            onComplete={() => setIsTypingComplete(true)}
            speed={20}
          />
        ) : (
          parts.map((part, index) => {
            if (typeof part === "string") {
              return (
                <div key={index} className="prose dark:prose-invert max-w-none">
                  {part}
                </div>
              );
            }

            return (
              <div key={index} className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  {isCommand(part.content) && onExecuteCommand && (
                    <button
                      onClick={() => onExecuteCommand(part.content)}
                      className="p-1.5 rounded-md bg-blue-500/80 text-white hover:bg-blue-400/80 backdrop-blur-sm"
                      title="実行"
                    >
                      実行
                    </button>
                  )}
                  {onPreview && !isCommand(part.content) && (
                    <button
                      onClick={() => onPreview(part.content, part.language)}
                      className="p-1.5 rounded-md bg-green-500/80 text-white hover:bg-green-400/80 backdrop-blur-sm"
                      title="プレビュー"
                    >
                      プレビュー
                    </button>
                  )}
                </div>
                <SyntaxHighlighter
                  language={part.language}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    borderRadius: "0.5rem",
                  }}
                >
                  {part.content}
                </SyntaxHighlighter>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

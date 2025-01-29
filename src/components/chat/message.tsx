"use client";

import { useState } from "react";
import { Message } from "@/types/chat";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, vs } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";
import { Play, Copy, Check, Eye, User, Bot } from "lucide-react";
import { Sandbox } from "@/components/preview/sandbox";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  onExecuteCommand?: (command: string) => void;
}

export function ChatMessage({ message, onExecuteCommand }: ChatMessageProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<{
    files: { [key: string]: string };
    dependencies: { [key: string]: string };
  } | null>(null);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const detectCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: {
      type: "text" | "code";
      content: string;
      language?: string;
    }[] = [];
    
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: "code",
        language: match[1] || "plaintext",
        content: match[2].trim(),
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: "text",
        content: content.slice(lastIndex),
      });
    }

    return parts;
  };

  const isCommand = (code: string) => {
    return /^(ls|cd|mkdir|rm|cp|mv|git|npm|yarn|pnpm)\s/.test(code);
  };

  const handlePreview = async (code: string, language: string) => {
    try {
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error("Preview generation failed");
      }

      const data = await response.json();
      setPreviewData(data);
      setShowPreview(true);
    } catch (error) {
      console.error("Error generating preview:", error);
    }
  };

  const renderContent = () => {
    const parts = detectCodeBlocks(message.content);

    return parts.map((part, index) => {
      if (part.type === "text") {
        return (
          <div key={index} className="whitespace-pre-wrap mb-2 leading-relaxed">
            {part.content}
          </div>
        );
      } else {
        return (
          <div key={index} className="relative group my-4 rounded-lg overflow-hidden">
            <div className="absolute right-2 top-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button
                onClick={() => copyToClipboard(part.content)}
                className="p-1.5 rounded-md bg-gray-700/80 text-white hover:bg-gray-600/80 backdrop-blur-sm"
                title="コピー"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              {isCommand(part.content) && onExecuteCommand && (
                <button
                  onClick={() => onExecuteCommand(part.content)}
                  className="p-1.5 rounded-md bg-blue-500/80 text-white hover:bg-blue-400/80 backdrop-blur-sm"
                  title="実行"
                >
                  <Play size={14} />
                </button>
              )}
              {!isCommand(part.content) && (
                <button
                  onClick={() => handlePreview(part.content, part.language || "javascript")}
                  className="p-1.5 rounded-md bg-green-500/80 text-white hover:bg-green-400/80 backdrop-blur-sm"
                  title="プレビュー"
                >
                  <Eye size={14} />
                </button>
              )}
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                {part.language || "plaintext"}
              </div>
              <SyntaxHighlighter
                language={part.language}
                style={theme === "dark" ? vscDarkPlus : vs}
                customStyle={{
                  margin: 0,
                  padding: "1rem",
                  background: "transparent",
                  fontSize: "0.875rem",
                }}
              >
                {part.content}
              </SyntaxHighlighter>
            </div>
            {showPreview && previewData && (
              <div className="mt-4">
                <Sandbox
                  files={previewData.files}
                  dependencies={previewData.dependencies}
                />
              </div>
            )}
          </div>
        );
      }
    });
  };

  return (
    <div
      className={cn(
        "py-6 first:pt-0 last:pb-0",
        message.role === "user" ? "border-b border-gray-200 dark:border-gray-800" : ""
      )}
    >
      <div className="flex gap-4 max-w-3xl mx-auto">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          message.role === "user"
            ? "bg-blue-500 text-white"
            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
        )}>
          {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium mb-1 text-gray-900 dark:text-gray-100">
            {message.role === "user" ? "You" : "Assistant"}
          </div>
          <div className="prose dark:prose-invert max-w-none">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

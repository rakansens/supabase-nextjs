"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Plus, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Thread {
  id: string;
  title: string;
  lastMessage: string;
  createdAt: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([
    {
      id: "1",
      title: "新しいチャット",
      lastMessage: "ChatGPTへようこそ",
      createdAt: new Date(),
    },
  ]);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || `Error: ${response.status} ${response.statusText}`);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: error instanceof Error 
          ? `エラーが発生しました: ${error.message}` 
          : "エラーが発生しました。もう一度お試しください。",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {/* サイドバー */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* 新規チャットボタン */}
        <button className="flex items-center gap-2 m-3 p-3 rounded-md border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Plus size={16} />
          新しいチャット
        </button>

        {/* スレッド一覧 */}
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <div className="text-sm font-medium truncate">{thread.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {thread.lastMessage}
              </div>
            </div>
          ))}
        </div>

        {/* テーマ切り替えボタン */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="m-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* メインチャットエリア */}
      <div className="flex-1 flex flex-col">
        {/* チャットヘッダー */}
        <header className="border-b border-gray-200 dark:border-gray-700 p-4">
          <h1 className="text-xl font-bold">Gemini Chat</h1>
        </header>

        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <h2 className="text-2xl font-bold mb-2">Gemini Chatへようこそ</h2>
                <p>メッセージを入力してください</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className="flex gap-4 max-w-3xl mx-auto">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {message.role === "user" ? "U" : "AI"}
                </div>
                <div className="flex-1">
                  <div className="font-medium mb-1">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <div className="prose dark:prose-invert">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-4 max-w-3xl mx-auto">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                AI
              </div>
              <div className="flex-1">
                <div className="font-medium mb-1">Assistant</div>
                <div className="prose dark:prose-invert">
                  <div className="animate-pulse">考え中...</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力..."
                className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
                disabled={isLoading}
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

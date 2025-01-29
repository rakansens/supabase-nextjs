"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import SplitPane from "react-split-pane";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Moon, Sun, Send, FileCode, Eye, FolderTree } from "lucide-react";
import { useTheme } from "next-themes";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface FileStructure {
  name: string;
  type: "file" | "directory";
  content?: string;
  children?: FileStructure[];
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [files, setFiles] = useState<FileStructure[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Generation failed");
      }

      const data = await response.json();
      setFiles(data.files);
    } catch (error) {
      console.error("Error generating code:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderFileTree = (items: FileStructure[], level = 0) => {
    return (
      <div style={{ marginLeft: level * 16 }}>
        {items.map((item, index) => (
          <div key={index}>
            <div
              className={cn(
                "flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800",
                selectedFile === item.name && "bg-blue-100 dark:bg-blue-900"
              )}
              onClick={() => item.type === "file" && setSelectedFile(item.name)}
            >
              {item.type === "directory" ? (
                <FolderTree size={16} />
              ) : (
                <FileCode size={16} />
              )}
              <span>{item.name}</span>
            </div>
            {item.children && renderFileTree(item.children, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* サイドバー */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            コード生成
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {renderFileTree(files)}
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="m-4 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col">
        <div className="h-full">
          <SplitPane
            split="horizontal"
            minSize={100}
            defaultSize="50%"
            style={{ position: "relative" }}
          >
            {/* エディタ部分 */}
            <div className="h-full">
              <Tabs defaultValue="prompt" className="w-full h-full">
                <div className="border-b border-gray-200 dark:border-gray-700 px-4">
                  <TabsList>
                    <TabsTrigger value="prompt">プロンプト</TabsTrigger>
                    <TabsTrigger value="code">コード</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="prompt" className="h-[calc(100%-40px)]">
                  <div className="p-4 h-full">
                    <div className="relative h-full">
                      <MonacoEditor
                        height="100%"
                        defaultLanguage="markdown"
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        value={prompt}
                        onChange={(value) => setPrompt(value || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            生成中...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send size={16} />
                            生成
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="h-[calc(100%-40px)]">
                  <div className="p-4 h-full">
                    {selectedFile && (
                      <MonacoEditor
                        height="100%"
                        defaultLanguage="typescript"
                        theme={theme === "dark" ? "vs-dark" : "light"}
                        value={
                          files
                            .find((f) => f.name === selectedFile)
                            ?.content || ""
                        }
                        options={{
                          readOnly: true,
                          minimap: { enabled: false },
                          fontSize: 14,
                        }}
                      />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* プレビュー部分 */}
            <div className="h-full bg-white dark:bg-gray-900">
              <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Eye size={20} />
                  プレビュー
                </h2>
              </div>
              <div className="p-4">
                <div className="w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    プレビューはここに表示されます
                  </p>
                </div>
              </div>
            </div>
          </SplitPane>
        </div>
      </div>
    </div>
  );
}

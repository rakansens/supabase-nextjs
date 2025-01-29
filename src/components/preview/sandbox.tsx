"use client";

import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Play, RefreshCw } from "lucide-react";

interface SandboxProps {
  files: {
    [key: string]: string;
  };
  entry?: string;
  dependencies?: {
    [key: string]: string;
  };
}

const createHtml = (files: SandboxProps["files"], dependencies: SandboxProps["dependencies"]) => {
  const entry = files["index.html"] || `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Preview</title>
  ${Object.entries(dependencies || {})
    .map(([name, version]) => {
      if (name.endsWith(".css")) {
        return `<link rel="stylesheet" href="${version}">`;
      }
      return `<script src="${version}"></script>`;
    })
    .join("\n")}
  <style>
    ${files["styles.css"] || ""}
  </style>
</head>
<body>
  ${files["index.html"] || ""}
  <script type="module">
    ${files["index.js"] || ""}
  </script>
</body>
</html>
`;

  return entry;
};

export function Sandbox({ files, entry = "index.html", dependencies = {} }: SandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activeTab, setActiveTab] = useState(entry);
  const [isLoading, setIsLoading] = useState(false);

  const refreshPreview = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const html = createHtml(files, dependencies);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
    }
  };

  useEffect(() => {
    refreshPreview();
  }, [files, dependencies]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between px-4">
            <TabsList>
              {Object.keys(files).map((filename) => (
                <TabsTrigger key={filename} value={filename}>
                  {filename}
                </TabsTrigger>
              ))}
              <TabsTrigger value="preview">プレビュー</TabsTrigger>
            </TabsList>
            <button
              onClick={refreshPreview}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="更新"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
            </button>
          </div>

          {Object.entries(files).map(([filename, content]) => (
            <TabsContent key={filename} value={filename} className="p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {content}
              </pre>
            </TabsContent>
          ))}

          <TabsContent value="preview" className="h-[calc(100vh-10rem)]">
            <div className="relative w-full h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 dark:border-gray-100 border-t-transparent"></div>
                </div>
              )}
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                onLoad={handleIframeLoad}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

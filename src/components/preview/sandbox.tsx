"use client";

import { useEffect, useRef, useState } from "react";

interface SandboxProps {
  files: {
    [key: string]: string;
  };
  dependencies?: {
    [key: string]: string;
  };
}

export function Sandbox({ files, dependencies = {} }: SandboxProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("300px");

  useEffect(() => {
    if (!iframeRef.current) return;

    // 依存関係のCDNリンクを生成
    const dependencyLinks = Object.entries(dependencies).map(([name, version]) => {
      // 一般的なCDNプロバイダーのURLを生成
      if (name.includes("@")) {
        // スコープ付きパッケージの場合
        const [scope, pkgName] = name.split("/");
        return `https://cdn.jsdelivr.net/npm/${scope}/${pkgName}@${version}`;
      }
      return `https://cdn.jsdelivr.net/npm/${name}@${version}`;
    });

    // HTMLテンプレートを作成
    const html = files["index.html"] || "";
    const css = files["styles.css"] || "";
    const js = files["script.js"] || "";

    // スタイルとスクリプトを注入したHTMLを生成
    const content = html
      .replace("</head>", `
        <style>${css}</style>
        ${dependencyLinks.map(link => `<script src="${link}"></script>`).join("\n")}
        </head>
      `)
      .replace("</body>", `
        <script>${js}</script>
        <script>
          // iframeの高さを親ウィンドウに通知
          function updateHeight() {
            const height = document.documentElement.scrollHeight;
            window.parent.postMessage({ type: 'resize', height }, '*');
          }
          window.addEventListener('load', updateHeight);
          window.addEventListener('resize', updateHeight);
        </script>
        </body>
      `);

    // iframeのsrcDocを設定
    iframeRef.current.srcdoc = content;

    // iframeからのメッセージを受信
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize') {
        setHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, dependencies]);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        Preview
      </div>
      <iframe
        ref={iframeRef}
        className="w-full"
        style={{ height }}
        sandbox="allow-scripts allow-popups allow-modals"
        title="Preview"
      />
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePreviewProps {
  code: string;
  language: string;
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const [showPreview, setShowPreview] = useState(false);

  const renderPreview = () => {
    switch (language) {
      case 'html':
        return (
          <div className="w-full h-full min-h-[200px] border rounded-lg p-4 bg-white">
            <div dangerouslySetInnerHTML={{ __html: code }} />
          </div>
        );
      case 'css':
        return (
          <div className="w-full h-full min-h-[200px] border rounded-lg p-4 bg-white">
            <style>{code}</style>
            <div className="preview-content">
              {/* プレビュー用のサンプル要素 */}
              <div className="sample-element">Sample Element</div>
            </div>
          </div>
        );
      case 'javascript':
      case 'js':
        return (
          <div className="w-full h-full min-h-[200px] border rounded-lg p-4 bg-white">
            <div id="js-preview">
              {/* JavaScriptの実行結果がここに表示されます */}
            </div>
            <script dangerouslySetInnerHTML={{ __html: `
              try {
                const result = (function() {
                  ${code}
                })();
                document.getElementById('js-preview').textContent = result;
              } catch (error) {
                document.getElementById('js-preview').textContent = 'Error: ' + error.message;
              }
            `}} />
          </div>
        );
      default:
        return (
          <div className="w-full h-full min-h-[200px] border rounded-lg p-4 bg-gray-100">
            <p>プレビューは利用できません</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-400 transition-colors"
        >
          {showPreview ? 'コードを表示' : 'プレビューを表示'}
        </button>
      </div>
      {showPreview ? (
        renderPreview()
      ) : (
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: "0.5rem",
          }}
        >
          {code}
        </SyntaxHighlighter>
      )}
    </div>
  );
}
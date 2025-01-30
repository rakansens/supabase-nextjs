import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || !language) {
      return NextResponse.json(
        { error: "Code and language are required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
あなたは優秀なフロントエンド開発者です。以下のコードをプレビュー可能な形式に変換してください。

元のコード (${language}):
${code}

以下の形式で3つのファイルを含むJSONレスポンスを返してください:

{
  "files": {
    "index.html": "<!DOCTYPE html>\\n<html>\\n<head>\\n  <title>Preview</title>\\n  <link rel=\\"stylesheet\\" href=\\"styles.css\\">\\n</head>\\n<body>\\n  <!-- コンテンツ -->\\n  <script src=\\"script.js\\"></script>\\n</body>\\n</html>",
    "styles.css": "/* スタイル */",
    "script.js": "// スクリプト"
  },
  "dependencies": {}
}

要件:
1. index.htmlには必要なCSSとJavaScriptの読み込みを含めてください
2. styles.cssには必要なスタイルを記述してください
3. script.jsには必要なスクリプトを記述してください
4. 外部ライブラリが必要な場合はdependenciesに追加してください
5. コードの目的や機能を保持したまま、プレビュー可能な形に変換してください
6. レスポンスは必ず有効なJSONフォーマットで返してください

注意:
- HTMLの場合、そのままindex.htmlとして使用し、必要に応じてスタイルとスクリプトを分離
- CSSの場合、styles.cssに配置し、HTMLからリンク
- JavaScriptの場合、script.jsに配置し、HTMLから読み込み
- 複合的なコードの場合、適切に分離して各ファイルに配置
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // JSONの部分を抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Invalid response format - no JSON found:", text);
        throw new Error("Invalid response format");
      }

      try {
        const data = JSON.parse(jsonMatch[0]);

        // 必要なファイルが含まれているか確認
        if (!data.files || !data.files["index.html"]) {
          throw new Error("Missing required files in response");
        }

        // CSSとJavaScriptファイルがない場合は空の内容で追加
        if (!data.files["styles.css"]) {
          data.files["styles.css"] = "";
        }
        if (!data.files["script.js"]) {
          data.files["script.js"] = "";
        }

        // 依存関係がない場合は空のオブジェクトを設定
        if (!data.dependencies) {
          data.dependencies = {};
        }

        return NextResponse.json(data);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        console.error("Raw JSON string:", jsonMatch[0]);
        throw new Error("Invalid JSON format in response");
      }
    } catch (error) {
      console.error("Error processing Gemini response:", error);
      throw new Error("Failed to process Gemini response");
    }
  } catch (error) {
    console.error("Error in preview API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate preview" },
      { status: 500 }
    );
  }
}

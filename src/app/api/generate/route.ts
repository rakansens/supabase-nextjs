import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Geminiモデルの初期化
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // プロンプトの構築
    const systemPrompt = `
あなたはコード生成の専門家です。以下の要件に基づいて、必要なファイルとディレクトリ構造を生成してください。
生成するコードは実際に動作する必要があります。

応答は以下のJSON形式で返してください：
{
  "files": [
    {
      "name": "ファイル名",
      "type": "file",
      "content": "ファイルの内容"
    },
    {
      "name": "ディレクトリ名",
      "type": "directory",
      "children": [
        {
          "name": "サブファイル名",
          "type": "file",
          "content": "ファイルの内容"
        }
      ]
    }
  ]
}

要件：
${prompt}
`;

    // レスポンスの生成
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    // JSONの抽出（テキストから最初の{から最後の}までを取得）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in generate API:", error);
    return NextResponse.json(
      { error: "Failed to generate code" },
      { status: 500 }
    );
  }
}

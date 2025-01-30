import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable");
  throw new Error("GEMINI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        { error: "Invalid request: messages array is required" },
        { status: 400 }
      );
    }

    const { messages } = body;
    
    if (messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages array is empty" },
        { status: 400 }
      );
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || !lastMessage.content) {
      return NextResponse.json(
        { error: "Invalid message format: content is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    console.log("Sending request to Gemini API with message:", lastMessage.content);

    const prompt = `
あなたは優秀なプログラミングアシスタントです。
以下のルールに従って回答してください：

1. コードを含む回答の場合、必ず以下の形式で記述してください：
   \`\`\`言語名
   コード
   \`\`\`

2. コードの説明は、コードブロックの前後に記述してください。

3. コードの言語は、python, javascript, typescript, bash などを適切に指定してください。

4. プレビュー可能なコードの場合、以下の形式でプレビューコードも含めてください：
   \`\`\`html
   <!-- プレビュー用のHTML -->
   \`\`\`

   \`\`\`css
   /* プレビュー用のCSS */
   \`\`\`

   \`\`\`javascript
   // プレビュー用のJavaScript
   \`\`\`

ユーザーの質問：
${lastMessage.content}
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("Received response from Gemini API:", text);

      if (!text) {
        throw new Error("Empty response from Gemini API");
      }

      return NextResponse.json({
        content: text,
        metadata: {
          type: "text",
        },
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Gemini APIのエラーメッセージをより詳細に取得
      let errorMessage = "Unknown error occurred in Gemini API";
      if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      throw new Error(`Gemini API Error: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error in chat API:", error);
    
    const errorMessage = error instanceof Error 
      ? error.message
      : "チャットの応答生成中に予期せぬエラーが発生しました。";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

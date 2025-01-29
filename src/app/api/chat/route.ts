import { NextResponse } from "next/server";
import { generateResponse } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const response = await generateResponse(message);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}

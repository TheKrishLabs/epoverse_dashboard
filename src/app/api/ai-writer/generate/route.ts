import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, modelName, temperature, maxTokens, promptTemplate } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured on the server." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const selectedModel = modelName || "gemini-2.5-flash";

    const finalTemp = Number(temperature);
    const finalTokens = Number(maxTokens);

    const model = genAI.getGenerativeModel({
      model: selectedModel,
      generationConfig: {
        temperature: isNaN(finalTemp) ? 0.4 : finalTemp,
        maxOutputTokens: isNaN(finalTokens) || finalTokens < 1000 ? 1000 : finalTokens,
      }
    });

    const fullPrompt = promptTemplate ? `${promptTemplate}\n\n${prompt}` : prompt;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    
    return NextResponse.json({ text: response.text() });
  } catch (error: unknown) {
    console.error("AI Writer generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

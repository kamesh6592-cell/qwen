import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiModel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamChatResponse = async (
  modelId: string,
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  useSearch: boolean,
  useThinking: boolean,
  onChunk: (text: string) => void
) => {
  try {
    const modelName = modelId;
    
    // Configure tools
    const tools: any[] = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }

    // Configure config
    const config: any = {
      tools: tools.length > 0 ? tools : undefined,
    };

    if (useThinking && (modelName.includes('2.5') || modelName.includes('pro'))) {
      // Thinking config is only for specific models, ensuring compatibility
      config.thinkingConfig = { thinkingBudget: 2048 }; 
    }

    const chat = ai.chats.create({
      model: modelName,
      history: history,
      config: config,
    });

    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        onChunk(c.text);
      }
    }
  } catch (error) {
    console.error("Error streaming chat response:", error);
    onChunk("\n\n*Sorry, I encountered an error processing your request.*");
    throw error;
  }
};

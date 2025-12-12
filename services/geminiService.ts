import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GeminiModel, Attachment } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamChatResponse = async (
  modelId: string,
  history: any[], // Adjusted for flexibility
  message: string,
  useSearch: boolean,
  useThinking: boolean,
  currentAttachments: Attachment[],
  onUpdate: (content: { text: string, images?: Attachment[] }) => void
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
      config.thinkingConfig = { thinkingBudget: 2048 }; 
    }

    // Construct current turn contents
    const currentParts: any[] = [];
    if (message) {
      currentParts.push({ text: message });
    }
    
    if (currentAttachments && currentAttachments.length > 0) {
      currentAttachments.forEach(att => {
        // Strip data:image/...;base64, prefix for API
        const base64Data = att.data.split(',')[1];
        currentParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: base64Data
          }
        });
      });
    }

    const chat = ai.chats.create({
      model: modelName,
      history: history,
      config: config,
    });

    const result = await chat.sendMessageStream({
      message: currentParts.length > 0 ? currentParts : [{ text: message }]
    });

    for await (const chunk of result) {
      const c = chunk as GenerateContentResponse;
      
      const updateData: { text: string, images?: Attachment[] } = { text: '' };
      
      if (c.text) {
        updateData.text = c.text;
      }

      // Check for generated images
      if (c.candidates?.[0]?.content?.parts) {
        const images: Attachment[] = [];
        for (const part of c.candidates[0].content.parts) {
          if (part.inlineData) {
            images.push({
              mimeType: part.inlineData.mimeType,
              data: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            });
          }
        }
        if (images.length > 0) {
          updateData.images = images;
        }
      }

      if (updateData.text || updateData.images) {
         onUpdate(updateData);
      }
    }
  } catch (error) {
    console.error("Error streaming chat response:", error);
    onUpdate({ text: "\n\n*Sorry, I encountered an error processing your request.*" });
    throw error;
  }
};
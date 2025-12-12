import { Attachment } from "../types";

interface FreepikImageResponse {
  data: {
    id: string;
    status: string;
    image_url?: string;
    webhook_url?: string;
  };
}

interface FreepikGenerationOptions {
  prompt: string;
  resolution?: '1k' | '2k' | '4k';
  aspect_ratio?: 'square_1_1' | 'portrait_4_3' | 'portrait_3_4' | 'landscape_4_3' | 'landscape_3_4' | 'portrait_16_9' | 'landscape_16_9';
  model?: 'realism' | 'digital_art' | 'painting' | 'photo' | 'concept_art';
  creative_detailing?: number; // 0-100
  hdr?: number; // 0-100
  adherence?: number; // 0-100
  filter_nsfw?: boolean;
  engine?: 'automatic' | 'freepik' | 'stable_diffusion';
}

export const generateImageWithFreepik = async (
  prompt: string,
  options: Partial<FreepikGenerationOptions> = {},
  onUpdate: (content: { text: string, images?: Attachment[] }) => void
): Promise<void> => {
  try {
    const apiKey = process.env.FREEPIK_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      throw new Error('Freepik API key not found. Please set FREEPIK_API_KEY or API_KEY environment variable.');
    }

    const requestBody = {
      prompt,
      resolution: options.resolution || '2k',
      aspect_ratio: options.aspect_ratio || 'square_1_1',
      model: options.model || 'realism',
      creative_detailing: options.creative_detailing || 33,
      hdr: options.hdr || 50,
      adherence: options.adherence || 50,
      engine: options.engine || 'automatic',
      fixed_generation: false,
      filter_nsfw: options.filter_nsfw !== false, // Default to true unless explicitly set to false
    };

    // Update user with generation start message
    onUpdate({ 
      text: `🎨 Generating image: "${prompt}"\n\nPlease wait while I create your image...` 
    });

    const response = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Freepik API error: ${response.status} - ${errorData}`);
    }

    const result: FreepikImageResponse = await response.json();
    
    if (result.data.status === 'processing') {
      // For now, we'll handle synchronous generation
      // In a real implementation, you'd want to implement webhook handling for async processing
      onUpdate({ 
        text: `✅ Image generation started successfully!\n\nGeneration ID: ${result.data.id}\n\n*Note: This is a processing request. In a production environment, you would receive the image via webhook when generation completes.*` 
      });
      
      // If webhook_url was provided and image_url is available immediately
      if (result.data.image_url) {
        const imageAttachment: Attachment = {
          mimeType: 'image/png',
          data: result.data.image_url // For Freepik, this will be a URL, not base64
        };
        
        onUpdate({ 
          text: `🎨 **Image Generated Successfully!**\n\nPrompt: "${prompt}"`,
          images: [imageAttachment] 
        });
      }
    } else if (result.data.image_url) {
      // Direct image URL response
      const imageAttachment: Attachment = {
        mimeType: 'image/png',
        data: result.data.image_url
      };
      
      onUpdate({ 
        text: `🎨 **Image Generated Successfully!**\n\nPrompt: "${prompt}"`,
        images: [imageAttachment] 
      });
    }

  } catch (error) {
    console.error("Error generating image with Freepik:", error);
    onUpdate({ 
      text: `❌ **Image Generation Failed**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your API key and try again.` 
    });
    throw error;
  }
};
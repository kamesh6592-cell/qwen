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
    const requestBody = {
      prompt,
      options: {
        resolution: options.resolution || '2k',
        aspect_ratio: options.aspect_ratio || 'square_1_1',
        model: options.model || 'realism',
        creative_detailing: options.creative_detailing || 33,
        hdr: options.hdr || 50,
        adherence: options.adherence || 50,
        engine: options.engine || 'automatic',
        filter_nsfw: options.filter_nsfw !== false, // Default to true unless explicitly set to false
      }
    };

    // Update user with generation start message
    onUpdate({ 
      text: `🎨 Generating image: "${prompt}"\n\nPlease wait while I create your image...` 
    });

    // Use our own API endpoint to avoid CORS issues
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
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
    
    // Provide a helpful fallback message with alternative suggestions
    onUpdate({ 
      text: `❌ **Image Generation Temporarily Unavailable**\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\n**Alternative Options:**\n1. Try again in a few moments\n2. Use a different model for text generation\n3. Contact support if the issue persists\n\n*Note: Image generation requires proper API configuration. Please ensure your Freepik API key is set up correctly.*` 
    });
    throw error;
  }
};
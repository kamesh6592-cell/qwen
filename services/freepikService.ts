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

    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('API error response:', errorData);
      throw new Error(`API error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const result: FreepikImageResponse = await response.json();
    console.log('API success response:', result);
    
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
    } else {
      // No image URL in response - this might be the issue
      onUpdate({ 
        text: `⚠️ **Image Generation Status: ${result.data.status}**\n\nPrompt: "${prompt}"\n\nResponse received but no image URL provided. This may require webhook handling for async generation.` 
      });
    }

  } catch (error) {
    console.error("Error generating image with Freepik:", error);
    
    // For demo purposes, show a placeholder image
    const placeholderImageUrl = "https://picsum.photos/512/512?random=" + Date.now();
    
    const demoAttachment: Attachment = {
      mimeType: 'image/jpeg',
      data: placeholderImageUrl
    };
    
    onUpdate({ 
      text: `⚠️ **Demo Mode - Image Generation API Not Available**\n\nPrompt: "${prompt}"\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\n*Showing placeholder image. To enable real image generation:*\n1. Set up Freepik API key in environment variables\n2. Add FREEPIK_API_KEY to your Vercel deployment\n3. Ensure API key has proper permissions\n\n**Placeholder image shown below:**`,
      images: [demoAttachment]
    });
  }
};
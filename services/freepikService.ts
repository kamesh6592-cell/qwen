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

// Helper function to poll for image completion
const pollForCompletion = async (
  imageId: string,
  prompt: string,
  onUpdate: (content: { text: string, images?: Attachment[] }) => void,
  maxAttempts: number = 12, // 2 minutes max (12 * 10 seconds)
  attempt: number = 1
): Promise<void> => {
  try {
    const response = await fetch(`/api/check-image-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) {
      throw new Error(`Status check failed: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.data.image_url) {
      // Image is ready!
      const imageAttachment: Attachment = {
        mimeType: 'image/png',
        data: result.data.image_url
      };
      
      onUpdate({ 
        text: `🎨 **Image Generated Successfully!**\n\nPrompt: "${prompt}"\n\n✅ Completed after ${attempt * 10} seconds`,
        images: [imageAttachment] 
      });
    } else if (attempt >= maxAttempts) {
      // Timeout
      onUpdate({ 
        text: `⏰ **Generation Timeout**\n\nPrompt: "${prompt}"\n\nImage generation is taking longer than expected. Status: ${result.data.status}\n\nPlease try again or check Freepik dashboard for generation ID: ${imageId}` 
      });
    } else {
      // Still processing, continue polling
      onUpdate({ 
        text: `🔄 **Image Generation In Progress...**\n\nPrompt: "${prompt}"\nStatus: ${result.data.status}\nAttempt: ${attempt}/${maxAttempts}\n\nChecking again in 10 seconds...` 
      });
      
      // Wait 10 seconds and try again
      setTimeout(() => {
        pollForCompletion(imageId, prompt, onUpdate, maxAttempts, attempt + 1);
      }, 10000);
    }
  } catch (error) {
    console.error('Error polling for image completion:', error);
    onUpdate({ 
      text: `❌ **Error Checking Image Status**\n\nPrompt: "${prompt}"\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nGeneration ID: ${imageId}` 
    });
  }
};

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
    
    if (result.data.status === 'processing' || result.data.status === 'CREATED') {
      // Update user that generation started and we're waiting for completion
      onUpdate({ 
        text: `🔄 **Image Generation In Progress...**\n\nPrompt: "${prompt}"\nStatus: ${result.data.status}\nGeneration ID: ${result.data.id}\n\nPolling for completion...` 
      });
      
      // If image is immediately available
      if (result.data.image_url) {
        const imageAttachment: Attachment = {
          mimeType: 'image/png',
          data: result.data.image_url
        };
        
        onUpdate({ 
          text: `🎨 **Image Generated Successfully!**\n\nPrompt: "${prompt}"`,
          images: [imageAttachment] 
        });
      } else {
        // Poll for completion since no immediate image URL
        await pollForCompletion(result.data.id, prompt, onUpdate);
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
      // Unknown status
      onUpdate({ 
        text: `⚠️ **Unexpected Response Status: ${result.data.status}**\n\nPrompt: "${prompt}"\n\nGeneration ID: ${result.data.id}` 
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
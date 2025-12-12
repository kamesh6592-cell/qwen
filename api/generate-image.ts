import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FreepikImageResponse {
  data: {
    id: string;
    status: string;
    image_url?: string;
    webhook_url?: string;
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, options = {} } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = process.env.FREEPIK_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Freepik API key not configured. Please set FREEPIK_API_KEY in environment variables.' 
      });
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
      filter_nsfw: options.filter_nsfw !== false,
    };

    const response = await fetch('https://api.freepik.com/v1/ai/mystic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-freepik-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Freepik API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Freepik API error: ${response.status} - ${errorText}` 
      });
    }

    const result: FreepikImageResponse = await response.json();
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in generate-image API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
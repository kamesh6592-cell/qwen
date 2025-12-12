import type { VercelRequest, VercelResponse } from '@vercel/node';

interface FreepikStatusResponse {
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
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const apiKey = process.env.FREEPIK_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Freepik API key not configured. Please set FREEPIK_API_KEY in environment variables.' 
      });
    }

    console.log('Checking status for image ID:', imageId);

    const response = await fetch(`https://api.freepik.com/v1/ai/mystic/${imageId}`, {
      method: 'GET',
      headers: {
        'x-freepik-api-key': apiKey,
      },
    });

    console.log('Status check response:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Freepik status check error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Freepik API error: ${response.status} - ${errorText}` 
      });
    }

    const result: FreepikStatusResponse = await response.json();
    console.log('Status check result:', JSON.stringify(result, null, 2));
    
    return res.status(200).json(result);

  } catch (error) {
    console.error('Error in check-image-status API:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
}
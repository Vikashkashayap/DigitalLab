import { Router, Request, Response } from 'express';
import { generateImage } from './image.service';

const router = Router();

/**
 * POST /api/image/generate
 * Generate an image from a text prompt
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string'
      });
    }

    // Generate image
    const image = await generateImage(prompt.trim());

    // Return success response
    res.json({
      success: true,
      image: image
    });

  } catch (error: any) {
    console.error('Image generation error:', error.message);

    // Handle specific HTTP status codes
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Invalid API key'
        });
      }

      if (status === 403) {
        return res.status(403).json({
          success: false,
          error: 'Access forbidden'
        });
      }

      if (status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded'
        });
      }

      if (status === 504) {
        return res.status(504).json({
          success: false,
          error: 'Request timeout'
        });
      }
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: error.message || 'Image generation failed'
    });
  }
});

export default router;

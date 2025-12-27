import { Router, Request, Response } from 'express';
import { generateImage } from '../image.service';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { GenerateImageRequest, GenerateImageResponse, ApiResponse } from '../../../shared/types';

const router = Router();

// POST /api/images/generate - Generate a single image
router.post('/generate', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { prompt, style, size }: GenerateImageRequest = req.body;

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Please provide a prompt with at least 3 characters'
      };
      return res.status(400).json(errorResponse);
    }

    // Validate style if provided
    const validStyles = ['realistic', 'illustration', 'minimal', 'futuristic'];
    if (style && !validStyles.includes(style)) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: `Invalid style. Must be one of: ${validStyles.join(', ')}`
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`🎨 Generating image for prompt: "${prompt.substring(0, 50)}..."`);

    // Generate image using the simple service
    const imageUrl = await generateImage(prompt.trim());

    const response: ApiResponse<{ images: { url: string }[] }> = {
      success: true,
      data: { images: [{ url: imageUrl }] }
    };

    return res.status(200).json(response);

  } catch (error: any) {
    console.error('❌ Image generation route error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error.message || 'Internal server error during image generation'
    };
    return res.status(500).json(errorResponse);
  }
});

export default router;

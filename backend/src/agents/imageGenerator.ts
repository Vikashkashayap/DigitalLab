import { OpenRouterImageService, createOpenRouterImageService } from '../services/openRouterImageService';

/* ---------------- PROMPT ENHANCEMENT UTILITIES ---------------- */

/**
 * Enhance prompt based on style preferences
 * Pure function - no side effects, no API calls
 */
export function enhanceImagePrompt(basePrompt: string, style?: string): string {
  let enhancedPrompt = basePrompt.trim();

  // Apply style enhancements
  switch (style) {
    case 'realistic':
      enhancedPrompt +=
        ', photorealistic, ultra-detailed, professional photography, realistic lighting';
      break;
    case 'illustration':
      enhancedPrompt +=
        ', digital illustration, clean vector art, smooth shading, artistic style';
      break;
    case 'minimal':
      enhancedPrompt +=
        ', minimal design, flat style, clean composition, simple and elegant';
      break;
    case 'futuristic':
      enhancedPrompt +=
        ', futuristic, sci-fi, neon lighting, high-tech cyberpunk, advanced technology';
      break;
  }

  // Always add quality enhancers
  enhancedPrompt += ', high quality, studio lighting, no text, no watermark';

  return enhancedPrompt;
}

/* ---------------- IMAGE GENERATION AGENT ---------------- */

/**
 * Image Generation Agent - LangChain Brain
 * Only handles: intent classification, prompt enhancement, control flow
 * Never makes direct API calls to OpenRouter
 */
export class ImageGeneratorAgent {
  private imageService: OpenRouterImageService | null = null;

  async getImageService(): Promise<OpenRouterImageService> {
    if (!this.imageService) {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is missing');
      }
      this.imageService = createOpenRouterImageService(apiKey);
    }
    return this.imageService;
  }

  /**
   * Classify intent and decide control flow
   * LangChain's decision-making layer
   */
  classifyImageIntent(prompt: string): { shouldGenerate: boolean; reason?: string } {
    const trimmedPrompt = prompt.trim().toLowerCase();

    // Reject empty prompts
    if (trimmedPrompt.length < 3) {
      return {
        shouldGenerate: false,
        reason: 'Prompt too short - minimum 3 characters required'
      };
    }

    // Reject inappropriate content (basic filtering)
    const inappropriateTerms = ['nsfw', 'adult', 'explicit', 'violence', 'harm'];
    if (inappropriateTerms.some(term => trimmedPrompt.includes(term))) {
      return {
        shouldGenerate: false,
        reason: 'Content policy violation - inappropriate content detected'
      };
    }

    return { shouldGenerate: true };
  }

  /**
   * Generate image using enhanced prompt
   * Agent orchestrates: enhance prompt -> call service -> return result
   */
  async generateImage(
    prompt: string,
    style?: 'realistic' | 'illustration' | 'minimal' | 'futuristic',
    size?: string
  ): Promise<{
    success: boolean;
    images: { url: string }[];
    error?: string;
  }> {
    try {
      // Step 1: Intent classification (LangChain brain)
      const intent = this.classifyImageIntent(prompt);
      if (!intent.shouldGenerate) {
        return {
          success: false,
          images: [],
          error: intent.reason || 'Image generation not allowed'
        };
      }

      // Step 2: Prompt enhancement (LangChain brain)
      const enhancedPrompt = enhanceImagePrompt(prompt, style);
      console.log(`🎨 Image Agent: Enhanced prompt for generation`);

      // Step 3: Control flow - decide to call image service
      const imageService = await this.getImageService();

      // Step 4: Delegate execution to pure service (no LangChain involvement)
      const imageUrl = await imageService.generateImage({
        prompt: enhancedPrompt,
        size: size || '1024x1024'
      });

      console.log(`✅ Image Agent: Image generated successfully`);

      return {
        success: true,
        images: [{ url: imageUrl }]
      };
    } catch (error: any) {
      let message = 'Image generation failed';
      if (error.message) {
        message = error.message;
      }
      console.error(`❌ Image Agent Error:`, error.message);

      return {
        success: false,
        images: [],
        error: message
      };
    }
  }
}

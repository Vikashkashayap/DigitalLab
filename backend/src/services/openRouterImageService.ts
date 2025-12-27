import axios from 'axios';

/**
 * Pure OpenRouter image generation service
 * No LangChain dependencies - just plain HTTP POST with axios
 */
export class OpenRouterImageService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultHeaders: Record<string, string>;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.defaultHeaders = {
      Authorization: `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.HTTP_REFERER || 'http://localhost:5175',
      'X-Title': process.env.X_TITLE || 'DigitalLab Image Generator'
    };
  }

  /**
   * Generate image using OpenRouter Gemini image model via chat completions
   * POST only - no GET requests allowed
   */
  async generateImage(request: {
    prompt: string;
    size?: string;
  }): Promise<string> {
    try {
      console.log(`🎨 OpenRouter Image Service: Generating image with prompt: ${request.prompt.substring(0, 50)}...`);

      // Use Stability AI SDXL for image generation
      const model = 'stabilityai/stable-diffusion-xl';
      const endpoint = `${this.baseUrl}/images/generations`;

      const payload = {
        model: model,
        prompt: request.prompt,
        size: request.size || '1024x1024'
      };

      console.log(`📤 Making POST request to: ${endpoint}`);
      console.log(`📤 Using model: ${model}`);
      console.log(`📤 Request method: POST (explicitly enforced)`);
      console.log(`📤 Request payload:`, {
        model: payload.model,
        prompt: payload.prompt.substring(0, 50) + '...',
        size: payload.size
      });
      console.log(`📤 Request headers:`, {
        'Authorization': 'Bearer [REDACTED]',
        'Content-Type': this.defaultHeaders['Content-Type'],
        'HTTP-Referer': this.defaultHeaders['HTTP-Referer'],
        'X-Title': this.defaultHeaders['X-Title']
      });

      const response = await axios.post(
        endpoint,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5173',
            'X-Title': 'Simple Image Generator'
          },
          timeout: 60000 // 60 seconds
        }
      );

      console.log(`✅ OpenRouter Image Service: Image generated successfully`);
      console.log(`📤 Response data:`, JSON.stringify(response.data, null, 2));

      // Handle images/generations response format
      if (response.data?.data && Array.isArray(response.data.data)) {
        const image = response.data.data[0];
        if (image?.url) {
          return image.url;
        }
        if (image?.b64_json) {
          return `data:image/png;base64,${image.b64_json}`;
        }
      }

      throw new Error('No valid image data in OpenRouter response');
    } catch (error: any) {
      console.error(`❌ OpenRouter Image Service Error:`, {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message
      });

      // Production-grade error handling
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 400:
            throw new Error(`Invalid request: ${errorData?.error?.message || 'Check prompt and parameters'}`);
          case 401:
            throw new Error('Authentication failed - invalid OpenRouter API key');
          case 403:
            throw new Error('Access forbidden - check your OpenRouter account permissions');
          case 405:
            throw new Error(`Method not allowed: ${errorData?.error?.message || 'OpenRouter does not support this method for images'}`);
          case 429:
            throw new Error('Rate limit exceeded - too many requests to OpenRouter');
          case 500:
            throw new Error('OpenRouter internal server error - please try again later');
          case 502:
          case 503:
          case 504:
            throw new Error('OpenRouter service temporarily unavailable - please try again later');
          default:
            const errorMessage = errorData?.error?.message ||
              errorData?.message ||
              errorData?.detail ||
              `HTTP ${status}: ${error.response.statusText || 'Unknown error'}`;
            throw new Error(`OpenRouter API error (${status}): ${errorMessage}`);
        }
      }

      // Network or other errors
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout - OpenRouter took too long to respond');
      }

      throw new Error(error.message || 'Image generation failed due to network error');
    }
  }
}

/**
 * Factory function to create OpenRouter image service
 */
export function createOpenRouterImageService(apiKey: string): OpenRouterImageService {
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('OpenRouter API key is required');
  }
  return new OpenRouterImageService(apiKey);
}

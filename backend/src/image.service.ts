import axios from 'axios';

/**
 * Simple image generation service using OpenRouter
 * Takes a prompt string and returns an image URL or base64
 */
export async function generateImage(prompt: string): Promise<string> {
  try {
    // Check for required environment variable
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY environment variable is required');
    }

    // Make POST request to OpenRouter
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'openai/gpt-5-image',
        messages: [
          {
            role: 'user',
            content: `Generate an image of: ${prompt}. Return only the image URL.`
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Simple Image Generator'
        },
        timeout: 60000 // 60 seconds
      }
    );

    // Extract image URL from response
    if (response.data?.choices && Array.isArray(response.data.choices)) {
      const choice = response.data.choices[0];
      if (choice?.message?.content) {
        const content = choice.message.content;
        // Try to extract URL from the response content
        const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
        if (urlMatch) {
          return urlMatch[1];
        }
      }
    }

    throw new Error('No image URL found in OpenRouter response');
  } catch (error: any) {
    console.error(`❌ OpenRouter Image Service Error:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });

    // Handle specific HTTP status codes
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

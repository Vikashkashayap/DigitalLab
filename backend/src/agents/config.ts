import { ChatOpenAI } from '@langchain/openai';

// Initialize OpenRouter client
export const initializeLLM = (model = 'anthropic/claude-3-haiku:beta') => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set');
  }

  return new ChatOpenAI({
    openAIApiKey: apiKey,
    modelName: model,
    temperature: 0.7,
    maxTokens: 4000,
    configuration: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
        'X-Title': 'AI Blog Generator',
      },
    },
  });
};

// Different models for different tasks (OpenRouter compatible model names)
export const MODELS = {
  BLOG_WRITER: 'anthropic/claude-3.5-sonnet:beta',
  PROMPT_ENHANCER: 'anthropic/claude-3-haiku:beta',
  SEO_OPTIMIZER: 'anthropic/claude-3-haiku:beta',
} as const;

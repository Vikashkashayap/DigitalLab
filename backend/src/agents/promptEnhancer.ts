import { initializeLLM } from './config';

const PROMPT_ENHANCER_PROMPT = `You are a Prompt Enhancement Specialist. Your task is to take a user's basic blog request and transform it into a detailed, comprehensive prompt that will generate high-quality, SEO-optimized blog content.

For the given input, create an enhanced prompt that includes:
1. Specific topic and angle
2. Target audience details
3. Key points to cover
4. Desired tone and style
5. SEO considerations
6. Call-to-action suggestions
7. Length and structure requirements

Original user prompt: {userPrompt}

Enhanced prompt:`;

export class PromptEnhancerAgent {
  private get llm() {
    return initializeLLM();
  }

  async enhancePrompt(userPrompt: string): Promise<string> {
    try {
      const prompt = PROMPT_ENHANCER_PROMPT.replace('{userPrompt}', userPrompt);

      const response = await this.llm.invoke([
        { role: 'system', content: 'You are a professional prompt enhancer that creates detailed blog generation prompts.' },
        { role: 'user', content: prompt }
      ]);

      return response.content as string;
    } catch (error) {
      console.error('Prompt enhancement error:', error);
      // Return original prompt if enhancement fails
      return userPrompt;
    }
  }
}

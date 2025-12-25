import { initializeLLM, MODELS } from './config';

const BLOG_WRITER_PROMPT = `You are a Professional Blog Writer and SEO Specialist. Your task is to create a comprehensive, engaging, and SEO-optimized blog post based on the enhanced prompt provided.

Requirements:
- Write a complete blog post (800-1200 words)
- Include H1, H2, H3 headings for structure
- Write in engaging, conversational tone
- Include practical examples and insights
- Add a compelling conclusion with clear call-to-action
- Ensure content is original and valuable
- Use transition words for smooth flow
- Include relevant statistics or data points where appropriate
- Create a brief summary (50-100 words) that captures the main points

Enhanced Prompt: {enhancedPrompt}

Please generate the blog content in the following format:

# [Blog Title]

[Meta Description - 150-160 characters]

## Introduction
[Introduction content]

## [Main Section Heading]
[Section content]

## [Another Section Heading]
[Section content]

## Conclusion
[Conclusion with CTA]

---

Summary: [Brief 50-100 word summary of the blog]
Word count: [approximate word count]
SEO Keywords: [comma-separated keywords]
Hashtags: [relevant hashtags for social media]`;

// Initialize LLM with blog writer model (lazy initialization)
let blogWriterLLM: any = null;

const getBlogWriterLLM = () => {
  if (!blogWriterLLM) {
    blogWriterLLM = initializeLLM(MODELS.BLOG_WRITER);
  }
  return blogWriterLLM;
};

export interface BlogContent {
  title: string;
  content: string;
  metaDescription: string;
  seoKeywords: string[];
  hashtags: string[];
  wordCount: number;
  summary: string;
}

export class BlogWriterAgent {
  async generateBlog(enhancedPrompt: string): Promise<BlogContent> {
    try {
      const prompt = BLOG_WRITER_PROMPT.replace('{enhancedPrompt}', enhancedPrompt);

      const response = await getBlogWriterLLM().invoke([
        {
          role: 'system',
          content: 'You are an expert blog writer who creates high-quality, SEO-optimized content. Always structure your response with clear headings and engaging content.'
        },
        { role: 'user', content: prompt }
      ]);

      const content = response.content as string;

      // Parse the response to extract components
      return this.parseBlogContent(content);
    } catch (error) {
      console.error('Blog generation error:', error);
      throw new Error('Failed to generate blog content');
    }
  }

  private parseBlogContent(content: string): BlogContent {
    const lines = content.split('\n');
    let title = '';
    let metaDescription = '';
    let mainContent = '';
    let summary = '';
    let seoKeywords: string[] = [];
    let hashtags: string[] = [];

    let isInMeta = false;
    let isInContent = false;

    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.replace('# ', '').trim();
      } else if (line.includes('Meta Description') || line.length < 200) {
        // Check if this looks like a meta description
        if (!metaDescription && line.trim().length > 50 && line.trim().length < 200) {
          metaDescription = line.trim();
        }
      } else if (line.includes('Summary:')) {
        summary = line.replace('Summary:', '').trim();
      } else if (line.includes('SEO Keywords:')) {
        const keywordsText = line.replace('SEO Keywords:', '').trim();
        seoKeywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
      } else if (line.includes('Hashtags:')) {
        const hashtagsText = line.replace('Hashtags:', '').trim();
        hashtags = hashtagsText.split(',').map(h => h.trim().replace('#', '')).filter(h => h);
      } else if (line.trim() && !line.includes('Word count:')) {
        mainContent += line + '\n';
      }
    }

    // Calculate word count
    const wordCount = mainContent.split(/\s+/).filter(word => word.length > 0).length;

    // Fallback values
    if (!title) title = 'Generated Blog Post';
    if (!metaDescription) metaDescription = mainContent.substring(0, 160);
    if (!summary) summary = mainContent.substring(0, 150) + '...';
    if (seoKeywords.length === 0) seoKeywords = ['blog', 'content', 'article'];
    if (hashtags.length === 0) hashtags = ['blog', 'content'];

    return {
      title,
      content: mainContent.trim(),
      metaDescription,
      seoKeywords,
      hashtags,
      wordCount,
      summary
    };
  }
}

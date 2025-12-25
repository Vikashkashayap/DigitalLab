import { initializeLLM, MODELS } from './config';

const SEO_OPTIMIZER_PROMPT = `You are an SEO Optimization Specialist. Your task is to analyze the generated blog content and provide comprehensive SEO recommendations.

For the given blog content, provide:

1. **Primary Keyword**: The main keyword for this blog
2. **Secondary Keywords**: 3-5 related keywords
3. **SEO Title**: Optimized title (50-60 characters)
4. **Meta Description**: Compelling description (150-160 characters)
5. **URL Slug**: SEO-friendly URL slug
6. **Social Media Hashtags**: 5-8 relevant hashtags for Twitter/LinkedIn/Instagram
7. **Internal Linking Suggestions**: 2-3 related topics for internal links
8. **Content Gaps**: Any missing information that should be added

Blog Title: {title}
Blog Content Preview: {contentPreview}

Provide your analysis:`;

// Initialize LLM with SEO optimizer model (lazy initialization)
let seoOptimizerLLM: any = null;

const getSEOOptimizerLLM = () => {
  if (!seoOptimizerLLM) {
    seoOptimizerLLM = initializeLLM(MODELS.SEO_OPTIMIZER);
  }
  return seoOptimizerLLM;
};

export interface SEOAnalysis {
  primaryKeyword: string;
  secondaryKeywords: string[];
  seoTitle: string;
  metaDescription: string;
  urlSlug: string;
  hashtags: string[];
  internalLinkSuggestions: string[];
  contentGaps: string[];
}

export class SEOOptimizerAgent {
  async optimizeContent(title: string, content: string): Promise<SEOAnalysis> {
    try {
      // Take first 500 characters for preview to avoid token limits
      const contentPreview = content.substring(0, 500) + '...';

      const prompt = SEO_OPTIMIZER_PROMPT
        .replace('{title}', title)
        .replace('{contentPreview}', contentPreview);

      const response = await getSEOOptimizerLLM().invoke([
        {
          role: 'system',
          content: 'You are an SEO expert who provides detailed optimization recommendations for blog content.'
        },
        { role: 'user', content: prompt }
      ]);

      const analysis = response.content as string;
      return this.parseSEOAnalysis(analysis);
    } catch (error) {
      console.error('SEO optimization error:', error);
      // Return default SEO analysis
      return {
        primaryKeyword: title.toLowerCase().replace(/\s+/g, '-'),
        secondaryKeywords: ['content', 'blog', 'article'],
        seoTitle: title.substring(0, 60),
        metaDescription: content.substring(0, 160),
        urlSlug: title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        hashtags: ['blog', 'content', title.split(' ')[0].toLowerCase()],
        internalLinkSuggestions: [],
        contentGaps: []
      };
    }
  }

  private parseSEOAnalysis(analysis: string): SEOAnalysis {
    const lines = analysis.split('\n');
    const result: SEOAnalysis = {
      primaryKeyword: '',
      secondaryKeywords: [],
      seoTitle: '',
      metaDescription: '',
      urlSlug: '',
      hashtags: [],
      internalLinkSuggestions: [],
      contentGaps: []
    };

    let currentSection = '';

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.includes('**Primary Keyword**')) {
        currentSection = 'primary';
      } else if (trimmed.includes('**Secondary Keywords**')) {
        currentSection = 'secondary';
      } else if (trimmed.includes('**SEO Title**')) {
        currentSection = 'title';
      } else if (trimmed.includes('**Meta Description**')) {
        currentSection = 'meta';
      } else if (trimmed.includes('**URL Slug**')) {
        currentSection = 'slug';
      } else if (trimmed.includes('**Social Media Hashtags**')) {
        currentSection = 'hashtags';
      } else if (trimmed.includes('**Internal Linking Suggestions**')) {
        currentSection = 'links';
      } else if (trimmed.includes('**Content Gaps**')) {
        currentSection = 'gaps';
      } else if (trimmed && currentSection) {
        const content = trimmed.replace(/^\*\*|\*\*$/g, '').trim();

        switch (currentSection) {
          case 'primary':
            if (!result.primaryKeyword) result.primaryKeyword = content;
            break;
          case 'secondary':
            if (content.includes(',')) {
              result.secondaryKeywords = content.split(',').map(k => k.trim());
            } else if (result.secondaryKeywords.length < 5) {
              result.secondaryKeywords.push(content);
            }
            break;
          case 'title':
            if (!result.seoTitle) result.seoTitle = content;
            break;
          case 'meta':
            if (!result.metaDescription) result.metaDescription = content;
            break;
          case 'slug':
            if (!result.urlSlug) result.urlSlug = content;
            break;
          case 'hashtags':
            if (content.includes(',')) {
              result.hashtags = content.split(',').map(h => h.trim().replace('#', ''));
            } else if (result.hashtags.length < 8) {
              result.hashtags.push(content.replace('#', ''));
            }
            break;
          case 'links':
            if (result.internalLinkSuggestions.length < 3) {
              result.internalLinkSuggestions.push(content);
            }
            break;
          case 'gaps':
            result.contentGaps.push(content);
            break;
        }
      }
    }

    // Provide fallbacks
    if (!result.primaryKeyword) result.primaryKeyword = 'blog-content';
    if (result.secondaryKeywords.length === 0) result.secondaryKeywords = ['blog', 'content'];
    if (!result.seoTitle) result.seoTitle = 'Generated Blog Post';
    if (!result.metaDescription) result.metaDescription = 'Learn about this interesting topic through our comprehensive blog post.';
    if (!result.urlSlug) result.urlSlug = 'generated-blog-post';
    if (result.hashtags.length === 0) result.hashtags = ['blog', 'content'];

    return result;
  }
}

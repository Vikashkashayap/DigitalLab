import { PromptEnhancerAgent } from './promptEnhancer';
import { BlogWriterAgent, BlogContent } from './blogWriter';
import { SEOOptimizerAgent, SEOAnalysis } from './seoOptimizer';

export interface CompleteBlogResult {
  blog: BlogContent & SEOAnalysis;
  enhancedPrompt: string;
}

export class BlogOrchestrator {
  private promptEnhancer = new PromptEnhancerAgent();
  private blogWriter = new BlogWriterAgent();
  private seoOptimizer = new SEOOptimizerAgent();

  async generateCompleteBlog(userPrompt: string): Promise<CompleteBlogResult> {
    try {
      console.log('🚀 Starting blog generation process...');

      // Step 1: Enhance the user prompt
      console.log('📝 Enhancing user prompt...');
      const enhancedPrompt = await this.promptEnhancer.enhancePrompt(userPrompt);
      console.log('✅ Prompt enhanced successfully');

      // Step 2: Generate blog content
      console.log('✍️ Generating blog content...');
      const blogContent = await this.blogWriter.generateBlog(enhancedPrompt);
      console.log('✅ Blog content generated successfully');

      // Step 3: Optimize for SEO
      console.log('🔍 Optimizing for SEO...');
      const seoAnalysis = await this.seoOptimizer.optimizeContent(blogContent.title, blogContent.content);
      console.log('✅ SEO optimization completed');

      // Combine results
      const completeBlog = {
        ...blogContent,
        ...seoAnalysis,
        // Override with SEO-optimized versions
        title: seoAnalysis.seoTitle || blogContent.title,
        metaDescription: seoAnalysis.metaDescription || blogContent.metaDescription,
        seoKeywords: seoAnalysis.secondaryKeywords,
        hashtags: seoAnalysis.hashtags
      };

      console.log('🎉 Blog generation completed successfully!');

      return {
        blog: completeBlog,
        enhancedPrompt
      };
    } catch (error) {
      console.error('❌ Blog generation failed:', error);
      throw new Error(`Blog generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

}

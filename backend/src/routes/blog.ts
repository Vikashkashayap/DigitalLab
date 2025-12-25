import { Router, Request, Response } from 'express';
import { BlogOrchestrator } from '../agents/blogOrchestrator';
import { Blog } from '../models/Blog';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { GenerateBlogRequest, GenerateBlogResponse, BlogWithImagesResponse, ApiResponse } from '../../../shared/types';

const router = Router();
const blogOrchestrator = new BlogOrchestrator();

// POST /api/generate/blog - Generate a complete blog with images
router.post('/generate/blog', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { prompt }: GenerateBlogRequest = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Please provide a prompt with at least 10 characters'
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`🔄 Generating blog for prompt: "${prompt.substring(0, 50)}..."`);

    // Generate complete blog with images
    const result = await blogOrchestrator.generateCompleteBlog(prompt.trim());

    // Save blog to database
    const blogData = {
      title: result.blog.title,
      content: result.blog.content,
      metaDescription: result.blog.metaDescription,
      seoKeywords: result.blog.seoKeywords,
      hashtags: result.blog.hashtags,
      prompt: prompt.trim(),
      status: 'published' as const,
      wordCount: result.blog.wordCount,
      estimatedReadTime: Math.ceil(result.blog.wordCount / 200),
      summary: result.blog.summary
    };

    const savedBlog = await Blog.create(blogData);

    const response: ApiResponse<GenerateBlogResponse> = {
      success: true,
      data: {
        blog: {
          _id: savedBlog._id.toString(),
          title: savedBlog.title,
          content: savedBlog.content,
          metaDescription: savedBlog.metaDescription,
          seoKeywords: savedBlog.seoKeywords,
          hashtags: savedBlog.hashtags,
          heroImage: savedBlog.heroImage,
          sectionImages: savedBlog.sectionImages,
          prompt: savedBlog.prompt,
          status: savedBlog.status,
          wordCount: savedBlog.wordCount,
          estimatedReadTime: savedBlog.estimatedReadTime,
          createdAt: savedBlog.createdAt,
          updatedAt: savedBlog.updatedAt
        },
        images: []
      }
    };

    console.log(`✅ Blog generated successfully: ${savedBlog.title}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Blog generation error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate blog'
    };
    res.status(500).json(errorResponse);
  }
});

// POST /api/generate/blog-with-images - Generate blog (simplified response)
router.post('/generate/blog-with-images', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { prompt }: GenerateBlogRequest = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 10) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Please provide a prompt with at least 10 characters'
      };
      return res.status(400).json(errorResponse);
    }

    console.log(`🔄 Generating blog for prompt: "${prompt.substring(0, 50)}..."`);

    // Generate complete blog
    const result = await blogOrchestrator.generateCompleteBlog(prompt.trim());

    // Save blog to database
    const blogData = {
      title: result.blog.title,
      content: result.blog.content,
      metaDescription: result.blog.metaDescription,
      seoKeywords: result.blog.seoKeywords,
      hashtags: result.blog.hashtags,
      prompt: prompt.trim(),
      status: 'published' as const,
      wordCount: result.blog.wordCount,
      estimatedReadTime: Math.ceil(result.blog.wordCount / 200),
      summary: result.blog.summary
    };

    const savedBlog = await Blog.create(blogData);

    // Create simplified response format
    const response: ApiResponse<BlogWithImagesResponse> = {
      success: true,
      data: {
        title: result.blog.title,
        metaDescription: result.blog.metaDescription,
        content: result.blog.content,
        images: [],
        seoKeywords: result.blog.seoKeywords,
        hashtags: result.blog.hashtags,
        summary: result.blog.summary || result.blog.content.substring(0, 150) + '...'
      }
    };

    console.log(`✅ Blog generated successfully: ${savedBlog.title}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Blog generation error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate blog'
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/blogs - Get all blogs (with pagination)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await Blog.countDocuments();

    const response: ApiResponse<{ blogs: any[], pagination: { page: number, limit: number, total: number, pages: number } }> = {
      success: true,
      data: {
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Get blogs error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch blogs'
    };
    res.status(500).json(errorResponse);
  }
});

// GET /api/blogs/:id - Get single blog by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id).select('-__v');
    if (!blog) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Blog not found'
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse<{ blog: any, images: any[] }> = {
      success: true,
      data: {
        blog,
        images: []
      }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Get blog error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch blog'
    };
    res.status(500).json(errorResponse);
  }
});

// PUT /api/blogs/:id - Update blog (requires auth)
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;

    const blog = await Blog.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    }).select('-__v');

    if (!blog) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Blog not found'
      };
      return res.status(404).json(errorResponse);
    }

    const response: ApiResponse<{ blog: any }> = {
      success: true,
      data: { blog }
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Update blog error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to update blog'
    };
    res.status(500).json(errorResponse);
  }
});

// DELETE /api/blogs/:id - Delete blog (requires auth)
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      const errorResponse: ApiResponse<null> = {
        success: false,
        error: 'Blog not found'
      };
      return res.status(404).json(errorResponse);
    }


    const response: ApiResponse<null> = {
      success: true,
      message: 'Blog deleted successfully'
    };

    res.json(response);
  } catch (error) {
    console.error('❌ Delete blog error:', error);
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to delete blog'
    };
    res.status(500).json(errorResponse);
  }
});

export default router;

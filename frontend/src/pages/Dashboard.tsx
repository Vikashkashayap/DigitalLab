import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Sparkles, Wand2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react'
import { GenerateBlogResponse, ApiResponse } from '@shared/types'

const Dashboard = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const examplePrompts = [
    "Write a blog on AI in education for UPSC aspirants",
    "Create an article about renewable energy solutions for small businesses",
    "Write about the future of remote work and digital nomad lifestyle",
    "Explain blockchain technology and its real-world applications",
    "Create a guide on sustainable living for urban millennials"
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate your blog.",
        variant: "destructive"
      })
      return
    }

    if (prompt.trim().length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please provide a more detailed prompt (at least 10 characters).",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await axios.post<ApiResponse<GenerateBlogResponse>>('/api/blogs/generate/blog', {
        prompt: prompt.trim()
      })

      if (response.data.success && response.data.data) {
        const { blog } = response.data.data
        toast({
          title: "Blog generated successfully!",
          description: `"${blog.title}" has been created with ${blog.wordCount} words.`,
          variant: "success"
        })

        // Navigate to the blog editor
        navigate(`/blog/${blog._id}`)
      } else {
        throw new Error(response.data.error || 'Failed to generate blog')
      }
    } catch (error: any) {
      console.error('Generation error:', error)
      toast({
        title: "Generation failed",
        description: error.response?.data?.error || "Failed to generate blog. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt)
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="h-8 w-8 text-purple-400" />
          <h1 className="text-4xl font-bold gradient-text">AI Blog Generator</h1>
        </div>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Transform your ideas into complete, SEO-optimized blog posts with stunning images.
          Powered by advanced AI agents that craft content worthy of publication.
        </p>
      </div>

      {/* Main Input Card */}
      <Card className="glass-card max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-purple-400" />
            <span>Enter Your Blog Prompt</span>
          </CardTitle>
          <CardDescription>
            Describe your blog topic, target audience, and any specific requirements.
            Our AI will create a complete, professional blog post with images.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            placeholder="e.g., Write a comprehensive blog on artificial intelligence in healthcare, focusing on recent breakthroughs and future applications for medical professionals..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] text-base bg-white/5 border-white/20 focus:border-purple-400"
            disabled={isGenerating}
          />

          <div className="flex justify-center">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              size="lg"
              className="px-8 py-3 text-lg glow-purple"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Your Blog...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Blog & Images
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Example Prompts */}
      <Card className="glass-card max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Example Prompts</CardTitle>
          <CardDescription>
            Click on any example to use it as a starting point for your blog
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                className="text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-400/50 transition-all duration-200"
                disabled={isGenerating}
              >
                <p className="text-sm text-white/90">{example}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <Card className="glass-card text-center">
          <CardContent className="pt-6">
            <FileText className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Complete Blog Posts</h3>
            <p className="text-sm text-white/70">
              Generate 800-1200 word articles with proper structure, headings, and SEO optimization.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card text-center">
          <CardContent className="pt-6">
            <ImageIcon className="h-12 w-12 text-purple-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">AI-Generated Images</h3>
            <p className="text-sm text-white/70">
              Create stunning hero images and section illustrations using advanced AI models.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card text-center">
          <CardContent className="pt-6">
            <Sparkles className="h-12 w-12 text-pink-400 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">SEO Optimized</h3>
            <p className="text-sm text-white/70">
              Built-in SEO optimization with keywords, meta descriptions, and social media tags.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Generation Status */}
      {isGenerating && (
        <Card className="glass-card max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                <span className="text-lg font-medium">AI is working its magic...</span>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>✨ Enhancing your prompt with AI intelligence</p>
                <p>📝 Writing a comprehensive, engaging blog post</p>
                <p>🎨 Generating beautiful images for your content</p>
                <p>🔍 Optimizing for search engines and social media</p>
              </div>
              <p className="text-xs text-white/50">
                This may take 30-60 seconds depending on content complexity.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Dashboard

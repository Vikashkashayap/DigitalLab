import { useState } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Image as ImageIcon, Loader2, Download, Sparkles, Palette, Zap, Camera, Wand2 } from 'lucide-react'
import { GenerateImageRequest, GeneratedImage, ApiResponse } from '@shared/types'

interface StyleOption {
  id: 'realistic' | 'illustration' | 'minimal' | 'futuristic'
  name: string
  description: string
  icon: React.ComponentType<any>
  preview: string
}

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: 'realistic',
    name: 'Realistic',
    description: 'Photorealistic, natural lighting',
    icon: Camera,
    preview: 'Professional photography with natural lighting and realistic details'
  },
  {
    id: 'illustration',
    name: 'Illustration',
    description: 'Artistic, vibrant colors',
    icon: Palette,
    preview: 'Digital artwork with artistic composition and vibrant color palette'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, modern design',
    icon: Zap,
    preview: 'Minimalist design with clean lines and modern aesthetic'
  },
  {
    id: 'futuristic',
    name: 'Futuristic',
    description: 'Sci-fi, advanced technology',
    icon: Wand2,
    preview: 'Futuristic design with advanced technology and cyberpunk elements'
  }
]

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StyleOption['id']>('realistic')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate your image.",
        variant: "destructive"
      })
      return
    }

    if (prompt.trim().length < 5) {
      toast({
        title: "Prompt too short",
        description: "Please provide a more detailed prompt (at least 5 characters).",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)

    try {
      const requestData: GenerateImageRequest = {
        prompt: prompt.trim(),
        style: selectedStyle,
        model: "stabilityai/sdxl",
        size: "1024x1024"
      }

      const response = await axios.post<ApiResponse<{ images: GeneratedImage[] }>>('/api/agent/image', requestData)

      if (response.data.success && response.data.data && response.data.data.images.length > 0) {
        setGeneratedImages(response.data.data.images)

        toast({
          title: "🎨 Image generated successfully!",
          description: `Created with Stability AI SDXL using ${selectedStyle} style`,
        })
      } else {
        throw new Error(response.data.error || 'Failed to generate image')
      }
    } catch (error: any) {
      console.error('Image generation error:', error)
      toast({
        title: "Generation failed",
        description: error?.response?.data?.error || error.message || "Failed to generate image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `smart-ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive"
      })
    }
  }

  const selectedStyleOption = STYLE_OPTIONS.find(s => s.id === selectedStyle)
  const StyleIcon = selectedStyleOption?.icon || Camera

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600">
            <Wand2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text">AI Image Generator</h1>
        </div>
        <p className="text-xl text-white/80 max-w-2xl mx-auto">
          Generate high-quality images with AI using OpenRouter's Stability AI. Choose your style and let our agent enhance your prompt for stunning results.
        </p>
      </div>

      {/* Style Selection */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-purple-400" />
            <span>Choose Art Style</span>
          </CardTitle>
          <CardDescription>
            Select your preferred artistic style. Each style automatically enhances your prompt for optimal results.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {STYLE_OPTIONS.map((option) => {
              const IconComponent = option.icon
              const isSelected = selectedStyle === option.id

              return (
                <Card
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-400 ring-2 ring-purple-400/50'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedStyle(option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-purple-500' : 'bg-white/10'}`}>
                        <IconComponent className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-white/80'}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isSelected ? 'text-white' : 'text-white/90'}`}>
                          {option.name}
                        </h3>
                        <p className="text-sm text-white/60 mb-2">{option.description}</p>
                        <p className="text-xs text-white/50">
                          {option.preview}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Generator Form */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <span>Generate AI Image</span>
          </CardTitle>
          <CardDescription>
            Describe what you want to generate. Our AI agent will enhance your prompt and create a high-quality image using Stability AI.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-white/90">
              Image Prompt
            </label>
            <Textarea
              id="prompt"
              placeholder="Describe the image you want to generate... (e.g., 'A futuristic AI assistant helping students study')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/50"
              disabled={isGenerating}
            />
          </div>

          {/* Selected Style Display */}
          <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <StyleIcon className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">
                Selected: {selectedStyleOption?.name} Style
              </p>
              <p className="text-xs text-white/60">
                {selectedStyleOption?.description}
              </p>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating AI Image...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-5 w-5" />
                Generate with AI Agent
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {generatedImages.length === 0 && (
        <Card className="bg-yellow-500/10 border-yellow-400/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-400">
              <Sparkles className="h-5 w-5" />
              <span>Setup Required</span>
            </CardTitle>
            <CardDescription className="text-yellow-200">
              To generate real AI images, you need to configure your OpenRouter API key for the Image Generation Agent.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-500/20 p-4 rounded-lg border border-yellow-400/30">
              <h4 className="font-semibold text-yellow-300 mb-2">Quick Setup:</h4>
              <ol className="text-sm text-yellow-200 space-y-1 list-decimal list-inside">
                <li>Get API key from <a href="https://openrouter.ai/" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-100">OpenRouter.ai</a></li>
                <li>Create <code className="bg-yellow-600/30 px-2 py-1 rounded text-xs">backend/.env</code> file</li>
                <li>Add: <code className="bg-yellow-600/30 px-2 py-1 rounded text-xs">OPENROUTER_API_KEY=your-key-here</code></li>
                <li>Restart backend server</li>
              </ol>
            </div>
            <div className="text-center">
              <p className="text-yellow-300 text-sm">
                📖 See <code className="bg-yellow-600/30 px-2 py-1 rounded text-xs">SETUP-API-KEY.md</code> for detailed instructions
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card className="bg-black/20 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ImageIcon className="h-5 w-5 text-green-400" />
              <span>Generated Images</span>
            </CardTitle>
            <CardDescription>
              Your AI-generated images using Stability AI SDXL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Images Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {generatedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-black/20 border border-white/10">
                      <img
                        src={image.url}
                        alt={`Generated image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Image failed to load:', image.url);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMTExODI3Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2MzY2ZjEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBmYWlsZWQgdG8gbG9hZDwvdGV4dD4KPHN2Zz4=';
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Button
                        onClick={() => downloadImage(image.url)}
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Generation Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-2">AI Model</h4>
                  <p className="text-sm text-white/80">Stability AI SDXL</p>
                </div>
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="font-medium text-white mb-2">Art Style</h4>
                  <p className="text-sm text-white/80 capitalize">{selectedStyle}</p>
                </div>
              </div>

              {/* Original Prompt */}
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <h4 className="font-medium text-white mb-2">Your Prompt</h4>
                <p className="text-sm text-white/80">
                  "{prompt}"
                </p>
                <p className="text-xs text-white/60 mt-2">
                  The AI agent automatically enhanced this prompt for optimal results based on your selected style.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Prompts */}
      <Card className="bg-black/20 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle>💡 Example Prompts by Style</CardTitle>
          <CardDescription>
            Try these prompts optimized for different art styles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {STYLE_OPTIONS.map((style) => (
              <div key={style.id} className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <style.icon className="h-5 w-5" />
                  <span>{style.name} Style Examples</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {style.id === 'realistic' && [
                    "A professional portrait of a young woman with natural lighting, soft focus background, professional headshot",
                    "A serene mountain landscape with crystal clear lake, dramatic lighting, photorealistic quality"
                  ].map((examplePrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-3 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white justify-start text-sm"
                      onClick={() => {
                        setPrompt(examplePrompt);
                        setSelectedStyle(style.id);
                      }}
                      disabled={isGenerating}
                    >
                      {examplePrompt}
                    </Button>
                  ))}

                  {style.id === 'illustration' && [
                    "A magical forest with glowing mushrooms, vibrant colors, detailed fantasy illustration style",
                    "A futuristic cityscape with flying cars, neon lights, dynamic composition, digital artwork"
                  ].map((examplePrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-3 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white justify-start text-sm"
                      onClick={() => {
                        setPrompt(examplePrompt);
                        setSelectedStyle(style.id);
                      }}
                      disabled={isGenerating}
                    >
                      {examplePrompt}
                    </Button>
                  ))}

                  {style.id === 'minimal' && [
                    "A single white coffee cup on a wooden table, clean composition, soft lighting, minimal design",
                    "A geometric abstract pattern with clean lines, modern aesthetic, monochromatic color scheme"
                  ].map((examplePrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-3 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white justify-start text-sm"
                      onClick={() => {
                        setPrompt(examplePrompt);
                        setSelectedStyle(style.id);
                      }}
                      disabled={isGenerating}
                    >
                      {examplePrompt}
                    </Button>
                  ))}

                  {style.id === 'futuristic' && [
                    "A cyberpunk AI robot in a neon-lit laboratory, holographic displays, advanced technology",
                    "A space colony on Mars with domes and solar panels, futuristic architecture, red planet landscape"
                  ].map((examplePrompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left h-auto p-3 bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:text-white justify-start text-sm"
                      onClick={() => {
                        setPrompt(examplePrompt);
                        setSelectedStyle(style.id);
                      }}
                      disabled={isGenerating}
                    >
                      {examplePrompt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ImageGenerator

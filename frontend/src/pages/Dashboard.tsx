import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  FileText,
  Image as ImageIcon,
  Loader2,
  Send,
  Bot,
  MessageSquare,
  FolderOpen,
  File,
  FileText as DocumentIcon,
  History,
  Sun,
  Moon,
  User,
  Paperclip,
  Sparkles
} from 'lucide-react'
import { GenerateBlogResponse, ApiResponse, Blog, GeneratedImage } from '@shared/types'

type AgentType = 'blog' | 'image'

interface ChatMessage {
  id: string
  agent: AgentType
  prompt: string
  timestamp: Date
  isGenerating?: boolean
  result?: Blog | GeneratedImage
  error?: string
}

interface TaskCard {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  agent: AgentType
}

interface RecentOutput {
  id: string
  type: AgentType
  title: string
  preview: string
  timestamp: Date
  data: Blog | GeneratedImage
}

const Dashboard = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<AgentType>('blog')
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [recentOutputs, setRecentOutputs] = useState<RecentOutput[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [activeMenuItem, setActiveMenuItem] = useState('chat')
  const { toast } = useToast()
  const navigate = useNavigate()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const taskCards: TaskCard[] = [
    {
      id: 'image-gen',
      title: 'Image Generation',
      description: 'Create stunning AI-generated images from text descriptions',
      icon: <ImageIcon className="w-6 h-6" />,
      agent: 'image'
    },
    {
      id: 'blog-writing',
      title: 'Blog Writing',
      description: 'Generate comprehensive blog posts with SEO optimization',
      icon: <FileText className="w-6 h-6" />,
      agent: 'blog'
    }
  ]

  const menuItems = [
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'templates', label: 'Templates', icon: File },
    { id: 'documents', label: 'Documents', icon: DocumentIcon },
    { id: 'history', label: 'History', icon: History }
  ]

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleTaskSelect = (agent: AgentType) => {
    setSelectedAgent(agent)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: `Please enter a prompt to generate your ${selectedAgent}.`,
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

    // Add prompt to chat history
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      agent: selectedAgent,
      prompt: prompt.trim(),
      timestamp: new Date(),
      isGenerating: true
    }

    setChatHistory(prev => [...prev, chatMessage])
    setPrompt('') // Clear prompt immediately

    try {
      if (selectedAgent === 'blog') {
        const response = await axios.post<ApiResponse<GenerateBlogResponse>>('/api/blogs/generate/blog', {
          prompt: chatMessage.prompt
        })

        if (response.data.success && response.data.data) {
          const { blog } = response.data.data

          // Update the chat message with result
          setChatHistory(prev => prev.map(msg =>
            msg.id === chatMessage.id
              ? { ...msg, isGenerating: false, result: blog }
              : msg
          ))

          // Add to recent outputs
          const newOutput: RecentOutput = {
            id: blog._id || Date.now().toString(),
            type: 'blog',
            title: blog.title,
            preview: blog.summary || blog.content.substring(0, 150) + '...',
            timestamp: new Date(),
            data: blog
          }
          setRecentOutputs(prev => [newOutput, ...prev.slice(0, 4)])

          toast({
            title: "Blog generated successfully!",
            description: `"${blog.title}" has been created with ${blog.wordCount} words.`,
          })
        } else {
          throw new Error(response.data.error || 'Failed to generate blog')
        }
      } else {
        // Image generation
        const requestData = {
          prompt: chatMessage.prompt,
          style: 'realistic',
          size: "1024x1024"
        }

        const response = await axios.post<ApiResponse<{ images: GeneratedImage[] }>>('/api/images/generate', requestData)

        if (response.data.success && response.data.data && response.data.data.images.length > 0) {
          const image = response.data.data.images[0]

          // Update the chat message with result
          setChatHistory(prev => prev.map(msg =>
            msg.id === chatMessage.id
              ? { ...msg, isGenerating: false, result: image }
              : msg
          ))

          // Add to recent outputs
          const newOutput: RecentOutput = {
            id: Date.now().toString(),
            type: 'image',
            title: 'Generated Image',
            preview: chatMessage.prompt.substring(0, 100) + '...',
            timestamp: new Date(),
            data: image
          }
          setRecentOutputs(prev => [newOutput, ...prev.slice(0, 4)])

          toast({
            title: "Image generated successfully!",
            description: "Your AI-generated image is ready.",
          })
        } else {
          throw new Error(response.data.error || 'Failed to generate image')
        }
      }
    } catch (error: any) {
      console.error('Generation error:', error)

      // Update the chat message with error
      setChatHistory(prev => prev.map(msg =>
        msg.id === chatMessage.id
          ? { ...msg, isGenerating: false, error: error.response?.data?.error || `Failed to generate ${selectedAgent}` }
          : msg
      ))

      toast({
        title: "Generation failed",
        description: error.response?.data?.error || `Failed to generate ${selectedAgent}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className={`h-screen flex ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Left Sidebar */}
      <div className={`w-64 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* App Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Studio</h1>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveMenuItem(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeMenuItem === item.id
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
              isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User Profile */}
          <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
            isDarkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
          }`}>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">User</p>
              <p className="text-xs opacity-75">Free Plan</p>
            </div>
          </button>
        </div>
      </div>

      {/* Center Panel - Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`p-8 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-2">Welcome to AI Studio</h1>
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Select a task and let AI do the rest
            </p>
          </div>
        </div>

        {/* Task Cards */}
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {taskCards.map((task) => (
                <Card
                  key={task.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedAgent === task.agent
                      ? isDarkMode
                        ? 'ring-2 ring-blue-500 bg-gray-700'
                        : 'ring-2 ring-blue-500 bg-blue-50'
                      : isDarkMode
                        ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleTaskSelect(task.agent)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${
                        selectedAgent === task.agent
                          ? 'bg-blue-600 text-white'
                          : isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {task.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Chat Messages Area */}
            <div className="space-y-4 mb-6">
              {chatHistory.map((message) => (
                <div key={message.id} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className={`max-w-md px-4 py-3 rounded-2xl ${
                      isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-600 text-white'
                    }`}>
                      <p className="text-sm">{message.prompt}</p>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    {message.isGenerating ? (
                      <div className={`px-4 py-3 rounded-2xl ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                          <span className="text-sm">Generating your {message.agent}...</span>
                        </div>
                      </div>
                    ) : message.error ? (
                      <div className={`px-4 py-3 rounded-2xl ${
                        isDarkMode ? 'bg-red-900/50 text-red-300 border border-red-500/30' : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        <span className="text-sm">❌ {message.error}</span>
                      </div>
                    ) : message.result ? (
                      <div className={`px-4 py-3 rounded-2xl ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-sm font-medium text-green-600">
                            {message.agent === 'blog' ? 'Blog' : 'Image'} generated successfully!
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="relative">
              <div className={`flex items-end space-x-3 p-4 rounded-2xl border ${
                isDarkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-300'
              }`}>
                <button className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                }`}>
                  <Paperclip className="w-5 h-5" />
                </button>

                <Textarea
                  placeholder="Describe what you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`flex-1 min-h-[20px] max-h-32 resize-none border-0 focus:ring-0 focus:outline-none ${
                    isDarkMode
                      ? 'bg-transparent text-white placeholder-gray-500'
                      : 'bg-transparent text-gray-900 placeholder-gray-500'
                  }`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleGenerate()
                    }
                  }}
                />

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  size="sm"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Recent Outputs */}
      <div className={`w-80 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-l flex flex-col`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className="text-lg font-semibold">Recent Outputs</h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your generated content
          </p>
        </div>

        {/* Outputs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recentOutputs.length === 0 ? (
            <div className="text-center py-8">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                {selectedAgent === 'image' ? (
                  <ImageIcon className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                ) : (
                  <FileText className={`w-6 h-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                )}
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No outputs yet
              </p>
            </div>
          ) : (
            recentOutputs.map((output) => (
              <Card
                key={output.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isDarkMode ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (output.type === 'blog') {
                    navigate(`/blog/${output.id}`)
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      output.type === 'image'
                        ? isDarkMode ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-600'
                        : isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {output.type === 'image' ? (
                        <ImageIcon className="w-4 h-4" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate mb-1">{output.title}</h4>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {output.preview}
                      </p>
                      <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {output.timestamp.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard

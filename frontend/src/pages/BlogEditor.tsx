import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Save, Edit3, Eye, Loader2, FileText, Clock, Calendar, Heart, Download, Share2, Copy, Code, Globe, Facebook, Twitter, Linkedin, Printer } from 'lucide-react'
import { Blog, ApiResponse } from '@shared/types'

const BlogEditor = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [blog, setBlog] = useState<Blog | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [previewMode, setPreviewMode] = useState<'markdown' | 'html'>('markdown')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)

  // Editable fields
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [seoKeywords, setSeoKeywords] = useState<string[]>([])
  const [hashtags, setHashtags] = useState<string[]>([])

  useEffect(() => {
    if (id) {
      fetchBlog()
    }
  }, [id])

  const fetchBlog = async () => {
    try {
      setLoading(true)
      const response = await axios.get<ApiResponse<{ blog: Blog; images: any[] }>>(`/api/blogs/${id}`)
      if (response.data.success && response.data.data) {
        const { blog: fetchedBlog } = response.data.data
        setBlog(fetchedBlog)

        // Initialize editable fields
        setTitle(fetchedBlog.title)
        setContent(fetchedBlog.content)
        setMetaDescription(fetchedBlog.metaDescription)
        setSeoKeywords(fetchedBlog.seoKeywords || [])
        setHashtags(fetchedBlog.hashtags || [])
      } else {
        throw new Error(response.data.error || 'Failed to fetch blog')
      }
    } catch (error: any) {
      console.error('Fetch blog error:', error)
      toast({
        title: "Failed to load blog",
        description: error.response?.data?.error || "Could not load the blog. Please try again.",
        variant: "destructive"
      })
      navigate('/blogs')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!blog) return

    setSaving(true)
    try {
      const updates = {
        title: title.trim(),
        content: content.trim(),
        metaDescription: metaDescription.trim(),
        seoKeywords,
        hashtags
      }

      const response = await axios.put<ApiResponse<{ blog: Blog }>>(`/api/blogs/${blog._id}`, updates)

      if (response.data.success && response.data.data) {
        setBlog(response.data.data.blog)
        setEditMode(false)
        toast({
          title: "Blog saved successfully!",
          description: "Your changes have been saved.",
          variant: "default"
        })
      } else {
        throw new Error(response.data.error || 'Failed to save blog')
      }
    } catch (error: any) {
      console.error('Save blog error:', error)
      toast({
        title: "Failed to save blog",
        description: error.response?.data?.error || "Could not save the blog. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleKeywordChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    setSeoKeywords(keywords)
  }

  const handleHashtagChange = (value: string) => {
    const tags = value.split(',').map(h => h.trim().replace('#', '')).filter(h => h.length > 0)
    setHashtags(tags)
  }

  const toggleLike = () => {
    setLiked(!liked)
    setLikesCount(prev => liked ? prev - 1 : prev + 1)
    toast({
      title: liked ? "Removed from favorites" : "Added to favorites",
      description: liked ? "Blog removed from your favorites" : "Blog added to your favorites",
      variant: "default"
    })
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "Content copied!",
        description: "Blog content has been copied to clipboard",
        variant: "default"
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive"
      })
    }
  }

  const downloadAsHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${metaDescription}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        h2 { color: #2d3748; margin-top: 30px; }
        h3 { color: #4a5568; margin-top: 25px; }
        p { margin-bottom: 15px; }
        .meta { color: #718096; font-size: 0.9em; margin-bottom: 20px; }
        .keywords { background: #f7fafc; padding: 10px; border-radius: 5px; margin: 20px 0; }
        .hashtags { display: flex; flex-wrap: wrap; gap: 5px; margin: 20px 0; }
        .hashtag { background: #e6fffa; color: #234e52; padding: 3px 8px; border-radius: 15px; font-size: 0.8em; }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="meta">
        <p><strong>Meta Description:</strong> ${metaDescription}</p>
        <p><strong>Word Count:</strong> ${blog?.wordCount || 0} | <strong>Estimated Read Time:</strong> ${blog?.estimatedReadTime || 0} minutes</p>
    </div>

    ${seoKeywords.length > 0 ? `
    <div class="keywords">
        <strong>SEO Keywords:</strong> ${seoKeywords.join(', ')}
    </div>
    ` : ''}

    ${hashtags.length > 0 ? `
    <div class="hashtags">
        ${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
    </div>
    ` : ''}

    <div class="content">
        ${content.split('\n').map(line => {
          if (line.startsWith('# ')) {
            return `<h1>${line.replace('# ', '')}</h1>`
          } else if (line.startsWith('## ')) {
            return `<h2>${line.replace('## ', '')}</h2>`
          } else if (line.startsWith('### ')) {
            return `<h3>${line.replace('### ', '')}</h3>`
          } else if (line.trim() === '') {
            return '<br>'
          } else {
            return `<p>${line}</p>`
          }
        }).join('\n')}
    </div>
</body>
</html>`

    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "HTML downloaded!",
      description: "Blog has been downloaded as HTML file",
      variant: "default"
    })
  }

  const downloadAsMarkdown = () => {
    const markdownContent = `# ${title}\n\n${metaDescription}\n\n---\n\n${content}\n\n---\n\n**SEO Keywords:** ${seoKeywords.join(', ')}\n\n**Hashtags:** ${hashtags.map(h => `#${h}`).join(' ')}\n\n**Word Count:** ${blog?.wordCount || 0}\n\n**Estimated Read Time:** ${blog?.estimatedReadTime || 0} minutes`

    const blob = new Blob([markdownContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Markdown downloaded!",
      description: "Blog has been downloaded as Markdown file",
      variant: "default"
    })
  }

  const printBlog = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; page-break-after: avoid; }
        h2 { color: #2d3748; margin-top: 30px; page-break-after: avoid; }
        h3 { color: #4a5568; margin-top: 25px; page-break-after: avoid; }
        p { margin-bottom: 15px; }
        .meta { color: #718096; font-size: 0.9em; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
        .keywords { background: #f7fafc; padding: 10px; border-radius: 5px; margin: 20px 0; }
        .hashtags { display: flex; flex-wrap: wrap; gap: 5px; margin: 20px 0; }
        .hashtag { background: #e6fffa; color: #234e52; padding: 3px 8px; border-radius: 15px; font-size: 0.8em; }
        @media print { body { margin: 0; padding: 15mm; } }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="meta">
        <p><strong>Meta Description:</strong> ${metaDescription}</p>
        <p><strong>Word Count:</strong> ${blog?.wordCount || 0} | <strong>Estimated Read Time:</strong> ${blog?.estimatedReadTime || 0} minutes</p>
        <p><strong>Created:</strong> ${blog?.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A'}</p>
    </div>

    ${seoKeywords.length > 0 ? `
    <div class="keywords">
        <strong>SEO Keywords:</strong> ${seoKeywords.join(', ')}
    </div>
    ` : ''}

    ${hashtags.length > 0 ? `
    <div class="hashtags">
        ${hashtags.map(tag => `<span class="hashtag">#${tag}</span>`).join(' ')}
    </div>
    ` : ''}

    <div class="content">
        ${content.split('\n').map(line => {
          if (line.startsWith('# ')) {
            return `<h1>${line.replace('# ', '')}</h1>`
          } else if (line.startsWith('## ')) {
            return `<h2>${line.replace('## ', '')}</h2>`
          } else if (line.startsWith('### ')) {
            return `<h3>${line.replace('### ', '')}</h3>`
          } else if (line.trim() === '') {
            return '<br>'
          } else {
            return `<p>${line}</p>`
          }
        }).join('\n')}
    </div>
</body>
</html>`

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.print()
  }

  const shareOnTwitter = () => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent(`Check out this blog: ${title}`)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  }

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(window.location.href)
    const titleEncoded = encodeURIComponent(title)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${titleEncoded}`, '_blank')
  }

  const renderContent = (content: string) => {
    // Simple markdown-like rendering for preview
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-white mb-4 mt-6 first:mt-0">{line.replace('# ', '')}</h1>
        } else if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-white mb-3 mt-5">{line.replace('## ', '')}</h2>
        } else if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-medium text-white mb-2 mt-4">{line.replace('### ', '')}</h3>
        } else if (line.trim() === '') {
          return <br key={index} />
        } else {
          return <p key={index} className="text-white/90 mb-3 leading-relaxed">{line}</p>
        }
      })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white/70">Loading blog...</p>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Blog Not Found</h1>
        <Button onClick={() => navigate('/blogs')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Blogs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/blogs')}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blogs</span>
        </Button>

        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <Button
            onClick={toggleLike}
            variant={liked ? "default" : "outline"}
            size="sm"
            className={`flex items-center space-x-1 ${liked ? 'bg-red-600 hover:bg-red-700' : ''}`}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </Button>

          {/* Share Dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <button onClick={shareOnTwitter} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <Twitter className="h-4 w-4" />
                  <span>Twitter</span>
                </button>
                <button onClick={shareOnFacebook} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <Facebook className="h-4 w-4" />
                  <span>Facebook</span>
                </button>
                <button onClick={shareOnLinkedIn} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Download Dropdown */}
          <div className="relative">
            <Button variant="outline" size="sm" className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="py-2">
                <button onClick={downloadAsHTML} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <Code className="h-4 w-4" />
                  <span>HTML</span>
                </button>
                <button onClick={downloadAsMarkdown} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <FileText className="h-4 w-4" />
                  <span>Markdown</span>
                </button>
                <button onClick={printBlog} className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-white hover:bg-slate-700">
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Copy Button */}
          <Button
            onClick={copyToClipboard}
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </Button>

          {/* Preview Mode Toggle */}
          {!editMode && (
            <Button
              onClick={() => setPreviewMode(previewMode === 'markdown' ? 'html' : 'markdown')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              {previewMode === 'markdown' ? <Code className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              <span>{previewMode === 'markdown' ? 'HTML' : 'Markdown'}</span>
            </Button>
          )}

          <Button
            onClick={() => setEditMode(!editMode)}
            variant={editMode ? "secondary" : "default"}
            className="flex items-center space-x-2"
          >
            {editMode ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            <span>{editMode ? 'Preview' : 'Edit'}</span>
          </Button>

          {editMode && (
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Blog Metadata */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Blog Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editMode ? (
            <>
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter blog title..."
                  className="bg-white/5 border-white/20 focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">Meta Description</label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description..."
                  className="bg-white/5 border-white/20 focus:border-purple-400 min-h-[80px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">SEO Keywords</label>
                  <Input
                    value={seoKeywords.join(', ')}
                    onChange={(e) => handleKeywordChange(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3..."
                    className="bg-white/5 border-white/20 focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">Hashtags</label>
                  <Input
                    value={hashtags.map(h => `#${h}`).join(', ')}
                    onChange={(e) => handleHashtagChange(e.target.value)}
                    placeholder="#hashtag1, #hashtag2, #hashtag3..."
                    className="bg-white/5 border-white/20 focus:border-purple-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{blog.title}</h1>
                <p className="text-white/70 text-sm mb-4">{blog.metaDescription}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{blog.wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{blog.estimatedReadTime} min read</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(blog.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {blog.seoKeywords && blog.seoKeywords.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-white/90">Keywords: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blog.seoKeywords.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-200 rounded text-xs">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {blog.hashtags && blog.hashtags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-white/90">Hashtags: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {blog.hashtags.map((hashtag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-xs">
                            #{hashtag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Blog Content */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Edit3 className="h-5 w-5" />
            <span>Blog Content</span>
          </CardTitle>
          <CardDescription>
            {editMode ? 'Edit your blog content below' : 'Preview of your blog content'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your blog content..."
              className="bg-white/5 border-white/20 focus:border-purple-400 min-h-[600px] font-mono text-sm"
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              {previewMode === 'html' ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: content.split('\n').map(line => {
                      if (line.startsWith('# ')) {
                        return `<h1>${line.replace('# ', '')}</h1>`
                      } else if (line.startsWith('## ')) {
                        return `<h2>${line.replace('## ', '')}</h2>`
                      } else if (line.startsWith('### ')) {
                        return `<h3>${line.replace('### ', '')}</h3>`
                      } else if (line.trim() === '') {
                        return '<br>'
                      } else {
                        return `<p>${line}</p>`
                      }
                    }).join('\n')
                  }}
                />
              ) : (
                renderContent(blog.content)
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Original Prompt */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Original Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 italic">"{blog.prompt}"</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default BlogEditor
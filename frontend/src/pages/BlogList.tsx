import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { FileText, Clock, Eye, Trash2, Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Blog } from '@shared/types'

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/blogs')
      if (response.data.success) {
        setBlogs(response.data.data.blogs)
      } else {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      toast({
        title: "Error loading blogs",
        description: error.response?.data?.error || "Failed to load blogs",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (blogId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeletingId(blogId)
    try {
      const response = await axios.delete(`/api/blogs/${blogId}`)
      if (response.data.success) {
        setBlogs(blogs.filter(blog => blog._id !== blogId))
        toast({
          title: "Blog deleted",
          description: `"${title}" has been deleted successfully.`,
          variant: "success"
        })
      } else {
        throw new Error(response.data.error)
      }
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.response?.data?.error || "Failed to delete blog",
        variant: "destructive"
      })
    } finally {
      setDeletingId(null)
    }
  }

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.seoKeywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white/80">Loading your blogs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Blogs</h1>
          <p className="text-white/80 mt-2">Manage and edit your AI-generated blog posts</p>
        </div>
        <Link to="/">
          <Button className="glow-purple">
            <Plus className="mr-2 h-4 w-4" />
            Create New Blog
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              placeholder="Search blogs by title, content, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Blog Grid */}
      {filteredBlogs.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <Search className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No blogs found</h3>
                  <p className="text-white/60">Try adjusting your search terms</p>
                </div>
              ) : (
                <div>
                  <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No blogs yet</h3>
                  <p className="text-white/60 mb-4">Create your first AI-generated blog post</p>
                  <Link to="/">
                    <Button className="glow-purple">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Blog
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBlogs.map((blog) => (
            <Card key={blog._id} className="glass-card hover:glow-purple transition-all duration-300">
              <CardHeader>
                <CardTitle className="line-clamp-2 text-lg leading-tight">
                  {blog.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {blog.metaDescription}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Blog Stats */}
                <div className="flex items-center justify-between text-sm text-white/60">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{blog.wordCount} words</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{blog.estimatedReadTime} min</span>
                  </div>
                </div>

                {/* Keywords */}
                <div>
                  <p className="text-xs text-white/60 mb-1">Keywords:</p>
                  <div className="flex flex-wrap gap-1">
                    {blog.seoKeywords.slice(0, 3).map((keyword, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                    {blog.seoKeywords.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-white/10 text-white/60 rounded-full">
                        +{blog.seoKeywords.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Hero Image Preview */}
                {blog.heroImage && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-white/5">
                    <img
                      src={blog.heroImage}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Link to={`/blog/${blog._id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(blog._id!, blog.title)}
                    disabled={deletingId === blog._id}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    {deletingId === blog._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Status */}
                <div className="text-xs text-center">
                  <span className={`px-2 py-1 rounded-full ${
                    blog.status === 'published'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {blog.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      {blogs.length > 0 && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold gradient-text">{blogs.length}</div>
                <div className="text-sm text-white/60">Total Blogs</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {blogs.reduce((sum, blog) => sum + blog.wordCount, 0).toLocaleString()}
                </div>
                <div className="text-sm text-white/60">Total Words</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {blogs.filter(blog => blog.status === 'published').length}
                </div>
                <div className="text-sm text-white/60">Published</div>
              </div>
              <div>
                <div className="text-2xl font-bold gradient-text">
                  {Math.round(blogs.reduce((sum, blog) => sum + blog.wordCount, 0) / blogs.length) || 0}
                </div>
                <div className="text-sm text-white/60">Avg Words/Blog</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BlogList


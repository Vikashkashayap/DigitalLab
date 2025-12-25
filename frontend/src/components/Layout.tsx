import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, FileText, Home, Sparkles, Image as ImageIcon } from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-600 to-blue-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">AI Blog Generator</span>
            </Link>

            <nav className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/images">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Image Generator
                </Button>
              </Link>
              <Link to="/blogs">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
                  <FileText className="mr-2 h-4 w-4" />
                  My Blogs
                </Button>
              </Link>

              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-white/80">Welcome, {user.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="gradient" size="sm">
                    Sign In
                  </Button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 AI Blog Generator. Powered by OpenRouter & LangChain.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
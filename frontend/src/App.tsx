import { Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import Dashboard from '@/pages/Dashboard'
import BlogEditor from '@/pages/BlogEditor'
import BlogList from '@/pages/BlogList'
import Auth from '@/pages/Auth'
import ImageGenerator from '@/pages/ImageGenerator'
import Layout from '@/components/Layout'
import { AuthProvider } from '@/hooks/useAuth'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="images" element={<ImageGenerator />} />
            <Route path="blogs" element={<BlogList />} />
            <Route path="blog/:id" element={<BlogEditor />} />
            <Route path="auth" element={<Auth />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </AuthProvider>
  )
}

export default App

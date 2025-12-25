# 🚀 Setup API Keys for AI Features

## 📋 Required API Keys

This application uses **two different AI providers** for optimal performance:

### 1. 📝 Text Generation (OpenRouter)
**Used for**: Blog writing, prompt enhancement, SEO optimization

**Setup:**
1. Go to [https://openrouter.ai/](https://openrouter.ai/)
2. Create an account and add credits ($5 minimum recommended)
3. Go to Dashboard → API Keys
4. Copy your API key (starts with `sk-or-v1-`)

### 2. 🎨 Image Generation (Stability AI)
**Used for**: AI image generation with SDXL models

**Setup:**
1. Go to [https://platform.stability.ai/](https://platform.stability.ai/)
2. Create an account and add credits ($5 minimum recommended)
3. Go to Dashboard → API Keys
4. Copy your API key (starts with `sk-`)

## ❓ Why Two Different Providers?

- **OpenRouter**: Excellent for text generation with multiple models
- **Stability AI Direct API**: Reliable image generation (OpenRouter has routing issues with images)

## ❌ Common Issues & Solutions

### HTTP 405 Errors
- **Problem**: OpenRouter image endpoints return "Method Not Allowed"
- **Solution**: We now use Stability AI's direct API for images

### Missing API Keys
- **Problem**: Features don't work
- **Solution**: Set both `OPENROUTER_API_KEY` and `STABILITY_API_KEY`

### Step 2: Create .env File

1. Open your `backend/` folder
2. Create a new file named `.env` (note the dot at the beginning)
3. Copy the content from `env-example.txt`
4. Replace both API key placeholders with your actual keys

**Example .env file:**
```bash
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/ai-blog-generator

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenRouter API (Required for text generation - blogs, prompts, SEO)
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stability AI API (Required for image generation - direct API, no routing issues)
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 3: Restart Backend Server

```bash
# Stop the backend server (Ctrl+C in terminal)
# Then restart it
cd backend
npm run dev
```

### Step 4: Test Features

1. Open your app: `http://localhost:5173`
2. **Test Text Generation** (Blog writing):
   - Go to Dashboard → Generate Blog
   - Enter a topic and click generate
3. **Test Image Generation**:
   - Go to Image Generator
   - Choose a style (Realistic, Illustration, etc.)
   - Enter a prompt like: "A futuristic AI assistant helping students"
   - Click **"Generate with AI Agent"**
   - **Real Stability AI-generated image should appear!** 🎨

## 🔧 Troubleshooting

### Image generation not working?
- Check that `STABILITY_API_KEY` is set in .env
- Verify the key starts with `sk-` (not `sk-or-v1-`)
- Make sure your Stability AI account has credits
- Try a simple prompt first: "a red circle"

### Text generation (blogs) not working?
- Check that `OPENROUTER_API_KEY` is set in .env
- Verify the key starts with `sk-or-v1-`
- Make sure your OpenRouter account has credits

### HTTP 405 errors?
- This was an OpenRouter routing issue - now fixed with direct Stability AI API
- Update your .env file with the Stability AI key

## 🎯 Expected Results

After setup, you should see:

- **📝 Blog Generation**: AI-written articles with proper formatting, SEO optimization, and metadata
- **🎨 Image Generation**: High-quality Stability AI SDXL images with professional quality

**No more HTTP 405 errors or placeholder images!** 🎨✨

### API Key Summary

- **OpenRouter** (`sk-or-v1-xxx`): For text generation and AI writing
- **Stability AI** (`sk-xxx`): For reliable image generation
- **Both required** for full functionality</content>
</xai:function_call">SETUP-API-KEY.md

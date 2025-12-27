# Simple Image Generation Agent

A minimal, guaranteed working image generation system using OpenRouter API.

## Features

- ✅ No LangChain dependencies
- ✅ No complex abstractions
- ✅ Direct OpenRouter API calls
- ✅ Simple Express server
- ✅ TypeScript support
- ✅ Proper error handling

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend folder:
   ```env
   SIMPLE_PORT=5002
   OPENROUTER_API_KEY=your-openrouter-api-key-here
   ```
   Get your API key from [OpenRouter](https://openrouter.ai/keys)

3. **Build and run:**
   ```bash
   npm run build
   npm run start:simple
   ```

4. **Test the endpoint:**
   ```bash
   node test-image-simple.js
   ```

## API Usage

**Endpoint:** `POST http://localhost:5002/api/image/generate`

**Request Body:**
```json
{
  "prompt": "a beautiful sunset over mountains"
}
```

**Success Response:**
```json
{
  "success": true,
  "image": "https://example.com/generated-image.jpg"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Technical Details

- **Model:** `openai/gpt-image-1`
- **Endpoint:** `https://openrouter.ai/api/v1/images/generations`
- **Method:** POST only
- **Timeout:** 60 seconds
- **Headers:** Proper OpenRouter authentication

## Files Created

- `src/server.ts` - Minimal Express server
- `src/image.service.ts` - Simple OpenRouter service
- `src/image.route.ts` - Express route handler
- `test-image-simple.js` - Test script

## Error Handling

Handles common OpenRouter errors:
- 401: Invalid API key
- 403: Access forbidden
- 429: Rate limit exceeded
- 504: Request timeout

No server crashes - all errors return proper JSON responses.

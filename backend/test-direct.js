// Direct OpenRouter API test - trying chat completions with image model
const axios = require("axios");

console.log("Testing chat completions with image model...");

axios.post(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    model: "google/gemini-2.5-flash-image",
    messages: [
      {
        role: "user",
        content: "Generate an image of a cute robot drinking coffee. Return the image as a URL."
      }
    ]
  },
  {
    headers: {
      Authorization: "Bearer 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",
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost",
      "X-Title": "Test"
    }
  }
).then(r => console.log("SUCCESS:", JSON.stringify(r.data, null, 2)))
 .catch(e => console.log("ERROR:", e.response?.status, JSON.stringify(e.response?.data, null, 2)));

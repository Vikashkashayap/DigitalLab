// Debug test for OpenRouter image generation
const axios = require('axios');
require('dotenv').config();

async function testDebug() {
  try {
    console.log('🔍 Testing OpenRouter image generation...');

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'google/gemini-2.5-flash-image',
      messages: [
        {
          role: 'user',
          content: 'Generate an image of a cute robot drinking coffee. Return the image as a URL.'
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'DigitalLab Image Generator'
      },
      timeout: 60000
    });

    console.log('✅ Success!');
    console.log('Full Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error:', error.response?.status, JSON.stringify(error.response?.data, null, 2));
  }
}

testDebug();

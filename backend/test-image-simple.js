// Simple test script for the image generation endpoint
// Run this after setting up your OPENROUTER_API_KEY in a .env file

const axios = require('axios');

async function testImageGeneration() {
  try {
    console.log('🧪 Testing simple image generation endpoint...');

    const response = await axios.post('http://localhost:5000/api/images/generate', {
      prompt: 'a beautiful sunset over mountains'
    });

    console.log('✅ Success!');
    console.log('Full Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);

    if (error.response?.status === 500) {
      console.log('💡 Make sure OPENROUTER_API_KEY is set in your .env file');
    }
  }
}

// Run the test
testImageGeneration();

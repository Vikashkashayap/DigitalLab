// Test script for the existing complex image generation endpoint
const axios = require('axios');

async function testExistingImageGeneration() {
  try {
    console.log('🧪 Testing existing image generation endpoint...');

    const response = await axios.post('http://localhost:5000/api/images/generate/image', {
      prompt: 'a beautiful sunset over mountains',
      style: 'realistic'
    });

    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testExistingImageGeneration();

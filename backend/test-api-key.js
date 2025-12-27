// Test script to verify OpenRouter API key works
const axios = require('axios');
require('dotenv').config();

async function testApiKey() {
  try {
    console.log('🔑 Testing OpenRouter API key...');

    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ API key is valid!');
    console.log(`📊 Found ${response.data.data?.length || 0} models`);

    // Check for image generation models
    const imageModels = response.data.data?.filter(model =>
      model.id.includes('image') ||
      model.id.includes('dall') ||
      model.id.includes('stable') ||
      model.id.includes('sdxl')
    );

    console.log(`🎨 Found ${imageModels?.length || 0} potential image models:`);
    imageModels?.slice(0, 10).forEach(model => {
      console.log(`  - ${model.id}`);
    });

  } catch (error) {
    console.log('❌ API key test failed:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 Invalid API key');
    }
  }
}

testApiKey();

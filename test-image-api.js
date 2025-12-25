// Simple test script to check OpenRouter Google Gemini image generation API
const axios = require('axios');

async function testImageAPI() {
    try {
        console.log('🧪 Testing OpenRouter Google Gemini Image Generation API...\n');

        const response = await axios.post('http://localhost:5000/api/agent/image', {
            prompt: "i want to generate a img of gandhi ji",
            size: "1024x1024",
            style: "realistic",
            model: "google/gemini-2.5-flash-image-preview"
        });

        console.log('✅ API Response:');
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ API Error:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testImageAPI();

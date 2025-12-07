require('dotenv').config();
const axios = require('axios'); // We need to install axios or use fetch

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log('🔄 Fetching models from API...');
        // Node 18+ has fetch natively
        const response = await fetch(url);
        const data = await response.json();

        if (data.models) {
            console.log('\n✅ Available Models:');
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                }
            });
        } else {
            console.log('❌ No models found or error:', data);
        }

    } catch (error) {
        console.error('Network error:', error.message);
    }
}

listModels();

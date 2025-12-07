const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const ProductEmbedding = require('../models/ProductEmbedding');
const clipService = require('./clipService');

class GeminiChatbotService {
    constructor() {
        this.genAI = null;
        this.model = null;
        this.initialize();
    }

    initialize() {
        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        } else {
            console.warn('⚠️ GEMINI_API_KEY is missing. Chatbot will not function correctly.');
        }
    }

    async processMessage(userMessage, conversationHistory = []) {
        if (!this.model) {
            return {
                response: "I'm currently unable to connect to my brain (Google Gemini). Please check the server configuration.",
                action: null
            };
        }

        try {
            // 1. Create prompt with specific context (truncated to save tokens)
            // Limit history to last 6 messages to avoid hitting token limits
            const recentHistory = conversationHistory.slice(-6);
            const prompt = this.buildPrompt(userMessage, recentHistory);

            // 2. Get Gemini response
            const result = await this.model.generateContent(prompt);
            const responseText = result.response.text();

            // 3. Clean and parse Gemini's response (handle potential markdown formatting)
            const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            let parsed;
            try {
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                console.error('Failed to parse Gemini JSON:', cleanJson);
                // Fallback if JSON parsing fails
                return {
                    response: "I understood what you said, but I'm having trouble processing the structured data. Could you try rephrasing?",
                    action: null
                };
            }

            // 4. Execute action based on intent
            const actionResult = await this.executeIntent(parsed);

            // 5. Handle empty results for search
            let finalResponse = parsed.response;
            if (parsed.intent === 'SEARCH_PRODUCT' && Array.isArray(actionResult) && actionResult.length === 0) {
                finalResponse = "I couldn't find any products matching your exact criteria. Try broadening your search or checking for different colors/pricing.";
            }

            // 6. Return formatted response
            return {
                response: finalResponse,
                action: parsed.action,
                intent: parsed.intent,
                data: actionResult
            };

        } catch (error) {
            console.error('Gemini processing error:', error);

            if (error.status === 429 || error.message.includes('429')) {
                return {
                    response: "I'm getting too many requests right now! 😅 Please wait about 1 minute and try asking me again.",
                    action: null
                };
            }

            return {
                response: "I'm sorry, I encountered an error while processing your request. Please try again later.",
                action: null
            };
        }
    }

    buildPrompt(userMessage, history) {
        return `You are an AI shopping assistant for an e-commerce platform called "EComes".
    
    Available product categories: electronics, clothing, shoes, furniture, jewelry-watches, sports
    Available brands: Samsung, Apple, Nike, Adidas, FitFemme, HomeComfort, EliteTime, StyleAura, CottonKing, RunPro
    
    User message: "${userMessage}"
    
    Analyze the message and respond with STRICT JSON format ONLY (no markdown backticks).
    The JSON structure must be:
    {
      "intent": "SEARCH_PRODUCT | RECOMMENDATIONS | NAVIGATE | PRODUCT_INQUIRY | CHAT | IMAGE_SEARCH_CONTEXT",
      "entities": {
        "category": "category name or null",
        "subcategory": "subcategory or null",
        "brand": "brand name or null",
        "priceRange": { "min": number, "max": number } or null,
        "color": "color name or null (e.g., red, blue, black)",
        "gender": "men | women | kids | unisex | null",
        "keywords": ["keyword1", "keyword2"],
        "destination": "cart | wishlist | orders | profile | home | settings | null",
        "query": "search query string for database" 
      },
      "response": "A friendly, conversational response to show the user. If searching, say something like 'I found these for you'.",
      "action": "search | recommend | navigate | none"
    }

    Notes:
    - Extract GENDER from terms like "men's", "women's", "female", "male", "for him", "for her".
    - Extract COLOR from valid color names.
    - If the user asks for "men's shirts", category is 'clothing', gender is 'men', and keywords include 'shirt'.
    - If the user asks for "red shoes", category is 'shoes', color is 'red'.
    `;
    }

    async executeIntent(parsed) {
        const { intent, entities } = parsed;

        switch (intent) {
            case 'SEARCH_PRODUCT':
                return await this.searchProducts(entities);

            case 'RECOMMENDATIONS':
                return await this.getRecommendations(entities);

            case 'NAVIGATE':
                return { destination: entities.destination };

            default:
                return null;
        }
    }

    async searchProducts(entities) {
        const query = {};

        // 1. Category Filter
        if (entities.category) {
            query.category = { $regex: new RegExp(entities.category, 'i') };
        }

        // 2. Brand Filter
        if (entities.brand) {
            query.brand = { $regex: new RegExp(entities.brand, 'i') };
        }

        // 3. Price Filter
        if (entities.priceRange) {
            query.salePrice = {};
            if (entities.priceRange.min) query.salePrice.$gte = entities.priceRange.min;
            if (entities.priceRange.max) query.salePrice.$lte = entities.priceRange.max;
        }

        // 4. Color Filter (Search in variants or description)
        if (entities.color) {
            const colorRegex = new RegExp(entities.color, 'i');
            query.$or = [
                { 'variants.color': { $regex: colorRegex } },
                { description: { $regex: colorRegex } },
                { name: { $regex: colorRegex } },
                { tags: { $in: [colorRegex] } }
            ];
        }

        // 5. Gender Filter (Search in name, description, tags, category)
        if (entities.gender) {
            let genderRegex;
            if (entities.gender === 'men') {
                genderRegex = /(^|\s)(men's|mens|male|for him|gentleman)(\s|$)/i;
            } else if (entities.gender === 'women') {
                genderRegex = /(^|\s)(women's|womens|female|ladies|for her)(\s|$)/i;
            } else if (entities.gender === 'kids') {
                genderRegex = /(^|\s)(kid's|kids|child|children)(\s|$)/i;
            }

            if (genderRegex) {
                const genderQuery = {
                    $or: [
                        { name: { $regex: genderRegex } },
                        { description: { $regex: genderRegex } },
                        { category: { $regex: genderRegex } },
                        { subcategory: { $regex: genderRegex } },
                        { tags: { $in: [genderRegex] } }
                    ]
                };

                if (query.$or) {
                    query.$and = [
                        { $or: query.$or },
                        genderQuery
                    ];
                    delete query.$or;
                } else {
                    Object.assign(query, genderQuery);
                }
            }
        }

        // 6. Keyword Search
        if ((!entities.category && !entities.brand) && entities.keywords && entities.keywords.length > 0) {
            const keywordRegex = entities.keywords.map(k => new RegExp(k, 'i'));
            const keywordQuery = {
                $or: [
                    { name: { $in: keywordRegex } },
                    { 'seo.keywords': { $in: keywordRegex } },
                    { description: { $in: keywordRegex } }
                ]
            };

            if (Object.keys(query).length === 0) {
                Object.assign(query, keywordQuery);
            }
        }

        try {
            console.log('🔍 Executing Chatbot Query:', JSON.stringify(query, null, 2));
            const products = await Product.find(query).limit(5).lean();

            if (products.length === 0) {
                console.log('❌ No products found matching criteria');
                return [];
            }

            return products;
        } catch (err) {
            console.error("Product search error:", err);
            return [];
        }
    }

    async getRecommendations(entities) {
        try {
            return await Product.find({ status: 'active' })
                .sort({ averageRating: -1, reviewCount: -1 })
                .limit(5)
                .lean();
        } catch (err) {
            return [];
        }
    }
}

module.exports = new GeminiChatbotService();

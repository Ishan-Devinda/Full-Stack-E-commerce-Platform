const express = require('express');
const router = express.Router();
const geminiChatbotService = require('../services/geminiChatbotService');

// POST /api/chatbot/message
router.post('/message', async (req, res) => {
    try {
        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const result = await geminiChatbotService.processMessage(message, history);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Chatbot route error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error processing message'
        });
    }
});

module.exports = router;

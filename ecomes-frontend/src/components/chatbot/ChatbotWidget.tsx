"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Image as ImageIcon, Minimize2, Loader2, Sparkles } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { themeConfig } from '@/lib/theme';
import { ChatMessage } from './ChatMessage';
import { QuickActions } from './QuickActions';
import { useRouter } from 'next/navigation';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    products?: any[];
    timestamp: Date;
}

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! 👋 I'm your AI shopping assistant. I can help you find products, suggest gifts, or answer questions. How can I help you today?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { theme } = useTheme();
    const t = themeConfig[theme];

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chatbot/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                })
            });

            const data = await response.json();

            if (data.success) {
                const botMsg: Message = {
                    role: 'assistant',
                    content: data.response,
                    products: data.data, // Products are returned in 'data' field
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botMsg]);

                // Handle navigation if needed
                if (data.action === 'navigate' && data.data?.destination) {
                    const dest = data.data.destination;
                    if (dest === 'cart') router.push('/cart');
                    else if (dest === 'wishlist') router.push('/profile/wishlist');
                    else if (dest === 'orders') router.push('/profile/orders');
                    else if (dest === 'home') router.push('/');
                }
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Placeholder for image upload 
    // (In a full implementation, this would upload image to backend first, then send image URL/embedding to chatbot)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Implement image handling here
        const file = e.target.files?.[0];
        if (file) {
            // For now, notify user
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Image search inside chat is coming soon! For now, please use the camera icon in the search bar above.",
                timestamp: new Date()
            }]);
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-6 right-6 z-50 
                    w-14 h-14 rounded-full shadow-lg 
                    flex items-center justify-center
                    bg-gradient-to-r from-blue-600 to-purple-600 text-white
                    hover:shadow-xl transition-shadow
                `}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            fixed bottom-24 right-6 z-50
                            w-[90vw] md:w-[400px] h-[600px] max-h-[80vh]
                            bg-white dark:bg-gray-900 
                            rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800
                            flex flex-col overflow-hidden
                        `}
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <Sparkles size={20} />
                                <div>
                                    <h3 className="font-bold text-sm">AI Shopping Assistant</h3>
                                    <p className="text-xs text-blue-100 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <Minimize2 size={18} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50 dark:bg-gray-950/50">
                            {messages.map((msg, idx) => (
                                <ChatMessage key={idx} {...msg} />
                            ))}
                            {loading && (
                                <div className="flex justify-start mb-4">
                                    <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm">
                                        <div className="flex gap-1">
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shrink-0">
                            {messages.length < 3 && (
                                <QuickActions onAction={handleSend} />
                            )}

                            <div className="flex gap-2 items-end mt-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    title="Upload image"
                                >
                                    <ImageIcon size={20} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />

                                <div className="flex-1 relative">
                                    <textarea
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask about products..."
                                        className={`
                                            w-full p-3 pr-10 rounded-xl resize-none h-[48px] max-h-[100px]
                                            bg-gray-100 dark:bg-gray-800 
                                            text-gray-900 dark:text-gray-100
                                            focus:outline-none focus:ring-2 focus:ring-blue-500
                                            custom-scrollbar text-sm
                                        `}
                                        rows={1}
                                    />
                                </div>

                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || loading}
                                    className={`
                                        p-3 rounded-xl flex items-center justify-center
                                        ${!input.trim() || loading
                                            ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                        }
                                        transition-all
                                    `}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

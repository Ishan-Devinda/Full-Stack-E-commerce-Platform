import React from 'react';
import { motion } from 'framer-motion';

interface QuickActionsProps {
    onAction: (action: string) => void;
}

const suggestions = [
    "Suggested gift?",
    "Show me new arrivals",
    "Track my order",
    "Men's watches",
    "Running shoes"
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onAction }) => {
    return (
        <div className="flex gap-2 overflow-x-auto py-2 px-1 custom-scrollbar scrollbar-hide">
            {suggestions.map((text, idx) => (
                <motion.button
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => onAction(text)}
                    className="
                        whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium
                        bg-gray-100 dark:bg-gray-800 
                        text-gray-600 dark:text-gray-300
                        border border-gray-200 dark:border-gray-700
                        hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400
                        hover:border-blue-200 dark:hover:border-blue-800
                        transition-colors
                    "
                >
                    {text}
                </motion.button>
            ))}
        </div>
    );
};

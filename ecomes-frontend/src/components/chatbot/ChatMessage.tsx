import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    _id: string;
    name: string;
    basePrice: number;
    salePrice: number;
    images: string[];
    averageRating?: number;
}

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    products?: Product[];
    timestamp?: Date;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, products }) => {
    const isUser = role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                {/* Avatar */}
                <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${isUser ? 'bg-blue-600' : 'bg-purple-600'}
                    text-white shadow-sm
                `}>
                    {isUser ? <User size={14} /> : <Sparkles size={14} />}
                </div>

                {/* Message Content */}
                <div className="flex flex-col gap-2">
                    <div className={`
                        p-3 rounded-2xl text-sm shadow-sm
                        ${isUser
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                        }
                    `}>
                        <p className="whitespace-pre-wrap">{content}</p>
                    </div>

                    {/* Product Cards (Horizontal Scroll) */}
                    {products && products.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto py-2 -mx-1 px-1 custom-scrollbar">
                            {products.map((product) => (
                                <Link
                                    key={product._id}
                                    href={`/product/${product._id}`}
                                    className="min-w-[140px] w-[140px] bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                                >
                                    <div className="relative h-24 w-full bg-gray-100 dark:bg-gray-900">
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <h4 className="text-xs font-medium text-gray-800 dark:text-gray-100 line-clamp-2 h-8">
                                            {product.name}
                                        </h4>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                ${product.salePrice || product.basePrice}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

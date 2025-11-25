import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, MessageCircle, Minimize2, Maximize2 } from 'lucide-react';
import { callGemini } from '../lib/gemini';
import { useGameStore } from '../store/useGameStore';
import { useLocation } from 'react-router-dom';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Chào đạo hữu! Ta là Hộ Pháp của Tiên Giới. Đạo hữu cần ta giúp gì không?", sender: 'ai' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useGameStore();
    const location = useLocation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const userMessage = { id: Date.now(), text: inputText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // Construct context-aware prompt
            const context = `
                Ngữ cảnh hiện tại:
                - Người dùng: ${user?.username || 'Khách'} (Cảnh giới: ${user?.rank || 'Phàm Nhân'})
                - Trang đang xem: ${location.pathname}
                - Vai trò của bạn: Bạn là một Hộ Pháp (Trợ lý ảo) trong web xem phim tu tiên "Tiên Giới". 
                - Phong cách trả lời: Cổ trang, kiếm hiệp, tiên hiệp, xưng hô "ta" và "đạo hữu".
                - Nhiệm vụ: Giải đáp thắc mắc về phim, hướng dẫn tu luyện (tăng cấp), hoặc trò chuyện vui vẻ.
            `;

            const fullPrompt = `${context}\n\nCâu hỏi của người dùng: ${userMessage.text}`;
            const responseText = await callGemini(fullPrompt);

            const aiMessage = { id: Date.now() + 1, text: responseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('AI Error:', error);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: "Linh khí hỗn loạn, ta không thể kết nối với Thiên Đạo lúc này.", sender: 'ai', isError: true }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform duration-300 group"
            >
                <Bot size={28} className="text-white group-hover:animate-bounce" />
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-ping"></span>
            </button>
        );
    }

    return (
        <div className={`fixed z-50 transition-all duration-300 ease-in-out ${isMinimized
            ? 'bottom-6 right-6 w-72 h-14 overflow-hidden rounded-full'
            : 'bottom-6 right-6 w-80 md:w-96 h-[500px] rounded-2xl'
            } bg-[#0f172a] border border-cyan-500/30 shadow-2xl shadow-cyan-900/40 flex flex-col`}>

            {/* Header */}
            <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 backdrop-blur cursor-pointer"
                onClick={() => isMinimized && setIsMinimized(false)}
            >
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg">
                        <Bot size={20} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Hộ Pháp Tiên Giới</h3>
                        {!isMinimized && <span className="text-xs text-green-400 flex items-center gap-1">● Đang trực tuyến</span>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Chat Body */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.sender === 'user'
                                        ? 'bg-cyan-600 text-white rounded-tr-none'
                                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-700 flex gap-1">
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-gray-900/50 border-t border-white/5">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Hỏi gì đó đi đạo hữu..."
                                className="w-full bg-gray-800 text-white text-sm rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:ring-1 focus:ring-cyan-500 border border-gray-700 placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isLoading}
                                className="absolute right-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default AIAssistant;

import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Learning", "Health", "Miscellaneous"];

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [allMessages, setAllMessages] = useState([]);
    const [messages, setMessages] = useState([]);
    const [activeCategory, setActiveCategory] = useState("All");
    const [inputValue, setInputValue] = useState("");
    const [inputCategory, setInputCategory] = useState("Miscellaneous");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeCategory]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchAllMessages = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/messages?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setAllMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch all messages", err);
        }
    };

    const fetchCategoryMessages = async (userId, category) => {
        try {
            const url = category === "All"
                ? `http://localhost:5001/api/messages?userId=${userId}`
                : `http://localhost:5001/api/messages/category/${category}?userId=${userId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch category messages", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAllMessages(user._id);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCategoryMessages(user._id, activeCategory);
        }
    }, [user, activeCategory]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || !user || isLoading) return;

        const text = inputValue;
        const category = inputCategory;
        setInputValue("");
        setIsLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, text, category })
            });
            const data = await res.json();

            if (res.ok) {
                if (activeCategory === "All" || activeCategory === category) {
                    setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
                }
                setAllMessages(prev => [...prev, data.userMessage, data.aiMessage]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getCategoryCount = (category) => {
        if (category === "All") return allMessages.length;
        return allMessages.filter(m => m.category === category).length;
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-3">
                            <span className="text-white font-bold text-xl leading-none -rotate-3">P</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Persona<span className="text-indigo-600">AI</span>
                        </span>
                    </Link>
                    <button
                        className="lg:hidden text-gray-500 hover:text-gray-900"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                        Categories
                    </h3>
                    <div className="space-y-1">
                        {CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setActiveCategory(category);
                                    if (category !== "All") setInputCategory(category);
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeCategory === category
                                    ? 'bg-indigo-50 text-indigo-700'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <span>{category}</span>
                                <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${activeCategory === category
                                    ? 'bg-indigo-100 text-indigo-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {getCategoryCount(category)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold overflow-hidden">
                            <svg className="w-6 h-6 text-gray-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user.email.split('@')[0]}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-white shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] z-10">

                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-gray-500 hover:text-gray-900 focus:outline-none"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                {activeCategory} {activeCategory !== "All" && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{getCategoryCount(activeCategory)}</span>}
                            </h2>
                        </div>
                    </div>
                </header>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50/50">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">No messages in {activeCategory}</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold leading-none ${msg.role === 'user'
                                        ? 'bg-gray-200 text-gray-600 hidden sm:flex'
                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                                        }`}>
                                        {msg.role === 'user' ? 'ME' : 'AI'}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-[11px] font-medium text-gray-500">{msg.role === 'user' ? 'You' : 'PersonaAI'}</span>
                                            <span className="text-[10px] text-gray-400">{formatTime(msg.createdAt)}</span>
                                        </div>

                                        <div className={`px-4 py-3 shadow-sm relative ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm'
                                            : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'
                                            }`}>
                                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                        </div>

                                        {/* Category Tag */}
                                        <div className={`mt-1.5 flex transition-opacity duration-200 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${msg.role === 'user'
                                                ? 'bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-500'
                                                : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600'
                                                }`}>
                                                {msg.category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start animate-fade-in-up">
                            <div className="flex gap-3 max-w-[85%] md:max-w-[75%] flex-row">
                                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold leading-none bg-gradient-to-br from-indigo-500 to-purple-600 text-white">AI</div>
                                <div className="flex flex-col group items-start">
                                    <div className="px-4 py-3 shadow-sm relative bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm flex items-center gap-1 h-[48px]">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-100 p-4 sm:p-6 z-20">
                    <form
                        onSubmit={handleSendMessage}
                        className="max-w-4xl mx-auto flex items-end gap-3"
                    >
                        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all flex flex-col">

                            <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                    <select
                                        value={inputCategory}
                                        onChange={(e) => setInputCategory(e.target.value)}
                                        className="text-xs font-medium text-gray-600 bg-transparent border-none focus:ring-0 p-0 cursor-pointer outline-none"
                                    >
                                        {CATEGORIES.filter(c => c !== "All").map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={isLoading}
                                placeholder={isLoading ? "PersonaAI is thinking..." : "Message your second brain..."}
                                className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none disabled:bg-gray-50"
                                rows={1}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="shrink-0 p-3 h-[44px] w-[44px] bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl shadow-sm flex items-center justify-center transition-colors mb-1"
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <div className="max-w-4xl mx-auto mt-2 text-center">
                        <p className="text-[10px] text-gray-400">PersonaAI can make mistakes. Consider verifying important information.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;

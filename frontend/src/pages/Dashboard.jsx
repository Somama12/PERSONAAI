import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MemoryPanel from '../components/MemoryPanel';
import SourcePanel from '../components/SourcePanel';

const CATEGORIES = ["All", "Work", "Personal", "Ideas", "Learning", "Health", "Miscellaneous"];

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [memories, setMemories] = useState([]);
    const [sources, setSources] = useState([]);
    const [activeMode, setActiveMode] = useState('Memory');
    const [activeCategory, setActiveCategory] = useState("All");
    const [activeSource, setActiveSource] = useState(null); // For Source mode
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSourceUploading, setIsSourceUploading] = useState(false);

    // Default to Miscellaneous if creating new memory without a tag
    const [inputCategory, setInputCategory] = useState("Miscellaneous");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, activeCategory, activeMode]);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchMessages = async (userId) => {
        try {
            // Depending on architecture, you might want to fetch by mode later
            const url = activeCategory === "All"
                ? `http://localhost:5001/api/messages?userId=${userId}`
                : `http://localhost:5001/api/messages/category/${activeCategory}?userId=${userId}`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const fetchMemories = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/memory?userId=${userId}`);
            if (res.ok) {
                const data = await res.json();
                setMemories(data);
            }
        } catch (err) {
            console.error("Failed to fetch memories", err);
        }
    };

    const fetchSources = async (userId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/source/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSources(data);
            }
        } catch (err) {
            console.error("Failed to fetch sources", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchMessages(user._id);
            fetchMemories(user._id);
            fetchSources(user._id);
        }
    }, [user, activeCategory]); // Re-fetch when category changes

    const handleUploadPdf = async (file) => {
        if (!user) return;
        setIsSourceUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', user._id);

        try {
            const res = await fetch('http://localhost:5001/api/source/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                fetchSources(user._id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSourceUploading(false);
        }
    };

    const handleAddUrl = async (url) => {
        if (!user) return;
        setIsSourceUploading(true);
        try {
            const res = await fetch('http://localhost:5001/api/source/url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, url })
            });
            if (res.ok) {
                fetchSources(user._id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSourceUploading(false);
        }
    };

    const handleDeleteSource = async (sourceId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/source/${sourceId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setSources(prev => prev.filter(s => s._id !== sourceId));
                if (activeSource === sourceId) setActiveSource(null);
            }
        } catch (err) {
            console.error("Failed to delete source", err);
        }
    };

    const [pendingMemories, setPendingMemories] = useState([]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (!inputValue.trim() || !user || isLoading) return;

        if (activeMode === 'Source' && !activeSource) {
            alert("Please select a document first.");
            return;
        }

        const text = inputValue;
        const category = inputCategory;
        const currentMode = activeMode;

        setInputValue("");
        setIsLoading(true);

        try {
            const url = currentMode === 'Source'
                ? 'http://localhost:5001/api/source/query'
                : 'http://localhost:5001/api/chat';

            const payload = currentMode === 'Source'
                ? { userId: user._id, sourceId: activeSource, query: text }
                : { userId: user._id, text, category, mode: currentMode, sourceId: activeSource };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, data.userMessage, data.aiMessage]);
                // If Memory mode, extract facts
                if (currentMode === 'Memory') {
                    try {
                        const extractRes = await fetch('http://localhost:5001/api/memory/extract', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                userId: user._id,
                                text: data.userMessage.text,
                                aiResponse: data.aiMessage.text
                            })
                        });
                        if (extractRes.ok) {
                            const extractData = await extractRes.json();
                            if (extractData.extracted && extractData.extracted.length > 0) {
                                setPendingMemories(prev => [...prev, ...extractData.extracted]);
                            }
                        }
                    } catch (extErr) {
                        console.error("Extraction error", extErr);
                    }
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmMemory = async (factObj, index) => {
        try {
            const res = await fetch('http://localhost:5001/api/memory/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    content: factObj.fact,
                    category: factObj.category || 'Miscellaneous',
                    confidence: factObj.confidence || 0.9
                })
            });
            if (res.ok) {
                fetchMemories(user._id);
                setPendingMemories(prev => prev.filter((_, i) => i !== index));
            }
        } catch (err) {
            console.error("Memory confirm error", err);
        }
    };

    const handleDismissMemory = (index) => {
        setPendingMemories(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteMemory = async (memoryId) => {
        try {
            const res = await fetch(`http://localhost:5001/api/memory/${memoryId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setMemories(prev => prev.filter(m => m._id !== memoryId));
            }
        } catch (err) {
            console.error("Failed to delete memory", err);
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const displayedMessages = messages.filter(msg => {
        // First filter by mode
        let modeMatch = true;
        if (activeMode === 'General') modeMatch = msg.mode === 'General' || !msg.mode;
        else if (activeMode === 'Memory') modeMatch = msg.mode === 'Memory';
        else if (activeMode === 'Source') modeMatch = msg.mode === 'Source' && msg.sourceId === activeSource;

        if (!modeMatch) return false;

        // Then filter by search query
        if (searchQuery.trim()) {
            try {
                const regex = new RegExp(searchQuery, 'i');
                return regex.test(msg.text);
            } catch (e) {
                // fallback to standard text includes if regex is invalid
                return msg.text.toLowerCase().includes(searchQuery.toLowerCase());
            }
        }
        return true;
    });

    if (!user) return null;

    return (
        <div className="flex h-screen bg-navy text-white font-sans overflow-hidden bg-grain relative">

            {/* Memory Toasts */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
                {pendingMemories.map((mem, i) => (
                    <div key={i} className="pointer-events-auto bg-[#111827]/95 backdrop-blur-md border border-amber/30 p-4 rounded-xl shadow-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center max-w-md w-full animate-fade-in-up">
                        <div className="flex-1">
                            <h4 className="text-xs font-bold text-amber tracking-wider uppercase mb-1 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Memory Detected
                            </h4>
                            <p className="text-sm text-gray-200 leading-snug">{mem.fact}</p>
                        </div>
                        <div className="flex shrink-0 gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button onClick={() => handleConfirmMemory(mem, i)} className="flex-1 sm:flex-none px-3 py-1.5 bg-amber/20 hover:bg-amber/30 text-amber text-xs font-bold rounded-lg transition-colors border border-amber/20">
                                Save
                            </button>
                            <button onClick={() => handleDismissMemory(i)} className="flex-1 sm:flex-none px-3 py-1.5 hover:bg-gray-800 text-gray-400 text-xs font-semibold rounded-lg transition-colors border border-transparent">
                                Dismiss
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar */}
            <Sidebar
                user={user}
                activeMode={activeMode}
                setActiveMode={setActiveMode}
                categories={CATEGORIES}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                onLogout={handleLogout}
            />

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0A0F1E] z-10 relative">

                {/* Header Backdrop */}
                <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-[#0A0F1E] to-transparent z-0 pointer-events-none"></div>

                {/* Top Action Bar */}
                <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 z-20 flex justify-end items-center pointer-events-none">
                    <div className="flex items-center gap-2 pointer-events-auto">
                        {isSearchOpen ? (
                            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-full px-4 py-1.5 shadow-lg animate-fade-in-up">
                                <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Search messages (regex supported)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none text-sm text-gray-200 outline-none w-64 placeholder-gray-500"
                                />
                                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="ml-2 text-gray-500 hover:text-white">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2.5 bg-gray-900 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-gray-500 transition-colors shadow-lg"
                                title="Search Messages"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pt-20 pb-32 custom-scrollbar z-10 relative">
                    {displayedMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center border border-gray-700">
                                <span className="text-2xl opacity-50">✨</span>
                            </div>
                            <p className="text-sm font-medium">
                                {activeMode === 'Source' && !activeSource
                                    ? "Select a document to start chatting."
                                    : `How can I help you in ${activeMode} mode?`}
                            </p>
                        </div>
                    ) : (
                        displayedMessages.map((msg) => (
                            <div key={msg._id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up w-full`}>
                                <div className={`flex gap-4 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold shadow-md ${msg.role === 'user'
                                        ? 'bg-gray-800 text-gray-400 border border-gray-700'
                                        : `bg-gradient-to-br from-gray-800 to-gray-900 border ${activeMode === 'Memory' ? 'border-cyan/50 text-cyan' :
                                            activeMode === 'Source' ? 'border-emerald-500/50 text-emerald-500' :
                                                'border-amber/50 text-amber'
                                        }`
                                        }`}>
                                        {msg.role === 'user' ? user.name?.charAt(0).toUpperCase() || 'U' : 'AI'}
                                    </div>

                                    {/* Message Content */}
                                    <div className={`flex flex-col group ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 mb-1.5 px-1">
                                            <span className="text-xs font-semibold text-gray-400">{msg.role === 'user' ? 'You' : 'PersonaAI'}</span>
                                            <span className="text-[10px] text-gray-600">{formatTime(msg.createdAt)}</span>
                                        </div>

                                        <div className={`px-5 py-4 shadow-sm relative text-[15px] leading-relaxed ${msg.role === 'user'
                                            ? 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-2xl rounded-tr-sm'
                                            : 'bg-transparent text-gray-200 border border-transparent rounded-2xl rounded-tl-sm'
                                            }`}>
                                            <p className="whitespace-pre-wrap">{msg.text}</p>
                                        </div>

                                        {/* Tag */}
                                        {msg.category && msg.category !== "Uncategorized" && (
                                            <div className={`mt-2 flex opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <span className="inline-flex items-center px-2 py-0.5 border border-gray-700 rounded text-[10px] font-bold tracking-wider uppercase text-gray-500 bg-gray-900">
                                                    {msg.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex justify-start animate-fade-in-up">
                            <div className="flex gap-4 max-w-[85%] md:max-w-[75%] flex-row">
                                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-sm font-bold shadow-md bg-gradient-to-br from-gray-800 to-gray-900 border ${activeMode === 'Memory' ? 'border-cyan/50 text-cyan' :
                                    activeMode === 'Source' ? 'border-emerald-500/50 text-emerald-500' :
                                        'border-amber/50 text-amber'
                                    }`}>
                                    AI
                                </div>
                                <div className="flex flex-col group items-start mt-2">
                                    <div className="px-5 py-3 flex items-center gap-1.5 h-[48px]">
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>

                {/* Input Area */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E] to-transparent pt-12 pb-6 px-4 sm:px-6 z-20">
                    <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3 glass-panel p-2 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="flex-1 flex flex-col relative group">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={isLoading || (activeMode === 'Source' && !activeSource)}
                                placeholder={
                                    isLoading ? "Processing..." :
                                        (activeMode === 'Source' && !activeSource) ? "Select a knowledge source first..." :
                                            `Message in ${activeMode} Mode...`
                                }
                                className="w-full max-h-48 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none scrollbar-hide disabled:opacity-50"
                                rows={1}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading || (activeMode === 'Source' && !activeSource)}
                            className={`shrink-0 p-3 h-[44px] w-[44px] rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${!inputValue.trim() || isLoading || (activeMode === 'Source' && !activeSource)
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                : `bg-white text-navy hover:scale-105 active:scale-95 ${activeMode === 'Memory' ? 'hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]' :
                                    activeMode === 'Source' ? 'hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]' :
                                        'hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                }`
                                }`}
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </form>
                    <div className="text-center mt-3">
                        <p className="text-[10px] text-gray-600">AI can generate incorrect information. Verify facts in Source Mode.</p>
                    </div>
                </div>
            </main>

            {/* Memory Panel */}
            <MemoryPanel
                memories={memories}
                onDeleteMemory={handleDeleteMemory}
                isVisible={activeMode === 'Memory'}
            />

            {/* Source Panel */}
            <SourcePanel
                sources={sources}
                activeSource={activeSource}
                setActiveSource={setActiveSource}
                onUploadPdf={handleUploadPdf}
                onAddUrl={handleAddUrl}
                onDeleteSource={handleDeleteSource}
                isVisible={activeMode === 'Source'}
                isUploading={isSourceUploading}
            />
        </div>
    );
};

export default Dashboard;

import React from 'react';
import { Brain, BookOpen, MessageSquare, LogOut, Network } from 'lucide-react';

export default function Sidebar({ user, activeMode, setActiveMode, categories, activeCategory, setActiveCategory, onLogout }) {
    const modes = [
        { id: 'Memory', icon: <Brain size={20} />, label: 'Memory Mode', desc: 'Facts extracted' },
        { id: 'Source', icon: <BookOpen size={20} />, label: 'Source Mode', desc: 'Chat with docs' },
        { id: 'General', icon: <MessageSquare size={20} />, label: 'General', desc: 'No memory saved' },
    ];

    return (
        <aside className="w-64 bg-[#0A0F1E] border-r border-gray-800 flex flex-col h-full shrink-0 transition-transform duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <Network className="text-cyan drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" size={28} strokeWidth={1.5} />
                    <span className="text-2xl font-bold font-heading text-white tracking-tight">Persona<span className="text-cyan">AI</span></span>
                </div>
            </div>

            {/* Modes */}
            <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Modes</div>
                <div className="space-y-2 mb-8">
                    {modes.map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setActiveMode(mode.id)}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left ${activeMode === mode.id
                                    ? 'bg-gray-800/80 border border-gray-700 shadow-sm'
                                    : 'hover:bg-gray-800/30 border border-transparent text-gray-400'
                                }`}
                        >
                            <div className={`mt-0.5 ${activeMode === mode.id ? 'text-cyan' : 'text-gray-500'}`}>
                                {mode.icon}
                            </div>
                            <div>
                                <div className={`font-semibold ${activeMode === mode.id ? 'text-white' : ''}`}>{mode.label}</div>
                                <div className="text-[11px] text-gray-500 mt-0.5">{mode.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Categories */}
                {activeMode !== 'Source' && (
                    <>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2 mt-8">Categories</div>
                        <div className="space-y-1">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeCategory === category
                                            ? 'bg-cyan/10 text-cyan'
                                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-800/50 transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600 flex items-center justify-center text-white font-bold shrink-0 shadow-inner">
                        {user?.name ? user.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-400 truncate">{user?.email}</div>
                    </div>
                    <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

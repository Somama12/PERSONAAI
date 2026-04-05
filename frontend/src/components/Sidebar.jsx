import React from 'react';
import { Brain, BookOpen, MessageSquare, LogOut, Zap, ChevronRight } from 'lucide-react';

const CATEGORIES = [
    { id: 'All', emoji: '✦' },
    { id: 'Work', emoji: '💼' },
    { id: 'Personal', emoji: '✨' },
    { id: 'Ideas', emoji: '💡' },
    { id: 'Learning', emoji: '📚' },
    { id: 'Health', emoji: '🏃' },
    { id: 'Miscellaneous', emoji: '⚡' },
];

const MODE_CONFIG = {
    Memory: { color: 'text-amber', activeBg: 'bg-amber/8 border-amber/25', glow: 'shadow-[0_0_16px_rgba(245,158,11,0.1)]' },
    Source: { color: 'text-emerald-400', activeBg: 'bg-emerald-500/8 border-emerald-500/25', glow: 'shadow-[0_0_16px_rgba(16,185,129,0.1)]' },
    General: { color: 'text-cyan', activeBg: 'bg-cyan/8 border-cyan/25', glow: 'shadow-[0_0_16px_rgba(6,182,212,0.1)]' },
};

export default function Sidebar({ user, activeMode, setActiveMode, categories, activeCategory, setActiveCategory, onLogout }) {
    const modes = [
        {
            id: 'Memory',
            icon: <Brain size={18} />,
            label: 'Memory Mode',
            desc: 'Learns facts about you',
        },
        {
            id: 'Source',
            icon: <BookOpen size={18} />,
            label: 'Source Mode',
            desc: 'Chat with documents',
        },
        {
            id: 'General',
            icon: <MessageSquare size={18} />,
            label: 'General Chat',
            desc: 'Open conversation',
        },
    ];

    return (
        <aside className="w-64 bg-[#080D1A] border-r border-gray-800/60 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-800/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                        <Zap className="text-cyan" size={15} />
                    </div>
                    <span className="text-xl font-bold font-heading text-white tracking-tight">
                        Persona<span className="text-cyan">AI</span>
                    </span>
                </div>
                {user && (
                    <div className="mt-3 px-2 py-1.5 bg-gray-900/50 rounded-lg border border-gray-800/60">
                        <p className="text-[10px] text-gray-500">Signed in as</p>
                        <p className="text-xs font-semibold text-gray-300 truncate">{user.email}</p>
                    </div>
                )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">

                {/* AI Modes */}
                <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-2">AI Modes</p>
                    <div className="space-y-1">
                        {modes.map(mode => {
                            const cfg = MODE_CONFIG[mode.id];
                            const isActive = activeMode === mode.id;
                            return (
                                <button
                                    key={mode.id}
                                    onClick={() => setActiveMode(mode.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${isActive
                                            ? `${cfg.activeBg} ${cfg.glow}`
                                            : 'border-transparent hover:bg-gray-800/30'
                                        }`}
                                >
                                    <div className={`transition-colors ${isActive ? cfg.color : 'text-gray-600 group-hover:text-gray-400'}`}>
                                        {mode.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                            {mode.label}
                                        </div>
                                        <div className="text-[10px] text-gray-600 mt-0.5">{mode.desc}</div>
                                    </div>
                                    {isActive && (
                                        <ChevronRight size={12} className={cfg.color} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Category Filter — only for Memory / General */}
                {activeMode !== 'Source' && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2 px-2">Filter</p>
                        <div className="space-y-0.5">
                            {CATEGORIES.map(cat => {
                                const isActive = activeCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                                ? 'bg-cyan/8 text-cyan border border-cyan/15'
                                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/40 border border-transparent'
                                            }`}
                                    >
                                        <span className="text-base leading-none">{cat.emoji}</span>
                                        <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>{cat.id}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* User Profile Footer */}
            <div className="p-3 border-t border-gray-800/60">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-gray-800/40 transition-colors group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan/20 to-violet-500/20 border border-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white truncate">{user?.name || 'User'}</div>
                        <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                        title="Logout"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </aside>
    );
}

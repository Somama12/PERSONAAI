import React, { useState, useMemo } from 'react';
import { Brain, Trash2, Search, ChevronDown, ChevronRight, Sparkles, Clock, Star, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DUMMY_MEMORIES = [
    { _id: 'dm1', content: 'Works as a software engineer at a tech startup', category: 'Work', confidence: 0.97, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { _id: 'dm2', content: 'Prefers dark mode for all applications', category: 'Personal', confidence: 0.91, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { _id: 'dm3', content: 'Learning Rust programming language in spare time', category: 'Learning', confidence: 0.88, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
    { _id: 'dm4', content: 'Has an idea to build a productivity app for developers', category: 'Ideas', confidence: 0.85, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
    { _id: 'dm5', content: 'Exercises 3 times a week, focuses on strength training', category: 'Health', confidence: 0.93, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
    { _id: 'dm6', content: 'Enjoys building side projects on weekends', category: 'Personal', confidence: 0.79, createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
    { _id: 'dm7', content: 'Currently reading "Designing Data-Intensive Applications"', category: 'Learning', confidence: 0.95, createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString() },
    { _id: 'dm8', content: 'Interested in AI/ML and building intelligent products', category: 'Work', confidence: 0.92, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
];

const CATEGORY_CONFIG = {
    Work: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', glow: 'rgba(96,165,250,0.3)' },
    Personal: { color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20', glow: 'rgba(244,114,182,0.3)' },
    Ideas: { color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', glow: 'rgba(167,139,250,0.3)' },
    Learning: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20', glow: 'rgba(34,211,238,0.3)' },
    Health: { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', glow: 'rgba(52,211,153,0.3)' },
    Miscellaneous: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', glow: 'rgba(251,191,36,0.3)' },
};

function ConfidenceBar({ value }) {
    const pct = Math.round((value || 0) * 100);
    const color = pct >= 90 ? 'bg-emerald-400' : pct >= 70 ? 'bg-amber-400' : 'bg-red-400';
    return (
        <div className="flex items-center gap-1.5 mt-2">
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[9px] text-gray-500 font-mono w-7 text-right">{pct}%</span>
        </div>
    );
}

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days >= 1) return `${days}d ago`;
    if (hours >= 1) return `${hours}h ago`;
    return 'just now';
}

export default function MemoryPanel({ memories, onDeleteMemory, isVisible }) {
    const [search, setSearch] = useState('');
    const [collapsedCategories, setCollapsedCategories] = useState({});
    const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'confidence'

    // Merge real + dummy (real ones take priority) — must be before useMemo
    const allMemories = memories.length > 0 ? memories : DUMMY_MEMORIES;

    const filtered = useMemo(() => {
        let result = [...allMemories];
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(m => m.content.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
        }
        if (sortBy === 'confidence') {
            result.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
        } else {
            result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        return result;
    }, [allMemories, search, sortBy]);

    const grouped = useMemo(() => {
        return filtered.reduce((acc, mem) => {
            const cat = mem.category || 'Miscellaneous';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(mem);
            return acc;
        }, {});
    }, [filtered]);

    const toggleCategory = (cat) => setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));

    const totalCount = allMemories.length;
    const avgConfidence = totalCount > 0
        ? Math.round((allMemories.reduce((s, m) => s + (m.confidence || 0.8), 0) / totalCount) * 100)
        : 0;

    // Early return AFTER all hooks to avoid React rules-of-hooks violation
    if (!isVisible) return null;

    return (
        <aside className="w-80 bg-[#080D1A] border-l border-gray-800/60 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="p-5 border-b border-gray-800/60">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center">
                        <Brain className="text-amber" size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white font-heading leading-none">Memory Bank</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">Personal knowledge graph</p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                        { icon: <Brain size={11} />, label: 'Stored', value: totalCount, color: 'text-amber' },
                        { icon: <TrendingUp size={11} />, label: 'Avg Conf.', value: `${avgConfidence}%`, color: 'text-emerald-400' },
                        { icon: <Star size={11} />, label: 'Topics', value: Object.keys(grouped).length, color: 'text-violet-400' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-2 text-center">
                            <div className={`flex justify-center mb-0.5 ${stat.color}`}>{stat.icon}</div>
                            <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search memories..."
                        className="w-full bg-gray-900/50 border border-gray-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-gray-600 outline-none focus:border-amber/40 transition-colors"
                    />
                </div>

                {/* Sort Tabs */}
                <div className="flex gap-1 mt-2">
                    {[['recent', Clock, 'Recent'], ['confidence', Sparkles, 'Confidence']].map(([val, Icon, label]) => (
                        <button
                            key={val}
                            onClick={() => setSortBy(val)}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-[10px] font-semibold rounded-md transition-all ${sortBy === val
                                ? 'bg-amber/10 text-amber border border-amber/20'
                                : 'text-gray-600 hover:text-gray-400 border border-transparent'
                                }`}
                        >
                            <Icon size={10} />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Memory List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-600 mt-16 space-y-3">
                        <div className="w-14 h-14 bg-gray-900 rounded-2xl border border-gray-800 flex items-center justify-center mx-auto">
                            <Brain size={22} className="opacity-30" />
                        </div>
                        <p className="text-xs">{search ? 'No matches found.' : 'Start chatting in Memory Mode!'}</p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([category, mems]) => {
                        const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.Miscellaneous;
                        const isCollapsed = collapsedCategories[category];
                        return (
                            <div key={category} className="space-y-1.5">
                                {/* Category Header */}
                                <button
                                    onClick={() => toggleCategory(category)}
                                    className="w-full flex items-center gap-2 px-1 py-1 group"
                                >
                                    <div className={`flex items-center gap-1.5 flex-1 min-w-0`}>
                                        <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>{category}</span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} font-bold`}>{mems.length}</span>
                                    </div>
                                    <div className={`${cfg.color} opacity-50 group-hover:opacity-100 transition-opacity`}>
                                        {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {!isCollapsed && mems.map(memory => (
                                        <motion.div
                                            key={memory._id}
                                            initial={{ opacity: 0, height: 0, y: -4 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.18 }}
                                            className={`bg-gray-900/40 border ${cfg.border} rounded-xl p-3.5 group hover:bg-gray-900/70 transition-all cursor-default`}
                                        >
                                            <div className="flex justify-between items-start gap-2">
                                                <p className="text-xs text-gray-300 leading-relaxed flex-1">{memory.content}</p>
                                                <button
                                                    onClick={() => onDeleteMemory(memory._id)}
                                                    className="text-gray-700 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100 mt-0.5"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={11} />
                                                </button>
                                            </div>

                                            <ConfidenceBar value={memory.confidence} />

                                            <div className="flex items-center gap-1 mt-1.5">
                                                <Clock size={9} className="text-gray-700" />
                                                <span className="text-[9px] text-gray-700">{timeAgo(memory.createdAt)}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {memories.length === 0 && (
                <div className="p-3 border-t border-gray-800/60">
                    <div className="flex items-center gap-2 p-2.5 bg-amber/5 border border-amber/10 rounded-lg">
                        <Sparkles size={12} className="text-amber shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Sample data shown. Chat in <span className="text-amber font-semibold">Memory Mode</span> to save real facts about yourself.
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}

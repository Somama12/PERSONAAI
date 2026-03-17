import React from 'react';
import { Brain, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemoryPanel({ memories, onDeleteMemory, isVisible }) {
    if (!isVisible) return null;

    return (
        <aside className="w-80 bg-[#111827] border-l border-gray-800 flex flex-col h-full shrink-0 transition-transform duration-300">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2 text-white">
                    <Brain className="text-amber drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={20} />
                    <h2 className="text-lg font-bold font-heading">Memory Bank</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">Facts extracted from your conversations.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {memories.length === 0 ? (
                    <div className="text-center text-gray-500 mt-10 text-sm">
                        <Brain className="mx-auto mb-3 opacity-20" size={32} />
                        No memories stored yet.<br />Start chatting in Memory Mode!
                    </div>
                ) : (
                    <AnimatePresence>
                        {memories.map(memory => (
                            <motion.div
                                key={memory._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-[#0A0F1E] border border-gray-800 rounded-xl p-4 group hover:border-gray-700 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold text-amber bg-amber/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                        {memory.category}
                                    </span>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-white transition-colors" title="Edit">
                                            <Edit2 size={13} />
                                        </button>
                                        <button onClick={() => onDeleteMemory(memory._id)} className="text-gray-500 hover:text-red-400 transition-colors" title="Delete">
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {memory.content}
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </aside>
    );
}

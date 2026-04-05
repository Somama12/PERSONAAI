import React, { useState, useRef } from 'react';
import { BookOpen, Upload, Link as LinkIcon, FileText, Trash2, CheckCircle, Globe, Zap, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DUMMY_SOURCES = [
    { _id: 'ds1', type: 'pdf', filename: 'Product Roadmap Q2 2025.pdf', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { _id: 'ds2', type: 'url', url: 'https://docs.react.dev/learn', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
    { _id: 'ds3', type: 'pdf', filename: 'Research Paper - LLM Scaling.pdf', createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
];

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor(diff / 3600000);
    if (days >= 1) return `${days}d ago`;
    if (hours >= 1) return `${hours}h ago`;
    return 'just now';
}

export default function SourcePanel({
    sources,
    activeSource,
    setActiveSource,
    onUploadPdf,
    onAddUrl,
    onDeleteSource,
    isVisible,
    isUploading
}) {
    const [urlInput, setUrlInput] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    if (!isVisible) return null;

    const displaySources = sources.length > 0 ? sources : DUMMY_SOURCES;
    const isUsingDummy = sources.length === 0;

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (urlInput.trim()) {
            onAddUrl(urlInput.trim());
            setUrlInput('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            onUploadPdf(file);
        }
    };

    return (
        <aside className="w-80 bg-[#080D1A] border-l border-gray-800/60 flex flex-col h-full shrink-0">
            {/* Header */}
            <div className="p-5 border-b border-gray-800/60">
                <div className="flex items-center gap-2.5 mb-1">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <BookOpen className="text-emerald-400" size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-white font-heading leading-none">Knowledge Base</h2>
                        <p className="text-[10px] text-gray-500 mt-0.5">Grounded document chat</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                    {[
                        { label: 'Documents', value: displaySources.length, color: 'text-emerald-400' },
                        { label: 'Active', value: activeSource ? '1' : '—', color: 'text-cyan' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-gray-900/60 border border-gray-800/60 rounded-lg p-2 text-center">
                            <div className={`text-base font-bold ${stat.color}`}>{stat.value}</div>
                            <div className="text-[9px] text-gray-600 uppercase tracking-wider">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {/* Upload Zone */}
                <div>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Add Source</p>

                    {/* PDF Dropzone */}
                    <div
                        className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${isDragging
                                ? 'border-emerald-400/60 bg-emerald-500/10 scale-[1.01]'
                                : isUploading
                                    ? 'border-emerald-500/50 bg-emerald-500/8'
                                    : 'border-gray-700/60 hover:border-emerald-500/40 hover:bg-emerald-500/5 bg-gray-900/20'
                            }`}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    onUploadPdf(e.target.files[0]);
                                    e.target.value = null;
                                }
                            }}
                            disabled={isUploading}
                        />
                        <div className="p-5 text-center">
                            {isUploading ? (
                                <div className="flex flex-col items-center gap-2 text-emerald-400">
                                    <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-semibold">Processing PDF...</span>
                                    <span className="text-[10px] text-gray-500">Building embeddings</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isDragging ? 'bg-emerald-400/20 text-emerald-400' : 'bg-gray-800 text-gray-500 group-hover:bg-emerald-500/15 group-hover:text-emerald-400'}`}>
                                        <Upload size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 group-hover:text-emerald-400 transition-colors">
                                            {isDragging ? 'Drop to upload' : 'Drag & drop PDF'}
                                        </p>
                                        <p className="text-[10px] text-gray-600 mt-0.5">or click to browse · Max 10MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* URL Input */}
                    <form onSubmit={handleUrlSubmit} className="mt-2 flex gap-1.5">
                        <div className="relative flex-1">
                            <Globe size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                            <input
                                type="url"
                                value={urlInput}
                                onChange={e => setUrlInput(e.target.value)}
                                disabled={isUploading}
                                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-8 pr-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500/40 transition-colors placeholder-gray-700 disabled:opacity-50"
                                placeholder="Paste a URL to scrape..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!urlInput.trim() || isUploading}
                            className="px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Zap size={14} />
                        </button>
                    </form>
                </div>

                {/* Sources List */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Your Documents</p>
                        {activeSource && (
                            <button
                                onClick={() => setActiveSource(null)}
                                className="text-[10px] text-gray-600 hover:text-gray-400 flex items-center gap-1 transition-colors"
                            >
                                <X size={10} /> Clear
                            </button>
                        )}
                    </div>

                    <AnimatePresence>
                        {displaySources.length === 0 ? (
                            <div className="text-center text-gray-700 py-8 text-xs">
                                No documents yet. Upload a PDF or paste a URL above.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {displaySources.map(source => {
                                    const isActive = activeSource === source._id;
                                    const name = source.filename || source.url;
                                    const shortName = name?.length > 30 ? name.slice(0, 30) + '...' : name;

                                    return (
                                        <motion.div
                                            key={source._id}
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            onClick={() => !isUsingDummy && setActiveSource(isActive ? null : source._id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${isUsingDummy
                                                    ? 'border-gray-800/40 bg-gray-900/20 opacity-60 cursor-default'
                                                    : isActive
                                                        ? 'bg-emerald-500/8 border-emerald-500/30 cursor-pointer shadow-[0_0_16px_rgba(16,185,129,0.08)]'
                                                        : 'bg-gray-900/30 border-gray-800/60 hover:border-emerald-500/25 hover:bg-emerald-500/5 cursor-pointer'
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-emerald-500/15 border border-emerald-500/25' : 'bg-gray-800 border border-gray-700'
                                                }`}>
                                                {source.type === 'pdf'
                                                    ? <FileText size={14} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
                                                    : <Globe size={14} className={isActive ? 'text-emerald-400' : 'text-gray-500'} />
                                                }
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-semibold truncate ${isActive ? 'text-emerald-100' : 'text-gray-300'}`}>
                                                    {shortName}
                                                </p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className={`text-[9px] uppercase font-bold px-1 py-0.5 rounded ${source.type === 'pdf'
                                                            ? 'bg-red-500/10 text-red-400'
                                                            : 'bg-blue-500/10 text-blue-400'
                                                        }`}>{source.type}</span>
                                                    <span className="text-[9px] text-gray-700">{timeAgo(source.createdAt)}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 shrink-0">
                                                {isActive && <CheckCircle size={13} className="text-emerald-400" />}
                                                {!isUsingDummy && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onDeleteSource(source._id); }}
                                                        className="p-1 text-gray-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer tip */}
            {isUsingDummy && (
                <div className="p-3 border-t border-gray-800/60">
                    <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                        <BookOpen size={11} className="text-emerald-500 shrink-0" />
                        <p className="text-[10px] text-gray-500 leading-relaxed">
                            Sample documents shown. Upload a real PDF or URL to start chatting with your documents.
                        </p>
                    </div>
                </div>
            )}
        </aside>
    );
}

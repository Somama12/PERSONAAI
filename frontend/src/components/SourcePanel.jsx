import React, { useState } from 'react';
import { BookOpen, Upload, Link as LinkIcon, FileText, Trash2, CheckCircle } from 'lucide-react';

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
    const [urlInput, setUrlInput] = useState("");

    if (!isVisible) return null;

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        if (urlInput.trim()) {
            onAddUrl(urlInput.trim());
            setUrlInput("");
        }
    };

    return (
        <aside className="w-80 bg-[#111827] border-l border-gray-800 flex flex-col h-full shrink-0 transition-transform duration-300">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-2 text-white">
                    <BookOpen className="text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" size={20} />
                    <h2 className="text-lg font-bold font-heading">Knowledge Base</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">Chat strictly with grounded documents.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                {/* Upload Section */}
                <div className="space-y-4">
                    {/* PDF Dropzone */}
                    <div className="relative group">
                        <input
                            type="file"
                            accept=".pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    onUploadPdf(e.target.files[0]);
                                    e.target.value = null; // reset
                                }
                            }}
                            disabled={isUploading}
                        />
                        <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isUploading
                                ? 'border-emerald-500/50 bg-emerald-500/10'
                                : 'border-gray-700 bg-gray-800/30 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5'
                            }`}>
                            {isUploading ? (
                                <div className="flex flex-col items-center justify-center text-emerald-500">
                                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                    <span className="text-sm font-medium">Processing...</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-emerald-400 transition-colors">
                                    <Upload size={24} className="mb-2" />
                                    <span className="text-sm font-medium">Click or drag PDF</span>
                                    <span className="text-[10px] mt-1 opacity-70">Max 10MB</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* URL Input */}
                    <form onSubmit={handleUrlSubmit} className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LinkIcon size={14} className="text-gray-500" />
                        </div>
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isUploading}
                            className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-9 pr-2 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder-gray-500"
                            placeholder="Paste URL to read..."
                        />
                    </form>
                </div>

                {/* Sources List */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Your Sources</h3>

                    {sources.length === 0 ? (
                        <div className="text-center text-gray-600 mt-6 text-sm italic">
                            No documents uploaded.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sources.map(source => {
                                const isActive = activeSource === source._id;
                                return (
                                    <div
                                        key={source._id}
                                        onClick={() => setActiveSource(isActive ? null : source._id)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${isActive
                                                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-100'
                                                : 'bg-gray-800/20 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 text-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {source.type === 'pdf' ? (
                                                <FileText size={16} className={isActive ? 'text-emerald-400' : 'text-gray-500'} shrink-0 />
                                            ) : (
                                                <LinkIcon size={16} className={isActive ? 'text-emerald-400' : 'text-gray-500'} shrink-0 />
                                            )}
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-sm font-medium truncate">
                                                    {source.filename || source.url}
                                                </span>
                                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                    {source.type}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            {isActive && (
                                                <CheckCircle size={16} className="text-emerald-500" />
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDeleteSource(source._id);
                                                }}
                                                className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                                title="Delete Source"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}

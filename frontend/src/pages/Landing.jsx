import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, BookOpen, Shield, MessageSquare, Zap, Terminal, Code, Cpu } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    const features = [
        { icon: <Brain size={24} />, title: 'Long-term Memory', desc: 'Recalls user facts naturally across sessions without prompting.' },
        { icon: <Search size={24} />, title: 'Search & Summarize', desc: 'Find any past thought and summarize topics instantly.' },
        { icon: <Terminal size={24} />, title: 'Source Grounding', desc: 'Securely chat with your PDFs or technical documentation.' },
        { icon: <Zap size={24} />, title: 'Lightning Fast', desc: 'Optimized inference and immediate UI updates.' },
        { icon: <Shield size={24} />, title: 'Privacy Explicit', desc: 'Nothing is permanently saved without your explicit click.' },
        { icon: <Cpu size={24} />, title: 'Conflict Detection', desc: 'The engine actively resolves contradictory statements.' }
    ];

    return (
        <div className="min-h-screen bg-navy text-white font-sans bg-grain overflow-x-hidden selection:bg-cyan/30">
            {/* Ambient Base Glow (Mirai style) */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F0FF] opacity-[0.03] blur-[150px] rounded-full mix-blend-screen"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00F0FF] opacity-[0.03] blur-[150px] rounded-full mix-blend-screen"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full glass-panel z-50 flex justify-between items-center px-6 md:px-12 py-4 border-b border-white/5">
                <div className="text-xl font-bold font-heading tracking-tight text-white flex items-center gap-2">
                    <Brain className="text-cyan h-5 w-5" /> Persona<span className="text-cyan">AI</span>
                </div>
                <div className="flex gap-4 items-center">
                    <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Log in</button>
                    <button onClick={() => navigate('/signup')} className="px-5 py-2 text-sm font-bold bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">Start Building</button>
                </div>
            </nav>

            <main className="relative z-10 pt-32 md:pt-48 pb-20 px-6 mx-auto max-w-7xl">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-32"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/30 bg-cyan/10 text-cyan text-xs font-semibold mb-8 uppercase tracking-widest hover:bg-cyan/20 transition-colors cursor-pointer">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan"></span>
                        </span>
                        Persona Engine v2.0 Live
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-[6rem] font-bold font-heading tracking-tighter mb-6 leading-[1.05] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 max-w-5xl mx-auto">
                        Your memory. Recalled instantly.
                    </h1>
                    <p className="text-lg md:text-xl text-gray-400 mb-12 font-medium max-w-2xl mx-auto tracking-wide">
                        A premium personal intelligence layer that evolves with you. Stop repeating yourself to AI.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
                        <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-gray-200 transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            Start for Free
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-gray-700 text-white font-bold text-lg rounded-xl hover:bg-gray-900 transition-colors">
                            Read the Docs
                        </button>
                    </div>

                    {/* Hero Image / Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="relative max-w-5xl mx-auto rounded-xl md:rounded-3xl border border-gray-800 bg-[#050505] p-2 shadow-[0_0_80px_rgba(0,240,255,0.15)] overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none"></div>
                        <img
                            src="/hero-mockup.png"
                            alt="PersonaAI App Interface"
                            className="w-full h-auto rounded-lg md:rounded-2xl border border-gray-900"
                        />
                        {/* Subtle glow behind image */}
                        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-cyan/20 blur-[120px] rounded-full pointer-events-none"></div>
                    </motion.div>
                </motion.div>

                {/* macOS / Terminal Showcase */}
                <div className="my-40">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">Purpose-built contexts.</h2>
                        <p className="text-gray-400 border border-gray-800 rounded-full px-4 py-1 inline-block text-sm">macOS native feel, built for the web.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Terminal Window 1: Memory */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            {/* Window Header */}
                            <div className="flex items-center px-4 py-3 border-b border-gray-800 bg-[#111111]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mx-auto text-xs text-gray-500 font-mono flex items-center gap-2">
                                    <Brain size={12} className="text-cyan" /> memory-daemon.sh
                                </div>
                            </div>
                            {/* Window Content */}
                            <div className="p-6 font-mono text-sm">
                                <p className="text-gray-500 mb-4"># Extracting core identifiers from stream...</p>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <span className="text-gray-600">❯</span>
                                        <p className="text-gray-300">"I'm considering switching my stack to Next.js for better SEO."</p>
                                    </div>
                                    <div className="pl-6 border-l border-gray-800 space-y-2">
                                        <div className="flex items-center gap-2 text-cyan">
                                            <Zap size={14} /> <span>[EXTRACTED] Fact detected</span>
                                        </div>
                                        <div className="bg-[#111] border border-gray-800 p-3 rounded-lg text-xs">
                                            <span className="text-emerald-400">category:</span> "Engineering"<br />
                                            <span className="text-emerald-400">content:</span> "Considering switching to Next.js for SEO"<br />
                                            <span className="text-emerald-400">confidence:</span> <span className="text-amber">0.92</span>
                                        </div>
                                        <button className="mt-2 text-xs bg-cyan/10 text-cyan border border-cyan/30 px-3 py-1 rounded hover:bg-cyan/20 transition-colors">Confirm Extraction</button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Terminal Window 2: Source */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="bg-[#0A0A0A] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-bl from-amber/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            {/* Window Header */}
                            <div className="flex items-center px-4 py-3 border-b border-gray-800 bg-[#111111]">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                </div>
                                <div className="mx-auto text-xs text-gray-500 font-mono flex items-center gap-2">
                                    <Code size={12} className="text-amber" /> rag-pipeline.ts
                                </div>
                            </div>
                            {/* Window Content */}
                            <div className="p-6 font-mono text-sm flex flex-col h-full">
                                <p className="text-gray-500 mb-6"># Grounding response in local document chunks...</p>

                                <div className="flex-grow flex items-center justify-center">
                                    <div className="border border-dashed border-gray-700 rounded-xl p-8 text-center bg-[#111] hover:bg-[#151515] transition-colors cursor-pointer w-full">
                                        <BookOpen className="text-gray-500 mx-auto mb-3" size={32} />
                                        <p className="text-gray-400">Drop `architecture.pdf` here to index.</p>
                                        <p className="text-xs text-gray-600 mt-2">Local vectorization via API.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Grid Divider */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-800 to-transparent my-32"></div>

                {/* Features Grid */}
                <div className="mb-32 relative">
                    <div className="absolute inset-0 bg-[url('https://trymirai.com/grid.svg')] opacity-20 bg-center [mask-image:radial-gradient(ellipse_at_center,black,transparent)] pointer-events-none"></div>

                    <h2 className="text-4xl md:text-5xl font-heading font-bold mb-16 text-center tracking-tight">Engineered for intellect.</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="bg-[#0A0A0A] border border-gray-800 p-8 rounded-2xl hover:border-gray-600 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    {f.icon}
                                </div>
                                <div className="text-white mb-6 bg-[#111] w-12 h-12 flex items-center justify-center rounded-xl border border-gray-800 group-hover:border-cyan/50 transition-colors">
                                    {React.cloneElement(f.icon, { className: "text-gray-300 group-hover:text-cyan transition-colors" })}
                                </div>
                                <h4 className="text-xl font-bold mb-3 tracking-tight text-gray-100">{f.title}</h4>
                                <p className="text-gray-400 leading-relaxed text-sm">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Immersive CTA Footer */}
            <div className="relative border-t border-gray-900 mt-20 pt-32 pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#000000] to-[rgba(0,240,255,0.05)] z-0"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[300px] bg-cyan/20 blur-[120px] rounded-t-full pointer-events-none"></div>

                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8 tracking-tighter text-white drop-shadow-2xl">
                        Talk to us.<br />
                        <span className="text-gray-500">Or talk to PersonaAI.</span>
                    </h2>
                    <button onClick={() => navigate('/signup')} className="px-10 py-5 bg-white text-black font-bold text-xl rounded-2xl hover:bg-gray-200 transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.15)] mb-24">
                        Initialize Your Brain
                    </button>

                    <footer className="flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm border-t border-gray-800/50 pt-8 mt-12 w-full mx-auto">
                        <div className="flex items-center gap-2 mb-4 md:mb-0">
                            <Brain size={16} />
                            <span>&copy; {new Date().getFullYear()} PersonaAI. All rights reserved.</span>
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white transition-colors">Twitter</a>
                            <a href="#" className="hover:text-white transition-colors">GitHub</a>
                            <a href="#" className="hover:text-white transition-colors">Discord</a>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}

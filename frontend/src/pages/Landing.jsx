import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, BookOpen, MessageSquare, Zap, Shield, ChevronRight, ArrowRight } from 'lucide-react';

const TABS = [
    {
        id: 'memory',
        icon: <Brain size={18} />,
        label: 'Memory Mode',
        color: 'amber',
        headline: 'AI that actually remembers you.',
        desc: 'Tell PersonaAI where you work, what you\'re learning, your goals — once. It extracts and stores facts about you automatically, then recalls them in every future session without you ever repeating yourself.',
        highlight: 'text-amber',
        border: 'border-amber/20',
        bg: 'bg-amber/5',
        activeBg: 'bg-amber/10 border-amber/30',
        terminal: [
            { prompt: true, text: 'I\'m a software engineer learning Rust on weekends.' },
            { type: 'extracted', label: 'Memory Detected', category: 'Work', fact: 'Works as a software engineer', confidence: 0.97, color: 'text-amber' },
            { type: 'extracted', label: 'Memory Detected', category: 'Learning', fact: 'Learning Rust on weekends', confidence: 0.91, color: 'text-amber' },
        ],
    },
    {
        id: 'source',
        icon: <BookOpen size={18} />,
        label: 'Source Mode',
        color: 'emerald',
        headline: 'Chat with your documents.',
        desc: 'Upload a PDF or paste a URL. PersonaAI reads it, indexes it, and answers questions strictly grounded in your content — no hallucinations, no guessing. Perfect for research, contracts, or technical docs.',
        highlight: 'text-emerald-400',
        border: 'border-emerald-500/20',
        bg: 'bg-emerald-500/5',
        activeBg: 'bg-emerald-500/10 border-emerald-500/30',
        terminal: [
            { prompt: true, text: '📄 architecture.pdf uploaded — 42 pages indexed.' },
            { type: 'query', text: 'What are the main bottlenecks described in section 3?' },
            { type: 'response', color: 'text-emerald-400', text: 'Based on section 3 of your document: the primary bottleneck is the synchronous I/O layer in the request pipeline...' },
        ],
    },
    {
        id: 'general',
        icon: <MessageSquare size={18} />,
        label: 'General Chat',
        color: 'cyan',
        headline: 'A brilliant AI, no strings attached.',
        desc: 'When you just need to think out loud, brainstorm, debug, or get a second opinion — General Chat is there. No memory saved, no document required. Just a clean conversation.',
        highlight: 'text-cyan',
        border: 'border-cyan/20',
        bg: 'bg-cyan/5',
        activeBg: 'bg-cyan/10 border-cyan/30',
        terminal: [
            { prompt: true, text: 'Help me brainstorm names for my new dev tool.' },
            { type: 'response', color: 'text-cyan', text: 'Sure! Here are some directions:\n• Devora — elegant, tool-like\n• Nexlit — next + lite\n• Stackr — stackable tools\n• Koda — short, techy' },
        ],
    },
];

const STATS = [
    { value: '3', label: 'AI Modes', sub: 'Memory · Source · General' },
    { value: '∞', label: 'Memory Capacity', sub: 'Scalable per user' },
    { value: '<1s', label: 'Response Time', sub: 'Streaming inference' },
    { value: '100%', label: 'Privacy First', sub: 'Explicit confirm to save' },
];

const DEMO_SEQUENCES = [
    {
        userMsg: "I'm a software engineer who loves hiking and is learning Spanish.",
        aiMsg: "Got it! I'll remember a few things about you from that.",
        cards: [
            { cat: 'Work', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', fact: 'Works as a software engineer', conf: 97 },
            { cat: 'Health', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', fact: 'Enjoys hiking outdoors', conf: 90 },
            { cat: 'Learning', color: 'text-cyan bg-cyan/10 border-cyan/20', fact: 'Learning Spanish', conf: 88 },
        ],
    },
    {
        userMsg: "My goal this year is to read 12 books and ship a side project.",
        aiMsg: "Great goals! I've noted both. I'll keep track of your progress.",
        cards: [
            { cat: 'Ideas', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20', fact: 'Building a side project in 2025', conf: 93 },
            { cat: 'Personal', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', fact: 'Goal: read 12 books this year', conf: 91 },
        ],
    },
    {
        userMsg: "I prefer TypeScript over JavaScript and dark mode for everything.",
        aiMsg: "Noted your preferences — I'll keep these in mind going forward.",
        cards: [
            { cat: 'Work', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', fact: 'Prefers TypeScript over JavaScript', conf: 95 },
            { cat: 'Personal', color: 'text-pink-400 bg-pink-400/10 border-pink-400/20', fact: 'Prefers dark mode interfaces', conf: 89 },
        ],
    },
];

function useTypingEffect(text, speed = 28, startDelay = 0) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let timeout = setTimeout(() => {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayed(text.slice(0, i + 1));
                i++;
                if (i >= text.length) { clearInterval(interval); setDone(true); }
            }, speed);
            return () => clearInterval(interval);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);
    return { displayed, done };
}

function LiveDemoMockup() {
    const [seq, setSeq] = useState(0);
    const [phase, setPhase] = useState('typing'); // typing | ai | cards | done
    const [visibleCards, setVisibleCards] = useState(0);

    const demo = DEMO_SEQUENCES[seq];
    const { displayed: typedMsg, done: msgDone } = useTypingEffect(demo.userMsg, 22, 400);
    const { displayed: typedAI, done: aiDone } = useTypingEffect(
        phase !== 'typing' ? demo.aiMsg : '',
        18, 0
    );

    // Advance phases
    useEffect(() => { if (msgDone && phase === 'typing') setPhase('ai'); }, [msgDone, phase]);
    useEffect(() => { if (aiDone && phase === 'ai') setPhase('cards'); }, [aiDone, phase]);
    useEffect(() => {
        if (phase !== 'cards') return;
        setVisibleCards(0);
        const timers = demo.cards.map((_, i) =>
            setTimeout(() => setVisibleCards(v => v + 1), i * 600 + 200)
        );
        const reset = setTimeout(() => {
            setPhase('typing');
            setSeq(s => (s + 1) % DEMO_SEQUENCES.length);
            setVisibleCards(0);
        }, demo.cards.length * 600 + 2800);
        return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
    }, [phase]);

    return (
        <div className="relative rounded-2xl border border-gray-700/60 bg-[#050A15] shadow-2xl shadow-black/60 overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center px-4 py-3 border-b border-gray-800/60 bg-[#080D1A]">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/70" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                    <div className="w-3 h-3 rounded-full bg-green-500/70" />
                </div>
                <div className="mx-auto text-xs text-gray-600 font-mono flex items-center gap-1.5">
                    <Brain size={10} className="text-amber" /> PersonaAI — Memory Mode
                </div>
                <div className="w-2 h-2 rounded-full bg-amber/60 animate-pulse" />
            </div>

            {/* Chat area */}
            <div className="p-5 min-h-[200px] space-y-3">
                {/* User bubble */}
                <div className="flex justify-end">
                    <div className="max-w-[80%] px-4 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-2xl rounded-tr-sm text-xs text-gray-200 leading-relaxed">
                        {typedMsg}
                        {phase === 'typing' && <span className="inline-block w-0.5 h-3 bg-cyan ml-0.5 animate-pulse" />}
                    </div>
                </div>

                {/* AI bubble */}
                <AnimatePresence>
                    {phase !== 'typing' && (
                        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 items-start">
                            <div className="w-6 h-6 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Brain size={11} className="text-amber" />
                            </div>
                            <div className="max-w-[80%] px-4 py-2.5 text-xs text-gray-300 leading-relaxed">
                                {typedAI}
                                {phase === 'ai' && <span className="inline-block w-0.5 h-3 bg-amber ml-0.5 animate-pulse" />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Extracted memory cards */}
            <div className="px-5 pb-5 space-y-2">
                <AnimatePresence>
                    {phase === 'cards' && demo.cards.slice(0, visibleCards).map((m, i) => (
                        <motion.div
                            key={`${seq}-${i}`}
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className={`flex items-start gap-3 p-3 rounded-xl border bg-gray-900/50`}
                        >
                            <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-1 rounded-md border shrink-0 mt-0.5 ${m.color}`}>{m.cat}</span>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-200">{m.fact}</p>
                                <div className="mt-1.5 h-0.5 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full bg-emerald-400"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${m.conf}%` }}
                                        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                                    />
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-600 font-mono shrink-0">{m.conf}%</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input bar */}
            <div className="px-5 pb-5">
                <div className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-xl px-4 py-3">
                    <span className="text-xs text-gray-700 flex-1">Message in Memory Mode...</span>
                    <div className="w-6 h-6 rounded-lg bg-amber/10 border border-amber/20 flex items-center justify-center">
                        <Zap size={11} className="text-amber" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function LiveTabDemo({ tab }) {
    const [cycleKey, setCycleKey] = useState(0);
    const [typedPrompt, setTypedPrompt] = useState('');
    const [promptDone, setPromptDone] = useState(false);
    const [visibleLines, setVisibleLines] = useState(0);

    const promptLine = tab.terminal.find(l => l.prompt);
    const restLines = tab.terminal.filter(l => !l.prompt);

    // Type the prompt
    useEffect(() => {
        setTypedPrompt('');
        setPromptDone(false);
        setVisibleLines(0);
        if (!promptLine) { setPromptDone(true); return; }
        let i = 0;
        const delay = setTimeout(() => {
            const iv = setInterval(() => {
                setTypedPrompt(promptLine.text.slice(0, i + 1));
                i++;
                if (i >= promptLine.text.length) { clearInterval(iv); setPromptDone(true); }
            }, 20);
            return () => clearInterval(iv);
        }, 300);
        return () => clearTimeout(delay);
    }, [tab.id, cycleKey]);

    // Reveal rest lines after prompt finishes, then auto-loop
    useEffect(() => {
        if (!promptDone) return;
        setVisibleLines(0);
        const timers = restLines.map((_, i) =>
            setTimeout(() => setVisibleLines(v => v + 1), i * 500 + 200)
        );
        // After all lines shown, wait 2.5s then restart cycle
        const loopDelay = restLines.length * 500 + 200 + 2500;
        const reset = setTimeout(() => {
            setCycleKey(k => k + 1);
        }, loopDelay);
        return () => { timers.forEach(clearTimeout); clearTimeout(reset); };
    }, [promptDone, cycleKey]);

    return (
        <div className={`rounded-2xl border ${tab.border} ${tab.bg} overflow-hidden shadow-2xl`}>
            {/* Window chrome */}
            <div className="flex items-center px-4 py-3 border-b border-gray-800/60 bg-black/30">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
                <div className={`mx-auto text-[11px] font-mono ${tab.highlight} opacity-70 flex items-center gap-1.5`}>
                    {tab.icon} persona-{tab.id}.sh
                </div>
                <div className={`w-1.5 h-1.5 rounded-full ${tab.highlight.replace('text-', 'bg-')} animate-pulse opacity-70`} />
            </div>

            <div className="p-6 font-mono text-sm space-y-4 min-h-[220px]">
                {/* Prompt line with typewriter */}
                {promptLine && (
                    <div className="flex gap-3 items-start">
                        <span className="text-gray-600 mt-0.5">❯</span>
                        <p className="text-gray-200">
                            {typedPrompt}
                            {!promptDone && (
                                <span className={`inline-block w-0.5 h-3.5 ml-0.5 align-middle animate-pulse ${tab.highlight.replace('text-', 'bg-')} opacity-80`} />
                            )}
                        </p>
                    </div>
                )}

                {/* Rest of lines, revealed one by one */}
                <AnimatePresence>
                    {restLines.slice(0, visibleLines).map((line, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                        >
                            {line.type === 'extracted' && (
                                <div className="ml-6 border-l border-gray-800/60 pl-4 space-y-2">
                                    <div className={`flex items-center gap-2 text-xs ${line.color} font-bold`}>
                                        <Zap size={11} /> {line.label}
                                        <span className="text-gray-600 font-normal">→ {line.category}</span>
                                    </div>
                                    <div className={`text-xs bg-black/30 border ${tab.border} rounded-lg p-2.5 space-y-1`}>
                                        <div><span className="text-gray-500">fact: </span><span className="text-gray-200">"{line.fact}"</span></div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">confidence: </span>
                                            <span className={line.color}>{line.confidence}</span>
                                            <div className="flex-1 h-0.5 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    className={`h-full rounded-full ${line.color.replace('text-', 'bg-')}`}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.round(line.confidence * 100)}%` }}
                                                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {line.type === 'query' && (
                                <div className="flex gap-3 items-start">
                                    <span className="text-gray-600 mt-0.5">❯</span>
                                    <p className="text-gray-300">{line.text}</p>
                                </div>
                            )}
                            {line.type === 'response' && (
                                <div className={`ml-6 text-xs ${line.color} leading-relaxed whitespace-pre-line bg-black/20 rounded-lg p-3 border ${tab.border}`}>
                                    {line.text}
                                    <span className={`inline-block w-0.5 h-3 ml-0.5 align-middle animate-pulse ${tab.highlight.replace('text-', 'bg-')} opacity-60`} />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function Landing() {

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('memory');
    const tab = TABS.find(t => t.id === activeTab);

    return (
        <div className="min-h-screen bg-[#080D1A] text-white font-sans overflow-x-hidden selection:bg-cyan/20">

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-20%] right-[-5%] w-[55%] h-[55%] bg-cyan/8 blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] bg-amber/5 blur-[150px] rounded-full" />
            </div>

            {/* ── Floating Pill Navbar ── */}
            <div className="fixed top-5 inset-x-0 z-50 flex justify-center px-6">
                <nav className="w-full max-w-5xl flex items-center justify-between px-5 py-3 rounded-2xl bg-[#080D1A]/80 backdrop-blur-xl border border-gray-800/60 shadow-xl shadow-black/40">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                            <Zap size={13} className="text-cyan" />
                        </div>
                        <span className="text-base font-bold font-heading tracking-tight">
                            Persona<span className="text-cyan">AI</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
                        {['Features', 'Modes', 'Privacy'].map(l => (
                            <a key={l} href="#" className="hover:text-white transition-colors">{l}</a>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/login')} className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">Log in</button>
                        <button onClick={() => navigate('/signup')} className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-100 transition-all hover:gap-2.5">
                            Get started <ArrowRight size={14} />
                        </button>
                    </div>
                </nav>
            </div>

            <main className="relative z-10">
                {/* ── HERO: Split layout ── */}
                <section className="min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12 max-w-[1400px] mx-auto">
                    <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

                        {/* Left — Bold type-first */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/25 bg-cyan/8 text-cyan text-xs font-semibold mb-8 tracking-widest uppercase">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan" />
                                </span>
                                Persona Engine v2.0 — Live
                            </div>

                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold font-heading tracking-tighter leading-[0.95] mb-8">
                                <span className="text-white">The AI</span><br />
                                <span className="text-white">that</span>{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan to-blue-400">remembers</span><br />
                                <span className="text-white">you.</span>
                            </h1>

                            <p className="text-lg text-gray-400 leading-relaxed mb-10 max-w-md">
                                A personal intelligence layer that learns who you are — your work, habits, goals — and carries that context into every conversation. Stop explaining yourself to AI.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="flex items-center justify-center gap-2 px-7 py-4 bg-white text-black font-bold text-base rounded-xl hover:bg-gray-100 transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.15)] group"
                                >
                                    Start for free <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-7 py-4 bg-transparent border border-gray-700 text-white font-semibold text-base rounded-xl hover:bg-gray-800/50 transition-colors"
                                >
                                    Sign in
                                </button>
                            </div>
                        </motion.div>

                        {/* Right — Animated Live Demo */}
                        <motion.div
                            initial={{ opacity: 0, x: 30, y: 10 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-cyan/10 blur-[80px] rounded-full scale-75 pointer-events-none" />
                            <LiveDemoMockup />
                        </motion.div>
                    </div>
                </section>

                {/* ── STATS STRIP ── */}
                <section className="border-y border-gray-800/60 bg-[#05090F]">
                    <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                className="text-center"
                            >
                                <div className="text-4xl font-extrabold font-heading text-white mb-1">{s.value}</div>
                                <div className="text-sm font-semibold text-gray-300">{s.label}</div>
                                <div className="text-xs text-gray-600 mt-0.5">{s.sub}</div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* ── TABBED FEATURE SECTION ── */}
                <section className="py-32 px-6 md:px-12 max-w-[1300px] mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Three Modes. One Brain.</p>
                        <h2 className="text-5xl md:text-6xl font-extrabold font-heading tracking-tighter text-white">
                            Purpose-built<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-600">for every context.</span>
                        </h2>
                    </motion.div>

                    {/* Tab Buttons */}
                    <div className="flex justify-center gap-2 mb-12 flex-wrap">
                        {TABS.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all ${activeTab === t.id
                                    ? t.activeBg + ' text-white'
                                    : 'border-gray-800/60 text-gray-500 hover:text-gray-300 hover:border-gray-700'
                                    }`}
                            >
                                <span className={activeTab === t.id ? t.highlight : ''}>{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="grid lg:grid-cols-2 gap-12 items-center"
                        >
                            {/* Left: description */}
                            <div>
                                <div className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${tab.highlight} mb-6`}>
                                    {tab.icon} {tab.label}
                                </div>
                                <h3 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tighter text-white mb-6 leading-tight">
                                    {tab.headline}
                                </h3>
                                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                    {tab.desc}
                                </p>
                                <button
                                    onClick={() => navigate('/signup')}
                                    className={`flex items-center gap-2 text-sm font-bold ${tab.highlight} group hover:gap-3 transition-all`}
                                >
                                    Try it now <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>

                            {/* Right: animated terminal */}
                            <LiveTabDemo tab={tab} key={activeTab + '-demo'} />
                        </motion.div>
                    </AnimatePresence>
                </section>

                {/* ── ACCENT DIVIDER SECTION (light strip à la Dayos) ── */}
                <section className="bg-white/[0.03] border-y border-gray-800/50 py-20 px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Why PersonaAI</p>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tighter text-white mb-12">
                            AI. Gap. Closed.
                        </h2>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { label: 'AI.', color: 'text-cyan', desc: 'The technology no one can afford to ignore — but most AI tools forget you exist the second the tab closes.' },
                                { label: 'GAP.', color: 'text-amber', desc: 'The gap between powerful AI and personal context. Every session starts from zero. That\'s broken.' },
                                { label: 'CLOSED.', color: 'text-emerald-400', desc: 'PersonaAI bridges it. One AI that knows your story, your work, your goals — always.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 16 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-7 text-left"
                                >
                                    <p className={`text-3xl font-extrabold font-heading tracking-tighter mb-4 ${item.color}`}>{item.label}</p>
                                    <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURES GRID ── */}
                <section className="py-20 px-6 md:px-12 max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-3">Under the hood</p>
                        <h2 className="text-4xl md:text-5xl font-extrabold font-heading tracking-tighter text-white leading-tight">
                            Built different.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-500 to-gray-700">From the ground up.</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            {
                                icon: <Brain size={22} />,
                                iconColor: 'text-amber',
                                borderHover: 'hover:border-amber/30',
                                glowColor: 'rgba(245,158,11,0.08)',
                                title: 'Long-term Memory',
                                desc: 'Facts persist across sessions. PersonaAI knows you by the second conversation.',
                                badge: '↑ 97% avg confidence',
                                badgeColor: 'text-amber/70 border-amber/20 bg-amber/5',
                            },
                            {
                                icon: <BookOpen size={22} />,
                                iconColor: 'text-emerald-400',
                                borderHover: 'hover:border-emerald-400/30',
                                glowColor: 'rgba(52,211,153,0.08)',
                                title: 'Document Grounding',
                                desc: 'Upload a PDF or URL. Answers come strictly from your content — zero hallucination.',
                                badge: 'PDF · URL supported',
                                badgeColor: 'text-emerald-400/70 border-emerald-400/20 bg-emerald-400/5',
                            },
                            {
                                icon: <Zap size={22} />,
                                iconColor: 'text-cyan',
                                borderHover: 'hover:border-cyan/30',
                                glowColor: 'rgba(6,182,212,0.08)',
                                title: 'Streaming Speed',
                                desc: 'Responses stream instantly. No waiting, no spinners — just answers.',
                                badge: '< 1s first token',
                                badgeColor: 'text-cyan/70 border-cyan/20 bg-cyan/5',
                            },
                            {
                                icon: <Shield size={22} />,
                                iconColor: 'text-violet-400',
                                borderHover: 'hover:border-violet-400/30',
                                glowColor: 'rgba(167,139,250,0.08)',
                                title: 'Explicit Privacy',
                                desc: 'Nothing is saved without your confirmation. Every fact needs your approval.',
                                badge: 'You control the save',
                                badgeColor: 'text-violet-400/70 border-violet-400/20 bg-violet-400/5',
                            },
                            {
                                icon: <MessageSquare size={22} />,
                                iconColor: 'text-pink-400',
                                borderHover: 'hover:border-pink-400/30',
                                glowColor: 'rgba(244,114,182,0.08)',
                                title: 'Auto Categories',
                                desc: 'Memories are sorted automatically — Work, Health, Ideas, Learning & more.',
                                badge: '6 smart categories',
                                badgeColor: 'text-pink-400/70 border-pink-400/20 bg-pink-400/5',
                            },
                            {
                                icon: <ChevronRight size={22} />,
                                iconColor: 'text-blue-400',
                                borderHover: 'hover:border-blue-400/30',
                                glowColor: 'rgba(96,165,250,0.08)',
                                title: 'Conflict Resolution',
                                desc: 'Contradictions are flagged and resolved automatically for a coherent memory.',
                                badge: 'AI-powered logic',
                                badgeColor: 'text-blue-400/70 border-blue-400/20 bg-blue-400/5',
                            },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                                className={`group relative bg-gray-900/40 border border-gray-800/60 ${f.borderHover} rounded-2xl p-6 flex flex-col gap-4 overflow-hidden cursor-default transition-colors duration-300`}
                                style={{ '--glow': f.glowColor }}
                            >
                                {/* Hover glow spot */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                                    style={{ background: `radial-gradient(circle at 50% 0%, ${f.glowColor} 0%, transparent 70%)` }} />

                                {/* Icon */}
                                <motion.div
                                    className={`${f.iconColor} w-fit`}
                                    whileHover={{ scale: 1.15, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                >
                                    {f.icon}
                                </motion.div>

                                {/* Content */}
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white mb-1.5 tracking-tight">{f.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                                </div>

                                {/* Badge */}
                                <span className={`self-start text-[10px] font-semibold px-2 py-1 rounded-lg border ${f.badgeColor}`}>
                                    {f.badge}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </section>


                {/* ── CTA ── */}
                <div className="relative overflow-hidden">
                    {/* Grid overlay */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,transparent 1px,transparent 60px,#fff 60px),repeating-linear-gradient(90deg,#fff 0px,transparent 1px,transparent 60px,#fff 60px)' }} />
                    {/* Glow */}
                    <div className="absolute inset-x-0 bottom-0 h-[400px] bg-gradient-to-t from-cyan/10 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-cyan/8 blur-[120px] rounded-full pointer-events-none" />

                    <div className="relative z-10 border-t border-gray-800/60 text-center px-6 pt-28 pb-16 max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan/20 bg-cyan/5 text-cyan text-[10px] font-bold tracking-widest uppercase mb-8">
                                <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-pulse" /> Free to start
                            </div>
                            <h2 className="text-6xl md:text-8xl font-extrabold font-heading tracking-tighter text-white leading-[0.92] mb-8">
                                Your AI.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-br from-cyan via-blue-400 to-violet-400">Your memory.</span>
                            </h2>
                            <p className="text-gray-500 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                                Stop repeating yourself. Start a conversation that lasts forever.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-20">
                                <button
                                    onClick={() => navigate('/signup')}
                                    className="relative inline-flex items-center gap-2 px-10 py-5 font-bold text-lg rounded-2xl overflow-hidden group"
                                    style={{ background: 'linear-gradient(135deg,#06b6d4,#818cf8)' }}
                                >
                                    <span className="relative z-10 text-white flex items-center gap-2">
                                        Get started free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <button onClick={() => navigate('/login')} className="px-10 py-5 border border-gray-700 hover:border-gray-500 text-white font-semibold text-lg rounded-2xl transition-colors hover:bg-gray-800/40">
                                    Sign in
                                </button>
                            </div>
                        </motion.div>

                        <footer className="flex flex-col md:flex-row justify-between items-center text-gray-700 text-xs border-t border-gray-800/50 pt-8">
                            <div className="flex items-center gap-2 mb-4 md:mb-0">
                                <Zap size={12} className="text-cyan" />
                                <span>© {new Date().getFullYear()} PersonaAI. All rights reserved.</span>
                            </div>
                            <div className="flex gap-5">
                                {['Twitter', 'GitHub', 'Discord'].map(l => (
                                    <a key={l} href="#" className="hover:text-gray-400 transition-colors">{l}</a>
                                ))}
                            </div>
                        </footer>
                    </div>
                </div>
            </main>
        </div>
    );
}

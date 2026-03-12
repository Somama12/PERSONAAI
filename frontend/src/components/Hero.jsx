import React from 'react';
import { Link } from 'react-router-dom';
import dashboardPreview from '../assets/dashboard_preview.png';

const Hero = () => {
    return (
        <div className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-48 lg:pb-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-indigo-50/50 via-white to-white pointer-events-none" />

            {/* Background decoration */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            <div className="absolute top-12 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-24 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm mb-8 border border-indigo-100 shadow-sm transition-transform hover:scale-105 cursor-default">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    v2.0 Beta is now live
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 drop-shadow-sm">
                    Your Second Brain,<br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500">
                        Powered by AI
                    </span>
                </h1>

                <p className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed mb-10">
                    A personal AI memory assistant chatbot that remembers, organizes, and retrieves conversations like you never forgot them.
                </p>

                <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-xl shadow-gray-900/20 hover:shadow-gray-900/30 transform hover:-translate-y-0.5 text-center inline-block">
                        Sign Up for Free
                    </Link>
                    <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 hover:text-gray-900 rounded-2xl font-semibold text-lg transition-all duration-200 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 text-center inline-block">
                        Login to Account
                    </Link>
                </div>

                {/* Dashboard Preview Image */}
                <div className="mt-20 relative max-w-5xl mx-auto animate-fade-in-up animation-delay-500">
                    <div className="rounded-2xl p-2 shadow-2xl shadow-indigo-100/50 border border-gray-100 ring-1 ring-gray-900/5 bg-white/50 backdrop-blur-sm">
                        <img
                            src={dashboardPreview}
                            alt="PersonaAI Dashboard Preview"
                            className="rounded-xl overflow-hidden border border-gray-100 w-full h-auto object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

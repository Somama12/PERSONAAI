import React, { useState } from 'react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center transform rotate-3">
                            <span className="text-white font-bold text-xl leading-none -rotate-3">P</span>
                        </div>
                        <span className="text-2xl font-extrabold tracking-tight text-gray-900">
                            Persona<span className="text-indigo-600">AI</span>
                        </span>
                    </div>

                    <div className="hidden md:flex space-x-10 items-center">
                        <a href="#features" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#about" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">About</a>
                        <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">Contact</a>
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-500 hover:text-gray-900 focus:outline-none p-2"
                            aria-label="Toggle menu"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden absolute w-full bg-white border-b border-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="px-4 py-6 space-y-4 sm:px-6 bg-white shadow-xl rounded-b-2xl">
                    <a href="#features" className="block px-3 py-2 text-base font-semibold text-gray-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Features</a>
                    <a href="#about" className="block px-3 py-2 text-base font-semibold text-gray-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">About</a>
                    <a href="#contact" className="block px-3 py-2 text-base font-semibold text-gray-800 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">Contact</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

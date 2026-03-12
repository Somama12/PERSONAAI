import React from 'react';

const features = [
    {
        title: 'Long-Term Memory',
        description: "Never repeat yourself again. PersonaAI perfectly retains past conversations, preferences, and important details you've shared over time.",
        icon: (
            <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
        ),
    },
    {
        title: 'Automatic Categorization',
        description: "Your thoughts and ideas are automatically tagged, intelligently clustered, and seamlessly linked to related topics without any manual effort.",
        icon: (
            <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
        ),
    },
    {
        title: 'Lightning-Fast Search',
        description: "Find any past thought, idea, or file instantly using semantic search that understands the meaning and context of your queries.",
        icon: (
            <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        ),
    },
];

const Features = () => {
    return (
        <div id="features" className="py-24 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase shadow-sm inline-block px-3 py-1 bg-indigo-50 rounded-full">Features</h2>
                    <p className="mt-4 text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                        A smarter way to manage your mind
                    </p>
                    <p className="mt-5 max-w-prose mx-auto text-xl text-gray-500">
                        PersonaAI is built from the ground up to reduce cognitive load, allowing you to focus on creating while it handles the remembering.
                    </p>
                </div>

                <div className="mt-20">
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => (
                            <div key={index} className="pt-6">
                                <div className="flow-root bg-white rounded-3xl px-8 pb-10 pt-12 text-center h-full shadow-lg shadow-gray-200/40 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="-mt-20">
                                        <span className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-md border border-gray-100 mb-6 group-hover:scale-110 transition-transform">
                                            {feature.icon}
                                        </span>
                                        <h3 className="mt-2 text-2xl font-bold text-gray-900 tracking-tight">{feature.title}</h3>
                                        <p className="mt-6 text-base text-gray-500 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
        setServerError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await fetch('http://localhost:5001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, password: formData.password })
            });

            const data = await response.json();
            if (!response.ok) {
                setServerError(data.message || 'Login failed');
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            }
        } catch (err) {
            setServerError('Unable to connect to the server.');
        }
    };

    return (
        <div className="min-h-screen flex bg-navy text-white bg-grain overflow-hidden">
            {/* Left Side: Brain Visualization */}
            <div className="hidden lg:flex w-1/2 relative bg-[#111827] items-center justify-center border-r border-gray-800 p-12 overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--color-cyan)_0%,_transparent_70%)] animate-pulse"></div>
                <div className="z-10 text-center max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="mb-8 flex justify-center"
                    >
                        <Network size={120} className="text-cyan drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" strokeWidth={1} />
                    </motion.div>
                    <h2 className="text-4xl font-heading font-bold mb-4">Re-enter your second brain.</h2>
                    <p className="text-gray-400 font-light text-lg">Your intelligence layer awaits. All your memories, organized perfectly.</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
                {/* Back to Home Link */}
                <Link to="/" className="absolute top-8 right-8 text-sm text-gray-400 hover:text-white transition-colors">
                    Back to Home
                </Link>

                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block text-3xl font-bold font-heading mb-2">Persona<span className="text-cyan">AI</span></Link>
                        <h1 className="text-2xl font-bold mt-4 font-heading">Welcome back</h1>
                        <p className="text-gray-400 mt-2 text-sm">Don't have an account? <Link to="/signup" className="text-cyan hover:underline hover:text-cyan-400">Sign up here</Link></p>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl">
                        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                            {serverError && (
                                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm">
                                    {serverError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                                <input
                                    name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan focus:border-cyan'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="mt-2 text-xs text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-300">Password</label>
                                    <a href="#" className="text-xs text-cyan hover:underline">Forgot password?</a>
                                </div>
                                <input
                                    name="password" type="password" required
                                    value={formData.password} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-cyan focus:border-cyan'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-2 text-xs text-red-400">{errors.password}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-cyan text-navy font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                            >
                                Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

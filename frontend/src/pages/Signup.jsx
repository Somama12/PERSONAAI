import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Network } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
            const response = await fetch('http://localhost:5001/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
            });

            const data = await response.json();
            if (!response.ok) {
                setServerError(data.message || 'Signup failed');
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
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--color-amber)_0%,_transparent_70%)] animate-pulse" style={{ animationDuration: '4s' }}></div>
                <div className="z-10 text-center max-w-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="mb-8 flex justify-center"
                    >
                        <Brain size={120} className="text-amber drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]" strokeWidth={1} />
                    </motion.div>
                    <h2 className="text-4xl font-heading font-bold mb-4">Initialize your intelligence.</h2>
                    <p className="text-gray-400 font-light text-lg">Sign up securely and start building a memory bank that truly understands you.</p>
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
                        <Link to="/" className="inline-block text-3xl font-bold font-heading mb-2">Persona<span className="text-amber">AI</span></Link>
                        <h1 className="text-2xl font-bold mt-4 font-heading">Create your account</h1>
                        <p className="text-gray-400 mt-2 text-sm">Already a member? <Link to="/login" className="text-amber hover:underline hover:text-amber-400">Sign in here</Link></p>
                    </div>

                    <div className="glass-panel p-8 rounded-2xl border-t border-amber/30">
                        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                            {serverError && (
                                <div className="bg-red-900/40 border border-red-500/50 text-red-200 p-4 rounded-lg text-sm">
                                    {serverError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input
                                    name="name" type="text" required
                                    value={formData.name} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-amber focus:border-amber'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="Jane Doe"
                                />
                                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
                                <input
                                    name="email" type="email" required
                                    value={formData.email} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-amber focus:border-amber'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="you@example.com"
                                />
                                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                                <input
                                    name="password" type="password" required
                                    value={formData.password} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-amber focus:border-amber'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="••••••••"
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                                <input
                                    name="confirmPassword" type="password" required
                                    value={formData.confirmPassword} onChange={handleChange}
                                    className={`w-full bg-[#111827] border ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-amber focus:border-amber'} rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-all`}
                                    placeholder="••••••••"
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber text-navy font-bold py-3 pt-4 pb-4 mt-2 rounded-lg hover:bg-yellow-500 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)]"
                            >
                                Get Started
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;

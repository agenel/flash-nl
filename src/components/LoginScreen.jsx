import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';

export default function LoginScreen({ userManager, onLogin }) {
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);

    // Separate states for separate forms
    const [loginError, setLoginError] = useState('');
    const [registerError, setRegisterError] = useState('');

    const [loginForm, setLoginForm] = useState({ email: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

    const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            const user = await userManager.login(loginForm.email, loginForm.password);
            onLogin(user);
        } catch (err) {
            setLoginError(err.message || 'Login failed');
            setLoginLoading(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setRegisterError('');
        setRegisterLoading(true);

        try {
            const user = await userManager.register(registerForm.username, registerForm.email, registerForm.password);
            onLogin(user);
        } catch (err) {
            setRegisterError(err.message || 'Registration failed');
            setRegisterLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-bg/95 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-5xl bg-card-bg border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
                {/* LEFT SIDE: REGISTER */}
                <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden bg-dutch-blue/20">
                    <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-5 pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col h-full justify-center">
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-xl bg-dutch-orange flex items-center justify-center mb-4 text-white shadow-lg shadow-dutch-orange/20">
                                <UserPlus size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                            <p className="text-dutch-orange font-medium">New to FlashNL?</p>
                            <p className="text-gray-400 text-sm mt-1">Join us to track your progress and master Dutch vocabulary.</p>
                        </div>

                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="username"
                                        placeholder="Pick a username"
                                        required
                                        value={registerForm.username}
                                        onChange={handleRegisterChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-dutch-orange focus:bg-black/60 transition-all text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        required
                                        value={registerForm.email}
                                        onChange={handleRegisterChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-dutch-orange focus:bg-black/60 transition-all text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        value={registerForm.password}
                                        onChange={handleRegisterChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-dutch-orange focus:bg-black/60 transition-all text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {registerError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-xs font-medium">{registerError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={registerLoading}
                                className="w-full mt-4 px-6 py-3 bg-white text-dutch-blue hover:bg-gray-100 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-white/5"
                            >
                                {registerLoading ? 'Creating...' : (
                                    <><span>Register</span> <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* RIGHT SIDE: LOGIN */}
                <div className="flex-1 p-8 md:p-12 relative bg-dark-bg">
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-dutch-orange/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col h-full justify-center">
                        <div className="mb-8">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-dutch-orange">
                                <LogIn size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                            <p className="text-gray-400">Please enter your details to sign in.</p>
                        </div>

                        <form onSubmit={handleLoginSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username or Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Username or Email"
                                        required
                                        value={loginForm.email}
                                        onChange={handleLoginChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-dutch-orange/50 transition-all text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        required
                                        value={loginForm.password}
                                        onChange={handleLoginChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-dutch-orange/50 transition-all text-white placeholder-gray-600"
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <p className="text-red-400 text-xs font-medium">{loginError}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full px-6 py-3 bg-dutch-orange hover:bg-orange-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-white shadow-lg shadow-dutch-orange/20"
                            >
                                {loginLoading ? 'Signing In...' : (
                                    <><span>Sign In</span> <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

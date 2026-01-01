import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { Mail, Lock, LogIn, Facebook, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const { signInWithGoogle, signInWithFacebook } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            navigate('/profile-setup');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error(error);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            await signInWithFacebook();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Log in to access your analytics dashboard"
        >
            <form className="space-y-4" onSubmit={handleLogin}>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <Input
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="form-checkbox bg-transparent border-white/20 rounded text-neon-blue focus:ring-neon-blue transition-colors"
                        />
                        <span className="text-gray-400 group-hover:text-white transition-colors">Remember me</span>
                    </label>
                    <Link
                        to="/forgot-password"
                        className="text-gray-400 hover:text-neon-blue transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader className="animate-spin" size={20} /> : <LogIn size={20} />}
                    <span>{loading ? 'Logging in...' : 'Log In'}</span>
                </button>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-deep-bg text-gray-500">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                    <button onClick={handleGoogleLogin} className="flex items-center justify-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                    </button>
                    <button onClick={handleFacebookLogin} className="flex items-center justify-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all text-white">
                        <Facebook className="w-5 h-5 text-blue-500" />
                    </button>
                </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
                Don't have an account?{' '}
                <Link to="/signup" className="text-neon-blue hover:text-white font-medium transition-colors">
                    Register Now
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { Mail, Lock, LogIn, Facebook } from 'lucide-react';

const Login: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would validate creds here first
        navigate('/social-connect');
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Log in to access your analytics dashboard"
        >
            <form className="space-y-4" onSubmit={handleLogin}>
                <Input
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    required
                />
                <Input
                    label="Password"
                    type="password"
                    icon={Lock}
                    required
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
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                    <LogIn size={20} />
                    <span>Log In</span>
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
                    <button className="flex items-center justify-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all">
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
                    <button className="flex items-center justify-center py-2.5 border border-white/10 rounded-lg hover:bg-white/5 hover:border-white/30 transition-all text-white">
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

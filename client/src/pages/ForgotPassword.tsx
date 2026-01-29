import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword: React.FC = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter your email to receive recovery instructions"
        >
            {!submitted ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        label="Email Address"
                        type="email"
                        icon={Mail}
                        required
                    />

                    <button
                        type="submit"
                        className="w-full bg-linear-to-r from-neon-blue to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                        <Send size={20} />
                        <span>Send Reset Link</span>
                    </button>
                </form>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <div className="mx-auto w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center text-neon-blue">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Check your email</h3>
                    <p className="text-gray-400">
                        We've sent password reset instructions to your email address.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="text-neon-blue hover:text-white transition-colors text-sm"
                    >
                        Try another email
                    </button>
                </motion.div>
            )}

            <div className="mt-8 text-center text-sm">
                <Link to="/login" className="text-gray-400 hover:text-white flex items-center justify-center space-x-2 transition-colors">
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                </Link>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;

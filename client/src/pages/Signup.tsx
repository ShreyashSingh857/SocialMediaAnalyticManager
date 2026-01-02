import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Signup: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            // If email confirmation is required, Supabase might not sign in immediately?
            // Usually returns user. 
            if (data.user) {
                navigate('/profile-setup');
            } else {
                setError("Check your email for the confirmation link.");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the future of social analytics"
        >
            <form className="space-y-4" onSubmit={handleSignup}>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <Input
                    label="Full Name"
                    type="text"
                    icon={User}
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                />
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
                <Input
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <input
                        type="checkbox"
                        required
                        className="form-checkbox bg-transparent border-white/20 rounded text-neon-blue focus:ring-neon-blue"
                    />
                    <span>
                        I agree to the <a href="#" className="text-neon-blue hover:underline">Terms of Service</a> and <a href="#" className="text-neon-blue hover:underline">Privacy Policy</a>
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-neon-blue/50 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircle size={20} />
                    <span>{loading ? "Creating Account..." : "Sign Up"}</span>
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-neon-blue hover:text-white font-medium transition-colors">
                    Log In
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Signup;

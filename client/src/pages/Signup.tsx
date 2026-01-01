import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/Input';
import { Mail, Lock, User, CheckCircle } from 'lucide-react';

const Signup: React.FC = () => {
    const navigate = useNavigate();

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate and signup logic here
        navigate('/social-connect');
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join the future of social analytics"
        >
            <form className="space-y-4" onSubmit={handleSignup}>
                <Input
                    label="Full Name"
                    type="text"
                    icon={User}
                    required
                />
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
                <Input
                    label="Confirm Password"
                    type="password"
                    icon={Lock}
                    required
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
                    className="w-full bg-gradient-to-r from-neon-purple to-neon-blue hover:from-purple-500 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-neon-purple/50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                    <CheckCircle size={20} />
                    <span>Sign Up</span>
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

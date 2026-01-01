import React from 'react';
import AuthLayout from '../components/AuthLayout';
import { Facebook, Link as LinkIcon, AlertCircle } from 'lucide-react';

const SocialConnect: React.FC = () => {
    return (
        <AuthLayout
            title="Connect Accounts"
            subtitle="Link your social media to start tracking"
        >
            <div className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                    <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-gray-300">
                        To provide accurate analytics, we need permission to read your social media data.
                        <span className="text-white font-semibold ml-1">This step is mandatory.</span>
                    </p>
                </div>

                <div className="space-y-4">
                    <button className="w-full bg-white text-gray-900 font-bold py-3.5 px-4 rounded-lg shadow-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <img
                            src="https://www.google.com/favicon.ico"
                            alt="Google"
                            className="w-5 h-5 relative z-10"
                        />
                        <span className="relative z-10">Connect with Google</span>
                    </button>

                    <button className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-[#1877F2]/20 transition-all duration-300 flex items-center justify-center space-x-3">
                        <Facebook className="w-5 h-5" />
                        <span>Connect with Facebook</span>
                    </button>
                </div>

                <div className="pt-6 border-t border-white/10 text-center">
                    <div className="flex justify-center items-center space-x-2 text-gray-500 text-sm">
                        <LinkIcon size={14} />
                        <span>Secure SSL Connection</span>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SocialConnect;

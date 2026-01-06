import React from 'react';
import { Facebook, Link as LinkIcon, AlertCircle, Settings as SettingsIcon, Shield, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { signInWithGoogle, signInWithFacebook, user } = useAuth();

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                    <SettingsIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400 text-sm">Manage your account and integrations</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Account Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Connected Accounts Card */}
                    <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <LinkIcon size={18} className="text-blue-400" />
                                Connected Accounts
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">Connect your social media accounts to enable analytics tracking.</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-gray-300">
                                    To provide accurate analytics, we need permission to read your social media data.
                                    <span className="text-white font-semibold ml-1">This step is mandatory.</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => signInWithGoogle()} className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3">
                                    <img
                                        src="https://www.google.com/favicon.ico"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    <span>Connect Google</span>
                                </button>

                                <button onClick={() => signInWithFacebook()} className="w-full bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-[#1877F2]/20 transition-all duration-300 flex items-center justify-center space-x-3">
                                    <Facebook className="w-5 h-5" />
                                    <span>Connect Facebook</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Placeholder */}
                    <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden opacity-50 pointer-events-none">
                        <div className="p-6 border-b border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <User size={18} className="text-purple-400" />
                                Profile Settings
                            </h2>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500">Profile management coming soon.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Email</span>
                                <span className="text-white text-sm font-medium">{user?.email}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400 text-sm">Status</span>
                                <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Shield size={16} />
                            <span className="text-sm font-bold">Privacy & Security</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your data is encrypted and secure. We only access read-only permissions for analytics purposes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

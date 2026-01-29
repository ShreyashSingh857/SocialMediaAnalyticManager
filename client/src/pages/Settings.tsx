import React from 'react';
import { Link as LinkIcon, AlertCircle, Settings as SettingsIcon, Shield, User, PenSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { signInWithGoogle, unlinkIdentity, user, profile } = useAuth();
    const navigate = useNavigate();
    const [linking, setLinking] = React.useState<string | null>(null);
    const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
    
    // Check if providers are linked
    const hasGoogleLinked = user?.identities?.some((id: any) => id.provider === 'google');

    const handleLink = async (provider: 'google') => {
        if (linking) return;
        setLinking(provider);
        setErrorMsg(null);
        try {
            await signInWithGoogle();
        } catch (error: any) {
            console.error('Linking error:', error);
            if (error.message?.includes('Manual linking is disabled')) {
                setErrorMsg("Configuration Error: Please enable 'Manual Linking' in your Supabase Dashboard (Authentication > Settings > Security).");
            } else {
                setErrorMsg(`Connection failed: ${error.message}`);
            }
            setLinking(null);
        }
    };
    
    const handleUnlink = async (provider: 'google') => {
        if (linking) return;
        if (!confirm(`Are you sure you want to disconnect Google/YouTube? This will remove access to YouTube analytics.`)) {
            return;
        }
        setLinking(provider);
        setErrorMsg(null);
        try {
            await unlinkIdentity(provider);
            alert(`Google/YouTube disconnected successfully!`);
        } catch (error: any) {
            console.error('Unlinking error:', error);
            setErrorMsg(`Failed to disconnect: ${error.message}`);
        } finally {
            setLinking(null);
        }
    };

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
                            {errorMsg && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-start space-x-3">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold">Connection Failed</p>
                                        <p>{errorMsg}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start space-x-3">
                                <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-gray-300">
                                    To provide accurate analytics, we need permission to read your social media data.
                                    <span className="text-white font-semibold ml-1">This step is mandatory.</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button 
                                    onClick={() => handleLink('google')} 
                                    disabled={!!linking}
                                    className="w-full bg-white text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {linking === 'google' ? (
                                        <span>Connecting...</span>
                                    ) : (
                                        <>
                                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                            <span>Connect Google</span>
                                        </>
                                    )}
                                </button>

                                {hasGoogleLinked && (
                                    <button 
                                        onClick={() => handleUnlink('google')} 
                                        disabled={!!linking}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg shadow-red-600/20 transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {linking === 'google' ? (
                                            <span>Disconnecting...</span>
                                        ) : (
                                            <>
                                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                                <span>Disconnect Google</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <User size={18} className="text-purple-400" />
                                Profile Settings
                            </h2>
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors"
                            >
                                <PenSquare size={16} />
                                View Profile
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                                {profile?.profile_photo_url ? (
                                    <img
                                        src={profile.profile_photo_url}
                                        alt={profile?.full_name || 'Profile'}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-xl bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold">
                                        {(profile?.full_name || user?.email || 'U').slice(0, 1).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-semibold">{profile?.full_name || 'Creator'}</p>
                                    <p className="text-sm text-gray-400">{user?.email || 'No email on file'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-gray-400">Content Type</p>
                                    <p className="text-white font-medium mt-1">{profile?.content_type || 'Not set'}</p>
                                </div>
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                    <p className="text-gray-400">Location</p>
                                    <p className="text-white font-medium mt-1">{profile?.location || 'Not set'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/profile-setup')}
                                className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                            >
                                Edit Profile
                            </button>
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

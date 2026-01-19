import React from 'react';
import { Link as LinkIcon, AlertCircle, Settings as SettingsIcon, Shield, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
    const { signInWithGoogle, unlinkIdentity, user } = useAuth();
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
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8 font-sans relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-900/10 via-purple-900/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

            <div className="max-w-7xl mx-auto relative z-10">
                <header className="flex items-center gap-6 mb-12">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                        <SettingsIcon size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
                        <p className="text-gray-400 text-base font-medium mt-1">Manage your account and integrations</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column (Wide) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Connected Accounts Card */}
                        <div className="bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
                            <div className="p-8 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                        <LinkIcon size={20} />
                                    </div>
                                    Connected Accounts
                                </h2>
                                <p className="text-gray-400 mt-2 ml-11">Connect your social media accounts to enable analytics tracking.</p>
                            </div>

                            <div className="p-8 space-y-8">
                                {errorMsg && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl flex items-start gap-4">
                                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <p className="font-bold text-base mb-1">Connection Failed</p>
                                            <p className="opacity-80">{errorMsg}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
                                    <AlertCircle className="text-blue-400 shrink-0 mt-1" size={24} />
                                    <p className="text-base text-gray-300 leading-relaxed">
                                        To provide accurate analytics, we need permission to read your social media data.
                                        <span className="text-white font-bold block mt-1">This step is mandatory for the app to function.</span>
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => handleLink('google')}
                                        disabled={!!linking}
                                        className="w-full h-16 bg-white text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {linking === 'google' ? (
                                            <span className="animate-pulse">Connecting...</span>
                                        ) : (
                                            <>
                                                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                                                <span>Connect Google</span>
                                            </>
                                        )}
                                    </button>

                                    {hasGoogleLinked && (
                                        <button
                                            onClick={() => handleUnlink('google')}
                                            disabled={!!linking}
                                            className="w-full h-16 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-600/30 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {linking === 'google' ? (
                                                <span className="animate-pulse">Disconnecting...</span>
                                            ) : (
                                                <>
                                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale brightness-200" />
                                                    <span>Disconnect Google</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Profile Placeholder (Muted/Coming Soon) */}
                        <div className="bg-white/[0.03] rounded-3xl border border-white/10 backdrop-blur-md overflow-hidden opacity-60">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                                        <User size={20} />
                                    </div>
                                    Profile Settings
                                </h2>
                                <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-white/10 rounded-full text-gray-400">Coming Soon</span>
                            </div>
                            <div className="p-8">
                                <p className="text-gray-500 text-lg">Detailed profile customization features are currently under development.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Info Stack) */}
                    <div className="space-y-6">
                        {/* Account Info Card */}
                        <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                                Account Info
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-gray-500 text-sm font-medium mb-1 block">Email Address</label>
                                    <div className="text-white font-medium text-lg break-all">{user?.email}</div>
                                </div>
                                <div>
                                    <label className="text-gray-500 text-sm font-medium mb-2 block">Status</label>
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-bold">
                                        <CheckCircle size={14} />
                                        Active
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Privacy & Security Card */}
                        <div className="bg-white/[0.03] p-6 rounded-3xl border border-white/10 backdrop-blur-md shadow-xl">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield size={14} />
                                Privacy & Security
                            </h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                Your data is encrypted and stored securely. We only use your tokens to fetch analytics data you've authorized.
                            </p>
                            <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                                Valid until {new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString()}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

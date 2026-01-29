import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, MapPin, Calendar, PenSquare, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Profile: React.FC = () => {
    const { profile, user } = useAuth();
    const navigate = useNavigate();

    const initials = (profile?.full_name || user?.email || 'U').slice(0, 1).toUpperCase();

    return (
        <div className="p-8 space-y-8 bg-[#0f1014] min-h-screen text-white">
            <header className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/10 rounded-xl">
                    <UserCircle className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Profile</h1>
                    <p className="text-gray-400 text-sm">Manage your personal details and creator identity</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#12141a] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserCircle size={18} className="text-purple-400" />
                                Profile Details
                            </h2>
                            <button
                                onClick={() => navigate('/profile-setup')}
                                className="flex items-center gap-2 text-sm text-purple-300 hover:text-white transition-colors"
                            >
                                <PenSquare size={16} />
                                Edit Profile
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-5">
                                {profile?.profile_photo_url ? (
                                    <img
                                        src={profile.profile_photo_url}
                                        alt={profile?.full_name || 'Profile'}
                                        className="w-20 h-20 rounded-2xl object-cover"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold">
                                        {initials}
                                    </div>
                                )}
                                <div>
                                    <p className="text-xl font-semibold text-white">{profile?.full_name || 'Creator'}</p>
                                    <p className="text-sm text-gray-400">{user?.email || 'No email on file'}</p>
                                </div>
                            </div>

                            {profile ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-gray-400">Content Type</p>
                                        <p className="text-white font-medium mt-1">{profile.content_type || 'Not set'}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-gray-400">Age</p>
                                        <p className="text-white font-medium mt-1">{profile.age || 'Not set'}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-2">
                                        <MapPin className="text-blue-400" size={16} />
                                        <div>
                                            <p className="text-gray-400">Location</p>
                                            <p className="text-white font-medium mt-1">{profile.location || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center gap-2">
                                        <Calendar className="text-purple-400" size={16} />
                                        <div>
                                            <p className="text-gray-400">Country</p>
                                            <p className="text-white font-medium mt-1">{profile.country || 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 bg-white/5 rounded-xl p-4 border border-white/5">
                                        <p className="text-gray-400">About</p>
                                        <p className="text-white mt-2 leading-relaxed">{profile.description || 'Tell us about your content.'}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-lg">
                                    <p className="text-sm">Complete your profile to unlock personalized recommendations.</p>
                                    <button
                                        onClick={() => navigate('/profile-setup')}
                                        className="mt-3 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                                    >
                                        Complete Profile
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Account</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Email</span>
                                <span className="text-white font-medium">{user?.email || 'Not set'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Status</span>
                                <span className="text-green-400 text-xs bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#12141a] p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 mb-2">
                            <Shield size={16} />
                            <span className="text-sm font-bold">Privacy</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">
                            Your profile data is used to personalize insights and remains private to your account.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

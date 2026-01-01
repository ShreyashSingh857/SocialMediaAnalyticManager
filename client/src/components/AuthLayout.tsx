import React from 'react';
import { motion } from 'framer-motion';
import loginBg from '../assets/login_bg.png';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-deep-bg text-white font-sans">
            {/* Left Side - Image & Branding */}
            <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={loginBg}
                        alt="Social Media Analytics"
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-deep-bg/90 to-deep-bg/40 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-bg via-transparent to-transparent" />
                </div>

                <div className="relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-bold tracking-tighter"
                    >
                        Uptrend
                    </motion.h1>
                </div>

                <div className="relative z-10 space-y-6">
                    <motion.h2
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl font-extrabold leading-tight"
                    >
                        Unlock the power of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple text-neon">
                            Social Data
                        </span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-300 max-w-md"
                    >
                        Advanced analytics for the modern creator. Visualize trends, predict growth, and dominate functionality.
                    </motion.p>
                </div>

                <div className="relative z-10 text-sm text-gray-400">
                    © {new Date().getFullYear()} Uptrend
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-12 relative">
                {/* Mobile Background (visible only on small screens) */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <img
                        src={loginBg}
                        alt="Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-deep-bg/90 backdrop-blur-sm" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md glass-panel p-8 rounded-2xl relative z-10"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">{title}</h2>
                        <p className="text-gray-400">{subtitle}</p>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;

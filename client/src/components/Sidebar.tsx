import {
    LayoutDashboard,
    Settings,
    TrendingUp,
    Sparkles,
    LogOut
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Sidebar = () => {
    const { signOut } = useAuth();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-20 lg:w-64 border-r border-white/5 bg-[#0f1014] fixed h-full z-10 flex flex-col hidden md:flex">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">SM</div>
                    <span className="font-bold text-lg hidden lg:block tracking-tight text-white">SocialMgr</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-8">
                    <NavItem to="/" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem to="/analytics/overview" icon={TrendingUp} label="Analytics" />
                    <NavItem to="/ai-studio" icon={Sparkles} label="AI Studio" />

                    <NavItem to="/settings" icon={Settings} label="Settings" />
                </nav>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={signOut}
                        className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-2 w-full rounded-lg hover:bg-white/5"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block">Log Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl border-b border-white/5 z-20 p-4 flex justify-between items-center text-white">
                <div className="font-bold text-lg">SocialMgr</div>
                <button onClick={signOut}><LogOut className="w-5 h-5" /></button>
            </div>
        </>
    );
};

const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            w-full flex items-center gap-3 p-3 rounded-xl transition-all
            ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }
        `}
    >
        <Icon className="w-5 h-5" />
        <span className="hidden lg:block font-medium">{label}</span>
    </NavLink>
);

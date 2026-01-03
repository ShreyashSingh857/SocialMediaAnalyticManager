import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

const SidebarLayout = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            <Sidebar />
            <main className="flex-1 md:ml-20 lg:ml-64 pt-20 md:pt-0 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default SidebarLayout;

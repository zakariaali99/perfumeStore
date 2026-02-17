import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Image,
    Ticket,
    Settings,
    Menu,
    X,
    LogOut,
    Bell,
    ExternalLink,
    Sun,
    Moon,
    TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useThemeStore from '../../store/themeStore';
import ErrorBoundary from '../common/ErrorBoundary';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600 hover:text-gold-600'}`}
    >
        <Icon size={20} />
        <span className="font-bold">{label}</span>
    </Link>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useThemeStore();

    const menuItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
        { to: '/dashboard/analytics', icon: TrendingUp, label: 'التقارير والتحليلات' },
        { to: '/dashboard/products', icon: Package, label: 'المنتجات' },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'الطلبات' },
        { to: '/dashboard/customers', icon: Users, label: 'العملاء (CRM)' },
        { to: '/dashboard/cms', icon: Image, label: 'المحتوى (CMS)' },
        { to: '/dashboard/coupons', icon: Ticket, label: 'الكوبونات' },
        { to: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen flex font-tajawal transition-colors duration-300">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-72 bg-white dark:bg-dark-800 border-l border-gold-100 dark:border-dark-600 flex-col sticky top-0 h-screen transition-colors duration-300">
                <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
                    <div>
                        <h2 className="font-black text-lg leading-none text-text-primary dark:text-cream-50">لوحة التحكم</h2>
                        <span className="text-[10px] text-gold-500 uppercase tracking-widest font-bold">ALMOSTAFAS ADMIN</span>
                    </div>
                </div>

                <nav className="flex-1 p-6 space-y-2">
                    {menuItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.to)}
                        />
                    ))}
                </nav>

                <div className="p-6 border-t border-gold-50 dark:border-dark-600">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold"
                    >
                        <LogOut size={20} />
                        خروج
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-dark-800 border-b border-gold-100 dark:border-dark-600 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-lg text-text-primary dark:text-cream-50"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-black text-text-primary dark:text-cream-50 hidden md:block">
                            {menuItems.find(i => i.to === location.pathname)?.label || 'الإدارة'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 text-text-secondary dark:text-gold-400 hover:text-gold-600 text-sm font-bold bg-gold-50 dark:bg-dark-600 px-4 py-2 rounded-xl border border-gold-100 dark:border-dark-600 transition-all">
                            <ExternalLink size={16} />
                            عرض المتجر
                        </Link>
                        <button className="p-2.5 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-600"></span>
                        </button>
                        <div className="w-10 h-10 bg-gold-100 dark:bg-dark-600 rounded-xl flex items-center justify-center text-gold-700 dark:text-gold-400 font-bold border border-gold-200 dark:border-dark-600">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-10">
                    <ErrorBoundary>
                        <Outlet />
                    </ErrorBoundary>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-dark-800 z-50 lg:hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center text-white font-black text-xl">M</div>
                                    <h2 className="font-black text-lg leading-none text-text-primary dark:text-cream-50">لوحة التحكم</h2>
                                </div>
                                <button onClick={() => setIsSidebarOpen(false)} className="text-text-primary dark:text-cream-50">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex-1 p-6 space-y-2">
                                {menuItems.map((item) => (
                                    <SidebarLink
                                        key={item.to}
                                        to={item.to}
                                        icon={item.icon}
                                        label={item.label}
                                        active={item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.to)}
                                        onClick={() => setIsSidebarOpen(false)}
                                    />
                                ))}
                            </nav>
                            <div className="p-6 border-t border-gold-50 dark:border-dark-600">
                                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-red-500 font-bold">
                                    <LogOut size={20} />
                                    خروج
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DashboardLayout;

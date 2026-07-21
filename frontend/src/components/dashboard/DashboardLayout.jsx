import logoImg from '../../assets/logo.png';
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
    HardDrive,
    Menu,
    LogOut,
    Bell,
    ExternalLink,
    Sun,
    Moon,
    TrendingUp,
    LayoutGrid,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    X
} from 'lucide-react';
import useThemeStore from '../../store/themeStore';
import Modal from '../common/Modal';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        title={collapsed ? label : undefined}
        className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 rounded-xl transition-all ${active ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600 hover:text-gold-600'}`}
    >
        <Icon size={20} className="shrink-0" />
        {!collapsed && <span className="font-bold truncate">{label}</span>}
    </Link>
);

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { isDark, toggleTheme } = useThemeStore();

    const menuItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
        { to: '/dashboard/analytics', icon: TrendingUp, label: 'التقارير والتحليلات' },
        { to: '/dashboard/products', icon: Package, label: 'المنتجات' },
        { to: '/dashboard/categories', icon: LayoutGrid, label: 'التصنيفات' },
        { to: '/dashboard/brands', icon: Briefcase, label: 'الماركات' },
        { to: '/dashboard/orders', icon: ShoppingBag, label: 'الطلبات' },
        { to: '/dashboard/customers', icon: Users, label: 'العملاء (CRM)' },
        { to: '/dashboard/cms', icon: Image, label: 'المحتوى (CMS)' },
        { to: '/dashboard/coupons', icon: Ticket, label: 'الكوبونات' },
        { to: '/dashboard/settings', icon: Settings, label: 'الإعدادات' },
        { to: '/dashboard/backup', icon: HardDrive, label: 'النسخ الاحتياطي' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/');
    };

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen flex font-tajawal transition-colors duration-300" dir="rtl">
            {/* Sidebar Desktop */}
            <aside className={`hidden lg:flex ${isCollapsed ? 'w-20' : 'w-72'} bg-white dark:bg-dark-800 border-l border-gold-200 dark:border-dark-600 flex-col sticky top-0 h-screen transition-all duration-300`}>
                <div className={`p-6 border-b border-gold-100 dark:border-dark-600 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 border border-gold-200 shrink-0 overflow-hidden shadow-sm">
                            <img src={logoImg} alt="عطور مصطفى" className="w-full h-full object-contain" />
                        </div>
                        {!isCollapsed && (
                            <div className="truncate">
                                <h2 className="font-black text-lg leading-none text-text-primary dark:text-cream-50 truncate">لوحة التحكم</h2>
                                <span className="text-[10px] text-gold-500 uppercase tracking-widest font-bold block truncate mt-1">ALMOSTAFAS ADMIN</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-lg text-text-muted dark:text-gold-400 transition-colors shrink-0"
                        title={isCollapsed ? 'توسيع القائمة' : 'طوي القائمة'}
                    >
                        {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <SidebarLink
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            collapsed={isCollapsed}
                            active={item.to === '/dashboard' ? location.pathname === '/dashboard' : location.pathname.startsWith(item.to)}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-gold-100 dark:border-dark-600">
                    <button
                        onClick={handleLogout}
                        title={isCollapsed ? 'خروج' : undefined}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-3 w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold`}
                    >
                        <LogOut size={20} className="shrink-0" />
                        {!isCollapsed && <span className="truncate">خروج</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-20 bg-white dark:bg-dark-800 border-b border-gold-200 dark:border-dark-600 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-lg text-text-primary dark:text-cream-50"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-black text-text-primary dark:text-cream-50 hidden md:block">
                            {menuItems
                                .filter(i => i.to !== '/dashboard' && location.pathname.startsWith(i.to))
                                .sort((a, b) => b.to.length - a.to.length)[0]?.label
                                || (location.pathname === '/dashboard' ? 'لوحة التحكم' : 'الإدارة')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 text-text-secondary dark:text-gold-400 hover:text-gold-600 text-sm font-bold bg-gold-50 dark:bg-dark-600 px-4 py-2 rounded-xl border border-gold-200 dark:border-dark-600 transition-all">
                            <ExternalLink size={16} />
                            عرض المتجر
                        </Link>
                        <button className="p-2.5 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-dark-600"></span>
                        </button>
                        <div className="w-10 h-10 bg-gold-100 dark:bg-dark-600 rounded-xl flex items-center justify-center text-gold-700 dark:text-gold-400 font-bold border border-gold-300 dark:border-dark-600">
                            AD
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6 md:p-10">
                    <Outlet />
                </main>
            </div>

            <Modal variant="drawer" maxWidth="max-w-[300px]" isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
                <div className="p-6 border-b border-gold-100 dark:border-dark-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 border border-gold-200 overflow-hidden shadow-sm shrink-0">
                            <img src={logoImg} alt="عطور مصطفى" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="font-black text-lg leading-none text-text-primary dark:text-cream-50">لوحة التحكم</h2>
                            <span className="text-[10px] text-gold-500 uppercase tracking-widest font-bold block mt-1">ALMOSTAFAS ADMIN</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-xl text-text-muted dark:text-gold-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
                <div className="p-4 border-t border-gold-100 dark:border-dark-600">
                    <button
                        onClick={() => {
                            setIsSidebarOpen(false);
                            handleLogout();
                        }}
                        className="flex items-center gap-3 px-4 py-3 w-full text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all font-bold"
                    >
                        <LogOut size={20} className="shrink-0" />
                        <span>خروج</span>
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardLayout;

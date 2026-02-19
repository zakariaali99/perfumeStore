import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    ShoppingBag,
    Search,
    Menu,
    User,
    Sun,
    Moon,
    X,
    Phone,
    MessageCircle,
    Instagram,
    Facebook,
    ChevronDown,
    Truck,
    Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import CartDrawer from '../cart/CartDrawer';
import { productsApi } from '../../services/api';

const Header = () => {
    const { cart } = useCartStore();
    const { isDark, toggleTheme } = useThemeStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [categories, setCategories] = useState([]);

    // Check if user is logged in
    const token = localStorage.getItem('access_token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const isLoggedIn = !!token;
    const isAdmin = user?.is_staff;

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const cartItemsCount = cart.items ? cart.items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productsApi.getCategories();
                setCategories(res.data.results || res.data || []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const isActive = (path) => {
        if (path === '#') return false;
        return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
    };

    const navLinks = [
        { name: 'كل العطور', path: '/products' },
        {
            name: 'الأقسام',
            path: '#',
            dropdown: categories.length > 0
                ? categories.map(c => ({ name: c.name_ar, path: `/products?category=${c.slug}` }))
                : [
                    { name: 'عطور شرقية', path: '/products?category=oriental' }, // Fallback
                    { name: 'عطور عود', path: '/products?category=oud' },
                ]
        },
        { name: 'تتبع الطلب', path: '/track' },
        { name: 'من نحن', path: '/about' },
        { name: 'اتصل بنا', path: '/contact' },
    ];

    return (
        <>
            <header className={`sticky top-0 z-[100] transition-all duration-500 ${scrolled ? 'bg-white/95 dark:bg-dark-800/95 backdrop-blur-md h-20 shadow-xl' : 'bg-transparent h-24'}`}>
                <div className="container mx-auto px-4 h-full flex items-center justify-between gap-8">
                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden text-text-primary dark:text-cream-50 p-3 hover:bg-gold-50 dark:hover:bg-dark-700 rounded-2xl transition-all"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Branding */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shadow-lg shadow-gold-600/10 border border-gold-100 group-hover:scale-105 transition-transform duration-500">
                            <img src="/logo.png" alt="عطور مصطفى" className="w-full h-full object-cover" />
                        </div>
                        <div className="hidden md:flex flex-col">
                            <span className="text-xl md:text-2xl font-black text-gold-600 tracking-tight transition-all">
                                عطور مصطفى
                            </span>
                            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary dark:text-gold-400 -mt-1 group-hover:text-gold-500 transition-colors">
                                Luxury Perfumes
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <div key={link.name} className="relative group/nav">
                                <Link
                                    to={link.path}
                                    className={`text-sm font-black transition-all flex items-center gap-1.5 ${isActive(link.path) ? 'text-gold-600' : 'text-text-primary dark:text-cream-50 hover:text-gold-600'}`}
                                >
                                    {link.name}
                                    {link.dropdown && <ChevronDown size={14} className="group-hover/nav:rotate-180 transition-transform" />}
                                </Link>

                                {link.dropdown && (
                                    <div className="absolute top-full -right-4 pt-4 opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 translate-y-2 group-hover/nav:translate-y-0">
                                        <div className="bg-white dark:bg-dark-700 w-56 rounded-3xl shadow-2xl border border-gold-50 dark:border-dark-600 overflow-hidden flex flex-col p-2">
                                            {link.dropdown.map(item => (
                                                <Link
                                                    key={item.name}
                                                    to={item.path}
                                                    className="px-5 py-3.5 text-xs font-bold text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600 hover:text-gold-600 rounded-[18px] transition-all flex items-center justify-between group/item"
                                                >
                                                    {item.name}
                                                    <span className="w-1.5 h-1.5 bg-gold-500 rounded-full scale-0 group-hover/item:scale-100 transition-all"></span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Search Bar - Desktop */}
                        <div className={`hidden sm:flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64 bg-gray-50 dark:bg-dark-700 px-3 py-1.5 rounded-2xl border border-gold-200 dark:border-dark-600' : 'w-12 bg-transparent justify-center'}`}>
                            {isSearchOpen ? (
                                <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center">
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="بحث..."
                                        className="w-full bg-transparent border-none outline-none text-sm text-text-primary dark:text-cream-50 placeholder:text-text-muted"
                                        onBlur={() => !searchQuery && setIsSearchOpen(false)}
                                    />
                                    <button type="submit" className="text-gold-500">
                                        <Search size={16} />
                                    </button>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-3 rounded-2xl bg-gray-50/50 dark:bg-dark-700/50 hover:bg-gold-50 dark:hover:bg-dark-600 text-text-primary dark:text-cream-50 transition-all shadow-sm"
                                >
                                    <Search size={20} />
                                </button>
                            )}
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="hidden md:block p-3 rounded-2xl bg-gray-50/50 dark:bg-dark-700/50 hover:bg-gold-50 dark:hover:bg-dark-600 text-text-primary dark:text-gold-400 transition-all shadow-sm border border-transparent hover:border-gold-100 dark:hover:border-dark-500"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-3 rounded-2xl bg-gold-600 hover:bg-gold-700 text-white transition-all shadow-lg shadow-gold-600/20 group scale-100 active:scale-95"
                        >
                            <ShoppingBag size={20} />
                            {cartItemsCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-white dark:bg-dark-800 text-gold-600 dark:text-gold-400 text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black shadow-md border-2 border-gold-600 group-hover:scale-110 transition-transform">
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>

                        {(isLoggedIn && isAdmin) && (
                            <Link
                                to="/dashboard"
                                className="hidden md:flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-gray-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 hover:border-gold-500 transition-all"
                            >
                                <span className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase tracking-widest leading-none">Management</span>
                                <div className="w-9 h-9 bg-gold-100 dark:bg-dark-600 rounded-xl flex items-center justify-center text-gold-600">
                                    <User size={18} />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <div className="fixed inset-0 z-[200] lg:hidden">
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        {/* Sidebar */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-dark-800 shadow-2xl flex flex-col overflow-hidden"
                            dir="rtl"
                        >
                            {/* Mobile Header */}
                            <div className="p-8 border-b border-gold-50 dark:border-dark-700 flex justify-between items-center bg-cream-50/30 dark:bg-dark-900/40">
                                <div className="flex flex-col">
                                    <span className="text-xl font-black text-gold-600">عطور مصطفى</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest dark:text-gold-400">Luxury Perfumes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleTheme}
                                        className="p-3 bg-white dark:bg-dark-700 rounded-2xl shadow-sm text-text-primary dark:text-gold-400 border border-gold-50 dark:border-dark-600"
                                    >
                                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                                    </button>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-3 bg-white dark:bg-dark-700 rounded-2xl shadow-sm text-text-primary dark:text-cream-50"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Nav */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-12">
                                {/* Mobile Search */}
                                <form onSubmit={handleSearchSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ما الذي تبحث عنه؟"
                                        className="w-full bg-gray-50 dark:bg-dark-700 px-4 py-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                    <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500">
                                        <Search size={20} />
                                    </button>
                                </form>

                                <nav className="space-y-6">
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-black border-r-2 border-gold-500 pr-3">القائمة الرئيسية</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        {navLinks.map((link) => (
                                            !link.dropdown ? (
                                                <Link
                                                    key={link.name}
                                                    to={link.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className={`p-4 rounded-[22px] border-2 transition-all font-bold text-sm text-center flex flex-col items-center gap-3 ${isActive(link.path) ? 'bg-gold-50 overflow-hidden border-gold-500 text-gold-600 shadow-sm' : 'border-gold-50 dark:border-dark-700 text-text-primary dark:text-cream-50'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive(link.path) ? 'bg-gold-500 text-white' : 'bg-gold-50 dark:bg-dark-700 text-gold-600'}`}>
                                                        {link.name === 'تتبع الطلب' ? <Truck size={20} /> : <Package size={20} />}
                                                    </div>
                                                    {link.name}
                                                </Link>
                                            ) : null
                                        ))}
                                    </div>
                                </nav>

                                <nav className="space-y-6">
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-black border-r-2 border-gold-500 pr-3">تسوق حسب القسم</p>
                                    <div className="space-y-3">
                                        {categories.map(item => (
                                            <Link
                                                key={item.id}
                                                to={`/products?category=${item.slug}`}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-between p-5 rounded-3xl bg-gray-50/50 dark:bg-dark-700/50 border border-gold-50 dark:border-dark-700 text-sm font-bold text-text-primary dark:text-cream-50 group hover:border-gold-500 hover:bg-gold-50 transition-all"
                                            >
                                                {item.name_ar}
                                                <ChevronDown size={14} className="-rotate-90 text-gold-500" />
                                            </Link>
                                        ))}
                                    </div>
                                </nav>

                                {/* Mobile Contact */}
                                <div className="space-y-6">
                                    <p className="text-[10px] uppercase tracking-widest text-text-muted font-black border-r-2 border-gold-500 pr-3">تواصل معنا</p>
                                    <div className="flex gap-4">
                                        <a href="https://wa.me/0912345678" className="flex-1 flex flex-col items-center gap-2 p-5 rounded-[28px] bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 text-green-600 transition-all active:scale-95">
                                            <MessageCircle size={28} />
                                            <span className="text-[10px] font-black">واتساب</span>
                                        </a>
                                        <a href="tel:0912345678" className="flex-1 flex flex-col items-center gap-2 p-5 rounded-[28px] bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 text-blue-600 transition-all active:scale-95">
                                            <Phone size={28} />
                                            <span className="text-[10px] font-black">اتصال</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Footer */}
                            {(isLoggedIn && isAdmin) && (
                                <div className="p-8 border-t border-gold-50 dark:border-dark-700 bg-cream-50/30 dark:bg-dark-900/40">
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-dark-900 text-gold-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gold-900/20"
                                    >
                                        <User size={16} />
                                        لوحة التحكم
                                    </Link>
                                </div>
                            )}
                            {(!isLoggedIn) && (
                                <div className="p-8 border-t border-gold-50 dark:border-dark-700 bg-cream-50/30 dark:bg-dark-900/40">
                                    <Link
                                        to="/dashboard/login"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-dark-900 text-gold-400 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gold-900/20 opacity-0 pointer-events-none"
                                    >
                                        Admin login
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default Header;

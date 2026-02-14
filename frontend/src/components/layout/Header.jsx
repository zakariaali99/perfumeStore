import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, User, Sun, Moon, X } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useThemeStore from '../../store/themeStore';
import CartDrawer from '../cart/CartDrawer';

const Header = () => {
    const { cart } = useCartStore();
    const { isDark, toggleTheme } = useThemeStore();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const cartItemsCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);

    const navLinks = [
        { name: 'كل العطور', path: '/products' },
        { name: 'عطور شرقية', path: '/category/oriental' },
        { name: 'عطور زهرية', path: '/category/floral' },
        { name: 'من نحن', path: '/about' },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 bg-cream-50/80 dark:bg-dark-800/90 backdrop-blur-md border-b border-gold-100 dark:border-dark-600 transition-colors duration-300">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="lg:hidden text-text-primary dark:text-cream-50 p-2 hover:bg-gold-50 dark:hover:bg-dark-700 rounded-xl transition-colors"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-gold-600 tracking-wider">
                        ALMOSTAFAS <span className="text-sm block text-center font-normal -mt-1 tracking-widest text-text-secondary dark:text-gold-500">PERFUME</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center space-x-8 space-x-reverse text-sm font-medium text-text-primary dark:text-cream-50">
                        {navLinks.map((link) => (
                            <Link key={link.path} to={link.path} className="hover:text-gold-500 transition-colors">
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Icons */}
                    <div className="flex items-center space-x-2 md:space-x-5 space-x-reverse">
                        <button
                            onClick={toggleTheme}
                            className="p-2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-gold-100/50 dark:hover:bg-dark-600 transition-colors text-text-primary dark:text-gold-400"
                        >
                            {isDark ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <button className="hidden sm:flex text-text-primary dark:text-cream-50 hover:text-gold-500 transition-colors p-2">
                            <Search size={22} />
                        </button>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative text-text-primary dark:text-cream-50 hover:text-gold-500 transition-colors p-2"
                        >
                            <ShoppingBag size={22} />
                            {cartItemsCount > 0 && (
                                <span className="absolute top-0 right-0 bg-gold-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cartItemsCount}
                                </span>
                            )}
                        </button>
                        <Link to="/accounts/profile" className="hidden md:flex text-text-primary dark:text-cream-50 hover:text-gold-500 transition-colors p-2">
                            <User size={22} />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Sidebar */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-3/4 max-w-sm bg-white dark:bg-dark-800 shadow-2xl flex flex-col p-6 animate-slide-in-right">
                        <div className="flex justify-between items-center mb-10">
                            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-bold text-gold-600">
                                ALMOSTAFAS
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gold-50 dark:hover:bg-dark-700 rounded-full">
                                <X size={24} />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-lg font-bold text-text-primary dark:text-cream-50 hover:text-gold-600 transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-6 border-t border-gold-50 dark:border-dark-700">
                                <Link to="/accounts/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-lg font-bold text-text-primary dark:text-cream-50">
                                    <User size={20} />
                                    حسابي
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
    );
};

export default Header;

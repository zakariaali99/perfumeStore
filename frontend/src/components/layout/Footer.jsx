import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-800 text-white py-20 mt-20">
            <div className="container mx-auto px-4">
                <div className="row g-5 mb-16">
                    {/* Brand */}
                    <div className="col-12 col-md-6">
                        <h2 className="text-3xl font-black mb-4 text-gold-400 tracking-tight">عطور مصطفى</h2>
                        <p className="text-gray-400 leading-relaxed max-w-md mb-8">
                            نحن نقدم أفخر العطور العربية والشرقية المختارة بعناية فائقة. نسعى لإيصال روائح الفخامة والأصالة لكل بيت ليبي.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/the.mostafa.perfumes?igsh=MXVnejh4d25qMjV4ZQ==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="https://www.tiktok.com/@mostafaperfumes?_r=1&_t=ZS-943SX1wYWer" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-1.26-.88-2.12-2.22-2.49-3.66L15.8 20.06c-.05 1.05-.34 2.1-.9 3.01-.55.91-1.39 1.62-2.34 2.05-1.01.46-2.15.58-3.23.41-1.12-.17-2.18-.7-3.03-1.45-.85-.75-1.41-1.78-1.57-2.9-.16-1.12.01-2.3.56-3.29.54-1 1.41-1.79 2.45-2.22 1.04-.43 2.2-.44 3.28-.1v4.19c-.91-.32-1.95-.21-2.73.35-.78.56-1.16 1.55-1.02 2.51.14.96.84 1.78 1.75 2.1.91.31 2.01.07 2.66-.64.65-.7.83-1.72.63-2.65L12.7 0h-.175z" />
                                </svg>
                            </a>
                            <a href="https://m.youtube.com/@mostafaperfumes?si=3KH5kj2c5Q47rVYB" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-6 col-md-3">
                        <h3 className="font-black text-lg mb-6 text-gold-400">روابط سريعة</h3>
                        <ul className="space-y-3 text-gray-400">
                            <li><Link to="/products" className="hover:text-gold-500 transition-colors">كل العطور</Link></li>
                            <li><Link to="/about" className="hover:text-gold-500 transition-colors">من نحن</Link></li>
                            <li><Link to="/contact" className="hover:text-gold-500 transition-colors">اتصل بنا</Link></li>
                            <li><Link to="/track" className="hover:text-gold-500 transition-colors">تتبع طلبك</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-6 col-md-3">
                        <h3 className="font-black text-lg mb-6 text-gold-400">تواصل معنا</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-center gap-3">
                                <MapPin size={16} className="text-gold-500" />
                                طرابلس، ليبيا
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone size={16} className="text-gold-500" />
                                <span dir="ltr">0917359191</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail size={16} className="text-gold-500" />
                                info@mostafastore.ly
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="pt-10 border-t border-dark-600 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500">
                        &copy; 2026 جميع الحقوق محفوظة لمتجر عطور مصطفى
                    </p>
                    <div className="flex gap-6 text-xs text-gray-500">
                        <Link to="/terms" className="hover:text-gold-500 transition-colors">الشروط والأحكام</Link>
                        <Link to="/privacy" className="hover:text-gold-500 transition-colors">سياسة الخصوصية</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

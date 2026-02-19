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
                            <a href="#" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <Facebook size={18} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-dark-600 hover:bg-gold-500 rounded-xl flex items-center justify-center transition-colors">
                                <Twitter size={18} />
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
                                <span dir="ltr">0912345678</span>
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

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

const RamadanBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const dismissed = sessionStorage.getItem('ramadan_banner_dismissed');
        if (dismissed) setIsVisible(false);
    }, []);

    const dismissBanner = () => {
        setIsVisible(false);
        sessionStorage.setItem('ramadan_banner_dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-dark-900 via-indigo-950 to-dark-900 border-b border-gold-500/20 relative z-[110] overflow-hidden"
                >
                    {/* Decorative stars background */}
                    <div className="absolute inset-0 pointer-events-none opacity-30">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity: [0.2, 0.8, 0.2] }}
                                transition={{ duration: 2 + i, repeat: Infinity, delay: i }}
                                className="absolute text-gold-400"
                                style={{
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    fontSize: '8px'
                                }}
                            >
                                ✦
                            </motion.div>
                        ))}
                    </div>

                    <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-4 relative z-10">
                        <div className="flex-1 flex items-center justify-center gap-3 text-center">
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="text-gold-400"
                            >
                                🌙
                            </motion.span>
                            <p className="text-[11px] md:text-sm font-black text-cream-50 tracking-wide">
                                رمضان كريم <span className="text-gold-500 mx-1">✦</span> خصومات خاصة بمناسبة الشهر الفضيل
                            </p>
                            <motion.div
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={14} className="text-gold-400 hidden sm:block" />
                            </motion.div>
                        </div>

                        <button
                            onClick={dismissBanner}
                            className="text-cream-50/50 hover:text-white transition-colors p-1"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default RamadanBanner;

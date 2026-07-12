import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cmsApi } from '../../services/api';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const Hero = () => {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await cmsApi.getSlides();
                setSlides(res.data.results || res.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    const next = () => setCurrent((current + 1) % slides.length);
    const prev = () => setCurrent((current - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(next, 7000);
        return () => clearInterval(timer);
    }, [slides, current]);

    if (loading || slides.length === 0) return (
        <section className="relative h-[85vh] bg-cream-50 dark:bg-dark-800 animate-pulse flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-text-secondary dark:text-gold-400 font-bold">جاري تحميل العروض...</p>
            </div>
        </section>
    );

    const slide = slides[current];

    return (
        <section className="relative h-[85vh] overflow-hidden bg-black font-tajawal">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/20 to-transparent z-10"></div>
                    {slide.image ? (
                        <img
                            src={slide.image}
                            className="w-full h-full object-cover"
                            alt={slide.title}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-dark-700 via-dark-800 to-dark-900" />
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="container mx-auto px-4 h-full relative z-20 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-3xl"
                    >
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gold-500 text-black px-4 py-1.5 rounded-lg text-xs font-black mb-6 inline-block uppercase tracking-[0.2em]"
                        >
                            {slide.subtitle}
                        </motion.span>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                            {slide.title}
                        </h1>
                        <p className="text-xl text-gray-200 mb-12 max-w-xl leading-loose font-medium drop-shadow-lg">
                            {slide.description_ar || 'اكتشف عبق الجوهر الشرقي في تشكيلتنا الفاخرة التي تحمل سحر التاريخ وروح العصر.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <a
                                href={slide.button_link || '/products'}
                                className="bg-gold-500 hover:bg-gold-600 text-black px-12 py-5 rounded-2xl transition-all duration-300 font-black shadow-2xl shadow-gold-500/20 text-center text-lg"
                            >
                                {slide.button_text || 'تسوق المجموعة'}
                            </a>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
                <>
                    <div className="absolute bottom-12 right-4 container mx-auto px-4 z-30 flex items-center gap-4">
                        <button
                            onClick={prev}
                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-gold-500 hover:text-black transition-all border border-white/20"
                        >
                            <ChevronRight size={24} />
                        </button>
                        <button
                            onClick={next}
                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-white hover:bg-gold-500 hover:text-black transition-all border border-white/20"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    </div>

                    {/* Indicators */}
                    <div className="absolute bottom-12 left-12 z-30 flex gap-2">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrent(idx)}
                                className={`h-1.5 transition-all rounded-full ${idx === current ? 'w-12 bg-gold-500' : 'w-4 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
};

export default Hero;

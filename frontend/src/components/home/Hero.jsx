import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cmsApi } from '../../services/api';

const Hero = () => {
    const [slides, setSlides] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

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

    const next = useCallback(() => {
        if (slides.length > 0) {
            setCurrent((prev) => (prev + 1) % slides.length);
        }
    }, [slides.length]);

    const prev = useCallback(() => {
        if (slides.length > 0) {
            setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
        }
    }, [slides.length]);

    useEffect(() => {
        if (slides.length < 2) return;
        const timer = setInterval(next, 3000); // 3 seconds auto-slide
        return () => clearInterval(timer);
    }, [slides.length, next]);

    // Swipe handlers
    const onTouchStart = (e) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            next(); // Swipe left -> next slide (Arabic direction consideration: typically swipe left shows next in LTR, but in RTL swipe left (move finger left) means "pulling" the content from right? Actually standard is swipe left to go next)
            // Let's assume standard behavior: Swipe Left = Next, Swipe Right = Prev
        } else if (isRightSwipe) {
            prev();
        }
    };

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
        <section
            className="relative h-[85vh] overflow-hidden bg-black font-tajawal touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/50 to-black/30 z-10"></div>
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

            <div className="container h-100 relative z-20">
                <div className="row h-100 align-items-center justify-content-end">
                    <div className="col-12 col-md-8 col-lg-7">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={current}
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="w-full overflow-hidden"
                            >
                                <motion.span
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gold-500 text-black px-4 py-1.5 rounded-lg text-xs font-black mb-6 inline-block uppercase tracking-[0.2em]"
                                >
                                    {slide.subtitle}
                                </motion.span>
                                <h1 className="text-3xl sm:text-5xl md:text-8xl font-black text-white mb-8 leading-tight drop-shadow-2xl">
                                    {slide.title}
                                </h1>
                                <p className="text-base md:text-xl text-gray-200 mb-12 leading-loose font-medium drop-shadow-lg">
                                    {slide.description_ar || 'اكتشف عبق الجوهر الشرقي في تشكيلتنا الفاخرة التي تحمل سحر التاريخ وروح العصر.'}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <Link
                                        to={slide.button_link || '/products'}
                                        className="bg-gold-500 hover:bg-gold-600 text-black px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 font-black shadow-2xl shadow-gold-500/20 text-center text-lg inline-block"
                                    >
                                        {slide.button_text || 'تسوق المجموعة'}
                                    </Link>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Navigation Indicators Only (Arrows Removed) */}
            {slides.length > 1 && (
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 z-30 flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrent(idx)}
                            className={`h-1.5 transition-all rounded-full ${idx === current ? 'w-12 bg-gold-500' : 'w-4 bg-white/30'}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Hero;

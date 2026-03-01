import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cmsApi } from '../../services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

const Hero = () => {
    const [slides, setSlides] = useState([]);
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

    if (loading || slides.length === 0) return (
        <section className="relative h-screen bg-cream-50 dark:bg-dark-800 animate-pulse flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-text-secondary dark:text-gold-400 font-bold">جاري تحميل العروض...</p>
            </div>
        </section>
    );

    return (
        <section className="relative h-[100svh] overflow-hidden bg-black font-tajawal">
            <Swiper
                modules={[Autoplay, EffectFade, Pagination]}
                effect="fade"
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{
                    clickable: true,
                    renderBullet: (index, className) => {
                        return `<span class="${className} !h-1 transition-all !rounded-full !bg-white/30 active:!bg-gold-500 !w-6 hover:!w-12"></span>`;
                    }
                }}
                loop={true}
                className="h-full w-full"
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={slide.id || index} className="relative overflow-hidden">
                        {({ isActive }) => (
                            <>
                                {/* Background Images (Two for One logic) */}
                                <div className="absolute inset-0">
                                    <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent z-10"></div>
                                    <div className="absolute inset-0 bg-black/20 z-10"></div>

                                    {/* Desktop Image */}
                                    <img
                                        src={slide.image}
                                        className="hidden md:block w-full h-full object-cover object-center"
                                        alt={slide.title}
                                    />

                                    {/* Mobile Image (Fallback to Desktop) */}
                                    <img
                                        src={slide.image_mobile || slide.image}
                                        className="md:hidden w-full h-full object-cover object-center"
                                        alt={slide.title}
                                    />
                                </div>

                                {/* Content Overlay */}
                                <div className="container h-full relative z-20">
                                    <div className="flex h-full items-center justify-end">
                                        <div className="w-full max-w-3xl text-right">
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 50 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.8, ease: "easeOut" }}
                                                    >
                                                        <motion.span
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                            className="bg-gold-500 text-black px-4 py-1.5 rounded-lg text-xs font-black mb-6 inline-block uppercase tracking-[0.2em]"
                                                        >
                                                            {slide.subtitle}
                                                        </motion.span>

                                                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 leading-[1.1] drop-shadow-2xl">
                                                            {slide.title}
                                                        </h1>

                                                        {slide.description_ar && (
                                                            <p className="text-lg md:text-2xl text-gray-200 mb-10 leading-loose font-medium max-w-2xl ml-auto drop-shadow-lg">
                                                                {slide.description_ar}
                                                            </p>
                                                        )}

                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: 0.4 }}
                                                            className="flex flex-wrap items-center justify-end gap-6"
                                                        >
                                                            <Link
                                                                to={slide.button_link || '/products'}
                                                                className="group relative bg-gold-500 hover:bg-gold-600 text-black px-8 py-4 md:px-12 md:py-5 rounded-2xl transition-all duration-300 font-black shadow-2xl shadow-gold-500/20 text-center text-lg inline-block overflow-hidden"
                                                            >
                                                                <span className="relative z-10">{slide.button_text || 'تسوق المجموعة'}</span>
                                                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                                            </Link>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Pagination Style Overrides */}
            <style>{`
                .swiper-pagination-bullet {
                    margin-bottom: 2rem !important;
                }
                .swiper-pagination-bullet-active {
                    background: #d4af37 !important;
                    width: 3rem !important;
                }
            `}</style>
        </section>
    );
};

export default Hero;

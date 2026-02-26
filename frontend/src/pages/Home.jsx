import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import ProductCard from '../components/products/ProductCard';
import { productsApi, cmsApi } from '../services/api';
import { ChevronLeft, Sparkles, TrendingUp, Package, ShieldCheck, Truck, Gift, Users, Award, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
// Swiper for the Best Sellers slider
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white dark:bg-dark-700 p-6 md:p-10 rounded-2xl md:rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm hover:shadow-xl transition-all group">
        <div className="w-16 h-16 bg-gold-50 dark:bg-dark-600 rounded-2xl flex items-center justify-center text-gold-500 mb-8 group-hover:scale-110 group-hover:bg-gold-500 group-hover:text-white transition-all">
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-black mb-4 text-text-primary dark:text-cream-50">{title}</h3>
        <p className="text-text-secondary dark:text-gold-400/70 leading-relaxed">{desc}</p>
    </div>
);

const Home = () => {
    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [categories, setCategories] = useState([]);
    const [hpcSections, setHpcSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, bannerRes, catRes, hpcRes] = await Promise.all([
                    productsApi.getAll({ is_featured: true }),
                    cmsApi.getBanners(),
                    productsApi.getCategories(),
                    cmsApi.getHPC()
                ]);
                setProducts(prodRes.data.results || prodRes.data || []);
                setBanners(bannerRes.data.results || bannerRes.data || []);
                setCategories(catRes.data.results || catRes.data || []);

                // Sort HPC sections by order
                const sortedHpc = (hpcRes.data.results || hpcRes.data || []).sort((a, b) => a.order - b.order);
                setHpcSections(sortedHpc);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const sectionRenderers = {
        ramadan: () => (
            <section key="ramadan" className="py-20 relative overflow-hidden bg-gradient-to-b from-dark-900 via-indigo-950/20 to-white dark:to-dark-900 transition-colors duration-500">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c5a572 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="relative mb-10">
                            <div className="flex justify-center gap-12 text-gold-500/40 mb-8">
                                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                                    <svg width="40" height="64" viewBox="0 0 40 64" fill="currentColor">
                                        <path d="M20 0l4 8h-8l4-8zm0 8c-8 0-12 6-12 14s4 14 12 14 12-6 12-14-4-14-12-14zm0 24c-4 0-6-4-6-10s2-10 6-10 6 4 6 10-2 10-6 10zm0 12l-4 8h8l-4-8zm0 8l-6 12h12l-6-12z" />
                                    </svg>
                                </motion.div>
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }} className="text-gold-600">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2c5.523 0 10 4.477 10 10 0 2.21-.717 4.25-1.933 5.908-.948-3.957-4.505-6.908-8.734-6.908-1.554 0-3.003.397-4.266 1.092C7.545 10.993 11 8 11 8s-1.5 2.5-3 3c-.5.167-1 .333-1.5.5C4.851 12.015 4 13.91 4 16c0 4.418 3.582 8 8 8 5.523 0 10-4.477 10-10S17.523 2 12 2z" transform="rotate(-15 12 12)" />
                                    </svg>
                                </motion.div>
                                <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}>
                                    <svg width="40" height="64" viewBox="0 0 40 64" fill="currentColor">
                                        <path d="M20 0l4 8h-8l4-8zm0 8c-8 0-12 6-12 14s4 14 12 14 12-6 12-14-4-14-12-14zm0 24c-4 0-6-4-6-10s2-10 6-10 6 4 6 10-2 10-6 10zm0 12l-4 8h8l-4-8zm0 8l-6 12h12l-6-12z" />
                                    </svg>
                                </motion.div>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-gold-400 to-gold-700 mb-6 font-tajawal">رمضان كريم</h2>
                            <p className="text-lg md:text-2xl text-text-secondary dark:text-gold-400 font-bold tracking-wide">أجواء رمضانية فاخرة مع أرقى العطور الشرقية</p>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} viewport={{ once: true }}>
                            <Link to="/products" className="bg-dark-900 dark:bg-gold-500 text-gold-500 dark:text-black px-10 py-4 rounded-2xl font-black hover:scale-105 transition-all shadow-xl shadow-gold-500/10">اكتشف عطور رمضان</Link>
                        </motion.div>
                    </div>
                </div>
            </section>
        ),
        features: () => (
            <section key="features" className="py-24 bg-cream-50 dark:bg-dark-800">
                <div className="container mx-auto px-4">
                    <div className="row g-4">
                        <div className="col-12 col-md-6 col-lg-3">
                            <FeatureCard icon={Sparkles} title="جودة استثنائية" desc="نستخدم أندر المكونات الطبيعية والزيوت العطرية النقية لضمان ثبات عالي وجاذبية لا تقاوم." />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <FeatureCard icon={ShieldCheck} title="أصالة مضمونة" desc="كافة عطورنا أصلية 100% ومن مصادرها الرسمية، نهتم بكل تفصيلة لتصلك الجودة كما هي." />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <FeatureCard icon={Truck} title="توصيل سريع" desc="خدمة شحن موثوقة تغطي كافة أنحاء ليبيا، مع تغليف فاخر يحمي منتجاتك ويجمل هديتك." />
                        </div>
                        <div className="col-12 col-md-6 col-lg-3">
                            <FeatureCard icon={Gift} title="تغليف فاخر" desc="نغلف كل طلب بعناية فائقة بتغليف أنيق يليق بقيمة العطر، مثالي كهدية مميزة لمن تحب." />
                        </div>
                    </div>
                </div>
            </section>
        ),
        categories: () => categories.length > 0 && (
            <section key="categories" className="py-24 bg-white dark:bg-dark-900 border-t border-gold-50 dark:border-dark-800 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-6xl font-black text-text-primary dark:text-cream-50 mb-4">تسوق حسب الفئات</h2>
                        <p className="text-text-secondary dark:text-gold-400 text-lg">اكتشف مجموعاتنا الحصرية المصنفة بعناية لتناسب ذوقك الرفيع.</p>
                    </div>
                    <div className="row g-4 justify-center">
                        {categories.map((cat, idx) => (
                            <motion.div
                                key={cat.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="col-6 col-md-4 col-lg-3"
                            >
                                <Link to={`/products?category=${cat.id}`} className="group relative block aspect-[3/4] rounded-3xl overflow-hidden shadow-lg border border-gold-100 dark:border-dark-700">
                                    <img src={cat.image || 'https://placehold.co/400x500/F4F1EA/D4AF37?text=' + cat.name_ar} alt={cat.name_ar} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center p-6 text-center">
                                        <h3 className="text-white text-xl md:text-2xl font-black group-hover:-translate-y-2 transition-transform">{cat.name_ar}</h3>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        ),
        best_sellers: () => products.filter(p => p.is_featured).length > 0 && (
            <section key="best_sellers" className="py-24 bg-cream-50 dark:bg-dark-800 overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black mb-3">
                                <Award size={24} />
                                <span className="uppercase tracking-widest text-sm">Top Rated</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-text-primary dark:text-cream-50">الأكثر مبيعاً</h2>
                        </div>
                        <Link to="/products" className="bg-white dark:bg-dark-700 text-gold-600 dark:text-gold-400 px-8 py-3 rounded-2xl font-black flex items-center gap-2 border border-gold-100 dark:border-dark-600 hover:bg-gold-500 hover:text-white transition-all shadow-lg">إكتشف الكل</Link>
                    </div>

                    <Swiper
                        modules={[Autoplay, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1.5}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 2.5 },
                            1024: { slidesPerView: 4.2 }
                        }}
                        className="products-swiper !pb-12"
                    >
                        {products.filter(p => p.is_featured).map((product) => (
                            <SwiperSlide key={product.id}>
                                <ProductCard product={product} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </section>
        ),
        featured_products: () => (
            <section key="featured_products" className="py-24 md:py-32 dark:bg-dark-900 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4 border-b border-gold-100 dark:border-dark-700 pb-8">
                        <div>
                            <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black mb-4">
                                <TrendingUp size={20} />
                                <span className="uppercase tracking-widest text-xs">Best Sellers</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black text-text-primary dark:text-cream-50">عطور مختارة لك</h2>
                        </div>
                        <Link to="/products" className="text-gold-600 dark:text-gold-400 font-black flex items-center gap-2 group hover:-translate-x-2 transition-all">تصفح الكل <ChevronLeft size={20} /></Link>
                    </div>
                    <div className="row g-3 g-md-4">
                        {loading ? (
                            [1, 2, 3, 4].map(i => <div key={i} className="col-6 col-lg-3"><div className="aspect-[3/4] bg-cream-50 dark:bg-dark-700 animate-pulse rounded-2xl md:rounded-[40px]"></div></div>)
                        ) : (
                            products.slice(0, 8).map((product, idx) => (
                                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} viewport={{ once: true }} className="col-6 col-lg-3">
                                    <ProductCard product={product} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        ),
        banner: () => banners.length > 0 && (
            <section key="banner" className="py-16 dark:bg-dark-800 bg-cream-50">
                <div className="container mx-auto px-4">
                    <div className="relative aspect-[21/9] md:aspect-[3/1] min-h-[300px] rounded-3xl md:rounded-[60px] overflow-hidden group shadow-2xl">
                        <img src={banners[0].image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center text-center p-8">
                            <div className="max-w-2xl text-white">
                                <motion.h2 initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="text-4xl md:text-7xl font-black mb-8 leading-tight drop-shadow-lg">{banners[0].title}</motion.h2>
                                <p className="text-xl opacity-90 mb-10 leading-relaxed font-bold">{banners[0].subtitle}</p>
                                <Link to={banners[0].button_link || '/products'} className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black hover:bg-gold-500 hover:text-white transition-all shadow-2xl transform hover:scale-105">اكتشف الآن</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        ),
        stats: () => (
            <section key="stats" className="py-24 bg-dark-900 text-white overflow-hidden relative">
                <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #c5a572 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="row g-5 text-center">
                        <div className="col-6 col-md-3">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                                <Users className="mx-auto text-gold-500 mb-6" size={48} />
                                <h4 className="text-4xl md:text-6xl font-black text-gold-400 mb-2">15K+</h4>
                                <p className="text-gray-400 font-bold">عميل سعيد</p>
                            </motion.div>
                        </div>
                        <div className="col-6 col-md-3">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                                <Package className="mx-auto text-gold-500 mb-6" size={48} />
                                <h4 className="text-4xl md:text-6xl font-black text-gold-400 mb-2">500+</h4>
                                <p className="text-gray-400 font-bold">عطر حصري</p>
                            </motion.div>
                        </div>
                        <div className="col-6 col-md-3">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                                <Award className="mx-auto text-gold-500 mb-6" size={48} />
                                <h4 className="text-4xl md:text-6xl font-black text-gold-400 mb-2">10+</h4>
                                <p className="text-gray-400 font-bold">سنوات خبرة</p>
                            </motion.div>
                        </div>
                        <div className="col-6 col-md-3">
                            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
                                <Clock className="mx-auto text-gold-500 mb-6" size={48} />
                                <h4 className="text-4xl md:text-6xl font-black text-gold-400 mb-2">24/7</h4>
                                <p className="text-gray-400 font-bold">خدمة عملاء</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        ),
        vision: () => (
            <section key="vision" className="py-32 bg-dark-800 text-white overflow-hidden relative border-t border-white/5">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[100px] border-gold-500 rounded-full"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl lg:text-7xl font-black mb-12 italic opacity-10">Art of Perfumery</h2>
                    <div className="max-w-3xl mx-auto space-y-10">
                        <p className="text-2xl md:text-4xl lg:text-5xl font-black leading-tight text-gold-400">&quot;العطر هو اللغة التي لا تحتاج إلى كلمات لتخبر العالم من أنت.&quot;</p>
                        <p className="text-xl text-gray-400 leading-loose">في بوتيك المصطفى، نؤمن أن العطر ليس مجرد منتج، بل هو رحلة عبر الزمن والمكان، تجسد أرقى معاني الفخامة والجمال العربي الأصيل.</p>
                        <div className="pt-10 flex flex-wrap justify-center gap-12 border-t border-white/10 opacity-60">
                            {['طرابلس', 'بنغازي', 'مصراتة', 'سبها', 'الزاوية'].map(city => (
                                <span key={city} className="text-sm font-black tracking-[0.3em] uppercase">{city}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        )
    };

    return (
        <div className="bg-white dark:bg-dark-900 transition-colors duration-300">
            <Hero />

            {hpcSections.map(section => {
                if (!section.is_active) return null;
                const renderer = sectionRenderers[section.key];
                return renderer ? renderer() : null;
            })}
        </div>
    );
};

export default Home;

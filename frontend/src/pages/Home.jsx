import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/home/Hero';
import ProductCard from '../components/products/ProductCard';
import { productsApi, cmsApi } from '../services/api';
import { ChevronLeft, Sparkles, TrendingUp, Package, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon: Icon, title, desc }) => (
    <div className="bg-white dark:bg-dark-700 p-10 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm hover:shadow-xl transition-all group">
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, bannerRes] = await Promise.all([
                    productsApi.getAll({ is_featured: true }),
                    cmsApi.getBanners()
                ]);
                setProducts(prodRes.data.results || prodRes.data || []);
                setBanners(bannerRes.data.results || bannerRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="bg-white dark:bg-dark-900 transition-colors duration-300">
            <Hero />

            {/* Features */}
            <section className="py-24 bg-cream-50 dark:bg-dark-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <FeatureCard
                            icon={Sparkles}
                            title="جودة استثنائية"
                            desc="نستخدم أندر المكونات الطبيعية والزيوت العطرية النقية لضمان ثبات عالي وجاذبية لا تقاوم."
                        />
                        <FeatureCard
                            icon={ShieldCheck}
                            title="أصالة مضمونة"
                            desc="كافة عطورنا أصلية 100% ومن مصادرها الرسمية، نهتم بكل تفصيلة لتصلك الجودة كما هي."
                        />
                        <FeatureCard
                            icon={Truck}
                            title="توصيل سريع"
                            desc="خدمة شحن موثوقة تغطي كافة أنحاء ليبيا، مع تغليف فاخر يحمي منتجاتك ويجمل هديتك."
                        />
                        <FeatureCard
                            icon={Package}
                            title="عينات مجانية"
                            desc="نرفق عينات مجانية مع كل طلب لتكتشف روائحنا الجديدة وتجد عطرك القادم بكل سهولة."
                        />
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-32 dark:bg-dark-900">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black mb-4">
                                <TrendingUp size={20} />
                                <span className="uppercase tracking-widest text-xs">Best Sellers</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-text-primary dark:text-cream-50">العطور الأكثر طلباً</h2>
                        </div>
                        <Link
                            to="/products"
                            className="text-gold-600 dark:text-gold-400 font-black flex items-center gap-2 group border-b-2 border-gold-100 dark:border-dark-600 pb-2 hover:border-gold-500 transition-all"
                        >
                            اكتشف المجموعة الكاملة
                            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="aspect-[3/4] bg-cream-50 dark:bg-dark-700 animate-pulse rounded-[40px]"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                            {products.map((product, idx) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Banner Section */}
            {banners.length > 0 && (
                <section className="py-20 dark:bg-dark-800">
                    <div className="container mx-auto px-4">
                        <div className="relative h-[500px] rounded-[60px] overflow-hidden group">
                            <img
                                src={banners[0].image}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                alt=""
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center text-center p-8">
                                <div className="max-w-2xl text-white">
                                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">{banners[0].title}</h2>
                                    <p className="text-xl opacity-90 mb-10 leading-relaxed">{banners[0].subtitle}</p>
                                    <Link
                                        to={banners[0].button_link || '/products'}
                                        className="inline-block bg-white text-black px-12 py-5 rounded-2xl font-black hover:bg-gold-500 transition-all shadow-2xl"
                                    >
                                        اكتشف المزيد
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Vision / About section */}
            <section className="py-32 bg-dark-800 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border-[100px] border-gold-500 rounded-full"></div>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h2 className="text-5xl md:text-7xl font-black mb-12 italic opacity-20">Art of Perfumery</h2>
                    <div className="max-w-3xl mx-auto space-y-10">
                        <p className="text-3xl md:text-5xl font-black leading-tight text-gold-400">
                            "العطر هو اللغة التي لا تحتاج إلى كلمات لتخبر العالم من أنت."
                        </p>
                        <p className="text-xl text-gray-400 leading-loose">
                            في بوتيك المصطفى، نؤمن أن العطر ليس مجرد منتج، بل هو رحلة عبر الزمن والمكان، تجسد أرقى معاني الفخامة والجمال العربي الأصيل.
                        </p>
                        <div className="pt-10 flex flex-wrap justify-center gap-12 border-t border-white/10 opacity-60">
                            {['طرابلس', 'بنغازي', 'مصراتة', 'سبها', 'الزاوية'].map(city => (
                                <span key={city} className="text-sm font-bold tracking-[0.3em] uppercase">{city}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

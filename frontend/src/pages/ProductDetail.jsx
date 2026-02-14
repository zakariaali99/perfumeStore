import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsApi } from '../services/api';
import useCartStore from '../store/cartStore';
import ProductCard from '../components/products/ProductCard';
import {
    ShoppingCart,
    ChevronLeft,
    Share2,
    Heart,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Minus,
    Plus,
    Sparkles,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore(state => state.addItem);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await productsApi.getDetail(slug);
                const data = res.data;
                setProduct(data);
                setSelectedImage(data.main_image);
                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                }

                const relatedRes = await productsApi.getRelated(slug);
                setRelatedProducts(relatedRes.data);
            } catch (error) {
                console.error("Error fetching product", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    if (loading) return (
        <div className="container py-40 text-center">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary dark:text-gold-400">جاري تحميل العطر...</p>
        </div>
    );

    if (!product) return (
        <div className="container py-40 text-center">
            <h2 className="text-2xl font-bold mb-4 text-text-primary dark:text-cream-50">العطر غير موجود</h2>
            <Link to="/products" className="text-gold-600 dark:text-gold-400 font-bold hover:underline">العودة لجميع العطور</Link>
        </div>
    );

    const handleAddToCart = () => {
        if (!selectedVariant) return;
        addItem(selectedVariant.id, quantity);
        toast.success('تمت إضافة العطر للسلة');
    };

    const notesByType = (type) => product.notes?.filter(n => n.note_type === type) || [];

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 space-x-reverse text-sm mb-8 text-text-secondary dark:text-gold-400">
                    <Link to="/" className="hover:text-gold-600 transition-colors">الرئيسية</Link>
                    <ChevronLeft size={16} />
                    <Link to="/products" className="hover:text-gold-600 transition-colors">العطور</Link>
                    <ChevronLeft size={16} />
                    <span className="text-text-primary dark:text-cream-50 font-medium">{product.name_ar}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left: Images */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-white dark:bg-dark-700 rounded-[40px] overflow-hidden border border-gold-100/50 dark:border-dark-600 shadow-sm relative group">
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={selectedImage}
                                alt={product.name_ar}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-6 left-6 space-y-3">
                                <button className="p-4 bg-white/80 dark:bg-dark-600/80 backdrop-blur-md rounded-full text-text-primary dark:text-cream-50 hover:bg-gold-500 hover:text-white transition-all shadow-lg">
                                    <Heart size={20} />
                                </button>
                                <button className="p-4 bg-white/80 dark:bg-dark-600/80 backdrop-blur-md rounded-full text-text-primary dark:text-cream-50 hover:bg-gold-500 hover:text-white transition-all shadow-lg">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Gallery Thumbnails */}
                        {product.images?.length > 0 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedImage(product.main_image)}
                                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === product.main_image ? 'border-gold-500 shadow-md scale-105' : 'border-transparent hover:border-gold-200'}`}
                                >
                                    <img src={product.main_image} className="w-full h-full object-cover" />
                                </button>
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(img.image)}
                                        className={`w-24 h-24 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${selectedImage === img.image ? 'border-gold-500 shadow-md scale-105' : 'border-transparent hover:border-gold-200'}`}
                                    >
                                        <img src={img.image} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Info */}
                    <div className="space-y-10">
                        <div>
                            <div className="flex items-center space-x-2 space-x-reverse mb-4">
                                <span className="text-gold-600 dark:text-gold-400 font-black tracking-widest uppercase text-xs bg-gold-50 dark:bg-dark-700 px-3 py-1.5 rounded-lg border border-gold-100 dark:border-dark-600">{product.brand?.name_ar}</span>
                                <span className="text-text-secondary dark:text-gold-400 text-sm font-bold">{product.category?.name_ar}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-text-primary dark:text-cream-50 mb-6 leading-tight">{product.name_ar}</h1>

                            <div className="flex items-center space-x-4 space-x-reverse mb-8 p-4 bg-white/50 dark:bg-dark-700 rounded-2xl border border-gold-50 dark:border-dark-600">
                                <div className="flex text-gold-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill={i <= 4 ? "currentColor" : "none"} />)}
                                </div>
                                <span className="text-sm text-text-secondary dark:text-gold-400 font-bold">4.8/5 بناءً على 128 تقييم حقيقي</span>
                            </div>

                            <p className="text-xl text-text-secondary dark:text-gold-400/80 leading-loose">
                                {product.description}
                            </p>
                        </div>

                        {/* Variants Selection */}
                        <div className="space-y-6">
                            <h3 className="font-black text-xl flex items-center gap-2 text-text-primary dark:text-cream-50">
                                <LayoutGrid size={22} className="text-gold-500" />
                                اختر الحجم المثالي:
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {product.variants?.map(variant => (
                                    <button
                                        key={variant.id}
                                        onClick={() => setSelectedVariant(variant)}
                                        className={`px-6 py-5 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${selectedVariant?.id === variant.id ? 'border-gold-500 bg-white dark:bg-dark-700 shadow-xl shadow-gold-500/10' : 'border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800 hover:border-gold-300'}`}
                                    >
                                        <span className={`text-2xl font-black ${selectedVariant?.id === variant.id ? 'text-gold-700 dark:text-gold-400' : 'text-text-primary dark:text-cream-50'}`}>{variant.size_ml} مل</span>
                                        <span className="text-sm font-bold text-text-secondary dark:text-gold-400">{variant.current_price} د.ل</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price & Add to Cart */}
                        <div className="p-10 bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50 dark:bg-gold-500/10 rounded-bl-[100px] -z-10 opacity-40"></div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-text-secondary dark:text-gold-400 text-sm font-bold block mb-2">القيمة الإجمالية</span>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-5xl font-black text-gold-700 dark:text-gold-400 font-poppins">{selectedVariant?.current_price} د.ل</span>
                                        {selectedVariant?.sale_price && (
                                            <span className="text-xl text-text-muted dark:text-gold-400/50 line-through font-poppins">{selectedVariant.price} د.ل</span>
                                        )}
                                    </div>
                                </div>

                                <div className="text-left">
                                    {selectedVariant?.stock_quantity > 0 ? (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-2xl text-xs font-black ring-1 ring-green-100 dark:ring-green-900">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            متوفر الآن
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-2xl text-xs font-black ring-1 ring-red-100 dark:ring-red-900">تحت الطلب</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="flex items-center bg-cream-50 dark:bg-dark-600 rounded-[20px] p-2 border border-gold-100 dark:border-dark-600 w-full sm:w-auto">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-4 hover:bg-white dark:hover:bg-dark-700 rounded-xl transition-all text-gold-700 dark:text-gold-400"
                                    >
                                        <Minus size={20} />
                                    </button>
                                    <span className="w-16 text-center text-2xl font-black font-poppins text-text-primary dark:text-cream-50">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-4 hover:bg-white dark:hover:bg-dark-700 rounded-xl transition-all text-gold-700 dark:text-gold-400"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <button
                                    disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
                                    onClick={handleAddToCart}
                                    className="flex-1 w-full bg-gold-600 hover:bg-gold-700 disabled:bg-gray-200 dark:disabled:bg-dark-600 text-white font-black py-5 rounded-[24px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-xl shadow-gold-600/30 text-xl"
                                >
                                    <ShoppingCart size={28} />
                                    تأكيد الإضافة للسلة
                                </button>
                            </div>
                        </div>

                        {/* Pyramid */}
                        <div className="bg-dark-800 text-white p-12 rounded-[48px] relative overflow-hidden shadow-2xl">
                            <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl"></div>
                            <h3 className="text-3xl font-black mb-12 text-center text-gold-400 flex items-center justify-center gap-3">
                                <Sparkles size={24} />
                                الهرم العطري والمكونات
                            </h3>

                            <div className="space-y-16 max-w-md mx-auto relative">
                                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-gold-500/50 via-gold-500/20 to-transparent"></div>

                                <div className="text-center relative z-10">
                                    <div className="bg-gold-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">Top Notes</div>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {notesByType('top').length > 0 ? notesByType('top').map((n, i) => (
                                            <span key={i} className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl text-sm border border-white/10 hover:bg-gold-500/20 transition-all font-bold">{n.name_ar}</span>
                                        )) : <span className="opacity-40 italic">مكونات بحرية وحمضيات فواحة</span>}
                                    </div>
                                </div>

                                <div className="text-center relative z-10">
                                    <div className="bg-gold-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">Heart Notes</div>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {notesByType('heart').length > 0 ? notesByType('heart').map((n, i) => (
                                            <span key={i} className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl text-sm border border-white/10 hover:bg-gold-500/20 transition-all font-bold">{n.name_ar}</span>
                                        )) : <span className="opacity-40 italic">خشب الصندل والياسمين</span>}
                                    </div>
                                </div>

                                <div className="text-center relative z-10">
                                    <div className="bg-gold-500 text-black px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 inline-block">Base Notes</div>
                                    <div className="flex flex-wrap justify-center gap-3">
                                        {notesByType('base').length > 0 ? notesByType('base').map((n, i) => (
                                            <span key={i} className="bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl text-sm border border-white/10 hover:bg-gold-500/20 transition-all font-bold">{n.name_ar}</span>
                                        )) : <span className="opacity-40 italic">المسك الأبيض والعود المعتق</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
                            {[
                                { icon: Truck, title: 'شحن لكافة أنحاء ليبيا', desc: 'توصيل لباب المنزل' },
                                { icon: ShieldCheck, title: 'ضمان الجودة', desc: 'عطور أصلية ومضمونة' },
                                { icon: RotateCcw, title: 'سياسة الاستبدال', desc: 'مرونة في التعامل' },
                            ].map((f, i) => (
                                <div key={i} className="flex flex-col items-center text-center p-8 bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                                    <div className="p-4 bg-gold-50 dark:bg-dark-600 rounded-2xl mb-4">
                                        <f.icon className="text-gold-600 dark:text-gold-400" size={28} />
                                    </div>
                                    <h4 className="font-black text-sm mb-1 text-text-primary dark:text-cream-50">{f.title}</h4>
                                    <p className="text-[10px] text-text-secondary dark:text-gold-400 font-bold">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-32 pt-20 border-t border-gold-100 dark:border-dark-600">
                        <div className="flex items-center justify-between mb-12">
                            <div>
                                <h2 className="text-4xl font-black text-text-primary dark:text-cream-50 mb-2">عطور قد تنال إعجابك</h2>
                                <p className="text-text-secondary dark:text-gold-400 font-bold">بناءً على تفضيلاتك في هذا العطر</p>
                            </div>
                            <Link to="/products" className="text-gold-600 dark:text-gold-400 font-black flex items-center gap-2 group">
                                عرض الكل
                                <ChevronLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(p => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;

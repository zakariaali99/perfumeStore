import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import {
    Trash2,
    Minus,
    Plus,
    ArrowRight,
    ShoppingBag,
    Ticket,
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { marketingApi } from '../services/api';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { cart, updateItem, removeItem, loading, applyCoupon, coupon } = useCartStore();
    const [couponCode, setCouponCode] = useState('');
    const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

    // Store local UI discount for display in Cart page, but also sync with global store
    const [localDiscount, setLocalDiscount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // When the component mounts, if there's a coupon in the global store,
        // initialize localDiscount with its calculated_discount.
        if (coupon && coupon.calculated_discount) {
            setLocalDiscount(coupon.calculated_discount);
            setCouponCode(coupon.code);
        }
    }, [coupon]); // Depend on coupon from store to update local state if it changes externally

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setIsValidatingCoupon(true);
        try {
            const res = await marketingApi.validateCoupon(couponCode, cart.total_amount);
            if (res.data.valid) {
                toast.success('تم تطبيق الكوبون بنجاح');
                let discount = 0;
                if (res.data.discount_type === 'percentage') {
                    discount = (cart.total_amount * res.data.discount_value) / 100;
                    if (res.data.max_discount) {
                        discount = Math.min(discount, res.data.max_discount);
                    }
                } else {
                    discount = res.data.discount_value;
                }
                setLocalDiscount(discount);

                // Save to global store for Checkout
                applyCoupon({
                    code: couponCode,
                    discount_value: res.data.discount_value,
                    discount_type: res.data.discount_type,
                    calculated_discount: discount
                });
            } else {
                toast.error(res.data.message || 'كوبون غير صالح');
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'خطأ في التحقق من الكوبون';
            toast.error(msg);
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    if (loading && !cart.items.length) return (
        <div className="container py-40 text-center">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary dark:text-gold-400">جاري تحميل السلة...</p>
        </div>
    );

    if (cart.items.length === 0) return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-40 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 text-center max-w-lg">
                <div className="w-24 h-24 bg-gold-50 dark:bg-dark-700 rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag size={40} className="text-gold-500" />
                </div>
                <h2 className="text-3xl font-black mb-4 text-text-primary dark:text-cream-50">سلتك فارغة</h2>
                <p className="text-text-secondary dark:text-gold-400 mb-10">تبدو سلتك فارغة حالياً. اكتشف مجموعتنا المميزة من العطور وأضف ما ينال إعجابك.</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 bg-gold-500 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-gold-500/20 hover:bg-gold-600 transition-all"
                >
                    <ArrowRight size={20} />
                    تسوق الآن
                </Link>
            </div>
        </div>
    );

    const subtotal = cart.total_amount;
    const total = subtotal - localDiscount;

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-black mb-10 text-text-primary dark:text-cream-50">سلة التسوق</h1>

                <div className="row g-4">

                    {/* Items List */}
                    <div className="col-12 col-lg-8 space-y-4">
                        <AnimatePresence>
                            {cart.items.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white dark:bg-dark-700 p-4 md:p-6 rounded-3xl border border-gold-100 dark:border-dark-600 flex gap-4 md:gap-6 items-center"
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-cream-50 dark:bg-dark-600 flex-shrink-0">
                                        <img src={item.variant.product_main_image} alt="" className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-text-primary dark:text-cream-50 truncate">{item.variant.product_name_ar}</h3>
                                                <p className="text-sm text-text-secondary dark:text-gold-400">{item.variant.size_ml} مل</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-text-muted dark:text-gold-400 hover:text-red-500 p-2 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap justify-between items-center gap-4">
                                            <div className="flex items-center border border-gold-100 dark:border-dark-600 rounded-xl p-1 bg-cream-50 dark:bg-dark-600">
                                                <button
                                                    onClick={() => updateItem(item.id, Math.max(1, item.quantity - 1))}
                                                    className="p-1.5 hover:bg-white dark:hover:bg-dark-700 rounded-lg transition-colors text-gold-700 dark:text-gold-400 disabled:opacity-30"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-bold text-text-primary dark:text-cream-50">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateItem(item.id, item.quantity + 1)}
                                                    className="p-1.5 hover:bg-white dark:hover:bg-dark-700 rounded-lg transition-colors text-gold-700 dark:text-gold-400"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                            <div className="text-lg font-bold text-gold-600 dark:text-gold-400 font-poppins">{item.total_price} د.ل</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="col-12 col-lg-4 space-y-6">
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm sticky top-28">
                            <h3 className="text-xl font-bold mb-6 text-text-primary dark:text-cream-50">ملخص الطلب</h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-text-secondary dark:text-gold-400">
                                    <span>المجموع الفرعي</span>
                                    <span className="font-poppins">{subtotal} د.ل</span>
                                </div>
                                {localDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                        <span>خصم الكوبون</span>
                                        <span className="font-poppins">-{localDiscount.toFixed(2)} د.ل</span>
                                    </div>
                                )}
                                <div className="pt-4 border-t border-gold-100 dark:border-dark-600 flex justify-between items-center text-xl font-black">
                                    <span className="text-text-primary dark:text-cream-50">الإجمالي</span>
                                    <span className="text-gold-700 dark:text-gold-400 font-poppins">{total.toFixed(2)} د.ل</span>
                                </div>
                            </div>

                            {/* Coupon Section */}
                            <div className="mb-8">
                                <div className="flex gap-2 p-1.5 bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 rounded-2xl">
                                    <input
                                        type="text"
                                        placeholder="كود الخصم"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="bg-transparent flex-1 px-3 focus:outline-none text-sm text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || isValidatingCoupon}
                                        className="bg-gold-500 text-white px-4 py-2 rounded-xl text-sm font-bold disabled:bg-gray-300 dark:disabled:bg-dark-600"
                                    >
                                        {isValidatingCoupon ? '...' : 'تطبيق'}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-gold-500 hover:bg-gold-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-gold-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                إتمام الطلب
                                <ChevronLeft size={20} />
                            </button>

                            <Link
                                to="/products"
                                className="block text-center mt-6 text-sm text-text-secondary dark:text-gold-400 hover:text-gold-600 underline"
                            >
                                مواصلة التسوق
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;

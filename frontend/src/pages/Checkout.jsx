import { useState, useEffect } from 'react';
import useCartStore from '../store/cartStore';
import { ordersApi } from '../services/api';
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    Truck,
    CreditCard,
    Info,
    MapPin,
    ShoppingBag,
    User,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';
import { marketingApi } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
    const { cart, clearCart, coupon, applyCoupon, removeCoupon } = useCartStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Order Form State
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        birth_day: '',
        birth_month: '',
        birth_year: '',
        city: '',
        area: '',
        address: '',
        notes: ''
    });

    const discountAmount = coupon ? coupon.calculated_discount : 0;
    const finalTotal = Math.max(0, cart.total_amount - discountAmount);

    useEffect(() => {
        if (!cart.items || cart.items.length === 0) {
            navigate('/cart');
        }
    }, [cart, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setApplyingCoupon(true);
        try {
            const res = await marketingApi.validateCoupon(couponCode, cart.total_amount);
            const couponData = res.data;

            // Calculate discount
            let calculated_discount = 0;
            if (couponData.discount_type === 'percentage') {
                calculated_discount = (cart.total_amount * couponData.discount_value) / 100;
                if (couponData.max_discount) {
                    calculated_discount = Math.min(calculated_discount, couponData.max_discount);
                }
            } else {
                calculated_discount = couponData.discount_value;
            }

            applyCoupon({
                code: couponCode,
                discount_type: couponData.discount_type,
                discount_value: couponData.discount_value,
                calculated_discount
            });
            toast.success('تم تطبيق الكوبون بنجاح');
            setCouponCode('');
        } catch (error) {
            console.error('Coupon error', error);
            const msg = error.response?.data?.message || 'كود الخصم غير صحيح';
            toast.error(msg);
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const orderData = {
                ...formData,
                items: cart.items.map(item => ({
                    variant_id: item.variant.id,
                    quantity: item.quantity
                })),
                coupon_code: coupon ? coupon.code : null
            };

            const res = await ordersApi.create(orderData);
            clearCart();
            toast.success('تم استلام طلبك بنجاح!');
            navigate(`/track?order_number=${res.data.order_number}`);
        } catch (error) {
            console.error('Order error', error);
            const msg = error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إتمام الطلب';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-32 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="max-w-6xl mx-auto row g-4 g-lg-5 align-items-start">

                    {/* Checkout Form */}
                    <div className="col-12 col-lg-7 space-y-8">
                        {/* Steps Indicator */}
                        <div className="flex items-center gap-4 mb-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-2 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-gold-500' : 'bg-gray-200 dark:bg-dark-700'}`} />
                            ))}
                        </div>

                        <div className="bg-white dark:bg-dark-700 p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-gold-100 dark:border-dark-600">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 flex items-center gap-3">
                                            <User className="text-gold-500" />
                                            معلومات العميل
                                        </h2>

                                        <div className="row g-3">
                                            <div className="col-12">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">الاسم بالكامل</label>
                                                <input
                                                    type="text"
                                                    name="customer_name"
                                                    value={formData.customer_name}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    placeholder="أدخل اسمك الكريم"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">رقم الهاتف</label>
                                                <input
                                                    type="tel"
                                                    name="customer_phone"
                                                    value={formData.customer_phone}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    placeholder="091xxxxxxx"
                                                    dir="ltr"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">البريد الإلكتروني (اختياري)</label>
                                                <input
                                                    type="email"
                                                    name="customer_email"
                                                    value={formData.customer_email}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    placeholder="example@mail.com"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">تاريخ الميلاد (للحصول على خصم يوم ميلادك)</label>
                                                <div className="flex gap-4">
                                                    <select
                                                        name="birth_day"
                                                        value={formData.birth_day}
                                                        onChange={handleChange}
                                                        className="flex-1 px-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    >
                                                        <option value="">اليوم</option>
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                                            <option key={d} value={d}>{d}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        name="birth_month"
                                                        value={formData.birth_month}
                                                        onChange={handleChange}
                                                        className="flex-1 px-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    >
                                                        <option value="">الشهر</option>
                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                                            <option key={m} value={m}>{m}</option>
                                                        ))}
                                                    </select>
                                                    <select
                                                        name="birth_year"
                                                        value={formData.birth_year}
                                                        onChange={handleChange}
                                                        className="flex-1 px-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    >
                                                        <option value="">السنة</option>
                                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                if (formData.customer_name && formData.customer_phone) setStep(2);
                                                else toast.error('يرجى تعبئة البيانات المطلوبة');
                                            }}
                                            className="w-full py-4 bg-gold-600 text-white rounded-2xl font-black shadow-lg shadow-gold-600/20 hover:scale-[1.02] transition-transform"
                                        >
                                            التالي: عنوان التوصيل
                                        </button>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 flex items-center gap-3">
                                            <MapPin className="text-gold-500" />
                                            عنوان التوصيل
                                        </h2>

                                        <div className="row g-3">
                                            <div className="col-12 col-md-6">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">المدينة</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    placeholder="طرابلس"
                                                />
                                            </div>
                                            <div className="col-12 col-md-6">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">المنطقة</label>
                                                <input
                                                    type="text"
                                                    name="area"
                                                    value={formData.area}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none"
                                                    placeholder="حي الأندلس"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">العنوان بالتفصيل</label>
                                                <textarea
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    rows="2"
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none resize-none"
                                                    placeholder="اسم الشارع، رقم المنزل، علامة مميزة..."
                                                />
                                            </div>
                                            <div className="col-12">
                                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">ملاحظات إضافية (اختياري)</label>
                                                <textarea
                                                    name="notes"
                                                    value={formData.notes}
                                                    onChange={handleChange}
                                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-800 border-2 border-transparent focus:border-gold-500 focus:bg-white dark:focus:bg-dark-600 transition-all outline-none resize-none"
                                                    placeholder="أي تعليمات خاصة للتوصيل..."
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-4 bg-gray-100 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                                            >
                                                رجوع
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (formData.city && formData.area && formData.address) setStep(3);
                                                    else toast.error('يرجى تعبئة عنوان التوصيل');
                                                }}
                                                className="flex-[2] py-4 bg-gold-600 text-white rounded-2xl font-black shadow-lg shadow-gold-600/20 hover:scale-[1.02] transition-transform"
                                            >
                                                مراجعة الطلب
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 flex items-center gap-3">
                                            <CreditCard className="text-gold-500" />
                                            تأكيد الطلب
                                        </h2>

                                        <div className="bg-gray-50 dark:bg-dark-800 p-6 rounded-3xl space-y-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary dark:text-gray-400">الاسم:</span>
                                                <span className="font-bold text-text-primary dark:text-cream-50">{formData.customer_name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary dark:text-gray-400">الهاتف:</span>
                                                <span className="font-bold text-text-primary dark:text-cream-50" dir="ltr">{formData.customer_phone}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-text-secondary dark:text-gray-400">العنوان:</span>
                                                <span className="font-bold text-text-primary dark:text-cream-50 text-left max-w-[200px] truncate">{formData.city}، {formData.area}</span>
                                            </div>
                                        </div>

                                        <div className="bg-gold-50 dark:bg-dark-600/50 p-4 rounded-2xl border border-gold-200 dark:border-gold-500/30 flex gap-3">
                                            <AlertCircle className="text-gold-600 flex-shrink-0" />
                                            <p className="text-xs text-gold-800 dark:text-gold-300 leading-relaxed font-bold">
                                                الدفع سيكون عند الاستلام او يمكنكم التحويل مباشرة لحساب المتجر عبر التواصل عن طريق الواتساب. سيقوم مندوب التوصيل بالتواصل معك قبل الوصول.
                                            </p>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => setStep(2)}
                                                className="flex-1 py-4 bg-gray-100 dark:bg-dark-600 text-text-secondary dark:text-gold-400 rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-dark-500 transition-colors"
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="flex-[2] py-4 bg-gold-600 text-white rounded-2xl font-black shadow-lg shadow-gold-600/20 hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
                                            >
                                                {loading ? 'جاري الإرسال...' : 'تأكيد الطلب الآن'}
                                                {!loading && <CheckCircle size={18} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-12 col-lg-5">
                        <div className="bg-white dark:bg-dark-700 p-5 md:p-8 rounded-3xl md:rounded-[40px] shadow-sm border border-gold-100 dark:border-dark-600 sticky top-32">
                            <h3 className="text-xl font-black mb-6 text-text-primary dark:text-cream-50">ملخص الطلب</h3>

                            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {cart.items && cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-cream-50 dark:bg-dark-600 rounded-xl overflow-hidden border border-gold-50 dark:border-dark-600 flex-shrink-0">
                                            <img
                                                src={item.variant.product_main_image || 'https://placehold.co/100x100'}
                                                className="w-full h-full object-cover"
                                                alt={item.variant.product_name_ar}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm text-text-primary dark:text-cream-50 line-clamp-1">{item.variant.product_name_ar}</h4>
                                            <p className="text-xs text-text-secondary dark:text-gold-400 mb-1">{item.variant.size_ml} مل</p>
                                            <div className="flex justify-between items-center bg-gray-50 dark:bg-dark-600 rounded-lg px-2 py-1">
                                                <span className="text-xs font-bold">x{item.quantity}</span>
                                                <span className="text-xs font-bold text-gold-600 dark:text-gold-400">{item.total_price} د.ل</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400 mb-2">كود الخصم</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="أدخل الكود هنا"
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 focus:border-gold-500 outline-none text-sm"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        disabled={!couponCode || applyingCoupon}
                                        className="px-6 py-2.5 bg-dark-900 dark:bg-gold-600 text-white dark:text-dark-900 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                    >
                                        {applyingCoupon ? '...' : 'تطبيق'}
                                    </button>
                                </div>
                                {coupon && (
                                    <div className="mt-2 flex items-center justify-between bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900/30">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400 text-xs font-bold">
                                            <CheckCircle2 size={14} />
                                            تم تطبيق الخصم: {coupon.code}
                                        </div>
                                        <button onClick={removeCoupon} className="text-rose-500 hover:text-rose-700">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-gold-100 dark:border-dark-600">
                                <div className="flex justify-between text-sm text-text-secondary dark:text-gold-400">
                                    <span>المجموع الفرعي</span>
                                    <span className="font-bold">{cart.total_amount} د.ل</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>خصم الكوبون ({coupon.code})</span>
                                        <span className="font-bold">-{discountAmount} د.ل</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xl font-black text-gold-600 dark:text-gold-400 pt-4 border-t border-dashed border-gold-200 dark:border-dark-500 mt-4">
                                    <span>الإجمالي</span>
                                    <span>{finalTotal.toFixed(2)} د.ل</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

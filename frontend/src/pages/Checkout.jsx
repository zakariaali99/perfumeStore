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
    ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const LIBYAN_CITIES = [
    'طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'زليتن', 'البيضاء', 'طبرق', 'غريان',
    'سبها', 'الخمس', 'سرت', 'صبراتة', 'زواره', 'أجدابيا', 'درنة', 'يفرن', 'ترهونة',
    'نالوت', 'غدامس', 'الجفرة', 'مرزق', 'الكفرة', 'براك الشاطئ'
];

const Checkout = () => {
    const { cart, clearCart } = useCartStore();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(null);
    const navigate = useNavigate();

    if (!cart.items || cart.items.length === 0) {
        return (
            <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-40 pb-20 transition-colors duration-300">
                <div className="container mx-auto px-4 text-center max-w-lg">
                    <ShoppingBag size={48} className="mx-auto mb-6 text-gold-300" />
                    <h1 className="text-2xl font-black mb-4 text-text-primary dark:text-cream-50">السلة فارغة</h1>
                    <p className="text-text-secondary dark:text-gold-400 mb-8">أضف بعض المنتجات أولاً قبل إتمام الشراء.</p>
                    <button
                        onClick={() => navigate('/products')}
                        className="bg-gold-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
                    >
                        تصفح العطور
                    </button>
                </div>
            </div>
        );
    }

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        birth_day: '',
        birth_month: '',
        birth_year: '',
        city: 'طرابلس',
        area: '',
        address: '',
        location_details: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1 && (!formData.name || !formData.phone || !formData.birth_day || !formData.birth_month || !formData.birth_year)) {
            toast.error('يرجى إكمال البيانات الأساسية وتاريخ الميلاد');
            return;
        }
        if (step === 2 && (!formData.city || !formData.address)) {
            toast.error('يرجى إدخال العنوان بالتفصيل');
            return;
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const orderData = {
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_email: formData.email,
                birth_day: parseInt(formData.birth_day),
                birth_month: parseInt(formData.birth_month),
                birth_year: parseInt(formData.birth_year),
                city: formData.city,
                area: formData.area,
                address: formData.address,
                location_details: formData.location_details,
                notes: formData.notes,
                items: cart.items.map(item => ({
                    variant_id: item.variant.id,
                    quantity: item.quantity
                }))
            };

            const res = await ordersApi.create(orderData);
            setOrderSuccess(res.data);
            toast.success('تم إرسال طلبك بنجاح');
            if (clearCart) clearCart();
        } catch (error) {
            toast.error('حدث خطأ أثناء إتمام الطلب، يرجى المحاولة لاحقاً');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-40 pb-20 transition-colors duration-300">
                <div className="container mx-auto px-4 text-center max-w-lg">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-green-50 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <CheckCircle2 size={48} />
                    </motion.div>
                    <h1 className="text-3xl font-black mb-4 text-text-primary dark:text-cream-50">شكراً لطلبك!</h1>
                    <p className="text-text-secondary dark:text-gold-400 mb-2">تم استلام طلبك بنجاح وهو الآن قيد المراجعة.</p>
                    <div className="bg-white dark:bg-dark-700 p-6 rounded-3xl border border-gold-100 dark:border-dark-600 my-8">
                        <p className="text-sm text-text-secondary dark:text-gold-400 mb-1">رقم الطلب</p>
                        <p className="text-2xl font-black text-gold-700 dark:text-gold-400 font-poppins">{orderSuccess.order_number}</p>
                    </div>
                    <p className="text-sm text-text-secondary dark:text-gold-400 mb-10 leading-relaxed">
                        سيقوم فريقنا بالتواصل معك قريباً لتأكيد تفاصيل التوصيل. يمكنك تتبع حالة طلبك باستخدام الرقم أعلاه.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gold-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
                    >
                        العودة للرئيسية
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-5xl">
                <h1 className="text-3xl font-black mb-10 text-center text-text-primary dark:text-cream-50">إتمام الشراء</h1>

                {/* Stepper */}
                <div className="flex justify-between max-w-md mx-auto mb-16 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gold-100 dark:bg-dark-600 -translate-y-1/2 -z-10"></div>
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'bg-white dark:bg-dark-700 border-2 border-gold-100 dark:border-dark-600 text-gold-300 dark:text-gold-400'}`}>
                                {s}
                            </div>
                            <span className={`text-xs mt-2 font-bold ${step >= s ? 'text-gold-600 dark:text-gold-400' : 'text-gold-300 dark:text-gold-400/50'}`}>
                                {s === 1 ? 'المعلومات' : s === 2 ? 'العنوان' : 'التأكيد'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    {/* Form Section */}
                    <div className="lg:col-span-2 bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm min-h-[500px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-text-primary dark:text-cream-50">
                                        <Info className="text-gold-500" size={20} />
                                        المعلومات الشخصية
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">الاسم الكامل *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="أدخل اسمك الكامل"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">رقم الهاتف *</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-left text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="09XXXXXXXX"
                                                dir="ltr"
                                            />
                                        </div>

                                        {/* Birthday Selection */}
                                        <div className="md:col-span-2 space-y-3">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">تاريخ الميلاد *</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <select
                                                    name="birth_day"
                                                    value={formData.birth_day}
                                                    onChange={handleChange}
                                                    className="bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-4 py-4 rounded-2xl focus:outline-none text-text-primary dark:text-cream-50"
                                                >
                                                    <option value="">اليوم</option>
                                                    {[...Array(31)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    name="birth_month"
                                                    value={formData.birth_month}
                                                    onChange={handleChange}
                                                    className="bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-4 py-4 rounded-2xl focus:outline-none text-text-primary dark:text-cream-50"
                                                >
                                                    <option value="">الشهر</option>
                                                    {[...Array(12)].map((_, i) => (
                                                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    name="birth_year"
                                                    value={formData.birth_year}
                                                    onChange={handleChange}
                                                    className="bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-4 py-4 rounded-2xl focus:outline-none text-text-primary dark:text-cream-50"
                                                >
                                                    <option value="">السنة</option>
                                                    {[...Array(100)].map((_, i) => {
                                                        const year = new Date().getFullYear() - i;
                                                        return <option key={year} value={year}>{year}</option>
                                                    })}
                                                </select>
                                            </div>
                                            <p className="text-[10px] text-text-muted dark:text-gold-500 pr-1">يستخدم تاريخ الميلاد لتقديم هدايا وعروض خاصة في ذكرى ميلادك.</p>
                                        </div>

                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">البريد الإلكتروني (اختياري)</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-left text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="email@example.com"
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>
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
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-text-primary dark:text-cream-50">
                                        <MapPin className="text-gold-500" size={20} />
                                        تفاصيل التوصيل
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">المدينة *</label>
                                            <select
                                                name="city"
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all appearance-none text-text-primary dark:text-cream-50"
                                            >
                                                {LIBYAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">المنطقة</label>
                                            <input
                                                type="text"
                                                name="area"
                                                value={formData.area}
                                                onChange={handleChange}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="اسم الحي أو المنطقة"
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">العنوان بالتفصيل *</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="الشارع، رقم المنزل، تفاصيل الشقة..."
                                            />
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">تفاصيل المكان أو أقرب علامة</label>
                                            <textarea
                                                name="location_details"
                                                value={formData.location_details}
                                                onChange={handleChange}
                                                rows="2"
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                                placeholder="بجانب مسجد فلان، مقابل محطة كذا..."
                                            />
                                        </div>
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
                                    <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-text-primary dark:text-cream-50">
                                        <CheckCircle2 className="text-gold-500" size={20} />
                                        مراجعة نهائية
                                    </h2>
                                    <div className="bg-cream-50 dark:bg-dark-600 p-6 rounded-3xl border border-gold-50 dark:border-dark-600 space-y-4">
                                        <div className="flex justify-between border-b border-gold-100 dark:border-dark-600 pb-3">
                                            <span className="text-text-secondary dark:text-gold-400">الاسم:</span>
                                            <span className="font-bold text-text-primary dark:text-cream-50">{formData.name}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gold-100 dark:border-dark-600 pb-3">
                                            <span className="text-text-secondary dark:text-gold-400">رقم الهاتف:</span>
                                            <span className="font-bold underline text-gold-600 dark:text-gold-400">{formData.phone}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gold-100 dark:border-dark-600 pb-3">
                                            <span className="text-text-secondary dark:text-gold-400">تاريخ الميلاد:</span>
                                            <span className="font-bold text-text-primary dark:text-cream-50">{formData.birth_day}/{formData.birth_month}/{formData.birth_year}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-gold-100 dark:border-dark-600 pb-3">
                                            <span className="text-text-secondary dark:text-gold-400">العنوان:</span>
                                            <span className="font-bold text-text-primary dark:text-cream-50">{formData.city}، {formData.area}</span>
                                        </div>
                                        <div className="flex flex-col gap-1 border-b border-gold-100 dark:border-dark-600 pb-3">
                                            <span className="text-text-secondary dark:text-gold-400">العنوان بالتفصيل:</span>
                                            <span className="font-bold text-text-primary dark:text-cream-50">{formData.address}</span>
                                        </div>
                                        {formData.location_details && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-text-secondary dark:text-gold-400">أقرب علامة:</span>
                                                <span className="font-bold text-text-primary dark:text-cream-50">{formData.location_details}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 px-1">ملاحظات إضافية</label>
                                        <textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows="2"
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                                            placeholder="أي تعليمات خاصة للتوصيل..."
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex justify-between mt-12">
                            {step > 1 ? (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex items-center gap-2 text-text-secondary dark:text-gold-400 font-bold hover:text-gold-600 px-6 py-4 rounded-2xl transition-all"
                                >
                                    <ChevronRight size={20} />
                                    السابق
                                </button>
                            ) : <div></div>}

                            {step < 3 ? (
                                <button
                                    onClick={handleNext}
                                    className="bg-gold-500 text-white px-10 py-4 rounded-2xl font-bold hover:bg-gold-600 transition-all flex items-center gap-2 shadow-lg shadow-gold-500/20"
                                >
                                    التالي
                                    <ChevronLeft size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-gold-700 text-white px-10 py-4 rounded-2xl font-black hover:bg-gold-800 transition-all flex items-center gap-2 shadow-xl shadow-gold-700/20 disabled:bg-gray-300 dark:disabled:bg-dark-600"
                                >
                                    {isSubmitting ? 'جاري إرسال الطلب...' : 'تأكيد الطلب نهائياً'}
                                    <CheckCircle2 size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-text-primary dark:text-cream-50">
                                <ShoppingBag size={20} className="text-gold-500" />
                                سلة التسوق
                            </h3>
                            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 scrollbar-hide">
                                {cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-3 text-sm">
                                        <div className="w-12 h-12 rounded-lg bg-cream-50 dark:bg-dark-600 overflow-hidden flex-shrink-0">
                                            <img src={item.variant.product_main_image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate text-text-primary dark:text-cream-50">{item.variant.product_name_ar}</p>
                                            <p className="text-text-secondary dark:text-gold-400 text-xs">{item.quantity} × {item.variant.size_ml}مل</p>
                                        </div>
                                        <span className="font-poppins font-bold text-text-primary dark:text-cream-50">{item.total_price} د.ل</span>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-gold-50 dark:border-dark-600 space-y-3">
                                <div className="flex justify-between text-text-secondary dark:text-gold-400 text-sm">
                                    <span>المجموع الفرعي</span>
                                    <span>{cart.total_amount} د.ل</span>
                                </div>
                                <div className="flex justify-between text-text-secondary dark:text-gold-400 text-sm">
                                    <span>التوصيل</span>
                                    <span>25 د.ل</span>
                                </div>
                                <div className="flex justify-between items-center text-xl font-black pt-4">
                                    <span className="text-text-primary dark:text-cream-50">الإجمالي</span>
                                    <span className="text-gold-700 dark:text-gold-400 font-poppins">{cart.total_amount + 25} د.ل</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gold-50 dark:bg-dark-700 p-6 rounded-3xl border border-gold-100 dark:border-dark-600 flex items-start gap-4">
                            <CreditCard className="text-gold-500 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="font-bold text-sm mb-1 text-text-primary dark:text-cream-50">الدفع عند الاستلام</h4>
                                <p className="text-xs text-text-secondary dark:text-gold-400 leading-relaxed">
                                    حالياً نقبل الدفع نقداً عند استلام طلبك. يرجى تجهيز المبلغ قبل وصول المندوب.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;

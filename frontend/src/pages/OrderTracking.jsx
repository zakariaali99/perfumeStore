import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ordersApi } from '../services/api';
import {
    Search,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    AlertCircle,
    ShoppingBag,
    Calendar,
    ChevronLeft,
    Phone,
    ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderTracking = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlOrderNumber = searchParams.get('order_number') || '';
    const urlPhone = searchParams.get('phone') || '';

    const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
    const [phone, setPhone] = useState(urlPhone);
    const [order, setOrder] = useState(null);
    const [ordersList, setOrdersList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const executeTrack = async (ordNum, ph) => {
        if (!ordNum && !ph) return;
        setLoading(true);
        setError('');
        try {
            const res = await ordersApi.track(ordNum, ph);
            if (res.data.single) {
                setOrder(res.data.order);
                setOrdersList([]);
            } else {
                setOrdersList(res.data.orders || []);
                if (res.data.orders && res.data.orders.length > 0) {
                    setOrder(res.data.orders[0]);
                } else {
                    setOrder(null);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'تعذر العثور على الطلب. يرجى التأكد من البيانات والمحاولة مرة أخرى.');
            setOrder(null);
            setOrdersList([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (urlOrderNumber || urlPhone) {
            setOrderNumber(urlOrderNumber);
            setPhone(urlPhone);
            executeTrack(urlOrderNumber, urlPhone);
        }
    }, [urlOrderNumber, urlPhone]);

    const handleTrack = (e) => {
        e.preventDefault();
        executeTrack(orderNumber, phone);
    };

    const statusMap = {
        'pending': { label: 'في الانتظار', step: 1, icon: Clock, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        'confirmed': { label: 'تم التأكيد', step: 2, icon: CheckCircle2, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        'processing': { label: 'قيد التجهيز', step: 3, icon: Package, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        'shipped': { label: 'تم الشحن', step: 4, icon: Truck, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        'delivered': { label: 'تم التوصيل', step: 5, icon: CheckCircle2, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
        'cancelled': { label: 'ملغي', step: 0, icon: AlertCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
        'returned': { label: 'مرتجع', step: 0, icon: AlertCircle, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
    };

    const stepsList = [
        { key: 'pending', label: 'في الانتظار', icon: Clock },
        { key: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2 },
        { key: 'processing', label: 'قيد التجهيز', icon: Package },
        { key: 'shipped', label: 'تم الشحن', icon: Truck },
        { key: 'delivered', label: 'تم التوصيل', icon: CheckCircle2 },
    ];

    const currentStatus = order ? statusMap[order.status] : null;
    const currentStepNum = currentStatus ? currentStatus.step : 0;

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-32 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4 text-text-primary dark:text-cream-50">تتبع طلبك ورصيد مشترياتك</h1>
                    <p className="text-text-secondary dark:text-gold-400">أدخل رقم الطلب أو رقم هاتفك للبحث ومتابعة جميع طلباتك</p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm mb-10">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">رقم الطلب</label>
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="ORD-2026..."
                                className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-200 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-poppins"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">أو رقم الهاتف (لعرض جميع طلبياتك)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09XXXXXXXX"
                                className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-200 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-poppins"
                                dir="ltr"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || (!orderNumber && !phone)}
                                className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:bg-gray-300 dark:disabled:bg-dark-600 cursor-pointer"
                            >
                                {loading ? 'جاري البحث...' : (
                                    <>
                                        <Search size={20} />
                                        تتبع الآن
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-red-500 dark:text-red-400 text-sm flex items-center gap-2 font-bold"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.p>
                    )}
                </div>

                {/* Multiple Orders List (When searched by Phone) */}
                {ordersList.length > 1 && (
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm mb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <ShoppingBag className="text-gold-500" />
                            <h3 className="text-xl font-bold text-text-primary dark:text-cream-50">سجل طلباتك السابق ({ordersList.length} طلبات)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {ordersList.map((ord) => {
                                const st = statusMap[ord.status] || {};
                                const isSelected = order?.id === ord.id;
                                return (
                                    <div
                                        key={ord.id}
                                        onClick={() => setOrder(ord)}
                                        className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                                            isSelected
                                                ? 'bg-gold-50/50 dark:bg-gold-900/20 border-gold-500 shadow-md ring-2 ring-gold-500/30'
                                                : 'bg-cream-50/50 dark:bg-dark-700/50 border-gold-200 dark:border-dark-600 hover:border-gold-400'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-poppins font-black text-text-primary dark:text-cream-50">{ord.order_number}</span>
                                            <span className={`text-xs px-3 py-1 rounded-full font-bold ${st.color} ${st.bg}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm text-text-secondary dark:text-gold-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(ord.created_at).toLocaleDateString('ar-LY')}
                                            </span>
                                            <span className="font-bold font-poppins text-text-primary dark:text-cream-50">{ord.total} د.ل</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Result Detail View */}
                <AnimatePresence>
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-text-secondary dark:text-gold-400 mb-1">حالة الطلب الحالية</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${currentStatus?.color} ${currentStatus?.bg}`}>
                                        {currentStatus && <currentStatus.icon size={20} />}
                                        {currentStatus?.label}
                                    </div>
                                </div>
                                <div className="h-12 w-px bg-gold-100 dark:bg-dark-600 hidden md:block"></div>
                                <div className="text-center">
                                    <p className="text-sm text-text-secondary dark:text-gold-400 mb-1">رقم الطلب</p>
                                    <p className="text-xl font-black font-poppins text-text-primary dark:text-cream-50">{order.order_number}</p>
                                </div>
                                <div className="h-12 w-px bg-gold-100 dark:bg-dark-600 hidden md:block"></div>
                                <div className="text-center md:text-left">
                                    <p className="text-sm text-text-secondary dark:text-gold-400 mb-1">تاريخ الطلب</p>
                                    <p className="font-bold text-text-primary dark:text-cream-50">{new Date(order.created_at).toLocaleDateString('ar-LY')}</p>
                                </div>
                            </div>

                            {/* Visual Progress Steps Bar (مسار الطلب) */}
                            {order.status !== 'cancelled' && order.status !== 'returned' ? (
                                <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm overflow-x-auto">
                                    <h3 className="text-xl font-bold mb-8 text-text-primary dark:text-cream-50">مسار الطلب</h3>
                                    <div className="min-w-[600px] flex items-center justify-between relative px-6">
                                        {/* Background Track Line */}
                                        <div className="absolute top-1/2 left-12 right-12 h-1 bg-gold-100 dark:bg-dark-600 -translate-y-1/2 z-0"></div>
                                        
                                        {/* Active Progress Line */}
                                        <div
                                            className="absolute top-1/2 right-12 h-1 bg-gold-500 -translate-y-1/2 z-0 transition-all duration-700"
                                            style={{
                                                width: `${Math.max(0, Math.min(100, ((currentStepNum - 1) / (stepsList.length - 1)) * 100))}%`
                                            }}
                                        ></div>

                                        {stepsList.map((st, idx) => {
                                            const stepIdx = idx + 1;
                                            const isDone = currentStepNum >= stepIdx;
                                            const isCurrent = currentStepNum === stepIdx;

                                            return (
                                                <div key={st.key} className="relative z-10 flex flex-col items-center gap-3">
                                                    <div
                                                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                                                            isDone
                                                                ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30 scale-110'
                                                                : 'bg-white dark:bg-dark-700 border-2 border-gold-200 dark:border-dark-600 text-gray-400 dark:text-dark-400'
                                                        }`}
                                                    >
                                                        <st.icon size={20} />
                                                    </div>
                                                    <span className={`text-xs font-bold text-center ${isCurrent ? 'text-gold-600 dark:text-gold-400 scale-105' : isDone ? 'text-text-primary dark:text-cream-50' : 'text-gray-400 dark:text-dark-400'}`}>
                                                        {st.label}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-200 dark:border-red-800 text-center">
                                    <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">حالة الطلب: {currentStatus?.label}</h3>
                                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">تواصل مع خدمة العملاء لمزيد من التفاصيل حول هذا الطلب.</p>
                                </div>
                            )}

                            {/* Detailed Timeline Log */}
                            <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm">
                                <h3 className="text-xl font-bold mb-8 text-text-primary dark:text-cream-50">سجل الأحداث</h3>
                                <div className="relative">
                                    <div className="absolute top-0 bottom-0 right-4 w-0.5 bg-gold-100 dark:bg-dark-600"></div>
                                    <div className="space-y-8">
                                        {order.status_history?.map((h, i) => {
                                            const s = statusMap[h.status];
                                            return (
                                                <div key={i} className="relative pr-12">
                                                    <div className={`absolute right-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${i === 0 ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'bg-white dark:bg-dark-700 border-2 border-gold-200 dark:border-dark-600 text-gold-400'}`}>
                                                        {s && <s.icon size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className={`font-bold ${i === 0 ? 'text-text-primary dark:text-cream-50' : 'text-text-secondary dark:text-gold-400'}`}>{s?.label}</h4>
                                                            <span className="text-xs text-text-muted dark:text-gold-400/60 font-poppins">{new Date(h.created_at).toLocaleString('ar-LY')}</span>
                                                        </div>
                                                        <p className="text-sm text-text-secondary dark:text-gold-400">{h.notes}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Items Summary */}
                            <div className="bg-white dark:bg-dark-800 p-8 rounded-3xl border border-gold-200 dark:border-dark-600 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 text-text-primary dark:text-cream-50">محتويات الطلب</h3>
                                <div className="divide-y divide-gold-50 dark:divide-dark-700">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="py-4 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-cream-50 dark:bg-dark-700 rounded-xl overflow-hidden flex items-center justify-center text-gold-500">
                                                    <Package size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary dark:text-cream-50">{item.product_name}</p>
                                                    <p className="text-xs text-text-secondary dark:text-gold-400">{item.variant_size ? `${item.variant_size} مل × ` : ''}{item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold font-poppins text-text-primary dark:text-cream-50">{item.total_price} د.ل</span>
                                        </div>
                                    ))}
                                    <div className="pt-6 flex justify-between items-center text-lg font-black text-text-primary dark:text-cream-50">
                                        <span>إجمالي المدفوع</span>
                                        <span className="text-gold-600 dark:text-gold-400 font-poppins">{order.total} د.ل</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default OrderTracking;

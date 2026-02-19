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
    ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const [orderNumber, setOrderNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const orderNumFromUrl = searchParams.get('order_number');
        if (orderNumFromUrl) {
            setOrderNumber(orderNumFromUrl);
            const fetchOrder = async () => {
                setLoading(true);
                try {
                    const res = await ordersApi.track(orderNumFromUrl, '');
                    setOrder(res.data);
                } catch (err) {
                    console.error(err);
                    setError('تعذر العثور على الطلب. يرجى التأكد من الرقم والمحاولة مرة أخرى.');
                } finally {
                    setLoading(false);
                }
            };
            fetchOrder();
        }
    }, [searchParams]);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!orderNumber) return;

        setLoading(true);
        setError('');
        try {
            const res = await ordersApi.track(orderNumber, phone);
            setOrder(res.data);
        } catch (error) {
            console.error(error);
            setError('تعذر العثور على الطلب. يرجى التأكد من الرقم والمحاولة مرة أخرى.');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const statusMap = {
        'pending': { label: 'في الانتظار', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
        'confirmed': { label: 'تم التأكيد', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
        'processing': { label: 'قيد التجهيز', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50' },
        'shipped': { label: 'تم الشحن', icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        'delivered': { label: 'تم التوصيل', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        'cancelled': { label: 'ملغي', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
        'returned': { label: 'مرتجع', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' },
    };

    const currentStatus = order ? statusMap[order.status] : null;

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black mb-4 text-text-primary dark:text-cream-50">تتبع طلبك</h1>
                    <p className="text-text-secondary dark:text-gold-400">أدخل رقم الطلب لمتابعة حالة شحنتك لحظة بلحظة</p>
                </div>

                {/* Search Form */}
                <div className="bg-white dark:bg-dark-700 p-6 md:p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm mb-10">
                    <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">رقم الطلب</label>
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="ORD-2026..."
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-poppins text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">رقم الهاتف (اختياري)</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="09XXXXXXXX"
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-poppins text-text-primary dark:text-cream-50 placeholder:text-text-secondary dark:placeholder:text-gold-400"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={loading || !orderNumber}
                                className="w-full md:w-auto bg-gold-500 hover:bg-gold-600 text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/20 disabled:bg-gray-300"
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
                            className="mt-4 text-red-500 text-sm flex items-center gap-2"
                        >
                            <AlertCircle size={16} />
                            {error}
                        </motion.p>
                    )}
                </div>

                {/* Result */}
                <AnimatePresence>
                    {order && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-text-secondary dark:text-gold-400 mb-1">حالة الطلب الحالية</p>
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${currentStatus?.color} ${currentStatus?.bg} dark:bg-opacity-10`}>
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

                            {/* Timeline */}
                            <div className="bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm">
                                <h3 className="text-xl font-bold mb-10 text-text-primary dark:text-cream-50">مسار الطلب</h3>
                                <div className="relative">
                                    <div className="absolute top-0 bottom-0 right-4 w-0.5 bg-gold-100 dark:bg-dark-600"></div>
                                    <div className="space-y-12">
                                        {order.status_history?.map((h, i) => {
                                            const s = statusMap[h.status];
                                            return (
                                                <div key={i} className="relative pr-12">
                                                    <div className={`absolute right-0 top-0 w-8 h-8 rounded-full flex items-center justify-center z-10 ${i === 0 ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'bg-white dark:bg-dark-700 border-2 border-gold-100 dark:border-dark-600 text-gold-300 dark:text-gold-400'}`}>
                                                        {s && <s.icon size={16} />}
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className={`font-bold ${i === 0 ? 'text-text-primary dark:text-cream-50' : 'text-text-secondary dark:text-gold-400'}`}>{s?.label}</h4>
                                                            <span className="text-xs text-text-muted dark:text-gold-500">{new Date(h.created_at).toLocaleString('ar-LY')}</span>
                                                        </div>
                                                        <p className="text-sm text-text-secondary dark:text-gold-400">{h.notes}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Original order creation */}
                                        <div className="relative pr-12">
                                            <div className="absolute right-0 top-0 w-8 h-8 rounded-full bg-cream-100 dark:bg-dark-800 border-2 border-gold-100 dark:border-dark-600 flex items-center justify-center z-10 text-gold-300 dark:text-gold-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-text-secondary dark:text-gold-400">تم استلام الطلب</h4>
                                                    <span className="text-xs text-text-muted dark:text-gold-500">{new Date(order.created_at).toLocaleString('ar-LY')}</span>
                                                </div>
                                                <p className="text-sm text-text-secondary dark:text-gold-400">شكراً لثقتكم بنا، طلبكم قيد المعالجة.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Summary */}
                            <div className="bg-white dark:bg-dark-700 p-8 rounded-3xl border border-gold-100 dark:border-dark-600 shadow-sm">
                                <h3 className="text-xl font-bold mb-6 text-text-primary dark:text-cream-50">محتويات الطلب</h3>
                                <div className="divide-y divide-gold-50 dark:divide-dark-600">
                                    {order.items?.map((item, i) => (
                                        <div key={i} className="py-4 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-cream-50 dark:bg-dark-600 rounded-xl overflow-hidden">
                                                    {/* We might need item image here, but order info might not have it in basic serializer */}
                                                    <div className="w-full h-full flex items-center justify-center text-gold-300 dark:text-gold-500">
                                                        <Package size={20} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-text-primary dark:text-cream-50">{item.product_name}</p>
                                                    <p className="text-xs text-text-secondary dark:text-gold-400">{item.variant_size} مل × {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-bold font-poppins text-text-primary dark:text-cream-50">{item.total_price} د.ل</span>
                                        </div>
                                    ))}
                                    <div className="pt-6 flex justify-between items-center text-lg font-black">
                                        <span className="text-text-primary dark:text-cream-50">إجمالي المدفوع</span>
                                        <span className="text-gold-700 dark:text-gold-400 font-poppins">{order.total} د.ل</span>
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

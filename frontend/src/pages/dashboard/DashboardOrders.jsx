import { useState, useEffect } from 'react';
import { ordersApi } from '../../services/api';
import {
    Search,
    CheckCircle2,
    Truck,
    Clock,
    AlertCircle,
    User,
    MapPin,
    Phone,
    Package,
    ShoppingBag,
    Eye,
    X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Pagination from '../../components/common/Pagination';

const DashboardOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const statusMap = {
        'pending': { label: 'في الانتظار', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
        'confirmed': { label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2 },
        'processing': { label: 'قيد التجهيز', color: 'text-purple-600', bg: 'bg-purple-50', icon: Truck },
        'shipped': { label: 'تم الشحن', color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Truck },
        'delivered': { label: 'تم التوصيل', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
        'cancelled': { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
        'returned': { label: 'مرتجع', color: 'text-gray-600', bg: 'bg-gray-50', icon: AlertCircle },
    };

    useEffect(() => {
        fetchOrders();
    }, [currentPage]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await ordersApi.getAll({
                search: searchTerm,
                status: filterStatus,
                page: currentPage,
                page_size: 10
            });
            setOrders(res.data.results || res.data || []);
            setTotalPages(Math.ceil((res.data.count || res.data.length) / 10));
        } catch (err) {
            toast.error('تعذر تحميل الطلبات');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await ordersApi.updateStatus(orderId, { status: newStatus });
            toast.success('تم تحديث حالة الطلب');
            fetchOrders();
        } catch (err) {
            toast.error('فشل تحديث الحالة');
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setCurrentPage(1);
            fetchOrders();
        }, 500);
        return () => clearTimeout(delayDebounce);
    }, [searchTerm, filterStatus]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">الطلبات</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">متابعة المبيعات، الشحن وتحديث حالات الطلب.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-dark-700 p-4 rounded-3xl border border-gold-100 dark:border-dark-600 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[300px]">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gold-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث برقم الطلب، اسم العميل أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-sm text-text-primary dark:text-cream-50"
                    />
                </div>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-4 py-3 rounded-2xl focus:outline-none text-sm min-w-[150px] text-text-primary dark:text-cream-50"
                >
                    <option value="">كل الحالات</option>
                    {Object.entries(statusMap).map(([key, value]) => (
                        <option key={key} value={key}>{value.label}</option>
                    ))}
                </select>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-[#FAF9F6] dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-8 py-5">الطلب</th>
                                <th className="px-8 py-5">العميل</th>
                                <th className="px-8 py-5">تاريخ الطلب</th>
                                <th className="px-8 py-5">الإجمالي</th>
                                <th className="px-8 py-5">الحالة</th>
                                <th className="px-8 py-5">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-sm">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse h-20 bg-white dark:bg-dark-700">
                                        <td colSpan="6" className="px-8 py-6"></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center opacity-50">
                                        <ShoppingBag size={48} className="mx-auto mb-2" />
                                        <p className="font-bold">لا توجد طلبات</p>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => {
                                    const s = statusMap[order.status] || { label: order.status, color: 'text-gray-500', bg: 'bg-gray-50', icon: AlertCircle };
                                    return (
                                        <tr key={order.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-colors">
                                            <td className="px-8 py-5 font-black font-poppins text-gold-700 dark:text-gold-400">
                                                #{order.order_number}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-text-primary dark:text-cream-50">{order.customer_name}</span>
                                                    <span className="text-xs text-text-secondary dark:text-gold-400 font-poppins">{order.customer_phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-text-secondary dark:text-gold-400">
                                                {new Date(order.created_at).toLocaleDateString('ar-LY')}
                                                <span className="block text-[10px] opacity-70 font-poppins">{new Date(order.created_at).toLocaleTimeString('ar-LY')}</span>
                                            </td>
                                            <td className="px-8 py-5 font-bold font-poppins text-text-primary dark:text-cream-50">
                                                {order.total} د.ل
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.color} ${s.bg} dark:bg-opacity-20`}>
                                                    <s.icon size={14} />
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 text-text-muted dark:text-gold-400 hover:text-gold-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                    >
                                                        <Eye size={18} />
                                                    </button>

                                                    <select
                                                        value=""
                                                        onChange={(e) => {
                                                            if (e.target.value) handleUpdateStatus(order.id, e.target.value);
                                                        }}
                                                        className="bg-gray-50 dark:bg-dark-600 border-none text-[10px] font-bold px-2 py-1 rounded-lg focus:ring-0 cursor-pointer text-text-primary dark:text-cream-50"
                                                    >
                                                        <option value="" disabled>تغيير الحالة...</option>
                                                        {Object.entries(statusMap).map(([key, val]) => (
                                                            <option key={key} value={key}>{val.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Order Detail Side Drawer */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        className="bg-white dark:bg-dark-700 w-full max-w-2xl h-full shadow-2xl relative z-10 overflow-hidden flex flex-col"
                    >
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">تفاصيل الطلب</h3>
                                <p className="text-gold-600 font-poppins font-black text-lg">#{selectedOrder.order_number}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-gold-100 rounded-2xl transition-all text-text-primary dark:text-cream-50">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-text-muted dark:text-gold-400 uppercase border-b border-gold-50 dark:border-dark-600 pb-2">بيانات العميل</h4>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gold-50 dark:bg-dark-600 rounded-full flex items-center justify-center text-gold-600"><User size={20} /></div>
                                            <div>
                                                <p className="font-bold text-text-primary dark:text-cream-50">{selectedOrder.customer_name}</p>
                                                <p className="text-xs text-text-secondary dark:text-gold-400 font-poppins">{selectedOrder.customer_phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gold-50 dark:bg-dark-600 rounded-full flex items-center justify-center text-gold-600 shrink-0"><MapPin size={20} /></div>
                                            <p className="text-sm text-text-primary dark:text-cream-50 leading-relaxed font-bold">
                                                {selectedOrder.city}, {selectedOrder.area}<br />
                                                {selectedOrder.address}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-text-muted dark:text-gold-400 uppercase border-b border-gold-50 dark:border-dark-600 pb-2">ملاحظات الطلب</h4>
                                    <div className="p-6 bg-cream-50 dark:bg-dark-600 rounded-[32px] border border-gold-50 dark:border-dark-600 min-h-[120px]">
                                        <p className="text-sm italic text-text-secondary dark:text-gold-400 font-bold">
                                            {selectedOrder.notes || 'لا يوجد ملاحظات خاصة بهذا الطلب.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-sm text-text-muted dark:text-gold-400 uppercase border-b border-gold-50 dark:border-dark-600 pb-2">تفاصيل المنتجات</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <div key={idx} className="bg-white dark:bg-dark-800 p-4 rounded-3xl border border-gold-50 dark:border-dark-600 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-cream-50 dark:bg-dark-700 rounded-2xl flex items-center justify-center text-gold-300">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm text-text-primary dark:text-cream-50">{item.product_name}</p>
                                                    <p className="text-[10px] text-text-secondary dark:text-gold-400 font-bold">{item.variant_size}مل × {item.quantity}</p>
                                                </div>
                                            </div>
                                            <span className="font-black font-poppins text-text-primary dark:text-cream-50">{item.total_price} د.ل</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-8 bg-gold-600 rounded-[40px] text-white shadow-xl shadow-gold-600/20">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm opacity-80">
                                        <span>المجموع الفرعي</span>
                                        <span className="font-poppins">{selectedOrder.subtotal} د.ل</span>
                                    </div>
                                    <div className="flex justify-between text-sm opacity-80">
                                        <span>رسوم التوصيل</span>
                                        <span className="font-poppins">{selectedOrder.shipping_cost} د.ل</span>
                                    </div>
                                    <div className="pt-4 border-t border-white/20 flex justify-between items-end">
                                        <span className="text-lg font-black">إجمالي الطلب</span>
                                        <span className="text-3xl font-black font-poppins">{selectedOrder.total} د.ل</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DashboardOrders;

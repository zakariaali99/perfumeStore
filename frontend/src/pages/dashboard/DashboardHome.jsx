import { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    Clock,
    ChevronLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }) => (
    <div className="bg-white dark:bg-dark-700 p-8 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-bl-full -z-10 group-hover:scale-110 transition-transform`}></div>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {trendValue}%
                </div>
            )}
        </div>
        <h3 className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">{title}</h3>
        <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{value}</p>
    </div>
);

const DashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const statusMap = {
        'pending': { label: 'في الانتظار', color: 'text-amber-600', bg: 'bg-amber-50' },
        'confirmed': { label: 'مؤكد', color: 'text-blue-600', bg: 'bg-blue-50' },
        'processing': { label: 'قيد التجهيز', color: 'text-purple-600', bg: 'bg-purple-50' },
        'shipped': { label: 'تم الشحن', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        'delivered': { label: 'تم التوصيل', color: 'text-green-600', bg: 'bg-green-50' },
        'cancelled': { label: 'ملغي', color: 'text-red-600', bg: 'bg-red-50' },
        'returned': { label: 'مرتجع', color: 'text-gray-600', bg: 'bg-gray-50' },
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await analyticsApi.getStats();
                setStats(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="space-y-10 animate-pulse">
            <div className="h-10 w-48 bg-gray-200 dark:bg-dark-700 rounded-xl"></div>
            <div className="row g-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="col-12 col-md-6 col-lg-3">
                        <div className="h-40 bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600"></div>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 h-96 bg-white dark:bg-dark-700 rounded-[32px]"></div>
                <div className="h-96 bg-white dark:bg-dark-700 rounded-[32px]"></div>
            </div>
        </div>
    );

    const summary = stats?.summary || {};

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">لوحة التحكم البانورامية</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm font-bold">أهلاً بك مجدداً، إليك ملخص أداء متجر المصطفى للعطور.</p>
                </div>
                <div className="text-left">
                    <p className="text-[10px] font-black text-text-muted uppercase mb-1">التوقيت الحالي</p>
                    <p className="text-sm font-black font-poppins text-text-primary dark:text-cream-50">{new Date().toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4">
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="إجمالي المبيعات المحققة"
                        value={`${summary.total_revenue?.toLocaleString() || 0} د.ل`}
                        icon={TrendingUp}
                        trend={summary.revenue_trend >= 0 ? 'up' : 'down'}
                        trendValue={Math.abs(summary.revenue_trend || 0)}
                        color="bg-green-600 text-green-600"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="الطلبات الكلية"
                        value={summary.total_orders || 0}
                        icon={ShoppingBag}
                        color="bg-gold-600 text-gold-600"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="قاعدة العملاء"
                        value={summary.total_customers || 0}
                        icon={Users}
                        color="bg-blue-600 text-blue-600"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="متوسط قيمة الطلب (AOV)"
                        value={`${summary.aov?.toFixed(2) || 0} د.ل`}
                        icon={TrendingUp}
                        color="bg-purple-600 text-purple-600"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="إيراد الشهر الحالي (MRR)"
                        value={`${summary.mrr?.toLocaleString() || 0} د.ل`}
                        icon={TrendingUp}
                        trend={summary.revenue_trend >= 0 ? 'up' : 'down'}
                        trendValue={Math.abs(summary.revenue_trend || 0)}
                        color="bg-amber-600 text-amber-600"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50/30 dark:bg-dark-800/50">
                        <h3 className="text-xl font-black flex items-center gap-3 text-text-primary dark:text-cream-50">
                            <Clock size={22} className="text-gold-500" />
                            أحدث الطلبيات
                        </h3>
                        <Link to="/dashboard/orders" className="text-xs font-black text-gold-600 dark:text-gold-400 hover:text-gold-700 flex items-center gap-1 transition-all">
                            عرض كافة الطلبات
                            <ChevronLeft size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-right">
                            <thead className="bg-[#FAF9F6] dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-[10px] uppercase font-black">
                                <tr>
                                    <th className="px-8 py-5">المعرف</th>
                                    <th className="px-8 py-5">العميل</th>
                                    <th className="px-8 py-5">المدينة</th>
                                    <th className="px-8 py-5">المبلغ</th>
                                    <th className="px-8 py-5 text-left">الحالة</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-[13px] text-text-primary dark:text-cream-50">
                                {stats?.recent_orders?.slice(0, 6).map((order) => {
                                    const s = statusMap[order.status] || { label: order.status, color: 'text-gray-500', bg: 'bg-gray-50' };
                                    return (
                                        <tr key={order.id} className="hover:bg-gold-50/30 dark:hover:bg-dark-600 transition-colors cursor-pointer group">
                                            <td className="px-8 py-5 font-black font-poppins text-gold-600">#{order.order_number}</td>
                                            <td className="px-8 py-5 font-bold">{order.customer_name}</td>
                                            <td className="px-8 py-5 flex items-center gap-1.5 opacity-80">
                                                <MapPin size={14} className="text-gold-500" />
                                                {order.city}
                                            </td>
                                            <td className="px-8 py-5 font-black font-poppins">{order.total} د.ل</td>
                                            <td className="px-8 py-5 text-left">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black ${s.color} ${s.bg} dark:bg-opacity-20 transition-all group-hover:scale-105`}>
                                                    {s.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm p-8 flex flex-col">
                    <div className="mb-8">
                        <h3 className="text-xl font-black flex items-center gap-3 text-text-primary dark:text-cream-50 mb-1">
                            <TrendingUp size={22} className="text-gold-500" />
                            الأكثر رواجاً
                        </h3>
                        <p className="text-[10px] text-text-muted font-bold">المنتجات الأكثر مبيعاً خلال هذا الشهر</p>
                    </div>
                    <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                        {stats?.top_products?.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-cream-50/50 dark:bg-dark-800/40 border border-transparent hover:border-gold-100 dark:hover:border-dark-600 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-dark-700 rounded-2xl flex items-center justify-center font-black text-gold-600 shadow-sm border border-gold-50 dark:border-dark-600 group-hover:bg-gold-600 group-hover:text-white transition-all font-poppins">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-black text-xs text-text-primary dark:text-cream-50 line-clamp-1">{product.product_name}</p>
                                        <p className="text-[10px] text-text-muted font-bold">{product.total_sold} مبيعات</p>
                                    </div>
                                </div>
                                <div className="text-left shrink-0">
                                    <p className="font-black text-sm font-poppins text-gold-700 dark:text-gold-400">{product.revenue.toFixed(2)} د.ل</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Link to="/dashboard/analytics" className="mt-8 py-4 bg-gold-50 dark:bg-dark-600 text-center rounded-2xl text-xs font-black text-gold-600 dark:text-gold-400 hover:bg-gold-500 hover:text-white transition-all">
                        تحليل البيانات المفصل
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;

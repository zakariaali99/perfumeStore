import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '../../services/api';
import {
    BarChart as BarChartIcon,
    PieChart as PieChartIcon,
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    Calendar,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { toast } from 'react-hot-toast';

const COLORS = ['#D4AF37', '#9CA3AF', '#374151', '#F59E0B', '#10B981'];

const DashboardAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const res = await analyticsApi.getStats({ days: timeRange === '30d' ? 30 : 90 });
            setData(res.data);
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل البيانات التحليلية');
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return <div className="p-8 text-center text-red-500">فشل تحميل البيانات</div>;

    const { summary, monthly_sales = [], top_products = [], city_sales = [], customer_segments = [] } = data;

    // Format monthly sales for chart
    const chartData = monthly_sales.map(item => ({
        name: new Date(item.month).toLocaleDateString('ar-LY', { month: 'short' }),
        revenue: item.revenue,
        orders: item.orders
    }));

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">التقارير والتحليلات</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">نظرة شاملة على أداء المتجر، المبيعات وسلوك العملاء.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex p-1 bg-white dark:bg-dark-700 rounded-2xl border border-gold-100 dark:border-dark-600">
                        <button
                            onClick={() => setTimeRange('30d')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === '30d' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                        >
                            آخر 30 يوم
                        </button>
                        <button
                            onClick={() => setTimeRange('90d')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === '90d' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                        >
                            آخر 90 يوم
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-50 dark:bg-dark-800 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-gold-50 dark:bg-dark-600 rounded-2xl text-gold-600 dark:text-gold-400">
                            <DollarSign size={24} />
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black ${summary.revenue_trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {summary.revenue_trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(summary.revenue_trend)}%
                        </span>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">إيرادات الشهر الحالي</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.monthly_revenue?.toLocaleString() || 0} د.ل</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 dark:bg-dark-800 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-dark-600 rounded-2xl text-blue-600 dark:text-gold-400">
                            <ShoppingBag size={24} />
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black ${summary.orders_trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {summary.orders_trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(summary.orders_trend)}%
                        </span>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">طلبات الشهر الحالي</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.total_orders}</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 dark:bg-dark-800 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-purple-50 dark:bg-dark-600 rounded-2xl text-purple-600 dark:text-gold-400">
                            <Users size={24} />
                        </div>
                        <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black ${summary.customers_trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {summary.customers_trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />} {Math.abs(summary.customers_trend)}%
                        </span>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">العملاء الجدد (الشهر)</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.total_customers}</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 dark:bg-dark-800 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-amber-50 dark:bg-dark-600 rounded-2xl text-amber-600 dark:text-gold-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">إيراد العام الكلي</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.total_revenue.toLocaleString()} د.ل</p>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Growth Chart (MRR) */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-primary dark:text-cream-50">الإيرادات الشهرية (MRR)</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-1">تتبع نمو الإيرادات على مدار الـ 12 شهراً الماضية</p>
                        </div>
                        <div className="w-10 h-10 bg-gold-50 dark:bg-dark-600 rounded-xl flex items-center justify-center text-gold-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                        background: '#fff'
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* City Sales Distribution */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-primary dark:text-cream-50">مبيعات المدن</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-1">توزيع الإيرادات حسب المواقع الجغرافية</p>
                        </div>
                        <div className="w-10 h-10 bg-blue-50 dark:bg-dark-600 rounded-xl flex items-center justify-center text-blue-600">
                            <PieChartIcon size={20} />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={city_sales} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="city" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 'bold' }} width={80} textAlign="right" />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="revenue" fill="#D4AF37" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Segments */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <h3 className="text-lg font-black text-text-primary dark:text-cream-50 mb-8">شرائح العملاء</h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customer_segments}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="segment"
                                >
                                    {customer_segments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products Table-like */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-700 p-8 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm leading-relaxed">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-primary dark:text-cream-50">أفضل المنتجات مبيعاً</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-1">المنتجات الأكثر طلباً وتحقيقاً للأرباح</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {top_products.map((product, idx) => (
                            <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-all border border-transparent hover:border-gold-50">
                                <div className="w-12 h-12 bg-cream-50 dark:bg-dark-800 rounded-2xl flex items-center justify-center font-black text-gold-600 font-poppins">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-text-primary dark:text-cream-50">{product.product_name}</p>
                                    <p className="text-[10px] text-text-muted font-bold">{product.total_sold} قطعة مباعة</p>
                                </div>
                                <div className="text-left">
                                    <p className="font-black text-gold-700 dark:text-gold-400 font-poppins">{product.revenue.toFixed(2)} د.ل</p>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;

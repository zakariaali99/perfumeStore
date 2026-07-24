import { useState, useEffect } from 'react';
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
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    Package,
    Tag,
    Award
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

const GOLD_PALETTE = ['#D4AF37', '#9CA3AF', '#374151', '#F59E0B', '#10B981', '#6366F1', '#EC4899'];

const statusLabels = {
    'pending': 'في الانتظار',
    'confirmed': 'مؤكد',
    'processing': 'قيد التجهيز',
    'shipped': 'تم الشحن',
    'delivered': 'تم التوصيل',
    'cancelled': 'ملغي',
    'returned': 'مرتجع'
};

const DashboardAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await analyticsApi.getStats({ range: timeRange });
            setData(res.data);
        } catch {
            toast.error('تعذر تحميل البيانات التحليلية');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        if (!data) return;
        const csvRows = [
            ['Metric', 'Value'],
            ['Total Revenue', data.summary.total_revenue],
            ['Total Orders', data.summary.total_orders],
            ['Total Customers', data.summary.total_customers],
            ['Average Order Value', data.summary.aov],
        ];

        const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map(e => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `analytics_report_${timeRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('تم تصدير التقرير بنجاح');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
                <p className="text-gold-600 font-bold animate-pulse">جاري تحميل البيانات التحليلية...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-text-secondary dark:text-gold-400 font-bold">تعذر تحميل البيانات</p>
            </div>
        );
    }

    const {
        summary,
        monthly_sales,
        top_products,
        brand_sales = [],
        category_sales = [],
        status_distribution = [],
        city_sales = [],
        customer_segments = [],
        low_stock_alerts = []
    } = data;

    const chartData = monthly_sales.map(item => ({
        name: new Date(item.month).toLocaleDateString('ar-LY', { month: 'short' }),
        revenue: item.revenue,
        orders: item.orders
    }));

    const formattedStatusData = status_distribution.map(s => ({
        name: statusLabels[s.status] || s.status,
        count: s.count
    }));

    return (
        <div className="space-y-8 pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">التقارير والتحليلات البانورامية</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm font-bold">تحليل متكامل للمبيعات، الماركات، النوتات العطرية وحالة المخزون.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex p-1 bg-white dark:bg-dark-700 rounded-2xl border border-gold-200 dark:border-dark-600">
                        {[
                            { key: '30d', label: '30 يوم' },
                            { key: '90d', label: '90 يوم' },
                            { key: '180d', label: '6 أشهر' },
                            { key: 'year', label: 'سنة' },
                            { key: 'all', label: 'الكل' }
                        ].map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTimeRange(t.key)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${timeRange === t.key ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="bg-white dark:bg-dark-700 border border-gold-300 dark:border-dark-600 text-text-primary dark:text-cream-50 px-4 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-50 transition-all text-xs"
                    >
                        <Download size={16} className="text-gold-600" />
                        تصدير التقرير
                    </button>
                </div>
            </div>

            {/* Core KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-gold-50 dark:bg-dark-600 rounded-2xl text-gold-600 dark:text-gold-400">
                            <DollarSign size={24} />
                        </div>
                        {summary.revenue_trend !== undefined && (
                            <span className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-black ${summary.revenue_trend >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                {summary.revenue_trend >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {summary.revenue_trend}%
                            </span>
                        )}
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">إجمالي المبيعات</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{Number(summary.total_revenue || 0).toLocaleString()} د.ل</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-blue-50 dark:bg-dark-600 rounded-2xl text-blue-600 dark:text-gold-400">
                            <ShoppingBag size={24} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">إجمالي الطلبات</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.total_orders}</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-purple-50 dark:bg-dark-600 rounded-2xl text-purple-600 dark:text-gold-400">
                            <Users size={24} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">العملاء النشطون</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{summary.total_customers}</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-amber-50 dark:bg-dark-600 rounded-2xl text-amber-600 dark:text-gold-400">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-xs font-bold mb-1">متوسط قيمة الطلب (AOV)</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{Number(summary.aov || 0).toFixed(2)} د.ل</p>
                </div>
            </div>

            {/* Sales Growth Chart & Brand Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Growth Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-lg font-black text-text-primary dark:text-cream-50">نمو المبيعات الزمني</h3>
                            <p className="text-[10px] text-text-muted font-bold mt-1">تطور الإيرادات المحققة للفترة المحددة</p>
                        </div>
                        <div className="w-10 h-10 bg-gold-50 dark:bg-dark-600 rounded-xl flex items-center justify-center text-gold-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-[320px] w-full">
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
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Brand Sales Performance */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-black text-text-primary dark:text-cream-50">أداء الماركات العطرية</h3>
                                <p className="text-[10px] text-text-muted font-bold mt-1">الماركات الأكثر تحقيقاً للإيرادات</p>
                            </div>
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-dark-600 rounded-xl flex items-center justify-center text-indigo-600">
                                <Award size={20} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {brand_sales.length === 0 ? (
                                <p className="text-xs text-text-muted font-bold py-10 text-center">لا توجد بيانات ماركات كافية</p>
                            ) : (
                                brand_sales.map((b, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span className="text-text-primary dark:text-cream-50">{b['variant__product__brand__name_ar']}</span>
                                            <span className="text-gold-600 font-poppins">{Number(b.revenue || 0).toLocaleString()} د.ل</span>
                                        </div>
                                        <div className="w-full bg-cream-50 dark:bg-dark-600 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-gold-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, (b.revenue / (brand_sales[0]?.revenue || 1)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2: Categories, Status Distribution, Low Stock Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Sales Distribution */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-text-primary dark:text-cream-50">توزيع الفئات</h3>
                        <Tag size={20} className="text-gold-500" />
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={category_sales}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="revenue"
                                    nameKey="variant__product__categories__name_ar"
                                >
                                    {category_sales.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GOLD_PALETTE[index % GOLD_PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Fulfillment Status Breakdown */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-black text-text-primary dark:text-cream-50">حالات الطلبات</h3>
                        <PieChartIcon size={20} className="text-blue-500" />
                    </div>
                    <div className="h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={formattedStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="count"
                                    nameKey="name"
                                >
                                    {formattedStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={GOLD_PALETTE[(index + 2) % GOLD_PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Low Stock Alert Widget */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black flex items-center gap-2 text-red-600">
                                <AlertTriangle size={20} />
                                تنبيهات المخزون المنخفض
                            </h3>
                            <span className="bg-red-50 text-red-600 text-xs font-black px-2.5 py-1 rounded-full">
                                {low_stock_alerts.length} عبوات
                            </span>
                        </div>
                        <div className="space-y-4">
                            {low_stock_alerts.length === 0 ? (
                                <div className="p-8 text-center text-green-600 font-bold text-xs bg-green-50 rounded-2xl">
                                    جميع العبوات مستقرة ومتاحة بالمخزن
                                </div>
                            ) : (
                                low_stock_alerts.map((v, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-cream-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 flex justify-between items-center">
                                        <div>
                                            <p className="font-bold text-xs text-text-primary dark:text-cream-50">{v.product__name_ar}</p>
                                            <p className="text-[10px] text-text-muted font-bold">{v.size_ml ? `${v.size_ml} مل` : 'عبوة أصلية'}</p>
                                        </div>
                                        <span className="text-xs font-black text-red-600 bg-red-50 dark:bg-dark-600 px-3 py-1.5 rounded-xl font-poppins">
                                            متبقي: {v.stock_quantity}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Products Leaderboard */}
            <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-black text-text-primary dark:text-cream-50">العطور الأكثر مبيعاً وترويجاً</h3>
                        <p className="text-[10px] text-text-muted font-bold mt-1">المنتجات التي حققت أعلى مبيعات خلال هذه الفترة</p>
                    </div>
                    <Package size={22} className="text-gold-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {top_products.map((product, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-5 rounded-3xl bg-cream-50/60 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 hover:border-gold-300 transition-all">
                            <div className="w-12 h-12 bg-white dark:bg-dark-700 rounded-2xl flex items-center justify-center font-black text-gold-600 font-poppins border border-gold-200 shadow-sm">
                                #{idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-text-primary dark:text-cream-50 truncate">{product.product_name}</p>
                                <p className="text-[10px] text-text-muted font-bold mt-0.5">{product.total_sold} قطعة مباعة</p>
                            </div>
                            <div className="text-left shrink-0">
                                <p className="font-black text-xs font-poppins text-gold-600 dark:text-gold-400">{Number(product.revenue || 0).toLocaleString()} د.ل</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardAnalytics;

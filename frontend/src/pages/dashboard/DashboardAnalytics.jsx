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
    ArrowDownRight,
    Activity,
    Target,
    Zap
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

const COLORS = ['#D4AF37', '#7C2D12', '#374151', '#78350F', '#10B981'];

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

    const handleExportCSV = () => {
        if (!data) {
            toast.error('لا توجد بيانات لتصديرها.');
            return;
        }

        const { summary, monthly_sales, top_products } = data;

        let csvContent = "data:text/csv;charset=utf-8,";

        // Summary Data
        csvContent += "Metric,Value\n";
        csvContent += `Total Revenue,${summary.total_revenue || 0}\n`;
        csvContent += `Monthly Revenue,${summary.monthly_revenue || 0}\n`;
        csvContent += `Total Orders,${summary.total_orders || 0}\n`;
        csvContent += `Total Customers,${summary.total_customers || 0}\n`;
        csvContent += `Average Order Value,${summary.avg_order_value || 0}\n`;

        // Monthly Sales Data
        if (monthly_sales && monthly_sales.length > 0) {
            csvContent += "\n\nMonthly Sales\n";
            csvContent += "Month,Revenue,Orders\n";
            monthly_sales.forEach(item => {
                const monthName = new Date(item.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                csvContent += `${monthName},${item.revenue},${item.orders}\n`;
            });
        }

        // Top Products Data
        if (top_products && top_products.length > 0) {
            csvContent += "\n\nTop Products\n";
            csvContent += "Product Name,Units Sold,Income\n";
            top_products.forEach(item => {
                csvContent += `"${item.name}",${item.sold},${item.income}\n`;
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `analytics_export_${timeRange}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('تم تصدير البيانات بنجاح');
    };

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-gold-100 border-t-gold-600 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-text-muted animate-pulse">جاري تحليل البيانات...</p>
            </div>
        );
    }

    if (!data) return (
        <div className="p-12 text-center bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600">
            <Zap size={48} className="mx-auto mb-4 text-red-400 opacity-20" />
            <p className="font-black text-red-500">فشل في استرداد التقارير التحليلية</p>
            <button onClick={fetchAnalytics} className="mt-4 px-6 py-2 bg-gold-50 dark:bg-dark-600 text-gold-600 rounded-xl font-bold hover:bg-gold-500 hover:text-white transition-all">إعادة المحاولة</button>
        </div>
    );

    const { summary, monthly_sales = [], top_products = [], city_sales = [], customer_segments = [] } = data;

    const chartData = monthly_sales.map(item => ({
        name: new Date(item.month).toLocaleDateString('ar-LY', { month: 'short' }),
        revenue: item.revenue,
        orders: item.orders
    }));

    const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, secondary }) => (
        <div className="bg-white dark:bg-dark-700 p-5 md:p-8 rounded-[32px] md:rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all h-full">
            <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] dark:opacity-[0.05] rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-700`}></div>
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl md:rounded-[24px] ${color} bg-opacity-10 text-opacity-100`}>
                    <Icon size={24} className="md:w-7 md:h-7" />
                </div>
                {trendValue !== undefined && (
                    <div className={`flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${trend >= 0 ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                        {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trendValue)}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-text-secondary dark:text-gold-400 text-xs md:text-sm font-bold mb-1 opacity-70 uppercase tracking-wider">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl md:text-3xl font-black text-text-primary dark:text-cream-50 font-poppins">{value}</p>
                    {secondary && <span className="text-xs font-bold text-text-muted">{secondary}</span>}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2 sm:px-0">
                <div className="relative">
                    <div className="absolute -right-4 top-0 w-2 h-12 bg-gold-500 rounded-full opacity-50 blur-sm hidden md:block"></div>
                    <h2 className="text-3xl md:text-5xl font-black text-text-primary dark:text-cream-50 mb-2 leading-tight">الرؤى والتحليلات <span className="text-gold-500">البيانية</span></h2>
                    <p className="text-text-secondary dark:text-gold-400/80 text-sm md:text-lg font-bold">معالجة فورية لأداء المتجر مع تحليلات البيع المتقدمة والنمو.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto self-end md:self-auto">
                    <div className="flex flex-1 md:flex-none p-1.5 bg-white dark:bg-dark-700 rounded-2xl border border-gold-100 dark:border-dark-600 backdrop-blur-md">
                        <button
                            onClick={() => setTimeRange('30d')}
                            className={`flex-1 md:px-6 py-2.5 rounded-xl text-xs font-black transition-all ${timeRange === '30d' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                        >
                            آخر 30 يوم
                        </button>
                        <button
                            onClick={() => setTimeRange('90d')}
                            className={`flex-1 md:px-6 py-2.5 rounded-xl text-xs font-black transition-all ${timeRange === '90d' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/30' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                        >
                            آخر 90 يوم
                        </button>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="p-3 bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-600 rounded-2xl text-gold-600 hover:bg-gold-50 dark:hover:bg-dark-800 transition-all shadow-sm group"
                        title="تصدير البيانات"
                    >
                        <Download size={22} className="group-active:scale-90 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                <StatCard
                    title="إيرادات الشهر الحالي"
                    value={`${summary.monthly_revenue?.toLocaleString() || 0} د.ل`}
                    icon={DollarSign}
                    trend={summary.revenue_trend}
                    trendValue={summary.revenue_trend}
                    color="text-gold-600"
                />
                <StatCard
                    title="إجمالي الطلبات"
                    value={summary.total_orders}
                    icon={ShoppingBag}
                    trend={summary.orders_trend}
                    trendValue={summary.orders_trend}
                    color="text-blue-600"
                    secondary="طلب ناجح"
                />
                <StatCard
                    title="العملاء الجدد"
                    value={summary.total_customers}
                    icon={Users}
                    trend={summary.customers_trend}
                    trendValue={summary.customers_trend}
                    color="text-purple-600"
                    secondary="عميل جديد"
                />
                <StatCard
                    title="إيراد العام الكلي"
                    value={`${summary.total_revenue?.toLocaleString() || 0} د.ل`}
                    icon={TrendingUp}
                    color="text-amber-600"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {/* Revenue Growth Chart */}
                <div className="bg-white dark:bg-dark-700 p-6 md:p-10 rounded-[40px] md:rounded-[56px] border border-gold-100 dark:border-dark-600 shadow-sm relative">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-text-primary dark:text-cream-50">نمو الإيرادات الشهرية</h3>
                            <p className="text-xs text-text-muted font-bold mt-2">معدل العائد الشهري المتكرر (MRR) بالألف د.ل</p>
                        </div>
                        <div className="p-4 bg-gold-500/10 rounded-3xl text-gold-600">
                            <Activity size={24} />
                        </div>
                    </div>
                    <div className="h-[280px] md:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.6} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#94a3b8' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fontWeight: '700', fill: '#94a3b8' }}
                                    dx={-10}
                                />
                                <Tooltip
                                    cursor={{ stroke: '#D4AF37', strokeWidth: 1 }}
                                    contentStyle={{
                                        borderRadius: '24px',
                                        border: 'none',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                                        background: '#fff',
                                        padding: '16px'
                                    }}
                                    itemStyle={{ fontWeight: '900', color: '#D4AF37', fontFamily: 'poppins' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#D4AF37"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* City Sales Distribution */}
                <div className="bg-white dark:bg-dark-700 p-6 md:p-10 rounded-[40px] md:rounded-[56px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-xl md:text-2xl font-black text-text-primary dark:text-cream-50">الأداء الجغرافي</h3>
                            <p className="text-xs text-text-muted font-bold mt-2">توزيع كثافة المبيعات في المدن الليبية</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-3xl text-blue-600">
                            <Target size={24} />
                        </div>
                    </div>
                    <div className="h-[280px] md:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={city_sales} layout="vertical" margin={{ left: 10 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="city"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fontWeight: '800', fill: '#475569' }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: '#FAF9F6' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="#D4AF37"
                                    radius={[0, 12, 12, 0]}
                                    barSize={24}
                                    animationDuration={1500}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customer Segments */}
                <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm flex flex-col items-center">
                    <h3 className="text-xl font-black text-text-primary dark:text-cream-50 mb-8 self-start">تركيبة العملاء</h3>
                    <div className="h-[280px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={customer_segments}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="count"
                                    nameKey="segment"
                                    animationDuration={1800}
                                >
                                    {customer_segments.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-black text-text-secondary dark:text-gold-400 mr-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center -mt-4">
                            <Users size={30} className="mx-auto text-gold-500 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Top Selling Products List */}
                <div className="lg:col-span-2 bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xl font-black text-text-primary dark:text-cream-50">قائمة النخبة الأكثر مبيعاً</h3>
                            <p className="text-xs text-text-muted font-bold mt-2">المنتجات ذات الكثافة الربحية العالية</p>
                        </div>
                        <PieChartIcon size={24} className="text-gold-500" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {top_products.map((product, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-5 rounded-[28px] bg-cream-50/50 dark:bg-dark-800/40 border border-transparent hover:border-gold-100 dark:hover:border-dark-600 transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gold-500 opacity-[0.02] rounded-bl-full -z-10 group-hover:scale-150 transition-transform"></div>
                                <div className="w-12 h-12 bg-white dark:bg-dark-700 rounded-2xl flex items-center justify-center font-black text-gold-600 shadow-sm border border-gold-50 dark:border-dark-600 group-hover:bg-gold-500 group-hover:text-white transition-all font-poppins shrink-0">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-black text-sm text-text-primary dark:text-cream-50 truncate">{product.product_name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-gold-100/50 dark:bg-dark-600 text-gold-700 dark:text-gold-400 px-2 py-0.5 rounded-full font-bold">{product.total_sold} قطعة</span>
                                        <span className="text-[10px] text-text-muted font-bold">{product.revenue.toFixed(2)} د.ل</span>
                                    </div>
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

import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ShoppingBag, TrendingUp, Users, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { adminApi } from '../services/api';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getStats()
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, []);

    if (loading) return <div className="p-8">Loading stats...</div>;

    const stats = [
        { label: 'إجمالي الإيرادات', value: `${data?.stats.revenue || 0} ر.س`, icon: <TrendingUp className="text-emerald-500" />, trend: '+12.5%', isUp: true },
        { label: 'عدد الطلبات', value: data?.stats.orders || 0, icon: <ShoppingBag className="text-blue-500" />, trend: '+8.2%', isUp: true },
        { label: 'المنتجات النشطة', value: data?.stats.products || 0, icon: <Package className="text-orange-500" />, trend: '-2.4%', isUp: false },
        { label: 'إجمالي العملاء', value: '1,240', icon: <Users className="text-purple-500" />, trend: '+15.3%', isUp: true },
    ];

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">نظرة عامة على المتجر</h1>
                <div className="text-sm text-gray-500">آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}</div>
            </div>

            {/* Stats Cards */}
            <div className="row g-4">
                {stats.map((stat, i) => (
                    <div key={i} className="col-12 col-md-6 col-lg-3">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-100">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 rounded-xl bg-gray-50">{stat.icon}</div>
                                <div className={`flex items-center text-sm font-bold ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.trend}
                                    {stat.isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mb-1">{stat.label}</div>
                            <div className="text-2xl font-bold text-gray-900 font-poppins">{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="row g-4">
                <div className="col-12 col-lg-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-100">
                        <h3 className="text-lg font-bold mb-6">نمو الإيرادات (MRR)</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.monthly_sales}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#C5A572" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#C5A572" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="revenue" stroke="#C5A572" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm h-100">
                        <h3 className="text-lg font-bold mb-6">الطلبات حسب المدن</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[{ name: 'الرياض', count: 40 }, { name: 'جدة', count: 30 }, { name: 'الدمام', count: 20 }, { name: 'مكة', count: 10 }]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#2C2416" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

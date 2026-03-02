import { useState, useEffect, useCallback } from 'react';
import { crmApi } from '../../services/api';
import {
    Search,
    User,
    Phone,
    MapPin,
    ShoppingBag,
    TrendingUp,
    MessageSquare,
    ChevronLeft,
    X,
    Clock,
    Tag as TagIcon,
    Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const DashboardCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegment, setFilterSegment] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [interactionForm, setInteractionForm] = useState({
        interaction_type: 'call',
        subject: '',
        content: ''
    });

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await crmApi.getProfiles({
                search: searchTerm,
                segment: filterSegment,
                page: currentPage,
                page_size: 10
            });
            setCustomers(res.data.results || res.data);
            setTotalPages(Math.ceil((res.data.count || res.data.length) / 10));
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل العملاء');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterSegment]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const fetchCustomerDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await crmApi.getProfileDetail(id);
            setCustomerDetail(res.data);
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل تفاصيل العميل');
            setSelectedCustomer(null);
        } finally {
            setDetailLoading(false);
        }
    };


    const handleViewCustomer = (customer) => {
        setSelectedCustomer(customer);
        fetchCustomerDetail(customer.id);
    };

    const handleAddInteraction = async (e) => {
        e.preventDefault();
        try {
            await crmApi.addInteraction(selectedCustomer.id, {
                interaction_type: interactionForm.interaction_type,
                subject: interactionForm.subject,
                content: interactionForm.content
            });
            toast.success('تم تسجيل التفاعل');
            setInteractionForm({ interaction_type: 'call', subject: '', content: '' });
            fetchCustomerDetail(selectedCustomer.id);
        } catch (error) {
            console.error(error);
            toast.error('خطأ في التسجيل');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">إدارة العملاء (CRM)</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">متابعة سجل المشتريات وتصنيف العملاء.</p>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-gold-50 dark:bg-dark-600 text-gold-600">
                            <User size={20} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-[10px] font-black uppercase mb-1">إجمالي العملاء</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{customers.length}</p>
                </div>
                <div className="bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-[10px] font-black uppercase mb-1">عملاء VIP</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">{customers.filter(c => c.segment === 'vip').length}</p>
                </div>
                <div className="bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-[10px] font-black uppercase mb-1">متوسط الطلبات</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">
                        {(customers.reduce((acc, c) => acc + (c.total_orders || 0), 0) / (customers.length || 1)).toFixed(1)}
                    </p>
                </div>
                <div className="bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <p className="text-text-secondary dark:text-gold-400 text-[10px] font-black uppercase mb-1">إجمالي المبيعات</p>
                    <p className="text-2xl font-black text-text-primary dark:text-cream-50 font-poppins">
                        {customers.reduce((acc, c) => acc + parseFloat(c.total_spent || 0), 0).toLocaleString()} <span className="text-[10px]">د.ل</span>
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-700 p-4 md:p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-0 w-full md:min-w-[280px]">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gold-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الهاتف أو البريد..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm text-text-primary dark:text-cream-50 transition-all"
                    />
                </div>
                <select
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                    className="bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-6 py-3.5 rounded-2xl focus:outline-none text-sm min-w-[150px] text-text-primary dark:text-cream-50 cursor-pointer"
                >
                    <option value="">كل القطاعات</option>
                    <option value="new">عملاء جدد</option>
                    <option value="regular">عملاء منتظمين</option>
                    <option value="vip">عملاء VIP</option>
                </select>
            </div>

            {/* List & Cards */}
            <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead className="bg-[#FAF9F6] dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-[10px] uppercase font-black">
                                <tr>
                                    <th className="px-8 py-6">العميل</th>
                                    <th className="px-8 py-6">الموقع</th>
                                    <th className="px-8 py-6">إجمالي الإنفاق</th>
                                    <th className="px-8 py-6">التصنيف</th>
                                    <th className="px-8 py-6">آخر طلب</th>
                                    <th className="px-8 py-6 text-left">إجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-[13px]">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse h-20 bg-white dark:bg-dark-700">
                                            <td colSpan="6" className="px-8 py-6"></td>
                                        </tr>
                                    ))
                                ) : customers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-20 text-center opacity-50">
                                            <User size={48} className="mx-auto mb-2 text-gold-200" />
                                            <p className="font-black text-text-muted">لا يوجد عملاء مطابقين للبحث</p>
                                        </td>
                                    </tr>
                                ) : (
                                    customers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-all cursor-pointer group" onClick={() => handleViewCustomer(customer)}>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-11 h-11 bg-gold-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 rounded-2xl flex items-center justify-center text-gold-600 dark:text-gold-400 font-black text-sm font-poppins shadow-sm group-hover:bg-gold-500 group-hover:text-white transition-all">
                                                        {customer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text-primary dark:text-cream-50 text-sm">{customer.name}</p>
                                                        <p className="text-[11px] text-text-secondary dark:text-gold-400/70 font-bold font-poppins">{customer.phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-1.5 text-text-secondary dark:text-gold-400/80 font-bold">
                                                    <MapPin size={14} className="text-gold-500" />
                                                    {customer.city}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-black font-poppins text-gold-700 dark:text-gold-400">
                                                {parseFloat(customer.total_spent || 0).toLocaleString()} <span className="text-[10px]">د.ل</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase ${customer.segment === 'vip' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20' :
                                                    customer.segment === 'regular' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                                                        'bg-green-50 text-green-600 dark:bg-green-900/20'
                                                    }`}>
                                                    {customer.segment === 'vip' ? 'عميل ذهبي' : customer.segment === 'regular' ? 'مشتري منتظم' : 'عميل جديد'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-text-muted dark:text-gold-400/60 font-black font-poppins text-[11px]">
                                                {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('ar-LY') : '—'}
                                            </td>
                                            <td className="px-8 py-6 text-left">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleViewCustomer(customer); }}
                                                        className="w-10 h-10 bg-gold-50 dark:bg-dark-600 hover:bg-gold-500 hover:text-white rounded-xl transition-all text-gold-600 flex items-center justify-center border border-gold-100 dark:border-dark-500/20"
                                                    >
                                                        <ChevronLeft size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-44 bg-white dark:bg-dark-700 rounded-[32px] animate-pulse" />)
                    ) : customers.length === 0 ? (
                        <div className="p-12 text-center opacity-50">
                            <User size={48} className="mx-auto mb-2 text-gold-200" />
                            <p className="font-black text-text-muted">لا يوجد عملاء</p>
                        </div>
                    ) : (
                        customers.map((customer) => (
                            <div key={customer.id} onClick={() => handleViewCustomer(customer)} className="bg-white dark:bg-dark-700 p-5 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm active:scale-95 transition-all">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gold-50 dark:bg-dark-800 rounded-2xl flex items-center justify-center text-gold-600 font-black text-sm">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-text-primary dark:text-cream-50 text-sm">{customer.name}</p>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${customer.segment === 'vip' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'}`}>
                                                {customer.segment}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] text-text-muted font-bold mb-1 uppercase">مجموع الإنفاق</p>
                                        <p className="font-black text-gold-600 dark:text-gold-400 font-poppins">{parseFloat(customer.total_spent || 0).toFixed(2)} د.ل</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gold-50 dark:border-dark-600">
                                    <div className="flex items-center gap-1 text-[10px] text-text-secondary font-bold">
                                        <Phone size={12} className="text-gold-500" />
                                        <span className="font-poppins">{customer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-text-secondary font-bold justify-end">
                                        <MapPin size={12} className="text-gold-500" />
                                        {customer.city}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Customer Detail Drawer */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-2xl h-full shadow-2xl relative z-10 overflow-hidden flex flex-col border-r border-gold-100 dark:border-dark-600">
                        <div className="p-6 md:p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50/50 dark:bg-dark-800 animate-slide-in-right">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 bg-gold-100 dark:bg-dark-600 rounded-2xl flex items-center justify-center text-gold-600 text-2xl font-black shadow-inner">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-text-primary dark:text-cream-50 leading-tight">{selectedCustomer.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-xs text-text-secondary dark:text-gold-400 font-bold font-poppins">{selectedCustomer.phone}</p>
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${selectedCustomer.segment === 'vip' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20' : 'bg-green-100 text-green-700 dark:bg-green-500/20'}`}>
                                            {selectedCustomer.segment === 'vip' ? 'GOLD MEMBER' : 'REGULAR'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {selectedCustomer.phone && (
                                    <a
                                        href={`https://wa.me/${selectedCustomer.phone.replace(/\s+/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20 flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <MessageSquare size={20} />
                                    </a>
                                )}
                                <button onClick={() => setSelectedCustomer(null)} className="w-10 h-10 bg-white dark:bg-dark-600 hover:bg-gold-50 dark:hover:bg-dark-500 rounded-xl transition-all text-text-primary dark:text-cream-50 border border-gold-50 dark:border-dark-600 flex items-center justify-center">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
                            {detailLoading ? (
                                <div className="space-y-6">
                                    <div className="h-32 bg-cream-50 dark:bg-dark-800 rounded-[32px] animate-pulse"></div>
                                    <div className="h-64 bg-cream-50 dark:bg-dark-800 rounded-[32px] animate-pulse"></div>
                                </div>
                            ) : customerDetail && (
                                <>
                                    {/* Stats Summary Area */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gradient-to-br from-gold-50 to-white dark:from-dark-800 dark:to-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gold-400 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform"></div>
                                            <p className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase mb-2">إجمالي الإيرادات</p>
                                            <p className="text-2xl font-black font-poppins text-text-primary dark:text-cream-50 mb-1">{parseFloat(customerDetail.total_spent || 0).toLocaleString()}</p>
                                            <p className="text-[11px] font-bold text-text-muted">دينار ليبي</p>
                                        </div>
                                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-dark-800 dark:to-dark-700 p-6 rounded-[32px] border border-blue-100 dark:border-dark-600 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400 opacity-5 rounded-bl-full group-hover:scale-150 transition-transform"></div>
                                            <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">حجم الطلبات</p>
                                            <p className="text-2xl font-black font-poppins text-text-primary dark:text-cream-50 mb-1">{customerDetail.total_orders || 0}</p>
                                            <p className="text-[11px] font-bold text-text-muted">طلبية ناجحة</p>
                                        </div>
                                    </div>

                                    {/* Detailed Sections Tabs-like Layout */}
                                    <div className="space-y-8">
                                        {/* Profile Card */}
                                        <div className="bg-white dark:bg-dark-800 rounded-[32px] border border-gold-50 dark:border-dark-600 overflow-hidden">
                                            <div className="px-6 py-4 bg-cream-50 dark:bg-dark-900/50 border-b border-gold-50 dark:border-dark-600 flex items-center gap-2">
                                                <User size={16} className="text-gold-600" />
                                                <h4 className="text-[11px] font-black uppercase text-gold-700 dark:text-gold-400">بيانات الملف الشخصي</h4>
                                            </div>
                                            <div className="p-6 grid grid-cols-2 gap-y-6 gap-x-4">
                                                <div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">البريد الإلكتروني</p>
                                                    <p className="text-xs font-bold text-text-primary dark:text-cream-50 truncate">{customerDetail.email || 'غير متوفر'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">تاريخ الميلاد</p>
                                                    <p className="text-xs font-bold text-text-primary dark:text-cream-50 font-poppins">
                                                        {customerDetail.birth_day ? `${customerDetail.birth_day}/${customerDetail.birth_month || ''}/${customerDetail.birth_year || ''}` : '—'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">الميول (العطر المفضل)</p>
                                                    <p className="text-xs font-bold text-text-primary dark:text-cream-50">
                                                        {customerDetail.preferred_gender === 'M' ? 'رجال' : customerDetail.preferred_gender === 'F' ? 'نساء' : 'عام'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">عضو منذ</p>
                                                    <p className="text-xs font-bold text-text-primary dark:text-cream-50 font-poppins">{new Date(selectedCustomer.created_at || Date.now()).toLocaleDateString('ar-LY')}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Card */}
                                        <div className="bg-white dark:bg-dark-800 rounded-[32px] border border-gold-50 dark:border-dark-600 overflow-hidden">
                                            <div className="px-6 py-4 bg-cream-50 dark:bg-dark-900/50 border-b border-gold-50 dark:border-dark-600 flex items-center gap-2">
                                                <MapPin size={16} className="text-gold-600" />
                                                <h4 className="text-[11px] font-black uppercase text-gold-700 dark:text-gold-400">لوجيسيات الشحن والتوصيل</h4>
                                            </div>
                                            <div className="p-6 space-y-5">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-text-muted uppercase mb-1">المدينة</p>
                                                        <p className="text-xs font-black text-text-primary dark:text-cream-50">{customerDetail.city}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-text-muted uppercase mb-1">المنطقة</p>
                                                        <p className="text-xs font-black text-text-primary dark:text-cream-50">{customerDetail.area || '—'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-text-muted uppercase mb-1">العنوان الأساسي</p>
                                                    <p className="text-xs font-bold text-text-secondary dark:text-gold-400/80 leading-relaxed">{customerDetail.address}</p>
                                                </div>
                                                {customerDetail.location_details && (
                                                    <div className="p-3 bg-gold-50/50 dark:bg-dark-700 rounded-xl border border-gold-100 dark:border-dark-600">
                                                        <p className="text-[9px] font-black text-gold-600 mb-1">ملاحظات العنوان</p>
                                                        <p className="text-[11px] font-bold text-text-secondary dark:text-gold-400">{customerDetail.location_details}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* CRM Interactions Area */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <MessageSquare size={20} className="text-gold-500" />
                                                <h4 className="text-lg font-black text-text-primary dark:text-cream-50">سجل التواصل (CRM Logs)</h4>
                                            </div>
                                            <div className="bg-white dark:bg-dark-800 border border-gold-50 dark:border-dark-600 p-6 rounded-[40px] shadow-sm">
                                                <form onSubmit={handleAddInteraction} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="عنوان التفاعل..."
                                                            value={interactionForm.subject}
                                                            onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                                                            className="col-span-2 w-full bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-bold text-text-primary dark:text-cream-50"
                                                        />
                                                        <select
                                                            value={interactionForm.interaction_type}
                                                            onChange={(e) => setInteractionForm({ ...interactionForm, interaction_type: e.target.value })}
                                                            className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-2xl focus:outline-none text-[11px] font-black text-text-primary dark:text-cream-50 cursor-pointer"
                                                        >
                                                            <option value="call">اتصال هاتفي</option>
                                                            <option value="whatsapp">واتساب</option>
                                                            <option value="visit">زيارة ميدانية</option>
                                                            <option value="problem">شكوى عميل</option>
                                                        </select>
                                                        <button className="bg-gold-600 text-white font-black py-3 px-6 rounded-2xl hover:bg-gold-700 transition-all text-xs flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 active:scale-95">
                                                            <Plus size={16} /> تسجيل الملاحظة
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        required
                                                        placeholder="ماذا حدث خلال التواصل؟ اكتب التفاصيل هنا..."
                                                        value={interactionForm.content}
                                                        onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                                                        className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm min-h-[100px] font-bold text-text-primary dark:text-cream-50"
                                                    ></textarea>
                                                </form>

                                                <div className="mt-8 space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pl-2">
                                                    {customerDetail.interactions?.length > 0 ? (
                                                        customerDetail.interactions.map((int, i) => (
                                                            <div key={i} className="bg-cream-50 dark:bg-dark-900/30 border border-gold-50 dark:border-dark-600 p-5 rounded-3xl relative">
                                                                <div className="flex justify-between items-center mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${int.interaction_type === 'problem' ? 'bg-red-100 text-red-600' : 'bg-gold-100 text-gold-700'}`}>
                                                                            {int.interaction_type}
                                                                        </span>
                                                                        <h5 className="text-[13px] font-black text-text-primary dark:text-cream-50 truncate max-w-[150px]">{int.subject}</h5>
                                                                    </div>
                                                                    <span className="text-[10px] text-text-muted font-bold font-poppins">{new Date(int.created_at).toLocaleDateString('ar-LY')}</span>
                                                                </div>
                                                                <p className="text-xs text-text-secondary dark:text-gold-400/80 leading-relaxed font-bold">{int.content}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-center py-6 text-[11px] text-text-muted font-bold italic">لا توجد تفاعلات مسجلة لهذا العميل حتى الآن.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Purchase History */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3">
                                                <ShoppingBag size={20} className="text-gold-500" />
                                                <h4 className="text-lg font-black text-text-primary dark:text-cream-50">تاريخ المشتريات (Order History)</h4>
                                            </div>
                                            <div className="space-y-4">
                                                {customerDetail.orders?.length > 0 ? (
                                                    customerDetail.orders.map((order) => (
                                                        <div key={order.order_number} className="group bg-white dark:bg-dark-800 p-5 rounded-[32px] border border-gold-50 dark:border-dark-600 hover:border-gold-300 transition-all flex justify-between items-center shadow-sm">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-gray-50 dark:bg-dark-700 rounded-2xl flex items-center justify-center font-black text-sm font-poppins text-text-primary dark:text-cream-50 group-hover:bg-gold-50 transition-colors">
                                                                    #{order.order_number}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] text-text-muted font-bold uppercase mb-1">تاريخ الطلب</p>
                                                                    <p className="text-xs font-black font-poppins text-text-primary dark:text-cream-50">{new Date(order.created_at).toLocaleDateString('ar-LY')}</p>
                                                                </div>
                                                            </div>
                                                            <div className="text-left">
                                                                <p className="font-black font-poppins text-gold-700 dark:text-gold-400 text-lg mb-1">{order.total} د.ل</p>
                                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                    {order.status === 'delivered' ? 'مكتمل' : order.status === 'cancelled' ? 'ملغي' : 'قيد المعالجة'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-10 bg-cream-50/50 dark:bg-dark-800 border border-dashed border-gold-200 dark:border-dark-600 text-center rounded-[40px]">
                                                        <ShoppingBag size={32} className="mx-auto text-gold-200 mb-3" />
                                                        <p className="text-[11px] font-bold text-text-muted">السجل نظيف، لم يطلب هذا العميل أي شيء بعد.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCustomers;

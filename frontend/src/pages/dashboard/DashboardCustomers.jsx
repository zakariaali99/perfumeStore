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
    Plus,
    Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const segmentMap = {
    new: { label: 'جديد', bg: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    regular: { label: 'منتظم', bg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    vip: { label: 'VIP 👑', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-black' },
    inactive: { label: 'خامل', bg: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

const DashboardCustomers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSegment, setFilterSegment] = useState('');
    const [tags, setTags] = useState([]);
    const [filterTag, setFilterTag] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetail, setCustomerDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [exporting, setExporting] = useState(false);
    const [interactionForm, setInteractionForm] = useState({
        interaction_type: 'call',
        subject: '',
        content: ''
    });

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const res = await crmApi.getTags();
                setTags(res.data?.results || res.data || []);
            } catch (err) {
                console.error('Error fetching tags:', err);
            }
        };
        fetchTags();
    }, []);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await crmApi.getProfiles({
                search: searchTerm,
                segment: filterSegment,
                tags: filterTag,
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
    }, [currentPage, searchTerm, filterSegment, filterTag]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const handleExportCsv = async () => {
        setExporting(true);
        try {
            const token = localStorage.getItem('access_token');
            const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/';
            const cleanBaseURL = baseURL.endsWith('/') ? baseURL : `${baseURL}/`;
            const url = `${cleanBaseURL}crm/customers/export_csv/?token=${token}&segment=${filterSegment}&tags=${filterTag}&search=${encodeURIComponent(searchTerm)}`;
            
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.setAttribute('download', 'customers_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('تم تصدير قائمة العملاء بنجاح');
        } catch {
            toast.error('فشل تصدير بيانات العملاء');
        } finally {
            setExporting(false);
        }
    };

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
                    <p className="text-text-secondary dark:text-gold-400 text-sm">متابعة سجل المشتريات والتصنيف التلقائي للعملاء.</p>
                </div>
                <button
                    onClick={handleExportCsv}
                    disabled={exporting}
                    className="bg-gold-600 hover:bg-gold-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-md shadow-gold-600/20 text-sm disabled:opacity-50"
                >
                    <Download size={18} />
                    تصدير إلى CSV
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-dark-700 p-4 rounded-3xl border border-gold-100 dark:border-dark-600 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-0 w-full md:min-w-[280px]">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gold-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الهاتف أو البريد..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm text-text-primary dark:text-cream-50"
                    />
                </div>
                <select
                    value={filterSegment}
                    onChange={(e) => setFilterSegment(e.target.value)}
                    className="bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-4 py-3 rounded-2xl focus:outline-none text-sm min-w-[150px] text-text-primary dark:text-cream-50"
                >
                    <option value="">كل القطاعات</option>
                    <option value="new">عملاء جدد (New)</option>
                    <option value="regular">عملاء منتظمين (Regular)</option>
                    <option value="vip">عملاء VIP 👑</option>
                    <option value="inactive">عملاء خاملين (Inactive)</option>
                </select>
                <select
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                    className="bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-4 py-3 rounded-2xl focus:outline-none text-sm min-w-[150px] text-text-primary dark:text-cream-50"
                >
                    <option value="">كل الوسوم</option>
                    {Array.isArray(tags) && tags.map((tag) => (
                        <option key={tag.id} value={tag.id}>
                            {tag.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-cream-50 dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-4 md:px-8 py-5">العميل</th>
                                <th className="px-4 md:px-8 py-5 hidden md:table-cell">الموقع</th>
                                <th className="px-4 md:px-8 py-5">إجمالي الإنفاق</th>
                                <th className="px-4 md:px-8 py-5">التصنيف</th>
                                <th className="px-4 md:px-8 py-5 hidden lg:table-cell">آخر طلب</th>
                                <th className="px-4 md:px-8 py-5">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-sm">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse h-20 bg-white dark:bg-dark-700">
                                        <td colSpan="5" className="px-8 py-6"></td>
                                    </tr>
                                ))
                            ) : customers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center opacity-50">
                                        <User size={48} className="mx-auto mb-2" />
                                        <p className="font-bold">لا يوجد عملاء</p>
                                    </td>
                                </tr>
                            ) : (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-colors">
                                        <td className="px-4 md:px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gold-50 dark:bg-dark-600 rounded-full flex items-center justify-center text-gold-600 font-bold font-poppins">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-black text-text-primary dark:text-cream-50">{customer.name}</p>
                                                    <p className="text-xs text-text-secondary dark:text-gold-400 font-poppins">{customer.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 hidden md:table-cell text-text-secondary dark:text-gold-400">
                                            <div className="flex items-center gap-1 font-bold">
                                                <MapPin size={14} />
                                                {customer.city}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 font-black font-poppins text-gold-700 dark:text-gold-400">
                                            {parseFloat(customer.total_spent).toFixed(2)} د.ل
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            {(() => {
                                                const s = segmentMap[customer.segment] || { label: customer.segment, bg: 'bg-gray-100 text-gray-700' };
                                                return (
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${s.bg}`}>
                                                        {s.label}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-4 md:px-8 py-5 hidden lg:table-cell text-text-secondary dark:text-gold-400 font-bold text-xs">
                                            {customer.last_order_date ? new Date(customer.last_order_date).toLocaleDateString('ar-LY') : 'لا يوجد'}
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleViewCustomer(customer)}
                                                    className="bg-gold-50 dark:bg-dark-600 hover:bg-gold-500 hover:text-white p-2 rounded-xl transition-all text-gold-600"
                                                    title="تفاصيل العميل"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                {customer.phone && (
                                                    <a
                                                        href={`https://wa.me/${customer.phone.replace(/\s+/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-green-50 dark:bg-dark-600 hover:bg-green-500 hover:text-white p-2 rounded-xl transition-all text-green-600"
                                                        title="تواصل عبر واتساب"
                                                    >
                                                        <MessageSquare size={20} />
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
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

            {/* Customer Detail Drawer */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedCustomer(null)}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-2xl h-full shadow-2xl relative z-10 overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gold-100 dark:bg-dark-600 rounded-2xl flex items-center justify-center text-gold-600 text-xl font-black">
                                    {selectedCustomer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-text-primary dark:text-cream-50">{selectedCustomer.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-text-secondary dark:text-gold-400 font-poppins">{selectedCustomer.phone}</p>
                                        {(() => {
                                            const s = segmentMap[selectedCustomer.segment] || { label: selectedCustomer.segment, bg: 'bg-gray-100 text-gray-700' };
                                            return (
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${s.bg}`}>
                                                    {s.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="p-2 hover:bg-gold-100 rounded-xl transition-all text-text-primary dark:text-cream-50">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {detailLoading ? (
                                <div className="space-y-6 animate-pulse">
                                    <div className="h-24 bg-cream-50 dark:bg-dark-800 rounded-3xl"></div>
                                    <div className="h-48 bg-cream-50 dark:bg-dark-800 rounded-3xl"></div>
                                </div>
                            ) : customerDetail && (
                                <>
                                    {/* Birthday Alerts */}
                                    {(() => {
                                        const bDay = Number(customerDetail.birth_day);
                                        const bMonth = Number(customerDetail.birth_month);
                                        if (bDay && bMonth) {
                                            const today = new Date();
                                            const isBdayToday = today.getDate() === bDay && (today.getMonth() + 1) === bMonth;
                                            const isBdayMonth = (today.getMonth() + 1) === bMonth;
                                            if (isBdayToday) {
                                                return (
                                                    <div className="p-5 bg-gradient-to-r from-amber-500 to-gold-600 text-white rounded-[28px] flex items-center gap-3 font-bold text-sm shadow-lg shadow-gold-500/25 animate-bounce">
                                                        <span>🎉 يصادف اليوم عيد ميلاد العميل! يمكنك إرسال كود تهنئة وخصم خاص.</span>
                                                    </div>
                                                );
                                            } else if (isBdayMonth) {
                                                return (
                                                    <div className="p-4 bg-gold-50 dark:bg-dark-800 border border-gold-200 dark:border-dark-600 text-gold-700 dark:text-gold-400 rounded-[28px] flex items-center gap-3 font-bold text-sm">
                                                        <span>🎂 يصادف هذا الشهر عيد ميلاد العميل.</span>
                                                    </div>
                                                );
                                            }
                                        }
                                        return null;
                                    })()}

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-gold-50 dark:bg-dark-800 p-5 rounded-[28px] border border-gold-100 dark:border-dark-600">
                                            <p className="text-[9px] font-black text-gold-600 dark:text-gold-400 uppercase mb-1">إجمالي الإنفاق</p>
                                            <p className="text-sm md:text-base font-black font-poppins text-gold-700 dark:text-gold-400">{parseFloat(customerDetail.total_spent).toFixed(2)} د.ل</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-dark-800 p-5 rounded-[28px] border border-blue-100 dark:border-dark-600">
                                            <p className="text-[9px] font-black text-blue-600 dark:text-gold-400 uppercase mb-1">الطلبيات</p>
                                            <p className="text-sm md:text-base font-black font-poppins text-blue-700">{customerDetail.total_orders}</p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-dark-800 p-5 rounded-[28px] border border-purple-100 dark:border-dark-600">
                                            <p className="text-[9px] font-black text-purple-600 dark:text-gold-400 uppercase mb-1">معدل الطلب</p>
                                            <p className="text-sm md:text-base font-black font-poppins text-purple-700">{parseFloat(customerDetail.avg_order_value || 0).toFixed(2)} د.ل</p>
                                        </div>
                                    </div>

                                    {/* Personal Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                            <User size={18} className="text-gold-500" />
                                            المعلومات الشخصية
                                        </h4>
                                        <div className="bg-cream-50 dark:bg-dark-800 p-6 rounded-[32px] border border-gold-50 dark:border-dark-600 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">الهاتف</p>
                                                <p className="text-sm font-bold text-text-primary dark:text-cream-50 font-poppins">{customerDetail.phone}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">البريد الإلكتروني</p>
                                                <p className="text-sm font-bold text-text-primary dark:text-cream-50 font-poppins">{customerDetail.email || 'غير متوفر'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">تاريخ الميلاد</p>
                                                <p className="text-sm font-bold text-text-primary dark:text-cream-50 font-poppins">
                                                    {customerDetail.birth_day && customerDetail.birth_month ? `${customerDetail.birth_day}/${customerDetail.birth_month}/${customerDetail.birth_year || ''}` : 'غير متوفر'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">النوع المفضل</p>
                                                <p className="text-sm font-bold text-text-primary dark:text-cream-50">
                                                    {customerDetail.preferred_gender === 'M' ? 'رجالي' : customerDetail.preferred_gender === 'F' ? 'نسائي' : customerDetail.preferred_gender === 'U' ? 'للجنسين' : 'غير محدد'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Fragrance Preferences */}
                                    {((customerDetail.favorite_brands_display && customerDetail.favorite_brands_display.length > 0) || 
                                      (customerDetail.favorite_families_display && customerDetail.favorite_families_display.length > 0)) && (
                                        <div className="space-y-4">
                                            <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                                <TagIcon size={18} className="text-gold-500" />
                                                التفضيلات العطرية
                                            </h4>
                                            <div className="bg-cream-50 dark:bg-dark-800 p-6 rounded-[32px] border border-gold-50 dark:border-dark-600 space-y-4">
                                                {customerDetail.favorite_brands_display && customerDetail.favorite_brands_display.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">الماركات المفضلة</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {customerDetail.favorite_brands_display.map((brand, idx) => (
                                                                <span key={idx} className="bg-gold-100/50 dark:bg-dark-600 text-gold-700 dark:text-gold-400 px-3 py-1 rounded-full text-xs font-bold">
                                                                    {brand}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {customerDetail.favorite_families_display && customerDetail.favorite_families_display.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">العائلات العطرية المفضلة</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {customerDetail.favorite_families_display.map((family, idx) => (
                                                                <span key={idx} className="bg-cream-100 dark:bg-dark-600 text-gold-700 dark:text-gold-400 px-3 py-1 rounded-full text-xs font-bold">
                                                                    {family}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* WhatsApp Direct templates */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                            <MessageSquare size={18} className="text-gold-500" />
                                            قوالب رسائل واتساب الجاهزة
                                        </h4>
                                        <div className="bg-cream-50 dark:bg-dark-800 p-6 rounded-[32px] border border-gold-50 dark:border-dark-600 space-y-3">
                                            {[
                                                {
                                                    title: 'متابعة ما بعد الشراء (عطور)',
                                                    text: `أهلاً ${customerDetail.name}، نتمنى أن تكون عطور متجرنا قد نالت إعجابك! نسعد بخدمتك دائماً ونرحب بآرائك.`
                                                },
                                                {
                                                    title: 'دعوة وعرض VIP خاص',
                                                    text: `أهلاً ${customerDetail.name}، بصفتك من كبار عملاء VIP لدينا، قمنا بتوفير تشكيلة جديدة وحصرية خصيصاً لك بخصم خاص!`
                                                },
                                                {
                                                    title: 'تهنئة عيد الميلاد',
                                                    text: `كل عام وأنت بخير أستاذ ${customerDetail.name} بمناسبة عيد ميلادك! يسعدنا إهداؤك كود خصم حصري: BDAY10 لطلبك القادم.`
                                                }
                                            ].map((tpl, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        const cleanPhone = customerDetail.phone.replace(/\s+/g, '');
                                                        const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(tpl.text)}`;
                                                        window.open(waUrl, '_blank');
                                                    }}
                                                    className="w-full text-right bg-white dark:bg-dark-700 hover:bg-gold-50/50 dark:hover:bg-dark-600 p-4 rounded-2xl border border-gold-100 dark:border-dark-600 flex justify-between items-center transition-all group"
                                                >
                                                    <div className="space-y-1">
                                                        <p className="font-black text-xs text-gold-700 dark:text-gold-400">{tpl.title}</p>
                                                        <p className="text-[10px] text-text-secondary dark:text-gold-400 truncate max-w-[320px] md:max-w-[450px]">{tpl.text}</p>
                                                    </div>
                                                    <MessageSquare size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Shipping Info */}
                                    <div className="space-y-4">
                                        <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                            <MapPin size={18} className="text-gold-500" />
                                            معلومات العنوان والشحن
                                        </h4>
                                        <div className="bg-cream-50 dark:bg-dark-800 p-6 rounded-[32px] border border-gold-50 dark:border-dark-600 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">المدينة</p>
                                                    <p className="text-sm font-bold text-text-primary dark:text-cream-50">{customerDetail.city}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">المنطقة</p>
                                                    <p className="text-sm font-bold text-text-primary dark:text-cream-50">{customerDetail.area}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">العنوان بالتفصيل</p>
                                                <p className="text-sm font-bold text-text-primary dark:text-cream-50">{customerDetail.address}</p>
                                            </div>
                                            {customerDetail.location_details && (
                                                <div>
                                                    <p className="text-[10px] font-black text-text-secondary dark:text-gold-400 uppercase mb-1">أقرب علامة / تفاصيل إضافية</p>
                                                    <p className="text-sm font-bold text-text-primary dark:text-cream-50">{customerDetail.location_details}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                            <MessageSquare size={18} className="text-gold-500" />
                                            سجل التفاعلات
                                        </h4>
                                        <form onSubmit={handleAddInteraction} className="space-y-3">
                                            <input
                                                type="text"
                                                required
                                                placeholder="الموضوع"
                                                value={interactionForm.subject}
                                                onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 p-4 rounded-2xl focus:outline-none text-sm text-text-primary dark:text-cream-50"
                                            />
                                            <textarea
                                                required
                                                placeholder="تفاصيل التفاعل..."
                                                value={interactionForm.content}
                                                onChange={(e) => setInteractionForm({ ...interactionForm, content: e.target.value })}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 p-4 rounded-2xl focus:outline-none text-sm min-h-[80px] text-text-primary dark:text-cream-50"
                                            ></textarea>
                                            <button className="w-full bg-gold-600 text-white font-bold py-3 rounded-2xl hover:bg-gold-700 transition-all flex items-center justify-center gap-2">
                                                <Plus size={18} /> تسجيل التفاعل
                                            </button>
                                        </form>

                                        <div className="space-y-4">
                                            {customerDetail.interactions?.map((int, i) => (
                                                <div key={i} className="bg-white dark:bg-dark-800 border border-gold-50 dark:border-dark-600 p-5 rounded-[28px]">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black bg-gold-50 dark:bg-dark-600 px-2 py-0.5 rounded-full text-gold-700 dark:text-gold-400">{int.interaction_type}</span>
                                                        <span className="text-[10px] text-text-muted font-bold font-poppins">{new Date(int.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <h5 className="text-sm font-bold text-text-primary dark:text-cream-50 mb-1">{int.subject}</h5>
                                                    <p className="text-xs text-text-secondary dark:text-gold-400 leading-relaxed">{int.content}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                            <ShoppingBag size={18} className="text-gold-500" />
                                            سجل الطلبات
                                        </h4>
                                        <div className="space-y-3">
                                            {customerDetail.orders?.map((order) => (
                                                <div key={order.order_number} className="bg-gray-50 dark:bg-dark-800 p-5 rounded-[28px] border border-gray-100 dark:border-dark-600 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-black font-poppins text-sm text-text-primary dark:text-cream-50">#{order.order_number}</p>
                                                        <p className="text-[10px] text-text-muted font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-black font-poppins text-gold-700 dark:text-gold-400">{order.total} د.ل</p>
                                                        <span className="text-[8px] font-black uppercase text-green-600">{order.status}</span>
                                                    </div>
                                                </div>
                                            ))}
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

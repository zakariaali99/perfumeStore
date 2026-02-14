import { useState, useEffect } from 'react';
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

    useEffect(() => {
        fetchCustomers();
    }, [currentPage]);

    const fetchCustomers = async () => {
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
        } catch (err) {
            toast.error('تعذر تحميل العملاء');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await crmApi.getProfileDetail(id);
            setCustomerDetail(res.data);
        } catch (err) {
            toast.error('تعذر تحميل تفاصيل العميل');
            setSelectedCustomer(null);
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchCustomers();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterSegment]);

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
        } catch (err) {
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

            {/* Filters */}
            <div className="bg-white dark:bg-dark-700 p-4 rounded-3xl border border-gold-100 dark:border-dark-600 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[280px]">
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
                    <option value="new">عملاء جدد</option>
                    <option value="regular">عملاء منتظمين</option>
                    <option value="vip">عملاء VIP</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-cream-50 dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-8 py-5">العميل</th>
                                <th className="px-8 py-5">الموقع</th>
                                <th className="px-8 py-5">إجمالي الإنفاق</th>
                                <th className="px-8 py-5">التصنيف</th>
                                <th className="px-8 py-5">إجراءات</th>
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
                                        <td className="px-8 py-5">
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
                                        <td className="px-8 py-5 text-text-secondary dark:text-gold-400">
                                            <div className="flex items-center gap-1 font-bold">
                                                <MapPin size={14} />
                                                {customer.city}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-black font-poppins text-gold-700 dark:text-gold-400">
                                            {parseFloat(customer.total_spent).toFixed(2)} د.ل
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${customer.segment === 'vip' ? 'bg-purple-50 text-purple-600' :
                                                customer.segment === 'regular' ? 'bg-blue-50 text-blue-600' :
                                                    'bg-green-50 text-green-600'
                                                }`}>
                                                {customer.segment}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <button
                                                onClick={() => handleViewCustomer(customer)}
                                                className="bg-gold-50 dark:bg-dark-600 hover:bg-gold-500 hover:text-white p-2 rounded-xl transition-all text-gold-600"
                                            >
                                                <ChevronLeft size={20} />
                                            </button>
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
                                    <p className="text-sm text-text-secondary dark:text-gold-400 font-poppins">{selectedCustomer.phone}</p>
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gold-50 dark:bg-dark-800 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600">
                                            <p className="text-[10px] font-black text-gold-600 dark:text-gold-400 uppercase mb-1">إجمالي الإنفاق</p>
                                            <p className="text-xl font-black font-poppins text-gold-700 dark:text-gold-400">{parseFloat(customerDetail.total_spent).toFixed(2)} د.ل</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-dark-800 p-6 rounded-[32px] border border-blue-100 dark:border-dark-600">
                                            <p className="text-[10px] font-black text-blue-600 dark:text-gold-400 uppercase mb-1">الطلبات</p>
                                            <p className="text-xl font-black font-poppins text-blue-700">{customerDetail.total_orders}</p>
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

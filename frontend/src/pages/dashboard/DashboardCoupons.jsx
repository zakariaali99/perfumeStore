import { useState, useEffect } from 'react';
import { marketingApi } from '../../services/api';
import {
    Plus,
    Ticket,
    Edit,
    Trash2,
    Calendar,
    Activity,
    Copy,
    CheckCircle2,
    X,
    Save,
    Percent,
    Banknote
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        usage_limit: null,
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await marketingApi.list();
            setCoupons(res.data.results || res.data || []);
        } catch (err) {
            toast.error('تعذر تحميل الكوبونات');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                code: item.code,
                discount_type: item.discount_type,
                discount_value: item.discount_value,
                min_order_amount: item.min_order_amount,
                valid_from: item.valid_from.split('T')[0],
                valid_to: item.valid_to.split('T')[0],
                usage_limit: item.usage_limit,
                is_active: item.is_active
            });
        } else {
            setEditingItem(null);
            setFormData({
                code: '',
                discount_type: 'percentage',
                discount_value: 0,
                min_order_amount: 0,
                valid_from: new Date().toISOString().split('T')[0],
                valid_to: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                usage_limit: null,
                is_active: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const copyToClipboard = (code) => {
        navigator.clipboard.writeText(code);
        toast.success('تم نسخ الكود');
    };

    const handleDelete = async (code) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;
        try {
            await marketingApi.delete(code);
            toast.success('تم الحذف بنجاح');
            fetchCoupons();
        } catch (err) {
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await marketingApi.update(editingItem.code, formData);
                toast.success('تم التحديث بنجاح');
            } else {
                await marketingApi.create(formData);
                toast.success('تم إنشاء الكوبون بنجاح');
            }
            handleCloseModal();
            fetchCoupons();
        } catch (err) {
            toast.error(err.response?.data?.code?.[0] || 'حدث خطأ أثناء الحفظ');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">الكوبونات والخصومات</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">إنشاء وإدارة أكواد الخصم، العروض الترويجية وقيود الاستخدام.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    إنشاء كوبون جديد
                </button>
            </div>

            {/* Coupons List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                    [1, 2, 3].map(i => <div key={i} className="h-64 bg-white dark:bg-dark-700 animate-pulse rounded-[40px] border border-gold-100 dark:border-dark-600"></div>)
                ) : coupons.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-50 bg-white dark:bg-dark-700 rounded-[40px] border border-dashed border-gold-200 dark:border-dark-600">
                        <Ticket size={48} className="mx-auto mb-4 text-gold-400" />
                        <p className="font-bold text-xl text-text-primary dark:text-cream-50">لا يوجد كوبونات فعالة حالياً</p>
                        <p className="text-sm mt-2 text-text-secondary dark:text-gold-400">ابدأ بإنشاء أول كوبون لجذب المزيد من العملاء!</p>
                    </div>
                ) : (
                    coupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600 overflow-hidden shadow-sm hover:shadow-xl transition-all relative group">
                            {/* Card Background Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-50 dark:bg-dark-800 rounded-bl-[100px] -z-10 opacity-50 group-hover:bg-gold-100 dark:group-hover:bg-dark-600 transition-colors"></div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div
                                        onClick={() => copyToClipboard(coupon.code)}
                                        className="bg-cream-50 dark:bg-dark-600 border-2 border-dashed border-gold-200 dark:border-dark-500 px-4 py-2 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-gold-50 dark:hover:bg-dark-800 transition-colors group/code"
                                    >
                                        <span className="font-black text-lg font-poppins text-gold-700 dark:text-gold-400 uppercase">{coupon.code}</span>
                                        <Copy size={16} className="text-gold-400 group-hover/code:text-gold-600" />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${coupon.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                        {coupon.is_active ? 'نشط' : 'متوقف'}
                                    </span>
                                </div>

                                <div className="mb-8">
                                    <h3 className="text-4xl font-black text-text-primary dark:text-cream-50 mb-2 font-poppins">
                                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `${coupon.discount_value} د.ل`}
                                        <span className="text-sm font-bold text-text-secondary dark:text-gold-400 mr-2">خصم</span>
                                    </h3>
                                    <p className="text-sm text-text-secondary dark:text-gold-400 leading-relaxed font-bold">
                                        يصل إلى {coupon.max_discount_amount || '∞'} د.ل
                                    </p>
                                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                                        صالح حتى {new Date(coupon.valid_to).toLocaleDateString('ar-LY')}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gold-50 dark:border-dark-600">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-text-secondary dark:text-gold-500 flex items-center gap-1 font-bold">
                                            <Activity size={14} />
                                            مرات الاستخدام:
                                        </span>
                                        <span className="font-black text-text-primary dark:text-cream-50">{coupon.used_count} / {coupon.usage_limit || '∞'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-text-secondary dark:text-gold-500 flex items-center gap-1 font-bold">
                                            <Calendar size={14} />
                                            الحد الأدنى للطلب:
                                        </span>
                                        <span className="font-black font-poppins text-text-primary dark:text-cream-50">{coupon.min_order_amount} د.ل</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-8">
                                    <button
                                        onClick={() => handleOpenModal(coupon)}
                                        className="flex-1 py-3 bg-gray-50 dark:bg-dark-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-text-secondary dark:text-gold-400 hover:text-blue-600 rounded-2xl transition-all font-bold text-xs flex items-center justify-center gap-2"
                                    >
                                        <Edit size={14} />
                                        تعديل
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.code)}
                                        className="p-3 bg-gray-50 dark:bg-dark-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-text-secondary dark:text-gold-400 hover:text-red-600 rounded-2xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">
                                    {editingItem ? 'تعديل الكوبون' : 'إنشاء كوبون جديد'}
                                </h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400">أدخل تفاصيل الخصم وقيود الاستخدام.</p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">كود الخصم</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-lg font-black font-poppins uppercase tracking-widest text-text-primary dark:text-cream-50"
                                        placeholder="EX: OFF50"
                                        disabled={!!editingItem}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">نوع الخصم</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-bold"
                                    >
                                        <option value="percentage">نسبة مئوية (%)</option>
                                        <option value="fixed">مبلغ ثابت (د.ل)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">قيمة الخصم</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            value={formData.discount_value}
                                            onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-black"
                                        />
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-600">
                                            {formData.discount_type === 'percentage' ? <Percent size={18} /> : <Banknote size={18} />}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الحد الأدنى للطلب</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: parseFloat(e.target.value) })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">تاريخ البدء</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.valid_from}
                                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">تاريخ الانتهاء</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.valid_to}
                                        onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">عدد مرات الاستخدام</label>
                                    <input
                                        type="number"
                                        value={formData.usage_limit || ''}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                        placeholder="اتركه فارغاً للاستخدام غير المحدود"
                                    />
                                </div>
                                <div className="flex items-center gap-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-5 h-5 accent-gold-600"
                                    />
                                    <label htmlFor="active" className="text-sm font-bold text-text-primary dark:text-cream-50 cursor-pointer select-none">تفعيل الكوبون الآن</label>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 transition-all"
                                >
                                    <Save size={20} />
                                    {editingItem ? 'تحديث الكوبون' : 'إنشاء الكوبون'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-8 py-4 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-500 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCoupons;

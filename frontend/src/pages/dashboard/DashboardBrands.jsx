import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload, Check, Search } from 'lucide-react';
import { adminBrandsApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const DashboardBrands = () => {
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentBrand, setCurrentBrand] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        name_ar: '',
        slug: '',
        logo: null,
        description: '',
        is_active: true
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const res = await adminBrandsApi.getAll();
            setBrands(res.data.results || res.data || []);
        } catch (err) {
            console.error(err);
            toast.error('فشل في جلب الماركات');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (brand = null) => {
        if (brand) {
            setCurrentBrand(brand);
            setFormData({
                name_ar: brand.name_ar,
                slug: brand.slug,
                description: brand.description || '',
                is_active: brand.is_active
            });
            setImagePreview(brand.logo);
        } else {
            setCurrentBrand(null);
            setFormData({
                name_ar: '',
                slug: '',
                logo: null,
                description: '',
                is_active: true
            });
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ name_ar: '', slug: '', logo: null, description: '', is_active: true });
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, logo: file }); // Note: API expects 'logo' but check if model expects 'logo'
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'logo' && typeof formData[key] === 'string') return; // Don't send URL string
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            if (currentBrand) {
                await adminBrandsApi.update(currentBrand.id, data);
                toast.success('تم تحديث الماركة بنجاح');
            } else {
                await adminBrandsApi.create(data);
                toast.success('تم إنشاء الماركة بنجاح');
            }
            fetchBrands();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الماركة؟')) {
            try {
                await adminBrandsApi.delete(id);
                toast.success('تم حذف الماركة');
                fetchBrands();
            } catch {
                toast.error('فشل في حذف الماركة');
            }
        }
    };

    const filteredBrands = brands.filter(b =>
        b.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-600"></div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary dark:text-cream-50">إدارة الماركات</h1>
                    <p className="text-sm text-text-secondary dark:text-gold-400 mt-1">إدارة العلامات التجارية والشركاء</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    <span>إضافة ماركة جديدة</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-dark-700 p-4 rounded-3xl border border-gold-100 dark:border-dark-600">
                <div className="relative">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gold-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث عن ماركة..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-sm text-text-primary dark:text-cream-50"
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-cream-50 dark:bg-dark-800 border-b border-gold-50 dark:border-dark-600">
                        <tr>
                            <th className="px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الشعار</th>
                            <th className="px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الاسم</th>
                            <th className="px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الرابط (Slug)</th>
                            <th className="px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الحالة</th>
                            <th className="px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-50 dark:divide-dark-600">
                        {filteredBrands.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-8 py-12 text-center text-text-muted dark:text-gold-400">
                                    لا توجد ماركات حالياً
                                </td>
                            </tr>
                        ) : (
                            filteredBrands.map((brand) => (
                                <tr key={brand.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-gold-100 dark:border-dark-600 bg-white dark:bg-dark-800 p-2 flex items-center justify-center">
                                            {brand.logo ? (
                                                <img src={brand.logo} alt={brand.name_ar} className="max-w-full max-h-full object-contain" />
                                            ) : (
                                                <span className="text-xs text-gray-400">لا يوجد</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-text-primary dark:text-cream-50">{brand.name_ar}</td>
                                    <td className="px-8 py-5 text-sm text-text-secondary dark:text-gold-400 font-poppins">{brand.slug}</td>
                                    <td className="px-8 py-5">
                                        <span className={`flex items-center gap-1.5 w-fit px-3 py-1 rounded-lg text-xs font-bold ${brand.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                            {brand.is_active ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleOpenModal(brand)}
                                                className="p-2 text-text-muted dark:text-gold-400 hover:text-blue-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                title="تعديل"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(brand.id)}
                                                className="p-2 text-text-muted dark:text-gold-400 hover:text-red-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                title="حذف"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white dark:bg-dark-700 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-text-primary dark:text-cream-50">{currentBrand ? 'تعديل ماركة' : 'إضافة ماركة جديدة'}</h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-600 rounded-full transition-colors text-text-secondary dark:text-gold-400">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400">الاسم بالعربية</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-text-primary dark:text-cream-50"
                                    placeholder="مثال: العربية للعود"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400">الرابط (Slug)</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all font-poppins text-text-primary dark:text-cream-50"
                                    placeholder="مثال: arabian-oud (يترك فارغاً للتوليد التلقائي)"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 rounded-2xl py-3.5 px-5 focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 outline-none transition-all text-text-primary dark:text-cream-50 min-h-[100px]"
                                    placeholder="وصف مختصر للماركة..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-text-secondary dark:text-gold-400">الشعار</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gold-100 dark:border-dark-600 border-dashed rounded-3xl relative hover:bg-gold-50/30 dark:hover:bg-dark-600/30 transition-colors">
                                    {imagePreview ? (
                                        <div className="relative w-full h-32 flex justify-center">
                                            <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setFormData({ ...formData, logo: null }) }}
                                                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 text-center">
                                            <div className="w-12 h-12 bg-gold-50 dark:bg-dark-600 rounded-full flex items-center justify-center mx-auto text-gold-500">
                                                <Upload size={24} />
                                            </div>
                                            <div className="flex flex-col text-sm text-text-secondary dark:text-gold-400">
                                                <label className="relative cursor-pointer rounded-md font-bold text-gold-600 hover:text-gold-500 focus-within:outline-none">
                                                    <span>اختر ملفاً للرفع</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                                <p className="text-xs opacity-70 mt-1">PNG, JPG, SVG up to 2MB</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-cream-50 dark:bg-dark-600 rounded-2xl">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-gold-600 rounded-md cursor-pointer"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-text-primary dark:text-cream-50 cursor-pointer select-none">
                                    تفعيل الماركة (إظهارها في المتجر)
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gold-600 text-white py-4 rounded-2xl font-bold hover:bg-gold-700 transition-all shadow-xl shadow-gold-600/20 flex items-center justify-center gap-2"
                            >
                                <Check size={20} />
                                <span>حفظ التغييرات</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardBrands;

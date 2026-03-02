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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-text-primary dark:text-cream-50">إدارة الماركات</h1>
                    <p className="text-sm text-text-secondary dark:text-gold-400 mt-1">إدارة العلامات التجارية والشركاء</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
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

            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden text-right">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-0">
                        <thead className="bg-cream-50 dark:bg-dark-800 border-b border-gold-50 dark:border-dark-600">
                            <tr>
                                <th className="px-4 md:px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الشعار</th>
                                <th className="px-4 md:px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الاسم</th>
                                <th className="px-4 md:px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase hidden md:table-cell">الرابط (Slug)</th>
                                <th className="px-4 md:px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الحالة</th>
                                <th className="px-4 md:px-8 py-5 text-xs font-bold text-text-secondary dark:text-gold-400 uppercase">الإجراءات</th>
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
                                        <td className="px-4 md:px-8 py-5">
                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden border border-gold-100 dark:border-dark-600 bg-white dark:bg-dark-800 p-1 md:p-2 flex items-center justify-center">
                                                {brand.logo ? (
                                                    <img src={brand.logo} alt={brand.name_ar} className="max-w-full max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-[10px] text-gray-400">لا يوجد</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-8 py-5 font-bold text-text-primary dark:text-cream-50 text-sm md:text-base">{brand.name_ar}</td>
                                        <td className="px-4 md:px-8 py-5 text-sm text-text-secondary dark:text-gold-400 font-poppins hidden md:table-cell">{brand.slug}</td>
                                        <td className="px-4 md:px-8 py-5">
                                            <span className={`flex items-center gap-1.5 w-fit px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold ${brand.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                                                <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${brand.is_active ? 'bg-green-600' : 'bg-red-600'}`}></div>
                                                {brand.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-4 md:px-8 py-5">
                                            <div className="flex items-center gap-1 md:gap-2">
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
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                    <div className="absolute inset-0 bg-dark-900/60 backdrop-blur-md" onClick={handleCloseModal} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-gold-100/50 dark:border-dark-600">
                        <div className="p-6 md:p-8 border-b border-gold-50 dark:border-dark-700 flex items-center justify-between bg-cream-50/50 dark:bg-dark-900/30">
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-text-primary dark:text-cream-50">{currentBrand ? 'تعديل البراند' : 'إضافة براند فاخر'}</h2>
                                <p className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest mt-0.5">Brand Management Portfolio</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center hover:bg-gold-50 dark:hover:bg-dark-700 rounded-2xl transition-all text-text-muted dark:text-gold-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-text-secondary dark:text-gold-400 uppercase mb-2 tracking-wider">اسم البراند (AR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                        placeholder="مثال: ديور، شانيل..."
                                        className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 rounded-[20px] py-4 px-6 focus:ring-2 focus:ring-gold-500/20 outline-none text-sm font-black text-text-primary dark:text-cream-50 transition-all placeholder:text-text-muted/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[11px] font-black text-text-secondary dark:text-gold-400 uppercase mb-2 tracking-wider">الرابط الفريد (Slug)</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="brand-slug"
                                            className="w-full bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600 rounded-[20px] py-4 px-6 focus:ring-2 focus:ring-gold-500/20 outline-none font-poppins text-sm font-black text-text-primary dark:text-cream-50 transition-all placeholder:text-text-muted/50"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <label className="flex items-center gap-3 cursor-pointer p-4 bg-cream-50 dark:bg-dark-700 rounded-[20px] border border-gold-100 dark:border-dark-600 transition-all hover:bg-gold-50/50">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.is_active}
                                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-10 h-6 bg-gray-200 dark:bg-dark-600 rounded-full peer peer-checked:bg-gold-500 transition-all"></div>
                                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:left-5"></div>
                                            </div>
                                            <span className="text-[11px] font-black text-text-primary dark:text-cream-50 uppercase">حالة العرض</span>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black text-text-secondary dark:text-gold-400 uppercase mb-3 tracking-wider">هوية البراند (Logo)</label>
                                    <div className="group relative">
                                        {imagePreview ? (
                                            <div className="relative w-full aspect-video rounded-[32px] overflow-hidden border-2 border-gold-200 dark:border-dark-600 shadow-xl">
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }) }}
                                                        className="w-12 h-12 bg-white text-rose-600 rounded-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl"
                                                    >
                                                        <Trash2 size={24} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="flex flex-col items-center justify-center w-full aspect-video border-4 border-dashed border-gold-100 dark:border-dark-600 rounded-[32px] hover:border-gold-300 dark:hover:border-gold-500/50 transition-all cursor-pointer bg-cream-50/30 group">
                                                <div className="bg-white dark:bg-dark-700 p-6 rounded-3xl shadow-lg border border-gold-50 dark:border-dark-600 mb-4 group-hover:scale-110 transition-transform">
                                                    <Upload className="h-8 w-8 text-gold-600" />
                                                </div>
                                                <span className="text-sm font-black text-text-primary dark:text-cream-50">اضغط لرفع الشعار</span>
                                                <span className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-tighter">PNG, JPG, SVG up to 5MB</span>
                                                <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-gold-600 text-white py-5 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-gold-700 transition-all shadow-2xl shadow-gold-600/30 active:scale-[0.98]"
                                >
                                    {currentBrand ? 'تحديث بيانات البراند' : 'تأكيد الإضافة والرفع'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardBrands;

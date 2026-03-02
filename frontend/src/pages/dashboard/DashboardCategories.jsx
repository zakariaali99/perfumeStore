import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { adminCategoriesApi } from '../../services/api';
import { toast } from 'react-hot-toast';

const DashboardCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [formData, setFormData] = useState({
        name_ar: '',
        slug: '',
        image: null,
        description: '',
        order: 0,
        is_active: true
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await adminCategoriesApi.getAll();
            setCategories(res.data.results || res.data || []);
        } catch (err) {
            console.error(err);
            toast.error('فشل في جلب الفئات');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setCurrentCategory(category);
            setFormData({
                name_ar: category.name_ar,
                slug: category.slug,
                description: category.description || '',
                order: category.order || 0,
                is_active: category.is_active
            });
            setImagePreview(category.image);
        } else {
            setCurrentCategory(null);
            setFormData({
                name_ar: '',
                slug: '',
                image: null,
                description: '',
                order: 0,
                is_active: true
            });
            setImagePreview(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ name_ar: '', slug: '', image: null, description: '', order: 0, is_active: true });
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' && typeof formData[key] === 'string') return; // Don't send URL string
            if (formData[key] !== null) data.append(key, formData[key]);
        });

        try {
            if (currentCategory) {
                await adminCategoriesApi.update(currentCategory.id, data);
                toast.success('تم تحديث الفئة بنجاح');
            } else {
                await adminCategoriesApi.create(data);
                toast.success('تم إنشاء الفئة بنجاح');
            }
            fetchCategories();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
            try {
                await adminCategoriesApi.delete(id);
                toast.success('تم حذف الفئة');
                fetchCategories();
            } catch {
                toast.error('فشل في حذف الفئة');
            }
        }
    };

    if (loading) return <div className="p-8">جاري التحميل...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-cream-50">إدارة الفئات</h1>
                    <p className="text-sm text-gray-500 dark:text-gold-400 mt-1">إضافة وتعديل تصنيفات المنتجات في المتجر</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gold-600 text-white px-6 py-3 rounded-xl hover:bg-gold-700 transition-colors shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    <span>إضافة فئة جديدة</span>
                </button>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 shadow-sm overflow-hidden text-right">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-0">
                        <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-100 dark:border-dark-600">
                            <tr>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الصورة</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الاسم</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50 hidden md:table-cell">الرابط (Slug)</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50 hidden md:table-cell">الترتيب</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الحالة</th>
                                <th className="px-4 md:px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                            {categories.map((cat) => (
                                <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-dark-600">
                                            <img src={cat.image} alt={cat.name_ar} className="w-full h-full object-cover" />
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-gray-900 dark:text-cream-50 text-sm md:text-base">{cat.name_ar}</td>
                                    <td className="px-4 md:px-6 py-4 text-sm text-gray-500 dark:text-gold-400 font-poppins hidden md:table-cell">{cat.slug}</td>
                                    <td className="px-4 md:px-6 py-4 text-sm text-gray-500 dark:text-gold-400 hidden md:table-cell">{cat.order}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold ${cat.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                            {cat.is_active ? 'نشط' : 'غير نشط'}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <button
                                                onClick={() => handleOpenModal(cat)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
                                <h2 className="text-xl md:text-2xl font-black text-text-primary dark:text-cream-50">{currentCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}</h2>
                                <p className="text-[10px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest mt-0.5">Category Management Suite</p>
                            </div>
                            <button onClick={handleCloseModal} className="w-12 h-12 flex items-center justify-center hover:bg-gold-50 dark:hover:bg-dark-700 rounded-2xl transition-all text-text-muted dark:text-gold-400">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[11px] font-black text-text-secondary dark:text-gold-400 uppercase mb-2 tracking-wider">اسم الفئة (AR)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name_ar}
                                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                        placeholder="مثال: عطور رجالية، بخور..."
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
                                            placeholder="category-slug"
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
                                    <label className="block text-[11px] font-black text-text-secondary dark:text-gold-400 uppercase mb-3 tracking-wider">صورة الفئة (Cover Image)</label>
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
                                                <span className="text-sm font-black text-text-primary dark:text-cream-50">اضغط لرفع الغلاف</span>
                                                <span className="text-[10px] text-text-muted mt-2 uppercase font-bold tracking-tighter">High Resolution Recommended</span>
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
                                    {currentCategory ? 'تحديث الفئة' : 'تأكيد الحفظ والنشر'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardCategories;

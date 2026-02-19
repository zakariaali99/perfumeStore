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
            } catch (err) {
                toast.error('فشل في حذف الفئة');
            }
        }
    };

    if (loading) return <div className="p-8">جاري التحميل...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-cream-50">إدارة الفئات</h1>
                    <p className="text-sm text-gray-500 dark:text-gold-400 mt-1">إضافة وتعديل تصنيفات المنتجات في المتجر</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-gold-600 text-white px-6 py-3 rounded-xl hover:bg-gold-700 transition-colors shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    <span>إضافة فئة جديدة</span>
                </button>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-100 dark:border-dark-600">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الصورة</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الاسم</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الرابط (Slug)</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الترتيب</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الحالة</th>
                            <th className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-cream-50">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-dark-600">
                        {categories.map((cat) => (
                            <tr key={cat.id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 dark:border-dark-600">
                                        <img src={cat.image} alt={cat.name_ar} className="w-full h-full object-cover" />
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-cream-50">{cat.name_ar}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gold-400 font-poppins">{cat.slug}</td>
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gold-400">{cat.order}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.is_active ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'}`}>
                                        {cat.is_active ? 'نشط' : 'غير نشط'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-gray-100 dark:border-dark-600 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-cream-50">{currentCategory ? 'تعديل فئة' : 'إضافة فئة جديدة'}</h2>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-full transition-colors text-gray-500 dark:text-gold-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gold-400 mb-1">الاسم بالعربية</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name_ar}
                                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-dark-700 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold-500 outline-none text-gray-900 dark:text-cream-50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gold-400 mb-1">الرابط (Slug)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-dark-700 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold-500 outline-none font-poppins text-gray-900 dark:text-cream-50"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gold-400 mb-1">الترتيب</label>
                                    <input
                                        type="number"
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-dark-700 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-gold-500 outline-none text-gray-900 dark:text-cream-50"
                                    />
                                </div>
                                <div className="flex-1 flex items-end pb-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-5 h-5 accent-gold-600"
                                        />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gold-400">نشط</span>
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gold-400 mb-1">الصورة</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 dark:border-dark-600 border-dashed rounded-2xl relative">
                                    {imagePreview ? (
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImagePreview(null); setFormData({ ...formData, image: null }) }}
                                                className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600 dark:text-gold-400">
                                                <label className="relative cursor-pointer bg-white dark:bg-dark-700 rounded-md font-medium text-gold-600 hover:text-gold-500 focus-within:outline-none">
                                                    <span>رفع صورة</span>
                                                    <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-gold-600 text-white py-4 rounded-2xl font-bold hover:bg-gold-700 transition-colors shadow-lg shadow-gold-600/20"
                                >
                                    حفظ البيانات
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

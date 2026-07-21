import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, adminProductsApi } from '../../services/api';
import {
    Save,
    Plus,
    Trash2,
    Image as ImageIcon,
    LayoutGrid,
    Type,
    Briefcase,
    ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/dashboard/products');
        }
    };
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [formData, setFormData] = useState({
        name_ar: '',
        slug: '',
        description: '',
        story: '',
        categories: [],
        brand: '',
        gender: 'unisex',
        occasion: '',
        vibe: '',
        is_active: true,
        is_featured: false,
        is_new: true,
        is_bestseller: false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchMetadata();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                productsApi.getCategories(),
                productsApi.getBrands()
            ]);
            setCategories(catRes.data.results || catRes.data);
            setBrands(brandRes.data.results || brandRes.data);
        } catch { /* ignore */ }
    };

    const fetchProduct = async () => {
        try {
            const res = await adminProductsApi.getDetail(id);
            const data = res.data;
            setFormData({
                name_ar: data.name_ar || '',
                slug: data.slug || '',
                description: data.description || '',
                story: data.story || '',
                categories: data.categories?.map(c => String(c.id)) || [],
                brand: data.brand?.id || '',
                gender: data.gender || 'unisex',
                occasion: data.occasion || '',
                vibe: data.vibe || '',
                is_active: data.is_active ?? true,
                is_featured: data.is_featured ?? false,
                is_new: data.is_new ?? true,
                is_bestseller: data.is_bestseller ?? false,
            });
            if (data.main_image) {
                setImagePreview(data.main_image);
            }
        } catch {
            toast.error('تعذر تحميل بيانات المنتج');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            const fields = [
                'name_ar', 'slug', 'description', 'story',
                'brand', 'gender', 'occasion', 'vibe',
                'is_active', 'is_featured', 'is_new', 'is_bestseller'
            ];

            fields.forEach(key => {
                const value = formData[key];
                if (value !== null && value !== undefined && value !== '') {
                    data.append(key, value);
                }
            });

            formData.categories.forEach(id => {
                data.append('categories', id);
            });

            if (imageFile) {
                data.append('main_image', imageFile);
            }

            if (isEdit) {
                await adminProductsApi.update(id, data);
                toast.success('تم تحديث المنتج بنجاح');
            } else {
                await adminProductsApi.create(data);
                toast.success('تم إضافة المنتج بنجاح');
            }
            handleBack();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء حفظ البيانات: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || ''));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 hover:bg-gold-50 rounded-xl transition-all text-text-secondary"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-text-primary mb-1">
                            {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                        </h2>
                        <p className="text-text-secondary text-sm">أدخل تفاصيل العطر، الصور، والتصنيفات بدقة.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 border border-gold-300 rounded-2xl font-bold bg-white hover:bg-gold-50 transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gold-600 text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20 disabled:bg-gray-300"
                    >
                        <Save size={20} />
                        {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gold-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 font-black text-sm mb-4">
                            <Type size={18} />
                            المعلومات الأساسية
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1 uppercase tracking-wider">اسم العطر (عربي)</label>
                                <input
                                    name="name_ar"
                                    value={formData.name_ar}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2 col-span-1 md:col-span-2">
                                <label className="text-xs font-bold text-text-secondary px-1 uppercase tracking-wider">رابط المنتج (Slug)</label>
                                <input
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="example-perfume-name"
                                    className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-bold font-poppins text-left"
                                    dir="ltr"
                                    required
                                />
                                <p className="text-[10px] text-text-muted px-1">يجب أن يكون باللغة الإنجليزية ولا يحتوي على مسافات (استخدم -).</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary px-1 uppercase tracking-wider">وصف العطر والقصة</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="الوصف المختصر..."
                                className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-loose mb-4"
                            />
                            <textarea
                                name="story"
                                value={formData.story}
                                onChange={handleChange}
                                rows="6"
                                placeholder="القصة العطرية الكاملة..."
                                className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-loose"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1 uppercase tracking-wider">مناسب لـ</label>
                                <input
                                    name="occasion"
                                    value={formData.occasion}
                                    onChange={handleChange}
                                    placeholder="ليلي، حفلات، كلاسيكي..."
                                    className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1 uppercase tracking-wider">مزاج العطر</label>
                                <input
                                    name="vibe"
                                    value={formData.vibe}
                                    onChange={handleChange}
                                    placeholder="قوي، دافئ، رجولي..."
                                    className="w-full bg-cream-50 border border-gold-100 px-5 py-4 rounded-2xl focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gold-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 font-black text-sm mb-4">
                            <ImageIcon size={18} />
                            معرض الصور
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="aspect-square bg-cream-50 border-2 border-dashed border-gold-300 rounded-3xl flex flex-col items-center justify-center gap-2 text-gold-400 cursor-pointer hover:bg-gold-50 transition-all relative overflow-hidden">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <Plus size={32} />
                                        <span className="text-[10px] font-bold">رفع صورة</span>
                                    </>
                                )}
                                <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                            </label>
                            {/* Placeholder for uploaded images */}
                            <div className="aspect-square bg-gray-100 rounded-3xl relative group">
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex items-center justify-center">
                                    <button type="button" className="p-2 bg-red-500 text-white rounded-xl"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[40px] border border-gold-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 font-black text-sm mb-4">
                            <LayoutGrid size={18} />
                            التصنيفات
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1">التصنيفات</label>
                                <select
                                    name="categories"
                                    multiple
                                    value={formData.categories}
                                    onChange={(e) => {
                                        const options = Array.from(e.target.selectedOptions).map(o => String(o.value));
                                        setFormData({ ...formData, categories: options });
                                    }}
                                    className="w-full bg-cream-50 border border-gold-100 px-4 py-4 rounded-2xl focus:outline-none min-h-[120px]"
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1">الماركة</label>
                                <select
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 border border-gold-100 px-4 py-4 rounded-2xl focus:outline-none"
                                >
                                    <option value="">اختر الماركة</option>
                                    {brands.map(b => <option key={b.id} value={b.id}>{b.name_ar}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary px-1">الجنس</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['men', 'women', 'unisex'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.gender === g ? 'bg-gold-500 text-white border-gold-500 shadow-md shadow-gold-500/20' : 'bg-cream-50 text-text-secondary border-gold-100 hover:bg-gold-50'}`}
                                        >
                                            {g === 'men' ? 'رجالي' : g === 'women' ? 'نسائي' : 'للجنسين'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gold-200 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 font-black text-sm mb-4">
                            <Briefcase size={18} />
                            خيارات العرض
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl cursor-pointer">
                                <span className="text-sm font-bold">تفعيل المنتج</span>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl cursor-pointer">
                                <span className="text-sm font-bold">منتج مميز (Featured)</span>
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl cursor-pointer">
                                <span className="text-sm font-bold">وصول جديد (New)</span>
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 rounded-2xl cursor-pointer">
                                <span className="text-sm font-bold">الأكثر مبيعاً (Bestseller)</span>
                                <input
                                    type="checkbox"
                                    name="is_bestseller"
                                    checked={formData.is_bestseller}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;

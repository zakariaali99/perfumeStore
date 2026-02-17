import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminProductsApi, adminVariantsApi } from '../../services/api';
import {
    Save,
    Package,
    UploadCloud,
    BarChart,
    ChevronRight,
    Plus,
    Trash2,
    Edit2,
    X,
    LayoutGrid
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [activeTab, setActiveTab] = useState('info');

    // Product Form Data
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        slug: '',
        description: '',
        story: '',
        category: '',
        brand: '',
        gender: 'unisex',
        concentration: 'EDP',
        longevity_rating: 3,
        sillage_rating: 3,
        is_active: true,
        is_featured: false,
        is_new: false,
        is_bestseller: false
    });

    // Variants State
    const [variants, setVariants] = useState([]);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);
    const [variantForm, setVariantForm] = useState({
        size_ml: 100,
        price: '',
        sale_price: '',
        sku: '',
        stock_quantity: 10,
        is_active: true
    });

    useEffect(() => {
        const load = async () => {
            await fetchMetadata();
            if (isEdit) {
                await fetchProduct();
            }
        };
        load();
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const [catsRes, brandsRes] = await Promise.all([
                adminProductsApi.listCategories(),
                adminProductsApi.listBrands()
            ]);
            setCategories(catsRes.data);
            setBrands(brandsRes.data);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في تحميل التصنيفات والماركات');
        }
    };

    const fetchProduct = async () => {
        setInitialLoading(true);
        try {
            const res = await adminProductsApi.get(id);
            const data = res.data;

            setFormData({
                name_ar: data.name_ar || '',
                name_en: data.name_en || '',
                slug: data.slug || '',
                description: data.description || '',
                story: data.story || '',
                category: data.category?.id || data.category || '',
                brand: data.brand?.id || data.brand || '',
                gender: data.gender || 'unisex',
                concentration: data.concentration || 'EDP',
                longevity_rating: data.longevity_rating || 3,
                sillage_rating: data.sillage_rating || 3,
                is_active: data.is_active ?? true,
                is_featured: data.is_featured ?? false,
                is_new: data.is_new ?? false,
                is_bestseller: data.is_bestseller ?? false,
            });

            if (data.main_image) {
                setPreviewUrl(data.main_image);
            }
            if (data.variants) {
                setVariants(data.variants);
            }
        } catch (err) {
            console.error(err);
            toast.error('تعذر تحميل بيانات المنتج');
            navigate('/dashboard/products');
        } finally {
            setInitialLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            const writableFields = [
                'name_ar', 'name_en', 'slug', 'description', 'story',
                'gender', 'concentration', 'longevity_rating', 'sillage_rating',
                'is_active', 'is_featured', 'is_new', 'is_bestseller'
            ];

            writableFields.forEach(key => {
                const val = formData[key];
                if (val !== null && val !== undefined) {
                    data.append(key, val);
                }
            });

            if (formData.category) data.append('category', formData.category);
            if (formData.brand) data.append('brand', formData.brand);
            if (imageFile) data.append('main_image', imageFile);

            let productId = id;
            if (isEdit) {
                await adminProductsApi.update(id, data);
                toast.success('تم تحديث المنتج بنجاح');
            } else {
                const res = await adminProductsApi.create(data);
                productId = res.data.id;
                toast.success('تم إضافة المنتج بنجاح');
                // Redirect to edit mode to add variants
                navigate(`/dashboard/products/${productId}`);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = JSON.stringify(err.response?.data || 'خطأ غير معروف');
            toast.error('حدث خطأ أثناء حفظ البيانات: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Variant Handlers
    const openVariantModal = (variant = null) => {
        if (variant) {
            setEditingVariant(variant);
            setVariantForm({
                size_ml: variant.size_ml,
                price: variant.price,
                sale_price: variant.sale_price || '',
                sku: variant.sku,
                stock_quantity: variant.stock_quantity,
                is_active: variant.is_active
            });
        } else {
            setEditingVariant(null);
            setVariantForm({
                size_ml: 100,
                price: '',
                sale_price: '',
                sku: '',
                stock_quantity: 10,
                is_active: true
            });
        }
        setIsVariantModalOpen(true);
    };

    const handleVariantSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = { ...variantForm, product: id };
            if (data.sale_price === '') delete data.sale_price;

            if (editingVariant) {
                await adminVariantsApi.update(editingVariant.id, data);
                toast.success('تم تحديث العبوة');
            } else {
                await adminVariantsApi.create(data);
                toast.success('تم إضافة العبوة');
            }
            setIsVariantModalOpen(false);
            fetchProduct(); // Refresh
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ في حفظ العبوة');
        }
    };

    const deleteVariant = async (variantId) => {
        if (window.confirm('هل أنت متأكد من حذف هذه العبوة؟')) {
            try {
                await adminVariantsApi.delete(variantId);
                toast.success('تم حذف العبوة');
                fetchProduct();
            } catch (err) {
                toast.error('تعذر الحذف');
            }
        }
    };

    if (initialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
                <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
                <p className="text-gold-600 font-bold animate-pulse">جاري تحميل بيانات المنتج...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
            <div className="flex justify-between items-center bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 mb-1">
                        {isEdit ? 'تعديل بيانات المنتج' : 'إضافة منتج فاخر جديد'}
                    </h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm font-bold">إدارة تفاصيل المنتج والعبوات والأسعار</p>
                </div>
                <div className="flex gap-4">
                    {isEdit && (
                        <div className="flex bg-cream-50 dark:bg-dark-800 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('info')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'info' ? 'bg-white dark:bg-dark-600 shadow-sm text-gold-600' : 'text-text-secondary dark:text-gold-400'}`}
                            >
                                المعلومات الأساسية
                            </button>
                            <button
                                onClick={() => setActiveTab('variants')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'variants' ? 'bg-white dark:bg-dark-600 shadow-sm text-gold-600' : 'text-text-secondary dark:text-gold-400'}`}
                            >
                                العبوات والأسعار
                            </button>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/dashboard/products')}
                        className="px-6 py-3 border border-gold-200 dark:border-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all font-tajawal"
                    >
                        عودة
                    </button>
                </div>
            </div>

            {activeTab === 'info' ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Info */}
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 mb-4 text-gold-600">
                                <Package size={24} />
                                <h3 className="text-xl font-black">المعلومات الأساسية</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الاسم بالعربي</label>
                                    <input
                                        type="text"
                                        name="name_ar"
                                        required
                                        value={formData.name_ar}
                                        onChange={handleChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50"
                                        placeholder="مثال: عطر العود الملكي"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الرابط اللطيف (Slug)</label>
                                    <input
                                        type="text"
                                        name="slug"
                                        required
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-poppins text-text-primary dark:text-cream-50"
                                        placeholder="royal-oud-perfume"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">وصف المنتج</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50"
                                    placeholder="اكتب وصفاً جذاباً للمنتج..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Tech Details */}
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm">
                            <div className="flex items-center gap-3 mb-8 text-gold-600">
                                <BarChart size={24} />
                                <h3 className="text-xl font-black">تفاصيل العطر الفنية</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end pr-1">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400">قوة الثبات</label>
                                            <span className="text-[10px] bg-gold-50 dark:bg-dark-600 text-gold-600 px-3 py-1 rounded-full font-black">{formData.longevity_rating}/5</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="longevity_rating"
                                            min="1"
                                            max="5"
                                            value={formData.longevity_rating}
                                            onChange={handleChange}
                                            className="w-full h-2 bg-cream-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end pr-1">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400">قوة الفوحان</label>
                                            <span className="text-[10px] bg-gold-50 dark:bg-dark-600 text-gold-600 px-3 py-1 rounded-full font-black">{formData.sillage_rating}/5</span>
                                        </div>
                                        <input
                                            type="range"
                                            name="sillage_rating"
                                            min="1"
                                            max="5"
                                            value={formData.sillage_rating}
                                            onChange={handleChange}
                                            className="w-full h-2 bg-cream-100 rounded-lg appearance-none cursor-pointer accent-gold-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">درجة التركيز</label>
                                        <select
                                            name="concentration"
                                            value={formData.concentration}
                                            onChange={handleChange}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-bold"
                                        >
                                            <option value="EDT">Eau de Toilette (EDT)</option>
                                            <option value="EDP">Eau de Parfum (EDP)</option>
                                            <option value="Parfum">Extrait de Parfum</option>
                                            <option value="Cologne">Eau de Cologne</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">لمن هذا العطر؟</label>
                                        <div className="flex gap-4">
                                            {['men', 'women', 'unisex'].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, gender: g })}
                                                    className={`flex-1 py-3 rounded-xl border-2 transition-all font-bold text-xs ${formData.gender === g ? 'bg-gold-500 border-gold-500 text-white shadow-lg' : 'border-gold-50 dark:border-dark-600 text-text-secondary dark:text-gold-400 hover:border-gold-200'}`}
                                                >
                                                    {g === 'men' ? 'رجالي' : g === 'women' ? 'نسائي' : 'للجنسين'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gold-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20 disabled:bg-gray-300 font-tajawal text-lg w-full md:w-auto justify-center"
                            >
                                <Save size={24} />
                                {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Image Upload */}
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-8">
                            <div className="flex items-center gap-3 text-gold-600">
                                <UploadCloud size={24} />
                                <h3 className="text-xl font-black">صورة الغلاف</h3>
                            </div>

                            <div className="relative group aspect-[4/5] rounded-[32px] overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-200 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                            <button
                                                type="button"
                                                onClick={() => document.getElementById('imageInput').click()}
                                                className="bg-white text-gold-600 px-6 py-2 rounded-xl font-black text-sm"
                                            >تغيير الصورة</button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <UploadCloud className="mx-auto text-gold-300 group-hover:text-gold-500 mb-4" size={48} />
                                        <p className="text-sm text-text-secondary dark:text-gold-400 font-bold">اضغط هنا أو اسحب الصورة</p>
                                        <p className="text-[10px] text-text-muted mt-2">عالية الجودة (PNG, JPG)</p>
                                    </div>
                                )}
                                <input
                                    id="imageInput"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                {!previewUrl && (
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('imageInput').click()}
                                        className="absolute inset-0 w-full h-full cursor-pointer"
                                    ></button>
                                )}
                            </div>
                        </div>

                        {/* Category & Brand */}
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-6">
                            <h3 className="text-lg font-black text-text-primary dark:text-cream-50 pr-1">التصنيف والماركة</h3>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الماركة (Brand)</label>
                                    <select
                                        name="brand"
                                        required
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-bold"
                                    >
                                        <option value="">اختر الماركة</option>
                                        {brands.map(brand => (
                                            <option key={brand.id} value={brand.id}>{brand.name_ar}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">التصنيف الرئيسي</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 font-bold"
                                    >
                                        <option value="">اختر التصنيف</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name_ar}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Status Flags */}
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50/50 dark:bg-dark-800/50">
                                <span className="text-sm font-black text-text-primary dark:text-cream-50">حالة المنتج (نشط)</span>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50/50 dark:bg-dark-800/50">
                                <span className="text-sm font-black text-text-primary dark:text-cream-50">مميز (Featured)</span>
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500 cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-50/50 dark:bg-dark-800/50">
                                <span className="text-sm font-black text-text-primary dark:text-cream-50">وصل حديثاً</span>
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-black text-text-primary dark:text-cream-50">العبوات المتوفرة (Variants)</h3>
                        <button
                            onClick={() => openVariantModal()}
                            className="bg-gold-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-700 transition"
                        >
                            <Plus size={20} />
                            أضف عبوة جديدة
                        </button>
                    </div>

                    <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gold-50 dark:bg-dark-800 border-b border-gold-100 dark:border-dark-600">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gold-600 uppercase tracking-wider">الحجم (مل)</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gold-600 uppercase tracking-wider">السعر</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gold-600 uppercase tracking-wider">المخزون</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gold-600 uppercase tracking-wider">SKU</th>
                                    <th className="px-6 py-4 text-right text-xs font-black text-gold-600 uppercase tracking-wider">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gold-50 dark:divide-dark-600">
                                {variants.length > 0 ? variants.map((v) => (
                                    <tr key={v.id} className="hover:bg-cream-50 dark:hover:bg-dark-800 transition-colors">
                                        <td className="px-6 py-4 font-bold text-text-primary dark:text-cream-50">{v.size_ml} ml</td>
                                        <td className="px-6 py-4 font-bold text-text-primary dark:text-cream-50">
                                            {v.current_price} د.ل
                                            {v.sale_price && <span className="mr-2 text-xs text-green-500 line-through">{v.price}</span>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-text-primary dark:text-cream-50">{v.stock_quantity}</td>
                                        <td className="px-6 py-4 text-sm text-text-secondary dark:text-gold-400 font-poppins">{v.sku}</td>
                                        <td className="px-6 py-4 flex gap-2">
                                            <button onClick={() => openVariantModal(v)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={18} /></button>
                                            <button onClick={() => deleteVariant(v.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-text-secondary dark:text-gold-400">لا توجد عبوات مضافة لهذا المنتج بعد.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Variant Modal */}
            {isVariantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-gold-50 dark:bg-dark-800">
                            <h3 className="text-xl font-black text-gold-600">{editingVariant ? 'تعديل العبوة' : 'إضافة عبوة جديدة'}</h3>
                            <button onClick={() => setIsVariantModalOpen(false)} className="p-2 hover:bg-white dark:hover:bg-dark-600 rounded-full transition"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleVariantSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الحجم (مل)</label>
                                    <input type="number" required value={variantForm.size_ml} onChange={e => setVariantForm({ ...variantForm, size_ml: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">رقم SKU</label>
                                    <input type="text" required value={variantForm.sku} onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">السعر الأساسي</label>
                                    <input type="number" required value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">سعر البيع (اختياري)</label>
                                    <input type="number" value={variantForm.sale_price} onChange={e => setVariantForm({ ...variantForm, sale_price: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الكمية في المخزن</label>
                                <input type="number" required value={variantForm.stock_quantity} onChange={e => setVariantForm({ ...variantForm, stock_quantity: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                            </div>
                            <button type="submit" className="w-full bg-gold-600 text-white font-black py-4 rounded-xl hover:bg-gold-700 transition shadow-lg">حفظ العبوة</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductEdit;

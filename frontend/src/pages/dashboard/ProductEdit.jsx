import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminProductsApi, adminVariantsApi } from '../../services/api';
import {
    Save,
    Package,
    UploadCloud,
    BarChart,
    ChevronDown,
    Plus,
    Trash2,
    Edit2,
    X,
    Check,
    Box
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ProductEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);

    // Metadata
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    // UI State
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef(null);

    // Form Data
    const [formData, setFormData] = useState({
        name_ar: '',
        name_en: '',
        slug: '',
        description: '',
        story: '',
        categories: [], // Array of IDs
        brand: '',
        gender: 'unisex',
        occasion: '',
        vibe: '',
        is_active: true,
        is_featured: false,
        is_new: false,
        is_bestseller: false
    });

    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    // Default Variant Data (For Creation Mode)
    const [defaultVariant, setDefaultVariant] = useState({
        price: '',
        sale_price: '',
        stock_quantity: 10,
        sku: '',
        is_original_package: false,
        size_ml: 100
    });

    // Variants State (For Edit Mode)
    const [variants, setVariants] = useState([]);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    // Variant Modal Form
    const [variantForm, setVariantForm] = useState({
        is_original_package: false,
        name: '',
        size_ml: 100,
        price: '',
        sale_price: '',
        sku: '',
        stock_quantity: 10,
        is_active: true
    });

    // Fetch Initial Data
    const fetchMetadata = useCallback(async () => {
        try {
            const [catsRes, brandsRes] = await Promise.all([
                adminProductsApi.listCategories(),
                adminProductsApi.listBrands()
            ]);
            setCategories(catsRes.data.results || catsRes.data);
            setBrands(brandsRes.data.results || brandsRes.data);
        } catch (err) {
            console.error(err);
            toast.error('خطأ في تحميل التصنيفات والماركات');
        }
    }, []);

    const fetchProduct = useCallback(async () => {
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
                categories: data.categories ? data.categories.map(c => c.id) : [],
                brand: data.brand?.id || data.brand || '',
                gender: data.gender || 'unisex',
                occasion: data.occasion || '',
                vibe: data.vibe || '',
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
    }, [id, navigate]);

    useEffect(() => {
        const load = async () => {
            await fetchMetadata();
            if (isEdit) {
                await fetchProduct();
            }
        };
        load();

        // Clicks outside category dropdown
        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [fetchMetadata, fetchProduct, isEdit]);

    // Handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryToggle = (catId) => {
        setFormData(prev => {
            const current = prev.categories || [];
            if (current.includes(catId)) {
                return { ...prev, categories: current.filter(id => id !== catId) };
            } else {
                return { ...prev, categories: [...current, catId] };
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDefaultVariantChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDefaultVariant(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();

            // Basic Fields
            const textFields = ['name_ar', 'name_en', 'slug', 'description', 'story', 'gender', 'brand', 'occasion', 'vibe'];
            textFields.forEach(key => {
                if (formData[key] !== undefined && formData[key] !== null) data.append(key, formData[key]);
            });

            // Booleans
            ['is_active', 'is_featured', 'is_new', 'is_bestseller'].forEach(key => {
                data.append(key, formData[key]);
            });

            // M2M Categories
            formData.categories.forEach(catId => {
                data.append('categories', catId);
            });

            // Image
            if (imageFile) data.append('main_image', imageFile);

            let productId = id;
            if (isEdit) {
                await adminProductsApi.update(id, data);
                toast.success('تم تحديث المنتج بنجاح');
            } else {
                // Create Product
                const res = await adminProductsApi.create(data);
                productId = res.data.id;

                // Create Default Variant automatically
                const variantData = {
                    product: productId,
                    price: defaultVariant.price,
                    stock_quantity: defaultVariant.stock_quantity,
                    sku: defaultVariant.sku || `${formData.slug}-standard`,
                    is_active: true
                };

                // Handle Variant Type (Original vs Size)
                if (defaultVariant.is_original_package) {
                    variantData.name = 'العبوة الاصلية';
                    variantData.size_ml = null;
                } else {
                    variantData.size_ml = defaultVariant.size_ml || 100;
                    variantData.name = '';
                }

                // Handle Sale Price Logic
                if (defaultVariant.sale_price && parseFloat(defaultVariant.sale_price) > 0) {
                    variantData.sale_price = defaultVariant.sale_price;
                }

                await adminVariantsApi.create(variantData);
                toast.success('تم إضافة المنتج والعبوة الافتراضية بنجاح');
                navigate(`/dashboard/product/edit/${productId}`);
            }
        } catch (err) {
            console.error(err);
            const errorMsg = JSON.stringify(err.response?.data || 'خطأ غير معروف');
            toast.error('حدث خطأ أثناء الحفظ: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Variant Handlers (Edit Mode)
    const openVariantModal = (variant = null) => {
        if (variant) {
            setEditingVariant(variant);
            const isOriginal = !variant.size_ml && variant.name === 'العبوة الاصلية';
            setVariantForm({
                is_original_package: isOriginal,
                name: variant.name || '',
                size_ml: variant.size_ml || 100,
                price: variant.price,
                sale_price: variant.sale_price || '',
                sku: variant.sku,
                stock_quantity: variant.stock_quantity,
                is_active: variant.is_active
            });
        } else {
            setEditingVariant(null);
            setVariantForm({
                is_original_package: false,
                name: '',
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
            const data = {
                ...variantForm,
                product: id
            };

            // Logic: Set sale_price to null if 0 or empty
            if (!data.sale_price || parseFloat(data.sale_price) === 0) {
                data.sale_price = 0; // Model handles 0 -> None
            }
            if (data.sale_price === '') data.sale_price = 0;

            // Handle Type
            if (variantForm.is_original_package) {
                data.name = 'العبوة الاصلية';
                data.size_ml = null;
            } else {
                data.name = ''; // Clear name if size
                data.size_ml = variantForm.size_ml || 100;
            }

            // Remove helper fields
            delete data.is_original_package;

            if (editingVariant) {
                await adminVariantsApi.update(editingVariant.id, data);
                toast.success('تم تحديث العبوة');
            } else {
                await adminVariantsApi.create(data);
                toast.success('تم إضافة العبوة');
            }
            setIsVariantModalOpen(false);
            fetchProduct();
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
            } catch (error) {
                console.error(error);
                toast.error('تعذر الحذف');
            }
        }
    };

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4" dir="rtl">
            <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            <p className="text-gold-600 font-bold animate-pulse">جاري تحميل بيانات المنتج...</p>
        </div>
    );

    return (
        <div className="space-y-6 pb-20 animate-fade-in" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm">
                <div>
                    <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 mb-1">
                        {isEdit ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
                    </h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm font-bold">إدارة تفاصيل المنتج، التصنيف، والأسعار</p>
                </div>
                <button
                    onClick={() => navigate('/dashboard/products')}
                    className="px-6 py-3 border border-gold-200 dark:border-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gold-50 dark:hover:bg-dark-700 transition-all font-tajawal"
                >
                    إلغاء
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Right Column: Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 mb-2 text-gold-600">
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
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    placeholder="اسم المنتج"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الرابط (Slug)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    required
                                    value={formData.slug}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-text-primary dark:text-cream-50"
                                    placeholder="product-slug"
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
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                placeholder="وصف تفصيلي..."
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">قصة العطر (Story)</label>
                            <textarea
                                name="story"
                                value={formData.story}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                placeholder="قصة إلهام العطر..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">مع من يناسب؟ (Occasion)</label>
                                <textarea
                                    name="occasion"
                                    value={formData.occasion}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    placeholder="ex: ليلي، حفلات، كلاسيكي..."
                                ></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">مزاج العطر (Vibe)</label>
                                <textarea
                                    name="vibe"
                                    value={formData.vibe}
                                    onChange={handleChange}
                                    rows="2"
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    placeholder="ex: قوي، دافئ، رجولي..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Section (Only for Create Mode) */}
                    {!isEdit && (
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2 text-gold-600">
                                <BarChart size={24} />
                                <h3 className="text-xl font-black">الأسعار والمخزون (العبوة الافتراضية)</h3>
                            </div>

                            {/* Variant Type Selector */}
                            <div className="bg-gold-50 dark:bg-dark-800 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Box className="text-gold-600" size={20} />
                                    <span className="font-bold text-text-secondary dark:text-gold-400">العبوة الاصلية (بدون تحديد حجم)</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_original_package"
                                        checked={defaultVariant.is_original_package}
                                        onChange={handleDefaultVariantChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-300 dark:peer-focus:ring-gold-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Size Input - Conditional */}
                                {!defaultVariant.is_original_package && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الحجم (ml)</label>
                                        <input
                                            type="number"
                                            name="size_ml"
                                            value={defaultVariant.size_ml}
                                            onChange={handleDefaultVariantChange}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                                            placeholder="100"
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">السعر الأساسي</label>
                                    <input
                                        type="number"
                                        name="price"
                                        required
                                        value={defaultVariant.price}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">سعر العرض (اختياري)</label>
                                    <input
                                        type="number"
                                        name="sale_price"
                                        value={defaultVariant.sale_price}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">المخزون</label>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        required
                                        value={defaultVariant.stock_quantity}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">SKU (اختياري)</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={defaultVariant.sku}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins"
                                        placeholder="ترك فارغاً للتوليد التلقائي"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variants List (Only for Edit Mode) */}
                    {isEdit && (
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3 text-gold-600">
                                    <BarChart size={24} />
                                    <h3 className="text-xl font-black">العبوات والأسعار</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openVariantModal()}
                                    className="bg-gold-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-700 transition text-sm"
                                >
                                    <Plus size={16} />
                                    أضف عبوة
                                </button>
                            </div>

                            <div className="overflow-hidden border border-gold-50 dark:border-dark-600 rounded-2xl">
                                <table className="w-full">
                                    <thead className="bg-gold-50 dark:bg-dark-800 border-b border-gold-100 dark:border-dark-600">
                                        <tr>
                                            <th className="px-4 py-3 text-right text-xs font-black text-gold-600">النوع / الحجم</th>
                                            <th className="px-4 py-3 text-right text-xs font-black text-gold-600">السعر</th>
                                            <th className="px-4 py-3 text-right text-xs font-black text-gold-600">المخزون</th>
                                            <th className="px-4 py-3 text-right text-xs font-black text-gold-600">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold-50 dark:divide-dark-600">
                                        {variants.map((v) => (
                                            <tr key={v.id} className="hover:bg-cream-50 dark:hover:bg-dark-800">
                                                <td className="px-4 py-3 font-bold text-text-primary dark:text-cream-50">
                                                    {v.name ? v.name : `${v.size_ml} ml`}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-text-primary dark:text-cream-50">
                                                    {v.current_price} د.ل
                                                    {v.sale_price && <span className="mr-2 text-xs text-green-500 line-through">{v.price}</span>}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-text-primary dark:text-cream-50">{v.stock_quantity}</td>
                                                <td className="px-4 py-3 flex gap-2">
                                                    <button type="button" onClick={() => openVariantModal(v)} className="p-1 text-blue-500 bg-blue-50 rounded"><Edit2 size={14} /></button>
                                                    <button type="button" onClick={() => deleteVariant(v.id)} className="p-1 text-red-500 bg-red-50 rounded"><Trash2 size={14} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Left Column: Classification & Image */}
                <div className="space-y-8">
                    {/* Image Upload */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-4">
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
                                </div>
                            )}
                            <input id="imageInput" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </div>
                    </div>

                    {/* Classification */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm space-y-6">
                        <h3 className="text-lg font-black text-text-primary dark:text-cream-50 pr-1">التصنيف</h3>

                        {/* Brand */}
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

                        {/* Categories (Multi-Select) */}
                        <div className="space-y-2" ref={categoryRef}>
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">التصنيفات (Categories)</label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl flex justify-between items-center focus:outline-none text-text-primary dark:text-cream-50 font-bold"
                                >
                                    <span>
                                        {formData.categories.length > 0
                                            ? `${formData.categories.length} تصنيفات محددة`
                                            : "اختر التصنيفات"}
                                    </span>
                                    <ChevronDown size={18} />
                                </button>

                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-600 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto p-2">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.id}
                                                onClick={() => handleCategoryToggle(cat.id)}
                                                className="flex items-center gap-3 p-3 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-xl cursor-pointer"
                                            >
                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${formData.categories.includes(cat.id) ? 'bg-gold-600 border-gold-600 text-white' : 'border-gold-200'}`}>
                                                    {formData.categories.includes(cat.id) && <Check size={14} />}
                                                </div>
                                                <span className="text-sm font-bold text-text-primary dark:text-cream-50">{cat.name_ar}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Selected Chips */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.categories.map(catId => {
                                    const cat = categories.find(c => c.id === catId);
                                    if (!cat) return null;
                                    return (
                                        <span key={catId} className="bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                            {cat.name_ar}
                                            <button type="button" onClick={() => handleCategoryToggle(catId)} className="hover:text-red-500"><X size={12} /></button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">لمن هذا العطر؟</label>
                            <div className="flex gap-2">
                                {['men', 'women', 'unisex'].map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-2 px-3 rounded-xl border-2 transition-all font-bold text-xs ${formData.gender === g ? 'bg-gold-500 border-gold-500 text-white shadow-lg' : 'border-gold-50 dark:border-dark-600 text-text-secondary dark:text-gold-400 hover:border-gold-200'}`}
                                    >
                                        {g === 'men' ? 'رجالي' : g === 'women' ? 'نسائي' : 'للجنسين'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20 justify-center text-lg disabled:opacity-50"
                    >
                        <Save size={24} />
                        {loading ? 'جاري الحفظ...' : 'حفظ ونشر المنتج'}
                    </button>
                </div>
            </form>

            {/* Variant Modal (Edit Mode) */}
            {isVariantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-In">
                        <div className="p-6 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-gold-50 dark:bg-dark-800">
                            <h3 className="text-xl font-black text-gold-600">{editingVariant ? 'تعديل العبوة' : 'إضافة عبوة جديدة'}</h3>
                            <button onClick={() => setIsVariantModalOpen(false)} className="p-2 hover:bg-white rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleVariantSubmit} className="p-8 space-y-6">

                            {/* Variant Type Toggle */}
                            <div className="bg-gold-50 dark:bg-dark-800 p-4 rounded-2xl flex items-center justify-between">
                                <span className="font-bold text-text-secondary dark:text-gold-400">العبوة الاصلية (بدون تحديد حجم)</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={variantForm.is_original_package}
                                        onChange={(e) => setVariantForm({ ...variantForm, is_original_package: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gold-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {!variantForm.is_original_package && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الحجم (مل)</label>
                                        <input type="number" required value={variantForm.size_ml} onChange={e => setVariantForm({ ...variantForm, size_ml: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">SKU</label>
                                    <input type="text" required value={variantForm.sku} onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">السعر الأساسي</label>
                                    <input type="number" required value={variantForm.price} onChange={e => setVariantForm({ ...variantForm, price: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">سعر العرض</label>
                                    <input type="number" value={variantForm.sale_price} onChange={e => setVariantForm({ ...variantForm, sale_price: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" placeholder="اختياري" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الكمية</label>
                                <input type="number" required value={variantForm.stock_quantity} onChange={e => setVariantForm({ ...variantForm, stock_quantity: e.target.value })} className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800" />
                            </div>
                            <button type="submit" className="w-full bg-gold-600 text-white font-black py-4 rounded-xl hover:bg-gold-700 transition">حفظ</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductEdit;

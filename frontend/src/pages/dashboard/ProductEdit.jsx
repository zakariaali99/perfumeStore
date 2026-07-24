import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsApi, adminProductsApi, adminVariantsApi } from '../../services/api';
import {
    Save,
    Plus,
    Trash2,
    Edit2,
    Image as ImageIcon,
    LayoutGrid,
    Type,
    Briefcase,
    ChevronRight,
    BarChart,
    Box,
    X,
    Check,
    ChevronDown
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

    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef(null);

    const [isBrandOpen, setIsBrandOpen] = useState(false);
    const [brandSearch, setBrandSearch] = useState('');
    const brandRef = useRef(null);

    const [formData, setFormData] = useState({
        name_ar: '',
        description: '',
        story: '',
        categories: [],
        brand: '',
        gender: 'unisex',
        stock_type: 'unit',
        bulk_ml_stock: 0,
        occasion: '',
        vibe: '',
        is_active: true,
        is_featured: false,
        is_new: true,
        is_bestseller: false,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Default Variant for Creation Mode
    const [defaultVariant, setDefaultVariant] = useState({
        price: '',
        sale_price: '',
        stock_quantity: '',
        is_calculated_from_ml: true,
        sku: '',
        is_original_package: false,
        size_ml: 100
    });

    // Variants for Edit Mode
    const [variants, setVariants] = useState([]);
    const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState(null);

    const [variantForm, setVariantForm] = useState({
        is_original_package: false,
        name: '',
        size_ml: 100,
        price: '',
        sale_price: '',
        sku: '',
        stock_quantity: '',
        is_calculated_from_ml: true,
        is_active: true
    });

    const handleBack = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/dashboard/products');
        }
    };

    const fetchMetadata = useCallback(async () => {
        try {
            const [catRes, brandRes] = await Promise.all([
                productsApi.getCategories({ page_size: 1000 }),
                productsApi.getBrands({ page_size: 1000 })
            ]);
            setCategories(catRes.data.results || catRes.data || []);
            setBrands(brandRes.data.results || brandRes.data || []);
        } catch { /* ignore */ }
    }, []);

    const fetchProduct = useCallback(async () => {
        setInitialLoading(true);
        try {
            const res = await adminProductsApi.getDetail(id);
            const data = res.data;
            setFormData({
                name_ar: data.name_ar || '',
                description: data.description || '',
                story: data.story || '',
                categories: data.categories?.map(c => String(c.id)) || [],
                brand: data.brand?.id || '',
                gender: data.gender || 'unisex',
                stock_type: data.stock_type || 'unit',
                bulk_ml_stock: data.bulk_ml_stock || 0,
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
            if (data.variants) {
                setVariants(data.variants);
            }
        } catch {
            toast.error('تعذر تحميل بيانات المنتج');
            navigate('/dashboard/products');
        } finally {
            setInitialLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchMetadata();
        if (isEdit) fetchProduct();

        const handleClickOutside = (event) => {
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
            if (brandRef.current && !brandRef.current.contains(event.target)) {
                setIsBrandOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [fetchMetadata, fetchProduct, isEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleCategoryToggle = (catIdStr) => {
        setFormData(prev => {
            const current = prev.categories || [];
            if (current.includes(catIdStr)) {
                return { ...prev, categories: current.filter(c => c !== catIdStr) };
            } else {
                return { ...prev, categories: [...current, catIdStr] };
            }
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
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
            const textFields = ['name_ar', 'description', 'story', 'gender', 'stock_type', 'bulk_ml_stock', 'occasion', 'vibe'];
            textFields.forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            });

            if (formData.brand) {
                data.append('brand', formData.brand);
            }

            ['is_active', 'is_featured', 'is_new', 'is_bestseller'].forEach(key => {
                data.append(key, formData[key] ? 'true' : 'false');
            });

            formData.categories.forEach(catId => {
                data.append('categories', catId);
            });

            if (imageFile) {
                data.append('main_image', imageFile);
            }

            if (isEdit) {
                await adminProductsApi.update(id, data);
                toast.success('تم تحديث المنتج بنجاح');
            } else {
                const res = await adminProductsApi.create(data);
                const productId = res.data.id;

                // Create Default Variant
                if (defaultVariant.price) {
                    const variantData = {
                        product: productId,
                        price: defaultVariant.price,
                        stock_quantity: defaultVariant.stock_quantity ? parseInt(defaultVariant.stock_quantity) : 0,
                        is_calculated_from_ml: defaultVariant.is_calculated_from_ml,
                        size_ml: defaultVariant.size_ml ? parseInt(defaultVariant.size_ml) : 100,
                        name: defaultVariant.is_original_package ? 'العبوة الاصلية' : '',
                        sku: defaultVariant.sku || '',
                        is_active: true
                    };

                    if (defaultVariant.sale_price && parseFloat(defaultVariant.sale_price) > 0) {
                        variantData.sale_price = defaultVariant.sale_price;
                    }

                    await adminVariantsApi.create(variantData);
                }

                toast.success('تم إضافة المنتج والعبوة الافتراضية بنجاح');
            }
            handleBack();
        } catch (err) {
            console.error(err);
            toast.error('حدث خطأ أثناء حفظ البيانات: ' + (err.response?.data?.detail || JSON.stringify(err.response?.data) || ''));
        } finally {
            setLoading(false);
        }
    };

    // Variant Modal Handlers for Edit Mode
    const openVariantModal = (variant = null) => {
        if (variant) {
            setEditingVariant(variant);
            const isOriginal = variant.name === 'العبوة الاصلية';
            setVariantForm({
                is_original_package: isOriginal,
                name: variant.name || '',
                size_ml: variant.size_ml || 100,
                price: variant.price || '',
                sale_price: variant.sale_price || '',
                sku: variant.sku || '',
                stock_quantity: variant.stock_quantity ?? '',
                is_calculated_from_ml: variant.is_calculated_from_ml ?? true,
                is_active: variant.is_active ?? true
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
                stock_quantity: '',
                is_calculated_from_ml: true,
                is_active: true
            });
        }
        setIsVariantModalOpen(true);
    };

    const formatErrorMsg = (err, defaultMsg = 'حدث خطأ') => {
        if (!err.response?.data) return `${defaultMsg}: ${err.message || ''}`;
        const data = err.response.data;
        if (typeof data === 'string') return `${defaultMsg}: ${data}`;
        if (data.detail) return `${defaultMsg}: ${data.detail}`;
        if (typeof data === 'object') {
            const details = Object.entries(data).map(([field, errors]) => {
                const errStr = Array.isArray(errors) ? errors.join(', ') : String(errors);
                return `${field}: ${errStr}`;
            }).join(' | ');
            return `${defaultMsg} (${details})`;
        }
        return `${defaultMsg}: ${JSON.stringify(data)}`;
    };

    const handleVariantSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...variantForm,
                product: id,
                stock_quantity: variantForm.stock_quantity ? parseInt(variantForm.stock_quantity) : 0,
                size_ml: variantForm.size_ml ? parseInt(variantForm.size_ml) : 100,
                name: variantForm.is_original_package ? 'العبوة الاصلية' : (variantForm.name || '')
            };

            if (!data.sale_price || parseFloat(data.sale_price) === 0) {
                data.sale_price = null;
            }

            if (!data.sku) {
                delete data.sku;
            }

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
            console.error('Error saving variant:', err.response?.data || err);
            toast.error(formatErrorMsg(err, 'حدث خطأ في حفظ العبوة'));
        }
    };

    const deleteVariant = async (variantId) => {
        if (window.confirm('هل أنت متأكد من حذف هذه العبوة؟')) {
            try {
                await adminVariantsApi.delete(variantId);
                toast.success('تم حذف العبوة بنجاح');
                fetchProduct();
            } catch (error) {
                console.error(error);
                toast.error('تعذر حذف العبوة');
            }
        }
    };

    // Auto Stock Calculations across variants
    const totalStockPieces = variants.reduce((acc, v) => acc + (Number(v.stock_quantity) || 0), 0);
    const totalVolumeMl = variants.reduce((acc, v) => acc + ((Number(v.stock_quantity) || 0) * (Number(v.size_ml) || 0)), 0);

    if (initialLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <div className="w-12 h-12 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            <p className="text-gold-600 font-bold animate-pulse">جاري تحميل بيانات المنتج...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="p-2 hover:bg-gold-50 dark:hover:bg-dark-700 rounded-xl transition-all text-text-secondary dark:text-gold-400"
                    >
                        <ChevronRight size={24} />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">
                            {isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                        </h2>
                        <p className="text-text-secondary dark:text-gold-400 text-sm">أدخل تفاصيل العطر، العبوات، والأسعار بدقة.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 border border-gold-300 dark:border-dark-600 rounded-2xl font-bold bg-white dark:bg-dark-700 text-text-primary dark:text-cream-50 hover:bg-gold-50 dark:hover:bg-dark-600 transition-all"
                    >
                        إلغاء
                    </button>
                    <button
                        type="button"
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
                {/* Main Info Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Details */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-4">
                            <Type size={18} />
                            المعلومات الأساسية
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">اسم العطر (عربي)</label>
                                <input
                                    name="name_ar"
                                    value={formData.name_ar}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-bold"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">وصف العطر والقصة</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="الوصف المختصر..."
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-loose mb-4"
                            />
                            <textarea
                                name="story"
                                value={formData.story}
                                onChange={handleChange}
                                rows="4"
                                placeholder="القصة العطرية الكاملة..."
                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-loose"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">مناسب لـ</label>
                                <input
                                    name="occasion"
                                    value={formData.occasion}
                                    onChange={handleChange}
                                    placeholder="ليلي، حفلات، كلاسيكي..."
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1 uppercase tracking-wider">مزاج العطر</label>
                                <input
                                    name="vibe"
                                    value={formData.vibe}
                                    onChange={handleChange}
                                    placeholder="قوي، دافئ، رجولي..."
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Stock Mode Selection Card */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-2">
                            <Box size={18} />
                            نظام إدارة وتوزيع المخزون
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, stock_type: 'unit' })}
                                className={`p-5 rounded-3xl border text-right transition-all flex flex-col justify-between ${formData.stock_type === 'unit' ? 'bg-gold-50 border-gold-500 dark:bg-dark-600 dark:border-gold-500 shadow-md' : 'bg-cream-50/50 dark:bg-dark-800 border-gold-100 dark:border-dark-600 hover:bg-gold-50/50'}`}
                            >
                                <span className="font-black text-sm text-text-primary dark:text-cream-50 flex items-center justify-between mb-2">
                                    📦 بالقطع (عبوات مغلقة)
                                    {formData.stock_type === 'unit' && <Check size={16} className="text-gold-600" />}
                                </span>
                                <span className="text-xs text-text-secondary dark:text-gold-400">إدارة كمية العبوات المغلقة بشكل منفصل لكل حجم.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, stock_type: 'bulk_ml' })}
                                className={`p-5 rounded-3xl border text-right transition-all flex flex-col justify-between ${formData.stock_type === 'bulk_ml' ? 'bg-amber-50 border-amber-500 dark:bg-dark-600 dark:border-amber-500 shadow-md' : 'bg-cream-50/50 dark:bg-dark-800 border-gold-100 dark:border-dark-600 hover:bg-gold-50/50'}`}
                            >
                                <span className="font-black text-sm text-amber-700 dark:text-amber-400 flex items-center justify-between mb-2">
                                    🧪 بالسائل (مل - احتساب تلقائي)
                                    {formData.stock_type === 'bulk_ml' && <Check size={16} className="text-amber-600" />}
                                </span>
                                <span className="text-xs text-text-secondary dark:text-gold-400">تعبئة من خزان سائل واحد مع احتساب الكمية المتاحة لكل حجم تلقائياً.</span>
                            </button>
                        </div>

                        {formData.stock_type === 'bulk_ml' && (
                            <div className="p-6 rounded-3xl bg-amber-50/70 dark:bg-dark-800 border border-amber-200 dark:border-dark-600 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-amber-800 dark:text-amber-300">مخزون السائل الإجمالي بالمللي (Bulk ML Stock)</label>
                                    <input
                                        type="number"
                                        name="bulk_ml_stock"
                                        value={formData.bulk_ml_stock}
                                        onChange={handleChange}
                                        placeholder="مثال: 500 مل"
                                        className="w-full bg-white dark:bg-dark-600 border border-amber-300 dark:border-dark-500 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none font-bold text-lg font-poppins"
                                    />
                                </div>
                                <p className="text-xs text-amber-900 dark:text-amber-400 font-bold leading-relaxed">
                                    ⚡ حساب تلقائي: عند تحديد سائل بـ {formData.bulk_ml_stock || 0} مل، يتم تقسيم السائل تلقائياً على كل أحجام العبوات (مثال: 10 مل = {Math.floor((Number(formData.bulk_ml_stock) || 0) / 10)} قطعة | 50 مل = {Math.floor((Number(formData.bulk_ml_stock) || 0) / 50)} قطعة).
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Default Variant Section (Only for Create Mode) */}
                    {!isEdit && (
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                            <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-4">
                                <BarChart size={18} />
                                الأسعار والمخزون (العبوة الافتراضية)
                            </div>

                            <div className="bg-gold-50 dark:bg-dark-800 p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Box className="text-gold-600" size={20} />
                                    <span className="font-bold text-text-secondary dark:text-gold-400 text-sm">العبوة الأصلية (بدون تحديد حجم)</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="is_original_package"
                                        checked={defaultVariant.is_original_package}
                                        onChange={handleDefaultVariantChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">الحجم (مل)</label>
                                    <input
                                        type="number"
                                        name="size_ml"
                                        value={defaultVariant.size_ml}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none font-bold"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">السعر الأساسي (د.ل)</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={defaultVariant.price}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none font-bold"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">سعر العرض (اختياري)</label>
                                    <input
                                        type="number"
                                        name="sale_price"
                                        value={defaultVariant.sale_price}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">الكمية بالمخزن (قطعة)</label>
                                        <button
                                            type="button"
                                            onClick={() => setDefaultVariant(prev => ({ ...prev, is_calculated_from_ml: !prev.is_calculated_from_ml }))}
                                            className={`text-[11px] font-black px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${defaultVariant.is_calculated_from_ml ? 'bg-amber-100 text-amber-800 dark:bg-dark-600 dark:text-amber-300 border border-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-400'}`}
                                        >
                                            🧪 {defaultVariant.is_calculated_from_ml ? 'مربوط بمخزون السائل' : 'مخزون ثابت يدوي'}
                                        </button>
                                    </div>
                                    <input
                                        type="number"
                                        name="stock_quantity"
                                        value={defaultVariant.stock_quantity}
                                        onChange={handleDefaultVariantChange}
                                        disabled={defaultVariant.is_calculated_from_ml}
                                        className={`w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none font-bold ${defaultVariant.is_calculated_from_ml ? 'opacity-75 cursor-not-allowed bg-amber-50/50' : ''}`}
                                        placeholder={defaultVariant.is_calculated_from_ml ? "اتركه فارغاً للحساب التلقائي من السائل" : "أدخل الكمية الثابتة (مثال: 50)"}
                                    />
                                    {defaultVariant.is_calculated_from_ml && (
                                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 px-1">
                                            ⚡ حساب تلقائي متوقع: {defaultVariant.size_ml > 0 ? Math.floor((Number(formData.bulk_ml_stock) || 0) / Number(defaultVariant.size_ml)) : 0} قطعة (من {formData.bulk_ml_stock || 0} مل).
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">رمز SKU (اختياري)</label>
                                    <input
                                        type="text"
                                        name="sku"
                                        value={defaultVariant.sku}
                                        onChange={handleDefaultVariantChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-5 py-4 rounded-2xl focus:outline-none font-poppins"
                                        placeholder="توليد تلقائي إذا تُرك فارغاً"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Variants List Table & Modal (Only for Edit Mode) */}
                    {isEdit && (
                        <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm">
                                    <BarChart size={18} />
                                    العبوات والأسعار والمخزون
                                </div>
                                <button
                                    type="button"
                                    onClick={() => openVariantModal()}
                                    className="bg-gold-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all text-xs"
                                >
                                    <Plus size={16} />
                                    إضافة عبوة جديدة
                                </button>
                            </div>

                            {/* Auto Stock Calculation Badge */}
                            <div className="bg-gold-50/60 dark:bg-dark-800 p-4 rounded-2xl border border-gold-100 dark:border-dark-600 flex flex-wrap gap-6 items-center text-xs font-bold text-text-primary dark:text-cream-50">
                                <span>📦 إجمالي قطع المخزون: <strong className="text-gold-600 font-black">{totalStockPieces} قطعة</strong></span>
                                {totalVolumeMl > 0 && (
                                    <span>🧪 إجمالي السعة المتاحة: <strong className="text-blue-600 font-black">{totalVolumeMl} مل</strong></span>
                                )}
                            </div>

                            <div className="overflow-hidden border border-gold-100 dark:border-dark-600 rounded-2xl">
                                <table className="w-full text-right text-sm">
                                    <thead className="bg-cream-50 dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs font-bold">
                                        <tr>
                                            <th className="px-5 py-4">النوع / الحجم</th>
                                            <th className="px-5 py-4">السعر الحالي</th>
                                            <th className="px-5 py-4">المخزون</th>
                                            <th className="px-5 py-4">SKU</th>
                                            <th className="px-5 py-4 text-center">إجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gold-50 dark:divide-dark-600">
                                        {variants.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-5 py-8 text-center text-text-muted font-bold">لا توجد عبوات مضافة لهذا المنتج</td>
                                            </tr>
                                        ) : (
                                            variants.map((v) => (
                                                <tr key={v.id} className="hover:bg-cream-50/50 dark:hover:bg-dark-800/40">
                                                    <td className="px-5 py-4 font-bold text-text-primary dark:text-cream-50">
                                                        {v.name ? v.name : `${v.size_ml} مل`}
                                                    </td>
                                                    <td className="px-5 py-4 font-bold font-poppins text-gold-600">
                                                        {v.current_price || v.price} د.ل
                                                        {v.sale_price && (
                                                            <span className="mr-2 text-xs text-gray-400 line-through">{v.price} د.ل</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 font-bold font-poppins">
                                                        {formData.stock_type === 'bulk_ml' ? (
                                                            <span className="bg-amber-100 text-amber-900 dark:bg-dark-600 dark:text-amber-300 px-3 py-1.5 rounded-xl text-xs font-black inline-flex items-center gap-1">
                                                                ⚡ {v.size_ml && v.size_ml > 0 ? Math.floor((Number(formData.bulk_ml_stock) || 0) / Number(v.size_ml)) : (v.available_stock || v.stock_quantity)} قطعة (تلقائي)
                                                            </span>
                                                        ) : (
                                                            <span>{v.stock_quantity} قطعة</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 font-poppins text-xs text-text-muted">{v.sku || '-'}</td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => openVariantModal(v)}
                                                                className="p-2 text-blue-600 bg-blue-50 dark:bg-dark-600 rounded-xl hover:bg-blue-100 transition-all"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteVariant(v.id)}
                                                                className="p-2 text-red-600 bg-red-50 dark:bg-dark-600 rounded-xl hover:bg-red-100 transition-all"
                                                            >
                                                                <Trash2 size={16} />
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
                    )}

                    {/* Image Section */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-4">
                            <ImageIcon size={18} />
                            صورة الغلاف الرئيسية
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <label className="aspect-square bg-cream-50 dark:bg-dark-600 border-2 border-dashed border-gold-300 dark:border-dark-500 rounded-3xl flex flex-col items-center justify-center gap-2 text-gold-400 cursor-pointer hover:bg-gold-50 dark:hover:bg-dark-500 transition-all relative overflow-hidden">
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
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    {/* Classification */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-4">
                            <LayoutGrid size={18} />
                            التصنيفات والماركة
                        </div>

                        <div className="space-y-6">
                            {/* Categories Dropdown with Multi-select */}
                            <div className="space-y-2" ref={categoryRef}>
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">الفئات والتصنيفات</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl flex justify-between items-center text-text-primary dark:text-cream-50 font-bold text-sm"
                                    >
                                        <span>
                                            {formData.categories.length > 0
                                                ? `${formData.categories.length} تصنيفات محددة`
                                                : 'اختر التصنيفات'}
                                        </span>
                                        <ChevronDown size={18} />
                                    </button>

                                    {isCategoryOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-700 border border-gold-200 dark:border-dark-600 rounded-2xl shadow-xl z-30 max-h-60 overflow-y-auto p-2">
                                            {categories.map(cat => {
                                                const catIdStr = String(cat.id);
                                                const isSelected = formData.categories.includes(catIdStr);
                                                return (
                                                    <div
                                                        key={cat.id}
                                                        onClick={() => handleCategoryToggle(catIdStr)}
                                                        className="flex items-center gap-3 p-3 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-xl cursor-pointer"
                                                    >
                                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isSelected ? 'bg-gold-600 border-gold-600 text-white' : 'border-gold-300'}`}>
                                                            {isSelected && <Check size={14} />}
                                                        </div>
                                                        <span className="text-sm font-bold text-text-primary dark:text-cream-50">{cat.name_ar}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                {/* Selected Chips */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.categories.map(catIdStr => {
                                        const cat = categories.find(c => String(c.id) === catIdStr);
                                        if (!cat) return null;
                                        return (
                                            <span key={catIdStr} className="bg-gold-100 text-gold-800 dark:bg-dark-600 dark:text-gold-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                                {cat.name_ar}
                                                <button type="button" onClick={() => handleCategoryToggle(catIdStr)} className="hover:text-red-500"><X size={12} /></button>
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Contained & Searchable Brand Dropdown */}
                            <div className="space-y-2" ref={brandRef}>
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">الماركة</label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsBrandOpen(!isBrandOpen)}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-4 rounded-2xl flex justify-between items-center text-text-primary dark:text-cream-50 font-bold text-sm"
                                    >
                                        <span>
                                            {formData.brand
                                                ? (brands.find(b => String(b.id) === String(formData.brand))?.name_ar || 'الماركة المحددة')
                                                : 'اختر الماركة'}
                                        </span>
                                        <ChevronDown size={18} />
                                    </button>

                                    {isBrandOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-700 border border-gold-200 dark:border-dark-600 rounded-2xl shadow-xl z-30 overflow-hidden p-2 space-y-2">
                                            {/* Search Input */}
                                            <input
                                                type="text"
                                                value={brandSearch}
                                                onChange={(e) => setBrandSearch(e.target.value)}
                                                placeholder="ابحث عن ماركة..."
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 px-4 py-2.5 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                                            />

                                            {/* Scrollable Contained List */}
                                            <div className="max-h-52 overflow-y-auto space-y-1 pr-1 pb-4">
                                                <div
                                                    onClick={() => {
                                                        setFormData({ ...formData, brand: '' });
                                                        setIsBrandOpen(false);
                                                    }}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs font-bold ${!formData.brand ? 'bg-gold-50 text-gold-700 dark:bg-dark-600 dark:text-gold-400' : 'hover:bg-gray-50 dark:hover:bg-dark-600 text-text-primary dark:text-cream-50'}`}
                                                >
                                                    <span>بدون ماركة (تفريغ)</span>
                                                    {!formData.brand && <Check size={14} />}
                                                </div>

                                                {brands
                                                    .filter(b => b.name_ar.toLowerCase().includes(brandSearch.toLowerCase()))
                                                    .map(b => {
                                                        const isSelected = String(formData.brand) === String(b.id);
                                                        return (
                                                            <div
                                                                key={b.id}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, brand: String(b.id) });
                                                                    setIsBrandOpen(false);
                                                                }}
                                                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs font-bold ${isSelected ? 'bg-gold-50 text-gold-700 dark:bg-dark-600 dark:text-gold-400' : 'hover:bg-gray-50 dark:hover:bg-dark-600 text-text-primary dark:text-cream-50'}`}
                                                            >
                                                                <span>{b.name_ar}</span>
                                                                {isSelected && <Check size={14} />}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gender Select */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-text-secondary dark:text-gold-400 px-1">الجنس المستهدف</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['men', 'women', 'unisex'].map(g => (
                                        <button
                                            key={g}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, gender: g })}
                                            className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.gender === g ? 'bg-gold-500 text-white border-gold-500 shadow-md shadow-gold-500/20' : 'bg-cream-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 border-gold-100 dark:border-dark-600 hover:bg-gold-50'}`}
                                        >
                                            {g === 'men' ? 'رجالي' : g === 'women' ? 'نسائي' : 'للجنسين'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="bg-white dark:bg-dark-700 p-8 rounded-[40px] border border-gold-200 dark:border-dark-600 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 text-gold-600 dark:text-gold-400 font-black text-sm mb-4">
                            <Briefcase size={18} />
                            خيارات العرض والعلامات
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 rounded-2xl cursor-pointer text-text-primary dark:text-cream-50">
                                <span className="text-sm font-bold">تفعيل المنتج</span>
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 rounded-2xl cursor-pointer text-text-primary dark:text-cream-50">
                                <span className="text-sm font-bold">منتج مميز (Featured)</span>
                                <input
                                    type="checkbox"
                                    name="is_featured"
                                    checked={formData.is_featured}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 rounded-2xl cursor-pointer text-text-primary dark:text-cream-50">
                                <span className="text-sm font-bold">وصول جديد (New)</span>
                                <input
                                    type="checkbox"
                                    name="is_new"
                                    checked={formData.is_new}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-gold-500"
                                />
                            </label>
                            <label className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 rounded-2xl cursor-pointer text-text-primary dark:text-cream-50">
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

            {/* Variant Modal for Edit Mode */}
            {isVariantModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-gold-100 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <h3 className="text-lg font-black text-gold-600">
                                {editingVariant ? 'تعديل العبوة' : 'إضافة عبوة جديدة'}
                            </h3>
                            <button
                                type="button"
                                onClick={() => setIsVariantModalOpen(false)}
                                className="p-2 hover:bg-gray-200 dark:hover:bg-dark-600 rounded-full"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleVariantSubmit} className="p-6 space-y-5">
                            <div className="bg-gold-50 dark:bg-dark-800 p-4 rounded-2xl flex items-center justify-between">
                                <span className="font-bold text-text-secondary dark:text-gold-400 text-sm">العبوة الأصلية (بدون تحديد حجم)</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={variantForm.is_original_package}
                                        onChange={(e) => setVariantForm({ ...variantForm, is_original_package: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-gold-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold-600"></div>
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400">الحجم (مل)</label>
                                    <input
                                        type="number"
                                        required
                                        value={variantForm.size_ml}
                                        onChange={e => setVariantForm({ ...variantForm, size_ml: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800 text-text-primary dark:text-cream-50 font-bold"
                                        placeholder="100"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400">رمز SKU (اختياري)</label>
                                    <input
                                        type="text"
                                        value={variantForm.sku}
                                        onChange={e => setVariantForm({ ...variantForm, sku: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800 text-text-primary dark:text-cream-50 font-poppins"
                                        placeholder="توليد تلقائي"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400">السعر الأساسي (د.ل)</label>
                                    <input
                                        type="number"
                                        required
                                        value={variantForm.price}
                                        onChange={e => setVariantForm({ ...variantForm, price: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800 text-text-primary dark:text-cream-50 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400">سعر العرض (د.ل)</label>
                                    <input
                                        type="number"
                                        value={variantForm.sale_price}
                                        onChange={e => setVariantForm({ ...variantForm, sale_price: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 bg-cream-50 dark:bg-dark-800 text-text-primary dark:text-cream-50"
                                        placeholder="اختياري"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-text-secondary dark:text-gold-400">الكمية بالمخزن (قطعة)</label>
                                    <button
                                        type="button"
                                        onClick={() => setVariantForm(prev => ({ ...prev, is_calculated_from_ml: !prev.is_calculated_from_ml }))}
                                        className={`text-[11px] font-black px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 ${variantForm.is_calculated_from_ml ? 'bg-amber-100 text-amber-800 dark:bg-dark-600 dark:text-amber-300 border border-amber-300' : 'bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-400'}`}
                                    >
                                        🧪 {variantForm.is_calculated_from_ml ? 'مربوط بمخزون السائل' : 'مخزون ثابت يدوي'}
                                    </button>
                                </div>
                                <input
                                    type="number"
                                    value={variantForm.stock_quantity}
                                    onChange={e => setVariantForm({ ...variantForm, stock_quantity: e.target.value })}
                                    disabled={variantForm.is_calculated_from_ml}
                                    className={`w-full p-3 rounded-xl border border-gold-100 dark:border-dark-600 text-text-primary dark:text-cream-50 font-bold ${variantForm.is_calculated_from_ml ? 'bg-amber-50/50 dark:bg-dark-800 opacity-75 cursor-not-allowed' : 'bg-cream-50 dark:bg-dark-800'}`}
                                    placeholder={variantForm.is_calculated_from_ml ? "اتركه فارغاً للحساب التلقائي من السائل" : "أدخل الكمية الثابتة (مثال: 50)"}
                                />
                                {variantForm.is_calculated_from_ml && (
                                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400 px-1">
                                        ⚡ حساب تلقائي متوقع: {variantForm.size_ml > 0 ? Math.floor((Number(formData.bulk_ml_stock) || 0) / Number(variantForm.size_ml)) : 0} قطعة (من {formData.bulk_ml_stock || 0} مل).
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gold-600 text-white font-black py-4 rounded-2xl hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                            >
                                حفظ العبوة
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductEdit;

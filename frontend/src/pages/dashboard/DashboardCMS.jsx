import { useState, useEffect } from 'react';
import { cmsApi } from '../../services/api';
import {
    Plus,
    Image as ImageIcon,
    Edit,
    Trash2,
    Layout,
    Layers,
    ExternalLink,
    X,
    Save,
    Upload,
    Eye,
    EyeOff,
    CheckCircle2,
    CircleDashed,
    Settings2,
    ChevronUp,
    ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardCMS = () => {
    const [slides, setSlides] = useState([]);
    const [banners, setBanners] = useState([]);
    const [hpc, setHpc] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('slides');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description_ar: '',
        link: '',
        button_text: '',
        button_link: '',
        position: 'home_top',
        order: 0,
        is_active: true,
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchCMSData();
    }, []);

    const fetchCMSData = async () => {
        setLoading(true);
        try {
            const [slidesRes, bannersRes, hpcRes] = await Promise.all([
                cmsApi.getSlides(),
                cmsApi.getBanners(),
                cmsApi.getHPC()
            ]);
            setSlides(slidesRes.data.results || slidesRes.data || []);
            setBanners(bannersRes.data.results || bannersRes.data || []);
            setHpc(hpcRes.data.results || hpcRes.data || []);
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل بيانات المحتوى');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                title: item.title || '',
                subtitle: item.subtitle || '',
                description_ar: item.description_ar || '',
                link: item.link || '',
                button_text: item.button_text || '',
                button_link: item.button_link || '',
                position: item.position || 'home_top',
                order: item.order || 0,
                is_active: item.is_active,
                image: null
            });
            setImagePreview(item.image);
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                subtitle: '',
                description_ar: '',
                link: '',
                button_text: '',
                button_link: '',
                position: 'home_top',
                order: 0,
                is_active: true,
                image: null
            });
            setImagePreview(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا العنصر؟')) return;
        try {
            if (activeTab === 'slides') {
                await cmsApi.deleteSlide(id);
            } else {
                await cmsApi.deleteBanner(id);
            }
            toast.success('تم الحذف بنجاح');
            fetchCMSData();
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    const toggleHPCStatus = async (id, currentStatus) => {
        try {
            await cmsApi.updateHPC(id, { is_active: !currentStatus });
            toast.success('تم تحديث حالة القسم بنجاح');
            fetchCMSData();
        } catch (error) {
            toast.error('فشل في تحديث القسم');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        const slideFields = ['title', 'subtitle', 'description_ar', 'button_text', 'button_link', 'order', 'is_active', 'image'];
        const bannerFields = ['title', 'link', 'position', 'is_active', 'image'];
        const validFields = activeTab === 'slides' ? slideFields : bannerFields;

        Object.keys(formData).forEach(key => {
            if (validFields.includes(key)) {
                if (key === 'image') {
                    if (formData[key]) data.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    data.append(key, formData[key]);
                }
            }
        });

        try {
            if (editingItem) {
                if (activeTab === 'slides') {
                    await cmsApi.updateSlide(editingItem.id, data);
                } else {
                    await cmsApi.updateBanner(editingItem.id, data);
                }
                toast.success('تم التحديث بنجاح');
            } else {
                if (!formData.image) {
                    toast.error('يرجى اختيار صورة');
                    return;
                }
                if (activeTab === 'slides') {
                    await cmsApi.createSlide(data);
                } else {
                    await cmsApi.createBanner(data);
                }
                toast.success('تمت الإضافة بنجاح');
            }
            handleCloseModal();
            fetchCMSData();
        } catch (error) {
            console.error('CMS Submit Error:', error.response?.data || error.message);
            const errorMsg = error.response?.data
                ? Object.entries(error.response.data).map(([k, v]) => `${k}: ${v}`).join(', ')
                : 'حدث خطأ أثناء حفظ البيانات';
            toast.error(errorMsg);
        }
    };

    const handleMoveSection = async (section, direction) => {
        const index = hpc.findIndex(s => s.id === section.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === hpc.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const targetSection = hpc[targetIndex];

        try {
            // Swap orders
            await Promise.all([
                cmsApi.updateHPC(section.id, { order: targetSection.order }),
                cmsApi.updateHPC(targetSection.id, { order: section.order })
            ]);
            toast.success('تم تحديث الترتيب');
            fetchCMSData();
        } catch (error) {
            toast.error('فشل في تحديث الترتيب');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">إدارة المحتوى (CMS)</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">تخصيص السلايدر الرئيسي، البانرات الدعائية وإدارة أقسام الصفحة الرئيسية.</p>
                </div>
                {activeTab !== 'hpc' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                    >
                        <Plus size={20} />
                        إضافة {activeTab === 'slides' ? 'سلايدر' : 'بانر'} جديد
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-dark-700 rounded-2xl border border-gold-100 dark:border-dark-600 w-fit">
                <button
                    onClick={() => setActiveTab('slides')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'slides' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Layout size={18} />
                    السلايدر الرئيسي
                </button>
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'banners' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Layers size={18} />
                    البانرات الإعلانية
                </button>
                <button
                    onClick={() => setActiveTab('hpc')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'hpc' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Settings2 size={18} />
                    محتوى الصفحة الرئيسية (HPC)
                </button>
            </div>

            {/* HPC CONTENT */}
            {activeTab === 'hpc' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {hpc.sort((a, b) => a.order - b.order).map((section, idx) => (
                        <div key={section.id} className="bg-white dark:bg-dark-700 p-6 rounded-[32px] border border-gold-100 dark:border-dark-600 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 bg-gold-50 dark:bg-dark-800 rounded-2xl flex items-center justify-center text-gold-500">
                                        {section.is_active ? <CheckCircle2 size={24} /> : <CircleDashed size={24} className="opacity-40" />}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <button
                                            disabled={idx === 0}
                                            onClick={() => handleMoveSection(section, 'up')}
                                            className="p-1 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-lg text-gold-600 disabled:opacity-20"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            disabled={idx === hpc.length - 1}
                                            onClick={() => handleMoveSection(section, 'down')}
                                            className="p-1 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-lg text-gold-600 disabled:opacity-20"
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleHPCStatus(section.id, section.is_active)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${section.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                >
                                    {section.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {section.is_active ? 'نشط' : 'مخفي'}
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-text-primary dark:text-cream-50 leading-tight mb-2">{section.section_display}</h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400/70 mb-4">{section.title_ar}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gold-600 bg-gold-50 dark:bg-dark-800 w-fit px-3 py-1 rounded-lg">
                                ترتيب الظهور: {section.order}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List for Slides/Banners */}
            {activeTab !== 'hpc' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white dark:bg-dark-700 animate-pulse rounded-[32px] border border-gold-100 dark:border-dark-600"></div>)
                    ) : (
                        (activeTab === 'slides' ? slides : banners).map((item) => (
                            <div key={item.id} className="bg-white dark:bg-dark-700 rounded-[40px] border border-gold-100 dark:border-dark-600 overflow-hidden group hover:shadow-xl transition-all duration-500">
                                <div className="aspect-[21/9] bg-cream-50 relative overflow-hidden">
                                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                                        <div className="text-white">
                                            <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                            <p className="text-sm opacity-80">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-gold-700 border border-gold-100">
                                        الترتيب: {item.order}
                                    </div>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${item.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            {item.is_active ? 'نشط' : 'مخفي'}
                                        </span>
                                        {(item.link || item.button_link) && (
                                            <div className="flex items-center gap-1 text-[10px] text-text-secondary dark:text-gold-400 bg-gray-50 dark:bg-dark-600 px-3 py-1 rounded-full font-bold">
                                                <ExternalLink size={10} />
                                                {item.link || item.button_link}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(item)}
                                            className="p-2.5 text-text-muted dark:text-gold-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2.5 text-text-muted dark:text-gold-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal for Slides/Banners */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-2xl rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">
                                    {editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
                                </h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400">
                                    سيتم إضافته إلى {activeTab === 'slides' ? 'السلايدر الرئيسي' : 'البانرات الإعلانية'}
                                </p>
                            </div>
                            <button onClick={handleCloseModal} className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* Image Upload Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400">صورة العنصر</label>
                                <div className="relative group aspect-[21/9] rounded-3xl overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-200 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <div className="bg-white p-3 rounded-full text-gold-600 shadow-xl">
                                                    <Upload size={24} />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon size={48} className="mx-auto text-gold-300 mb-2" />
                                            <p className="text-xs font-bold text-text-muted">انقر لاختيار صورة</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">العنوان الرئيسي</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">العنوان الفرعي</label>
                                    <input
                                        type="text"
                                        value={formData.subtitle}
                                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                            </div>

                            {activeTab === 'slides' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">وصف العرض</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description_ar}
                                        onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 resize-none"
                                        placeholder="اكتب وصفاً قصيراً يظهر تحت العنوان الرئيسي..."
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الرابط (اختياري)</label>
                                    <input
                                        type="text"
                                        value={formData.link}
                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-poppins ltr text-text-primary dark:text-cream-50"
                                        placeholder="/products/perfumes"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الترتيب</label>
                                    <input
                                        type="number"
                                        required
                                        value={formData.order}
                                        onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                                {activeTab === 'slides' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">نص الزر</label>
                                            <input
                                                type="text"
                                                value={formData.button_text}
                                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                                placeholder="تسوق الآن"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">رابط الزر</label>
                                            <input
                                                type="text"
                                                value={formData.button_link}
                                                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                                className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-poppins ltr text-text-primary dark:text-cream-50"
                                                placeholder="/products/new-arrival"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">مكان البانر</label>
                                        <select
                                            value={formData.position}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                        >
                                            <option value="home_top">الرئيسية - أعلى</option>
                                            <option value="home_middle">الرئيسية - وسط</option>
                                            <option value="products_top">المنتجات - أعلى</option>
                                            <option value="sidebar">الشريط الجانبي</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-50 dark:border-dark-600">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-5 h-5 accent-gold-600"
                                />
                                <label htmlFor="is_active" className="text-sm font-bold text-text-primary dark:text-cream-50 cursor-pointer select-none">تفعيل المحتوى والظهور في واجهة المتجر</label>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 transition-all"
                                >
                                    <Save size={20} />
                                    حفظ التغييرات
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

export default DashboardCMS;

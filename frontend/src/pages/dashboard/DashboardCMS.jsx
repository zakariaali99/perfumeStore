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
    Save,
    Upload,
    ArrowUp,
    ArrowDown,
    Eye,
    EyeOff,
    CheckSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Modal from '../../components/common/Modal';

const DashboardCMS = () => {
    const [slides, setSlides] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('slides');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '',
        button_text: '',
        button_link: '',
        description_ar: '',
        position: 'home_top',
        order: 0,
        is_active: true,
        image: null,
        image_mobile: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [hpc, setHpc] = useState([]);
    const [isHpcModalOpen, setIsHpcModalOpen] = useState(false);
    const [editingHpcItem, setEditingHpcItem] = useState(null);
    const [hpcFormData, setHpcFormData] = useState({
        heading: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        quote: '',
        description: '',
        cities: ''
    });

    const sectionTypeLabels = {
        features: 'المميزات',
        stats: 'الإحصائيات',
        vision: 'رؤيتنا',
        categories: 'الفئات',
        best_sellers: 'الأكثر مبيعاً',
        featured_products: 'عطور مختارة'
    };

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
            setSlides(slidesRes.data.results || slidesRes.data);
            setBanners(bannersRes.data.results || bannersRes.data);
            const sortedHpc = (hpcRes.data.results || hpcRes.data || []).sort((a, b) => a.order - b.order);
            setHpc(sortedHpc);
        } catch {
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
                image: null,
                image_mobile: null
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
                image: null,
                image_mobile: null
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
        } catch {
            toast.error('حدث خطأ أثناء الحذف');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image' || key === 'image_mobile') {
                if (formData[key] instanceof File) data.append(key, formData[key]);
            } else if (key !== 'image_mobile') {
                data.append(key, formData[key]);
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
        } catch {
            toast.error('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleToggleHPCStatus = async (item) => {
        try {
            await cmsApi.updateHPC(item.id, { is_active: !item.is_active });
            toast.success('تم تحديث الحالة');
            fetchCMSData();
        } catch {
            toast.error('حدث خطأ');
        }
    };

    const handleMoveSection = async (item, direction) => {
        const idx = hpc.findIndex(s => s.id === item.id);
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= hpc.length) return;

        const currentOrder = hpc[idx].order;
        const targetOrder = hpc[targetIdx].order;

        try {
            await Promise.all([
                cmsApi.updateHPC(hpc[idx].id, { order: targetOrder }),
                cmsApi.updateHPC(hpc[targetIdx].id, { order: currentOrder })
            ]);
            toast.success('تم إعادة الترتيب');
            fetchCMSData();
        } catch {
            toast.error('حدث خطأ أثناء إعادة الترتيب');
        }
    };

    const handleOpenHpcModal = (item) => {
        setEditingHpcItem(item);
        const content = item.content || {};
        setHpcFormData({
            heading: content.heading || '',
            subtitle: content.subtitle || '',
            button_text: content.button_text || '',
            button_link: content.button_link || '',
            quote: content.quote || '',
            description: content.description || '',
            cities: Array.isArray(content.cities) ? content.cities.join(', ') : content.cities || ''
        });
        setIsHpcModalOpen(true);
    };

    const handleCloseHpcModal = () => {
        setIsHpcModalOpen(false);
        setEditingHpcItem(null);
    };

    const handleHpcSubmit = async (e) => {
        e.preventDefault();
        if (!editingHpcItem) return;

        const content = { ...hpcFormData };
        if (editingHpcItem.key === 'vision') {
            content.cities = content.cities ? content.cities.split(/[,،]/).map(c => c.trim()).filter(Boolean) : [];
        }
        if (['features', 'stats'].includes(editingHpcItem.key)) {
            delete content.heading;
            delete content.subtitle;
            delete content.button_text;
            delete content.button_link;
            delete content.quote;
            delete content.cities;
        }
        if (editingHpcItem.key === 'vision') {
            delete content.heading;
            delete content.subtitle;
            delete content.button_text;
            delete content.button_link;
        }
        if (['categories', 'best_sellers', 'featured_products'].includes(editingHpcItem.key)) {
            delete content.quote;
            delete content.description;
            delete content.cities;
        }

        try {
            await cmsApi.updateHPC(editingHpcItem.id, { content });
            toast.success('تم تحديث القسم');
            handleCloseHpcModal();
            fetchCMSData();
        } catch {
            toast.error('حدث خطأ أثناء حفظ القسم');
        }
    };

    const renderHpcFormFields = () => {
        if (!editingHpcItem) return null;
        const key = editingHpcItem.key;

        if (['features', 'stats'].includes(key)) {
            return (
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary dark:text-gold-400 bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-100 dark:border-dark-600 font-bold">
                        يتم إدارة محتوى هذا القسم من خلال لوحة التحكم. يمكنك تفعيله أو إلغاء تفعيله أو إعادة ترتيبه فقط.
                    </p>
                </div>
            );
        }

        if (key === 'vision') {
            return (
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">المقولة</label>
                        <textarea
                            value={hpcFormData.quote}
                            onChange={(e) => setHpcFormData({ ...hpcFormData, quote: e.target.value })}
                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 h-24 resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">الوصف</label>
                        <textarea
                            value={hpcFormData.description}
                            onChange={(e) => setHpcFormData({ ...hpcFormData, description: e.target.value })}
                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 h-24 resize-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">المدن (مفصولة بفواصل)</label>
                        <input
                            type="text"
                            value={hpcFormData.cities}
                            onChange={(e) => setHpcFormData({ ...hpcFormData, cities: e.target.value })}
                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                            placeholder="طرابلس, بنغازي, مصراتة"
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">العنوان الرئيسي</label>
                    <input
                        type="text"
                        value={hpcFormData.heading}
                        onChange={(e) => setHpcFormData({ ...hpcFormData, heading: e.target.value })}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400">العنوان الفرعي</label>
                    <input
                        type="text"
                        value={hpcFormData.subtitle}
                        onChange={(e) => setHpcFormData({ ...hpcFormData, subtitle: e.target.value })}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">نص الزر</label>
                        <input
                            type="text"
                            value={hpcFormData.button_text}
                            onChange={(e) => setHpcFormData({ ...hpcFormData, button_text: e.target.value })}
                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">رابط الزر</label>
                        <input
                            type="text"
                            value={hpcFormData.button_link}
                            onChange={(e) => setHpcFormData({ ...hpcFormData, button_link: e.target.value })}
                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-poppins ltr text-text-primary dark:text-cream-50"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">إدارة المحتوى (CMS)</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">تخصيص السلايدر الرئيسي، البانرات الدعائية والمحتوى المرئي.</p>
                </div>
                {activeTab !== 'hpc' && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                    >
                        <Plus size={20} />
                        إضافة عنصر جديد
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white dark:bg-dark-700 rounded-2xl border border-gold-200 dark:border-dark-600 w-fit">
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
                    <CheckSquare size={18} />
                    أقسام الرئيسية (HPC)
                </button>
            </div>

            {/* List */}
            {activeTab === 'hpc' ? (
                <div className="space-y-4">
                    <div className="flex items-center justify-between bg-white dark:bg-dark-700 p-4 rounded-2xl border border-gold-200 dark:border-dark-600">
                        <p className="text-sm font-bold text-text-secondary dark:text-gold-400">
                            الأقساب النشطة: <span className="text-gold-600 dark:text-gold-400">{hpc.filter(s => s.is_active).length}</span> من {hpc.length}
                        </p>
                    </div>
                    {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white dark:bg-dark-700 animate-pulse rounded-2xl border border-gold-200 dark:border-dark-600"></div>)
                    ) : hpc.length === 0 ? (
                        <div className="bg-white dark:bg-dark-700 rounded-3xl p-12 text-center border border-gold-200 dark:border-dark-600">
                            <p className="text-text-secondary dark:text-gold-400 font-bold">لا توجد أقسام لعرضها</p>
                        </div>
                    ) : (
                        hpc.map((section, idx) => (
                            <div key={section.id} className="bg-white dark:bg-dark-700 rounded-2xl border border-gold-200 dark:border-dark-600 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => handleMoveSection(section, 'up')}
                                            disabled={idx === 0}
                                            className="p-1 text-text-muted dark:text-gold-400 hover:text-gold-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleMoveSection(section, 'down')}
                                            disabled={idx === hpc.length - 1}
                                            className="p-1 text-text-muted dark:text-gold-400 hover:text-gold-600 disabled:opacity-20 disabled:cursor-not-allowed"
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-text-primary dark:text-cream-50">{section.content?.heading || sectionTypeLabels[section.key] || section.key}</h3>
                                        <p className="text-xs text-text-secondary dark:text-gold-400 font-bold mt-1">
                                            {sectionTypeLabels[section.key] || section.key} • الترتيب {section.order}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggleHPCStatus(section)}
                                        className={`p-2.5 rounded-xl transition-all ${section.is_active ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}
                                    >
                                        {section.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                    <button
                                        onClick={() => handleOpenHpcModal(section)}
                                        className="p-2.5 text-text-muted dark:text-gold-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                    >
                                        <Edit size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {loading ? (
                        [1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-white dark:bg-dark-700 animate-pulse rounded-[32px] border border-gold-200 dark:border-dark-600"></div>)
                    ) : (
                        (activeTab === 'slides' ? slides : banners).map((item) => (
                            <div key={item.id} className="bg-white dark:bg-dark-700 rounded-[40px] border border-gold-200 dark:border-dark-600 overflow-hidden group hover:shadow-xl transition-all duration-500">
                                <div className="aspect-[21/9] bg-cream-50 relative overflow-hidden">
                                    <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                                        <div className="text-white">
                                            <h3 className="text-2xl font-bold mb-1">{item.title}</h3>
                                            <p className="text-sm opacity-80">{item.subtitle}</p>
                                        </div>
                                    </div>
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-gold-700 border border-gold-200">
                                        الترتيب: {item.order}
                                    </div>
                                </div>
                                <div className="p-6 flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${item.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                                            {item.is_active ? 'نشط' : 'مخفي'}
                                        </span>
                                        {item.link && (
                                            <div className="flex items-center gap-1 text-[10px] text-text-secondary dark:text-gold-400 bg-gray-50 dark:bg-dark-600 px-3 py-1 rounded-full font-bold">
                                                <ExternalLink size={10} />
                                                {item.link}
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

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} maxWidth="max-w-2xl">
                <Modal.Header
                    title={editingItem ? 'تعديل العنصر' : 'إضافة عنصر جديد'}
                    subtitle={`سيتم إضافته إلى ${activeTab === 'slides' ? 'السلايدر الرئيسي' : 'البانرات الإعلانية'}`}
                    onClose={handleCloseModal}
                />
                <form onSubmit={handleSubmit}>
                    <Modal.Body className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400">صورة العنصر</label>
                            <div className="relative group aspect-[21/9] rounded-3xl overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-300 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
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
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">العنوان الفرعي</label>
                                <input
                                    type="text"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الرابط (اختياري)</label>
                                <input
                                    type="text"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-poppins ltr text-text-primary dark:text-cream-50"
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
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                />
                            </div>
                            {activeTab === 'slides' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الوصف</label>
                                        <textarea
                                            value={formData.description_ar}
                                            onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50 h-24 resize-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">صورة الجوال (اختياري)</label>
                                        <div className="relative group aspect-[9/16] w-48 rounded-3xl overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-300 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setFormData({ ...formData, image_mobile: file });
                                                    }
                                                }}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <ImageIcon size={32} className="text-gold-300" />
                                            <p className="text-[10px] font-bold text-text-muted mt-1">انقر لاختيار صورة</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">نص الزر</label>
                                        <input
                                            type="text"
                                            value={formData.button_text}
                                            onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                            placeholder="تسوق الآن"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">رابط الزر</label>
                                        <input
                                            type="text"
                                            value={formData.button_link}
                                            onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-sm font-poppins ltr text-text-primary dark:text-cream-50"
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
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-100 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    >
                                        <option value="home_top">الرئيسية - أعلى</option>
                                        <option value="home_middle">الرئيسية - وسط</option>
                                        <option value="products_top">المنتجات - أعلى</option>
                                        <option value="sidebar">الشريط الجانبي</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3 bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-100 dark:border-dark-600">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="w-5 h-5 accent-gold-600"
                            />
                            <label htmlFor="is_active" className="text-sm font-bold text-text-primary dark:text-cream-50 cursor-pointer select-none">تفعيل المحتوى والظهور في واجهة المتجر</label>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex gap-4">
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
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal isOpen={isHpcModalOpen} onClose={handleCloseHpcModal} maxWidth="max-w-2xl">
                <Modal.Header
                    title={`تعديل القسم: ${sectionTypeLabels[editingHpcItem?.key] || editingHpcItem?.key}`}
                    subtitle="تخصيص محتوى القسم الظاهر في الصفحة الرئيسية"
                    onClose={handleCloseHpcModal}
                />
                <form onSubmit={handleHpcSubmit}>
                    <Modal.Body>
                        {renderHpcFormFields()}
                        <div className="flex items-center gap-3 bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-100 dark:border-dark-600 mt-6">
                            <div className={`w-3 h-3 rounded-full ${editingHpcItem?.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-bold text-text-primary dark:text-cream-50">
                                الحالة: {editingHpcItem?.is_active ? 'نشط' : 'مخفي'}
                            </span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 transition-all"
                            >
                                <Save size={20} />
                                حفظ التغييرات
                            </button>
                            <button
                                type="button"
                                onClick={handleCloseHpcModal}
                                className="px-8 py-4 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-500 transition-all"
                            >
                                إلغاء
                            </button>
                        </div>
                    </Modal.Footer>
                </form>
            </Modal>
        </div>
    );
};

export default DashboardCMS;

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
    ChevronDown,
    GripVertical,
    ToggleLeft,
    ToggleRight,
    RotateCcw,
    Pencil
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardCMS = () => {
    const [slides, setSlides] = useState([]);
    const [banners, setBanners] = useState([]);
    const [hpc, setHpc] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('slides');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHpcModalOpen, setIsHpcModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingHpcItem, setEditingHpcItem] = useState(null);
    const [hpcFormData, setHpcFormData] = useState({ title_ar: '', order: 0, is_active: true, content: {} });
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
        image: null,
        image_mobile: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageMobilePreview, setImageMobilePreview] = useState(null);

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
            const sortedHpc = (hpcRes.data.results || hpcRes.data || []).sort((a, b) => a.order - b.order);
            setHpc(sortedHpc);
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
                image: null,
                image_mobile: null
            });
            setImagePreview(item.image);
            setImageMobilePreview(item.image_mobile);
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
            setImageMobilePreview(null);
        }
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setImagePreview(null);
        setImageMobilePreview(null);
    };

    const handleImageMobileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image_mobile: file });
            setImageMobilePreview(URL.createObjectURL(file));
        }
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
        } catch {
            toast.error('فشل في تحديث القسم');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        const slideFields = ['title', 'subtitle', 'description_ar', 'button_text', 'button_link', 'order', 'is_active', 'image', 'image_mobile'];
        const bannerFields = ['title', 'link', 'position', 'is_active', 'image'];
        const validFields = activeTab === 'slides' ? slideFields : bannerFields;

        Object.keys(formData).forEach(key => {
            if (validFields.includes(key)) {
                if (key === 'image' || key === 'image_mobile') {
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

    // ---- HPC CRUD Functions ----
    const handleMoveSection = async (section, direction) => {
        const sorted = [...hpc].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex(s => s.id === section.id);
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sorted.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const targetSection = sorted[targetIndex];

        try {
            await Promise.all([
                cmsApi.updateHPC(section.id, { order: targetSection.order }),
                cmsApi.updateHPC(targetSection.id, { order: section.order })
            ]);
            toast.success('تم تحديث الترتيب');
            fetchCMSData();
        } catch {
            toast.error('فشل في تحديث الترتيب');
        }
    };

    const handleOpenHpcModal = (section) => {
        setEditingHpcItem(section);
        setHpcFormData({
            title_ar: section.title_ar || '',
            order: section.order ?? 0,
            is_active: section.is_active,
            content: section.content || {}
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
        try {
            await cmsApi.updateHPC(editingHpcItem.id, hpcFormData);
            toast.success('تم تحديث القسم بنجاح');
            handleCloseHpcModal();
            fetchCMSData();
        } catch {
            toast.error('فشل في تحديث القسم');
        }
    };

    const handleBulkToggleHPC = async (activate) => {
        try {
            await Promise.all(hpc.map(s => cmsApi.updateHPC(s.id, { is_active: activate })));
            toast.success(activate ? 'تم تفعيل جميع الأقسام' : 'تم إخفاء جميع الأقسام');
            fetchCMSData();
        } catch {
            toast.error('فشل في تحديث الأقسام');
        }
    };

    const handleResetOrder = async () => {
        if (!window.confirm('هل تريد إعادة ترتيب جميع الأقسام إلى الترتيب الافتراضي؟')) return;
        try {
            const sorted = [...hpc].sort((a, b) => a.order - b.order);
            await Promise.all(sorted.map((s, idx) => cmsApi.updateHPC(s.id, { order: idx })));
            toast.success('تم إعادة الترتيب الافتراضي');
            fetchCMSData();
        } catch {
            toast.error('فشل في إعادة الترتيب');
        }
    };

    const activeCount = hpc.filter(s => s.is_active).length;

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
                        className="w-full md:w-auto bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                    >
                        <Plus size={20} />
                        إضافة {activeTab === 'slides' ? 'سلايدر' : 'بانر'} جديد
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 p-1.5 bg-white dark:bg-dark-700 rounded-2xl border border-gold-100 dark:border-dark-600 w-full md:w-fit">
                <button
                    onClick={() => setActiveTab('slides')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'slides' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Layout size={18} />
                    <span>السلايدر</span>
                </button>
                <button
                    onClick={() => setActiveTab('banners')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'banners' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Layers size={18} />
                    <span>البانرات</span>
                </button>
                <button
                    onClick={() => setActiveTab('hpc')}
                    className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'hpc' ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'text-text-secondary dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-dark-600'}`}
                >
                    <Settings2 size={18} />
                    <span>الأقسام (HPC)</span>
                </button>
            </div>

            {/* ==================== HPC SECTION ==================== */}
            {activeTab === 'hpc' && (
                <div className="space-y-6 animate-fade-in">
                    {/* HPC Stats & Bulk Actions Bar */}
                    <div className="bg-white dark:bg-dark-700 p-4 md:p-5 rounded-[28px] border border-gold-100 dark:border-dark-600 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center justify-between w-full md:w-auto gap-4">
                            <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-text-secondary dark:text-gold-400">
                                <Settings2 size={18} className="text-gold-500" />
                                <span>{hpc.length} أقسام</span>
                                <span className="text-gold-500">•</span>
                                <span className="text-green-600">{activeCount} نشط</span>
                                <span className="text-gold-500">•</span>
                                <span className="text-red-400">{hpc.length - activeCount} مخفي</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap gap-2 w-full md:w-auto">
                            <button
                                onClick={() => handleBulkToggleHPC(true)}
                                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all flex items-center justify-center gap-1.5 border border-green-100 dark:border-green-900/10"
                            >
                                <ToggleRight size={14} />
                                <span>تفعيل الكل</span>
                            </button>
                            <button
                                onClick={() => handleBulkToggleHPC(false)}
                                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center justify-center gap-1.5 border border-red-100 dark:border-red-900/10"
                            >
                                <ToggleLeft size={14} />
                                <span>إخفاء الكل</span>
                            </button>
                            <button
                                onClick={handleResetOrder}
                                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-[10px] md:text-xs font-black bg-gold-50 dark:bg-dark-600 text-gold-600 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-dark-500 transition-all flex items-center justify-center gap-1.5 border border-gold-100 dark:border-dark-500/20"
                            >
                                <RotateCcw size={14} />
                                <span>إعادة الترتيب</span>
                            </button>
                        </div>
                    </div>

                    {/* HPC Sortable List */}
                    <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 overflow-hidden">
                        {hpc.sort((a, b) => a.order - b.order).map((section, idx) => (
                            <div
                                key={section.id}
                                className="group bg-white dark:bg-dark-800 border border-gold-50 dark:border-dark-600 p-4 md:p-6 rounded-[32px] md:rounded-full flex flex-col md:flex-row items-center gap-4 transition-all hover:border-gold-300 dark:hover:border-gold-500/50 shadow-sm hover:shadow-md"
                            >
                                {/* Mobile Header / Position */}
                                <div className="flex w-full md:w-auto justify-between md:justify-start items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <GripVertical size={20} className="text-gold-200 dark:text-dark-500 hidden md:block" />
                                        <div className="w-12 h-12 bg-gold-50 dark:bg-dark-700/50 rounded-2xl flex items-center justify-center text-gold-600 dark:text-gold-400 font-black text-xl shadow-inner">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    {/* Action Buttons (Mobile Positioned Top) */}
                                    <div className="flex md:hidden gap-2">
                                        <button
                                            onClick={() => handleOpenHpcModal(section)}
                                            className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-dark-700 text-text-muted dark:text-gold-400 rounded-xl"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${section.is_active ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}>
                                            {section.is_active ? <CheckCircle2 size={20} /> : <CircleDashed size={20} />}
                                        </div>
                                    </div>
                                </div>

                                {/* Movement Controls (Mobile Row) */}
                                <div className="flex md:flex-col gap-2 w-full md:w-auto justify-center md:justify-start border-y md:border-y-0 border-gold-50/50 py-3 md:py-0">
                                    <button
                                        disabled={idx === 0}
                                        onClick={() => handleMoveSection(section, 'up')}
                                        className="flex-1 md:flex-none p-2 bg-cream-50 dark:bg-dark-900 rounded-xl text-gold-600 disabled:opacity-20 hover:scale-110 md:hover:scale-125 transition-all flex items-center justify-center"
                                    >
                                        <ChevronUp size={20} className="md:rotate-0 rotate-[-90deg]" />
                                    </button>
                                    <button
                                        disabled={idx === hpc.length - 1}
                                        onClick={() => handleMoveSection(section, 'down')}
                                        className="flex-1 md:flex-none p-2 bg-cream-50 dark:bg-dark-900 rounded-xl text-gold-600 disabled:opacity-20 hover:scale-110 md:hover:scale-125 transition-all flex items-center justify-center"
                                    >
                                        <ChevronDown size={20} className="md:rotate-0 rotate-[-90deg]" />
                                    </button>
                                </div>

                                {/* Section Info */}
                                <div className="flex-1 text-center md:text-right w-full md:min-w-0">
                                    <h4 className="font-black text-[15px] text-text-primary dark:text-cream-50 uppercase tracking-tight">{section.section_display}</h4>
                                    <p className="text-xs font-bold text-text-secondary dark:text-gold-400/70 mt-0.5">{section.title_ar || 'بدون عنوان'}</p>
                                </div>

                                {/* Desktop / Unified Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <button
                                        onClick={() => toggleHPCStatus(section.id, section.is_active)}
                                        className={`flex-1 md:px-6 py-3.5 rounded-2xl md:rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-2 ${section.is_active ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-200 dark:bg-dark-600 text-text-muted'}`}
                                    >
                                        {section.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {section.is_active ? 'ظاهر للعملاء' : 'مخفي حالياً'}
                                    </button>
                                    <button
                                        onClick={() => handleOpenHpcModal(section)}
                                        className="hidden md:flex w-12 h-12 items-center justify-center bg-gold-50 dark:bg-dark-700 text-gold-700 dark:text-gold-400 rounded-full hover:bg-gold-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* HPC Edit Modal */}
            {isHpcModalOpen && editingHpcItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseHpcModal}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">تعديل القسم</h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400">{editingHpcItem.section_display}</p>
                            </div>
                            <button onClick={handleCloseHpcModal} className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-full transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleHpcSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">اسم القسم (داخلي)</label>
                                <input
                                    type="text"
                                    required
                                    value={hpcFormData.title_ar}
                                    onChange={(e) => setHpcFormData({ ...hpcFormData, title_ar: e.target.value })}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    placeholder="اسم القسم كما يظهر في لوحة التحكم..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gold-50 dark:border-dark-600">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">ترتيب الظهور</label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={hpcFormData.order}
                                        onChange={(e) => setHpcFormData({ ...hpcFormData, order: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-3.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">الحالة</label>
                                    <button
                                        type="button"
                                        onClick={() => setHpcFormData({ ...hpcFormData, is_active: !hpcFormData.is_active })}
                                        className={`w-full px-5 py-3.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${hpcFormData.is_active ? 'bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-900/20 text-red-500 border border-red-200 dark:border-red-900'}`}
                                    >
                                        {hpcFormData.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                                        {hpcFormData.is_active ? 'نشط - ظاهر' : 'مخفي'}
                                    </button>
                                </div>
                            </div>

                            {/* Dynamic Content Fields */}
                            <div className="space-y-6 pt-2">
                                <h4 className="text-lg font-black text-gold-600 dark:text-gold-400 flex items-center gap-2">
                                    <Layers size={18} />
                                    محتوى القسم
                                </h4>

                                {editingHpcItem.key === 'ramadan' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-text-secondary">العنوان الرئيسي</label>
                                                <input type="text" value={hpcFormData.content.heading || ''}
                                                    onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, heading: e.target.value } })}
                                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gold-500/20" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-text-secondary">العنوان الفرعي</label>
                                                <textarea value={hpcFormData.content.subtitle || ''}
                                                    onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, subtitle: e.target.value } })}
                                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-gold-500/20 resize-none" rows={2} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-text-secondary">نص الزر</label>
                                                    <input type="text" value={hpcFormData.content.button_text || ''}
                                                        onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, button_text: e.target.value } })}
                                                        className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-text-secondary">رابط الزر</label>
                                                    <input type="text" value={hpcFormData.content.button_link || ''}
                                                        onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, button_link: e.target.value } })}
                                                        className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {(editingHpcItem.key === 'features' || editingHpcItem.key === 'stats') && (
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(hpcFormData.content || []).map((item, idx) => (
                                            <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-800 rounded-2xl border border-gold-100 dark:border-dark-600 space-y-3">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] font-black uppercase text-gold-500 tracking-widest">
                                                        {editingHpcItem.key === 'features' ? `ميزة ${idx + 1}` : `إحصائية ${idx + 1}`}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-3">
                                                    <input
                                                        type="text"
                                                        placeholder={editingHpcItem.key === 'features' ? "العنوان" : "القيمة (مثال: 15K+)"}
                                                        value={editingHpcItem.key === 'features' ? item.title : item.value}
                                                        onChange={e => {
                                                            const newContent = [...hpcFormData.content];
                                                            if (editingHpcItem.key === 'features') newContent[idx].title = e.target.value;
                                                            else newContent[idx].value = e.target.value;
                                                            setHpcFormData({ ...hpcFormData, content: newContent });
                                                        }}
                                                        className="w-full bg-white dark:bg-dark-700 border border-gold-50 dark:border-dark-600 px-4 py-2.5 rounded-xl text-sm"
                                                    />
                                                    <textarea
                                                        placeholder={editingHpcItem.key === 'features' ? "الوصف" : "التسمية (مثال: عميل سعيد)"}
                                                        value={editingHpcItem.key === 'features' ? item.desc : item.label}
                                                        onChange={e => {
                                                            const newContent = [...hpcFormData.content];
                                                            if (editingHpcItem.key === 'features') newContent[idx].desc = e.target.value;
                                                            else newContent[idx].label = e.target.value;
                                                            setHpcFormData({ ...hpcFormData, content: newContent });
                                                        }}
                                                        className="w-full bg-white dark:bg-dark-700 border border-gold-50 dark:border-dark-600 px-4 py-2.5 rounded-xl text-sm resize-none" rows={2}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {editingHpcItem.key === 'vision' && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-text-secondary">المقولة (Quote)</label>
                                            <textarea value={hpcFormData.content.quote || ''}
                                                onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, quote: e.target.value } })}
                                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" rows={2} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-text-secondary">الوصف التفصيلي</label>
                                            <textarea value={hpcFormData.content.description || ''}
                                                onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, description: e.target.value } })}
                                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" rows={3} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-text-secondary">المدن (مفصولة بفاصلة)</label>
                                            <input type="text" value={(hpcFormData.content.cities || []).join(', ')}
                                                onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, cities: e.target.value.split(',').map(c => c.trim()) } })}
                                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" placeholder="طرابلس, بنغازي..." />
                                        </div>
                                    </div>
                                )}

                                {(editingHpcItem.key === 'categories' || editingHpcItem.key === 'best_sellers' || editingHpcItem.key === 'featured_products') && (
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-text-secondary">عنوان القسم</label>
                                            <input type="text" value={hpcFormData.content.heading || ''}
                                                onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, heading: e.target.value } })}
                                                className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" />
                                        </div>
                                        {(editingHpcItem.key === 'categories' || editingHpcItem.key === 'featured_products') && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-text-secondary">العنوان الفرعي</label>
                                                <input type="text" value={hpcFormData.content.subtitle || ''}
                                                    onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, subtitle: e.target.value } })}
                                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" />
                                            </div>
                                        )}
                                        {editingHpcItem.key === 'best_sellers' && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-text-secondary">نص الزر</label>
                                                <input type="text" value={hpcFormData.content.button_text || ''}
                                                    onChange={e => setHpcFormData({ ...hpcFormData, content: { ...hpcFormData.content, button_text: e.target.value } })}
                                                    className="w-full bg-gray-50 dark:bg-dark-800 border border-gold-100 dark:border-dark-600 px-4 py-3 rounded-xl" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="bg-cream-50 dark:bg-dark-800 p-4 rounded-2xl border border-gold-50 dark:border-dark-600">
                                <p className="text-xs text-text-secondary dark:text-gold-400">
                                    <span className="font-black">معرّف القسم:</span> <code className="bg-gold-50 dark:bg-dark-600 px-2 py-0.5 rounded-lg text-gold-700 dark:text-gold-400">{editingHpcItem.key}</code>
                                </p>
                            </div>

                            <div className="pt-4 flex gap-4">
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
                        </form>
                    </div>
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                            {/* Desktop Image Upload — always shown */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400">صورة العرض {activeTab === 'slides' ? '(للكمبيوتر - Desktop)' : ''}</label>
                                <div className="relative group aspect-[21/9] rounded-3xl overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-200 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                <div className="bg-white p-3 rounded-full text-gold-600 shadow-xl">
                                                    <Upload size={24} />
                                                </div>
                                            </div>
                                            <div className="absolute top-3 right-3 bg-gold-500 text-black text-[10px] font-black px-2 py-1 rounded-lg">
                                                {activeTab === 'slides' ? 'Desktop' : 'صورة'}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-center p-8">
                                            <ImageIcon size={48} className="mx-auto text-gold-300 mb-3" />
                                            <p className="text-sm font-bold text-text-muted">انقر لاختيار صورة</p>
                                            {activeTab === 'slides' && <p className="text-[10px] text-text-muted mt-1">موصى بها: أفقية عريضة (Landscape)</p>}
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

                            {/* Mobile Image Upload — slides ONLY */}
                            {activeTab === 'slides' && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-bold text-text-secondary dark:text-gold-400">صورة الجوال (Mobile - اختياري)</label>
                                        <span className="text-[10px] bg-gold-50 dark:bg-dark-600 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-lg font-black">Portrait</span>
                                    </div>
                                    <p className="text-[11px] text-text-muted dark:text-gold-400/60">إذا لم تختر صورة جوال، سيتم استخدام صورة الكمبيوتر على الجوال أيضاً.</p>
                                    <div className="flex items-start gap-5">
                                        {/* Portrait frame preview */}
                                        <div className="relative group flex-shrink-0 w-32 h-56 rounded-2xl overflow-hidden bg-cream-50 dark:bg-dark-800 border-2 border-dashed border-gold-200 dark:border-dark-600 flex flex-col items-center justify-center transition-all hover:border-gold-400">
                                            {imageMobilePreview ? (
                                                <>
                                                    <img src={imageMobilePreview} alt="Mobile Preview" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <div className="bg-white p-2 rounded-full text-gold-600 shadow-xl">
                                                            <Upload size={16} />
                                                        </div>
                                                    </div>
                                                    <div className="absolute top-2 right-2 bg-gold-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded">Mobile</div>
                                                </>
                                            ) : (
                                                <div className="text-center px-2">
                                                    <ImageIcon size={28} className="mx-auto text-gold-300 mb-1" />
                                                    <p className="text-[9px] font-bold text-text-muted">جوال</p>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageMobileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                        </div>
                                        <div className="flex-1 bg-cream-50 dark:bg-dark-800 rounded-2xl p-4 border border-gold-100 dark:border-dark-600 text-sm text-text-secondary dark:text-gold-400 space-y-2">
                                            <p className="font-black text-text-primary dark:text-cream-50">كيف يعمل النظام؟</p>
                                            <p>📱 <span className="font-bold">الجوال:</span> تظهر صورة الجوال (Portrait) على الشاشات الصغيرة.</p>
                                            <p>🖥️ <span className="font-bold">الكمبيوتر:</span> تظهر صورة الكمبيوتر (Landscape) على الشاشات الكبيرة.</p>
                                            <p className="text-[11px] opacity-70">الحجم المُوصى به للجوال: 1080×1920px</p>
                                        </div>
                                    </div>
                                </div>
                            )}

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

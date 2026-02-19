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
    Upload
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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
            const [slidesRes, bannersRes] = await Promise.all([
                cmsApi.getSlides(),
                cmsApi.getBanners()
            ]);
            setSlides(slidesRes.data.results || slidesRes.data || []);
            setBanners(bannersRes.data.results || bannersRes.data || []);
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
                link: item.link || '',
                button_text: item.button_text || '',
                button_link: item.button_link || '',
                position: item.position || 'home_top',
                order: item.order || 0,
                is_active: item.is_active,
                image: null // For updates, only set image if uploading a new one
            });
            setImagePreview(item.image);
        } else {
            setEditingItem(null);
            setFormData({
                title: '',
                subtitle: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'image') {
                if (formData[key]) data.append(key, formData[key]);
            } else {
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
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء حفظ البيانات');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">إدارة المحتوى (CMS)</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">تخصيص السلايدر الرئيسي، البانرات الدعائية والمحتوى المرئي.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    إضافة عنصر جديد
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white dark:bg-dark-700 rounded-2xl border border-gold-100 dark:border-dark-600 w-fit">
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
            </div>

            {/* List */}
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

            {/* Modal */}
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

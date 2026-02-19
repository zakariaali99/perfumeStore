import { useState, useEffect } from 'react';
import { cmsApi } from '../../services/api';
import {
    Save,
    Phone,
    Mail,
    MapPin,
    Globe,
    Facebook,
    Instagram,
    Twitter,
    Settings,
    ShieldCheck,
    Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardSettings = () => {
    const [settings, setSettings] = useState({
        store_name: '',
        contact_phone: '',
        whatsapp: '',
        email: '',
        address: '',
        facebook_link: '',
        instagram_link: '',
        tiktok_link: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await cmsApi.getSettings();
            setSettings(prev => ({ ...prev, ...(res.data || {}) }));
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await cmsApi.updateSettings(settings.id, settings);
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error(error);
            toast.error('خطأ في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-10 h-10 border-4 border-gold-200 border-t-gold-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">إعدادات النظام</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">تخصيص معلومات المتجر وقنوات التواصل.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-gold-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-gold-700 transition-all shadow-xl shadow-gold-600/20 disabled:opacity-50"
                >
                    {saving ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Save size={20} />
                    )}
                    حفظ التغييرات
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* General Settings */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-dark-700 p-10 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-text-primary dark:text-cream-50">
                            <Settings size={22} className="text-gold-500" />
                            المعلومات الأساسية
                        </h3>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">اسم المتجر</label>
                                <input
                                    type="text"
                                    name="store_name"
                                    value={settings.store_name}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50 font-bold"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">هاتف التواصل</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-500" />
                                        <input
                                            type="text"
                                            name="contact_phone"
                                            value={settings.contact_phone}
                                            onChange={handleChange}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-text-primary dark:text-cream-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">واتساب</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" />
                                        <input
                                            type="text"
                                            name="whatsapp"
                                            value={settings.whatsapp}
                                            onChange={handleChange}
                                            className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-text-primary dark:text-cream-50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">العنوان الفعلي</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute right-5 top-4 text-gold-500" />
                                    <textarea
                                        name="address"
                                        value={settings.address}
                                        onChange={handleChange}
                                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 min-h-[100px] text-text-primary dark:text-cream-50"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Networks */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-dark-700 p-10 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm h-full">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-text-primary dark:text-cream-50">
                            <Globe size={22} className="text-gold-500" />
                            قنوات التواصل الاجتماعي
                        </h3>
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1 flex items-center gap-2">
                                    <Facebook size={18} className="text-blue-600" />
                                    فيسبوك
                                </label>
                                <input
                                    type="text"
                                    name="facebook_link"
                                    value={settings.facebook_link}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-sm ltr text-text-primary dark:text-cream-50"
                                    placeholder="https://facebook.com/yourstore"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1 flex items-center gap-2">
                                    <Instagram size={18} className="text-pink-600" />
                                    انستغرام
                                </label>
                                <input
                                    type="text"
                                    name="instagram_link"
                                    value={settings.instagram_link}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-sm ltr text-text-primary dark:text-cream-50"
                                    placeholder="https://instagram.com/yourstore"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1 flex items-center gap-2">
                                    <Globe size={18} className="text-black dark:text-white" />
                                    تيك توك
                                </label>
                                <input
                                    type="text"
                                    name="tiktok_link"
                                    value={settings.tiktok_link}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-sm ltr text-text-primary dark:text-cream-50"
                                    placeholder="https://tiktok.com/@yourstore"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1 flex items-center gap-2">
                                    <Mail size={18} className="text-red-500" />
                                    البريد الإلكتروني للإدارة
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={settings.email}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-5 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 font-poppins text-text-primary dark:text-cream-50"
                                    placeholder="admin@yourstore.com"
                                />
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-gold-50 dark:bg-dark-900/40 rounded-3xl border border-gold-100 dark:border-dark-600">
                            <div className="flex gap-4">
                                <div className="bg-white dark:bg-dark-700 p-3 rounded-2xl text-gold-600 shadow-sm border border-gold-100 dark:border-dark-600">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-xs leading-relaxed text-text-secondary dark:text-gold-400 font-bold">
                                    تأكد من صحة الروابط المدخلة حيث سيتم عرضها لعملاء المتجر في الفوتر وصفحة تواصل معنا.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form >
        </div >
    );
};

export default DashboardSettings;

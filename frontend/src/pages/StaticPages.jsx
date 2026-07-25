import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Youtube, Sparkles, HeartHandshake, Compass, ShieldCheck } from 'lucide-react';

const StaticPageLayout = ({ title, icon: Icon, children }) => {
    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-28 pb-20 transition-colors duration-300 relative overflow-hidden">
            {/* Background Decorative Glows */}
            <div className="absolute top-1/4 -right-20 w-96 h-96 bg-gold-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="container mx-auto px-4 max-w-4xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-xl p-8 md:p-14 rounded-[40px] border border-gold-200/60 dark:border-dark-600/60 shadow-xl shadow-gold-500/5"
                >
                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gold-100 dark:border-dark-600">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-400 flex items-center justify-center text-white shadow-lg shadow-gold-500/25 shrink-0">
                            {Icon ? <Icon size={28} /> : <Sparkles size={28} />}
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-text-primary dark:text-cream-50 tracking-tight">
                                {title}
                            </h1>
                            <p className="text-xs text-gold-600 dark:text-gold-400 font-bold mt-1">عطور مصطفى • المصداقية والشغف</p>
                        </div>
                    </div>

                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export const About = () => (
    <StaticPageLayout title="من نحن" icon={HeartHandshake}>
        <motion.div
            initial="hidden"
            animate="show"
            variants={{
                hidden: { opacity: 0 },
                show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 }
                }
            }}
            className="space-y-8 text-text-secondary dark:text-gold-300/90 leading-loose"
        >
            {/* Story Banner */}
            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-gold-500/10 via-gold-500/5 to-transparent border-r-4 border-gold-500"
            >
                <p className="text-xl md:text-2xl font-black text-gold-700 dark:text-gold-300 leading-relaxed">
                    متجر مصطفى هو مكان لبيع تقسيمات العطور الأصلية… ولا مكان للتقليد هنا.
                </p>
            </motion.div>

            {/* Paragraph 1 */}
            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="bg-cream-50/60 dark:bg-dark-700/50 p-6 md:p-8 rounded-3xl border border-gold-100/60 dark:border-dark-600"
            >
                <p className="text-base md:text-lg font-bold text-text-primary dark:text-cream-100 leading-relaxed">
                    بدت الفكرة من صفحة كنت ننزل فيها محتوى عن العطور، وبشوي بشوي كبر الموضوع. ولما فلّست الحكاية، لكن ما زال عندي نفس الشغف إني نستمر في تقديم المحتوى، قررت نبيع تقسيمات للعطور من مكتبتي الخاصة.
                </p>
            </motion.div>

            {/* Paragraph 2 */}
            <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="bg-cream-50/60 dark:bg-dark-700/50 p-6 md:p-8 rounded-3xl border border-gold-100/60 dark:border-dark-600"
            >
                <p className="text-base md:text-lg font-bold text-text-primary dark:text-cream-100 leading-relaxed">
                    نحاول من خلال الموقع هذا نقدم حاجة جديدة لهواة ومحبي العطور، ونبنو مجتمع عطري ليبي جميل، فيه مشاركة، وتجارب، وجو عطري مليح.
                </p>
            </motion.div>

            {/* Closing Quote */}
            <motion.div
                variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}
                className="mt-12 pt-8 border-t border-gold-200/60 dark:border-dark-600 text-center"
            >
                <p className="text-sm font-bold text-text-muted dark:text-gold-400 mb-2">و في النهاية</p>
                <p className="text-xl md:text-2xl font-black bg-gradient-to-r from-gold-600 to-gold-400 bg-clip-text text-transparent italic">
                    "وإن أخطأت فمن عندي، وإن أصبت فمن الله."
                </p>
            </motion.div>
        </motion.div>
    </StaticPageLayout>
);

export const Contact = () => (
    <StaticPageLayout title="تواصل معنا" icon={Phone}>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10"
        >
            <p className="text-base md:text-lg font-bold text-text-secondary dark:text-gold-300">
                نحن يسعدنا دائماً التواصل معكم والإجابة على كافة استفساراتكم عبر وسائل التواصل التالية:
            </p>

            {/* Main Contact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Location Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-cream-50/80 dark:bg-dark-700/60 p-6 md:p-8 rounded-3xl border border-gold-200/60 dark:border-dark-600 flex gap-4 items-start"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-dark-600 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg text-text-primary dark:text-cream-50 mb-2">المكان</h4>
                        <p className="text-sm font-bold text-text-secondary dark:text-gold-300 leading-relaxed">
                            مصراتة ليبيا لكن منييش حد يجيني اطلب من الموقع
                        </p>
                    </div>
                </motion.div>

                {/* Email Card */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-cream-50/80 dark:bg-dark-700/60 p-6 md:p-8 rounded-3xl border border-gold-200/60 dark:border-dark-600 flex gap-4 items-start"
                >
                    <div className="w-12 h-12 rounded-2xl bg-gold-100 dark:bg-dark-600 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h4 className="font-black text-lg text-text-primary dark:text-cream-50 mb-2">البريد الإلكتروني</h4>
                        <a href="mailto:info@mostafastore.ly" className="text-sm font-bold text-gold-600 dark:text-gold-400 hover:underline">
                            info@mostafastore.ly
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Social Media Grid (Same as Sidebar) */}
            <div className="pt-6 border-t border-gold-100 dark:border-dark-600">
                <h3 className="text-xl font-black text-text-primary dark:text-cream-50 mb-6 flex items-center gap-2">
                    <Sparkles size={20} className="text-gold-500" />
                    تابعنا وتواصل معنا عبر منصات الاجتماعي
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* WhatsApp */}
                    <a
                        href="https://wa.me/218917359191"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-green-50/60 dark:bg-green-900/20 border border-green-200/60 dark:border-green-800/40 text-green-600 dark:text-green-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <MessageCircle size={32} />
                        <span className="text-xs font-black">واتساب</span>
                        <span className="text-[11px] font-poppins font-bold dir-ltr">0917359191</span>
                    </a>

                    {/* Phone Call */}
                    <a
                        href="tel:0917359191"
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-gold-50/60 dark:bg-gold-900/20 border border-gold-200/60 dark:border-gold-800/40 text-gold-600 dark:text-gold-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <Phone size={32} />
                        <span className="text-xs font-black">إتصال هاتف</span>
                        <span className="text-[11px] font-poppins font-bold dir-ltr">0917359191</span>
                    </a>

                    {/* TikTok */}
                    <a
                        href="https://www.tiktok.com/@mostafaperfumes?_r=1&_t=ZS-943SX1wYWer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-gray-50/80 dark:bg-dark-700 border border-gold-200/60 dark:border-dark-600 text-text-primary dark:text-cream-50 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-1.26-.88-2.12-2.22-2.49-3.66L15.8 20.06c-.05 1.05-.34 2.1-.9 3.01-.55.91-1.39 1.62-2.34 2.05-1.01.46-2.15.58-3.23.41-1.12-.17-2.18-.7-3.03-1.45-.85-.75-1.41-1.78-1.57-2.9-.16-1.12.01-2.3.56-3.29.54-1 1.41-1.79 2.45-2.22 1.04-.43 2.2-.44 3.28-.1v4.19c-.91-.32-1.95-.21-2.73.35-.78.56-1.16 1.55-1.02 2.51.14.96.84 1.78 1.75 2.1.91.31 2.01.07 2.66-.64.65-.7.83-1.72.63-2.65L12.7 0h-.175z" />
                        </svg>
                        <span className="text-xs font-black">تيك توك</span>
                        <span className="text-[10px] text-text-muted">@mostafaperfumes</span>
                    </a>

                    {/* Instagram */}
                    <a
                        href="https://www.instagram.com/the.mostafa.perfumes?igsh=MXVnejh4d25qMjV4ZQ=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-pink-50/60 dark:bg-pink-900/20 border border-pink-200/60 dark:border-pink-800/40 text-pink-600 dark:text-pink-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <Instagram size={32} />
                        <span className="text-xs font-black">إنستغرام</span>
                        <span className="text-[10px] text-pink-600/70 dark:text-pink-400/70">the.mostafa.perfumes</span>
                    </a>

                    {/* YouTube */}
                    <a
                        href="https://m.youtube.com/@mostafaperfumes?si=3KH5kj2c5Q47rVYB"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 p-5 rounded-3xl bg-red-50/60 dark:bg-red-900/20 border border-red-200/60 dark:border-red-800/40 text-red-600 dark:text-red-400 transition-all hover:scale-105 active:scale-95 shadow-sm"
                    >
                        <Youtube size={32} />
                        <span className="text-xs font-black">يوتيوب</span>
                        <span className="text-[10px] text-red-600/70 dark:text-red-400/70">@mostafaperfumes</span>
                    </a>
                </div>
            </div>
        </motion.div>
    </StaticPageLayout>
);

export const Terms = () => (
    <StaticPageLayout title="الشروط والأحكام" icon={Compass}>
        <div className="space-y-6 text-text-secondary dark:text-gold-300 font-bold leading-relaxed">
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600">
                1. كافة تقسيمات العطور المعروضة أصلية 100% وتخرج من عبواتها الأصلية مباشرة.
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600">
                2. يتم شحن الطلبيات والتوصيل داخل ليبيا عبر مندوب التوصيل مع تأكيد الهاتف.
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600">
                3. الأسعار موضحة بالدينار الليبي بدقة وقابلة للتعديل عند إطلاق عروض جديدة.
            </div>
            <div className="p-4 rounded-2xl bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600">
                4. التوصيل متاح لجميع المدن والاقاليم الليبية (مصراتة، طرابلس، بنغازي، سبها، زليتن، الخمس، الزاوية، ...).
            </div>
        </div>
    </StaticPageLayout>
);

export const Privacy = () => (
    <StaticPageLayout title="سياسة الخصوصية" icon={ShieldCheck}>
        <div className="space-y-6 text-text-secondary dark:text-gold-300 font-bold leading-relaxed">
            <div className="p-6 rounded-3xl bg-cream-50 dark:bg-dark-700 border border-gold-100 dark:border-dark-600">
                <p className="mb-4">نحن نولي أهمية قصوى لخصوصيتكم وحماية معلوماتكم الشخصية.</p>
                <p>يتم استخدام بيانات الاسم ورقم الهاتف والمدينة فقط لغرض إيصال وتأكيد طلبات العطور الخاصة بكم داخل ليبيا ولن يتم مشاركتها مطلقاً.</p>
            </div>
        </div>
    </StaticPageLayout>
);


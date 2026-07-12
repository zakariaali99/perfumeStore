import { useNavigate } from 'react-router-dom';

const StaticPage = ({ title, content }) => {
    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-32 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="bg-white dark:bg-dark-700 p-10 md:p-16 rounded-[40px] border border-gold-100 dark:border-dark-600 shadow-sm">
                    <h1 className="text-4xl font-black mb-8 text-text-primary dark:text-cream-50 flex items-center gap-4">
                        <div className="w-3 h-10 bg-gold-500 rounded-full"></div>
                        {title}
                    </h1>
                    <div className="prose prose-gold max-w-none text-text-secondary dark:text-gold-400/80 leading-loose space-y-6">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const About = () => (
    <StaticPage
        title="من نحن"
        content={
            <>
                <p>متجر المصطفى للعطور هو وجهتكم الأولى لأرقى العطور العربية والشرقية المختارة بعناية لتناسب أذواقكم الرفيعة.</p>
                <p>بدأنا شغفنا في عالم العطور منذ سنوات، حيث نسعى دائماً لتقديم التوليفات التي تجمع بين عبق الماضي وحداثة الحاضر.</p>
                <p>نؤمن في "المصطفى" أن العطر ليس مجرد رائحة، بل هو هوية وذكرى لا تنسى.</p>
                <p>نوفر شحن سريع لجميع أنحاء ليبيا، من طرابلس إلى سبها ومن بنغازي إلى الزاوية.</p>
            </>
        }
    />
);

export const Contact = () => (
    <StaticPage
        title="اتصل بنا"
        content={
            <div className="space-y-8">
                <p>نحن هنا لخدمتكم والإجابة على استفساراتكم في أي وقت.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
                    <div className="bg-cream-50 dark:bg-dark-600 p-6 rounded-3xl border border-gold-100 dark:border-dark-600">
                        <h4 className="font-bold mb-2 text-text-primary dark:text-cream-50">خدمة العملاء</h4>
                        <p className="text-gold-600 dark:text-gold-400 font-bold" dir="ltr">091-2345678</p>
                    </div>
                    <div className="bg-cream-50 dark:bg-dark-600 p-6 rounded-3xl border border-gold-100 dark:border-dark-600">
                        <h4 className="font-bold mb-2 text-text-primary dark:text-cream-50">البريد الإلكتروني</h4>
                        <p className="text-gold-600 dark:text-gold-400 font-bold">info@almostafas.ly</p>
                    </div>
                </div>
                <p>موقعنا: طرابلس، ليبيا - شارع النصر</p>
            </div>
        }
    />
);

export const Terms = () => (
    <StaticPage
        title="الشروط والأحكام"
        content={
            <div className="space-y-4">
                <p>1. كافة المنتجات المعروضة تخضع لسياسة الجودة والضمان.</p>
                <p>2. يتم شحن الطلب خلال 24-48 ساعة من تأكيد الشراء.</p>
                <p>3. الأسعار بالدينار الليبي وقابلة للتغيير بناءً على العروض والخصومات الجارية.</p>
                <p>4. التوصيل متاح لجميع المدن الليبية (طرابلس، بنغازي، مصراتة، سبها، الزاوية، الخمس، زليتن، صبراتة، ...).</p>
            </div>
        }
    />
);

export const Privacy = () => (
    <StaticPage
        title="سياسة الخصوصية"
        content={
            <div className="space-y-4">
                <p>نحن نحترم خصوصيتكم ونلتزم بحماية بياناتكم الشخصية المقيمة لدينا.</p>
                <p>تستخدم بياناتكم فقط لتحسين تجربة التسوق وإتمام عمليات التوصيل داخل ليبيا.</p>
            </div>
        }
    />
);

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../../services/api';
import { Lock, User, LogIn, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DashboardLogin = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await accountsApi.login(credentials);
            localStorage.setItem('access_token', res.data.access);
            localStorage.setItem('refresh_token', res.data.refresh);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            toast.success('تم تسجيل الدخول بنجاح');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.error || 'بيانات الاعتماد غير صحيحة');
            toast.error('خطأ في تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream-50 dark:bg-dark-800 flex items-center justify-center p-6 bg-luxury-pattern">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gold-500 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-gold-500/20">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-2">لوحة التحكم</h1>
                    <p className="text-text-secondary dark:text-gold-400">سجل الدخول للمتابعة إلى الإدارة</p>
                </div>

                <div className="bg-white dark:bg-dark-700 p-10 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-4 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">اسم المستخدم</label>
                            <div className="relative">
                                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-500" size={18} />
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={credentials.username}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50"
                                    placeholder="أدخل اسم المستخدم"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-text-secondary dark:text-gold-400 pr-1">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-500" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={credentials.password}
                                    onChange={handleChange}
                                    className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-text-primary dark:text-cream-50"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-gold-600/20 disabled:opacity-50 mt-4"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    تسجيل الدخول
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-10 text-xs text-text-muted dark:text-gold-500 font-bold uppercase tracking-widest">
                    Almostafa&apos;s Admin v1.0.0
                </p>
            </div>
        </div>
    );
};

export default DashboardLogin;

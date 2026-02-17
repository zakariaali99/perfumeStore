import React from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center p-6 text-right" dir="rtl">
                    <div className="max-w-md w-full bg-white dark:bg-dark-700 p-10 rounded-[48px] border border-red-100 dark:border-red-900/30 shadow-2xl text-center">
                        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
                            <AlertTriangle size={40} />
                        </div>

                        <h2 className="text-2xl font-black text-text-primary dark:text-cream-50 mb-4">عذراً، حدث خطأ غير متوقع</h2>
                        <p className="text-text-secondary dark:text-gold-400 mb-8 font-bold leading-relaxed">
                            واجه النظام مشكلة تقنية أثناء تحميل هذه الصفحة. يمكنك محاولة تحديث الصفحة أو العودة للرئيسية.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleReset}
                                className="w-full bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-600/20"
                            >
                                <RefreshCcw size={18} />
                                محاولة التحديث
                            </button>

                            <a
                                href="/dashboard"
                                className="w-full bg-gray-50 dark:bg-dark-600 hover:bg-gray-100 dark:hover:bg-dark-500 text-text-secondary dark:text-gold-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Home size={18} />
                                العودة للوحة التحكم
                            </a>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-8 p-4 bg-gray-50 dark:bg-dark-800 rounded-xl text-left overflow-auto max-h-40">
                                <pre className="text-[10px] text-red-500 font-poppins">
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

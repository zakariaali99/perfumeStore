import { useState, useEffect } from 'react';
import { backupsApi } from '../../services/api';
import {
    HardDrive,
    Download,
    RotateCcw,
    Upload,
    ShieldCheck,
    AlertTriangle,
    X,
    Package,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader,
    Trash2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const statusMap = {
    creating: { label: 'جاري الإنشاء', color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
    ready: { label: 'جاهز', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    failed: { label: 'فشل', color: 'text-red-600', bg: 'bg-red-50', icon: AlertCircle },
    restoring: { label: 'جاري الاستعادة', color: 'text-blue-600', bg: 'bg-blue-50', icon: Loader },
};

const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DashboardBackup = () => {
    const [backups, setBackups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [restoringId, setRestoringId] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [confirmRestore, setConfirmRestore] = useState(null);
    const [confirmUploadRestore, setConfirmUploadRestore] = useState(false);

    useEffect(() => {
        fetchBackups();
    }, []);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await backupsApi.list();
            setBackups(res.data.results || res.data || []);
        } catch {
            toast.error('تعذر تحميل النسخ الاحتياطية');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            await backupsApi.create();
            toast.success('تم إنشاء النسخة الاحتياطية بنجاح');
            fetchBackups();
        } catch {
            toast.error('فشل إنشاء النسخة الاحتياطية');
        } finally {
            setCreating(false);
        }
    };

    const handleDownload = async (backup) => {
        try {
            const response = await backupsApi.download(backup.id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `backup_${backup.id}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('فشل تحميل النسخة الاحتياطية');
        }
    };

    const handleRestore = async (backup) => {
        setConfirmRestore(null);
        setRestoringId(backup.id);
        try {
            await backupsApi.restore(backup.id);
            toast.success('تمت الاستعادة بنجاح');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch {
            toast.error('فشلت عملية الاستعادة');
        } finally {
            setRestoringId(null);
        }
    };

    const handleUploadRestore = async () => {
        if (!selectedFile) {
            toast.error('يرجى اختيار ملف النسخة الاحتياطية');
            return;
        }
        setConfirmUploadRestore(true);
    };

    const executeUploadRestore = async () => {
        setConfirmUploadRestore(false);
        setUploading(true);
        try {
            await backupsApi.restoreFromUpload(selectedFile);
            toast.success('تمت الاستعادة بنجاح');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch {
            toast.error('فشلت عملية الاستعادة');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await backupsApi.delete(id);
            toast.success('تم حذف النسخة الاحتياطية');
            fetchBackups();
        } catch {
            toast.error('فشل الحذف');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">النسخ الاحتياطي</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">إنشاء واستعادة النسخ الاحتياطية للنظام.</p>
                </div>
                <button
                    onClick={handleCreate}
                    disabled={creating}
                    className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20 disabled:opacity-50"
                >
                    {creating ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <HardDrive size={20} />
                    )}
                    إنشاء نسخة احتياطية
                </button>
            </div>

            <div className="p-6 bg-gold-50 dark:bg-dark-900/40 rounded-3xl border border-gold-100 dark:border-dark-600">
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-dark-700 p-3 rounded-2xl text-gold-600 shadow-sm border border-gold-100 dark:border-dark-600">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="text-xs leading-relaxed text-text-secondary dark:text-gold-400 font-bold">
                        <p>النسخة الاحتياطية تشمل قاعدة البيانات وجميع الملفات (الصور، المستندات). يمكنك استعادة النظام بالكامل من أي نسخة احتياطية مع ضمان سلامة البيانات.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-cream-50 dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-8 py-5">التاريخ</th>
                                <th className="px-8 py-5">حجم الملف</th>
                                <th className="px-8 py-5">الحالة</th>
                                <th className="px-8 py-5">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-sm">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse h-20 bg-white dark:bg-dark-700">
                                        <td colSpan="4" className="px-8 py-6"></td>
                                    </tr>
                                ))
                            ) : backups.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-20 text-center opacity-50">
                                        <Package size={48} className="mx-auto mb-2" />
                                        <p className="font-bold">لا توجد نسخ احتياطية</p>
                                        <p className="text-xs mt-1">اضغط على "إنشاء نسخة احتياطية" لإنشاء أول نسخة</p>
                                    </td>
                                </tr>
                            ) : (
                                backups.map((backup) => {
                                    const s = statusMap[backup.status] || statusMap.failed;
                                    const StatusIcon = s.icon;
                                    return (
                                        <tr key={backup.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-colors">
                                            <td className="px-8 py-5">
                                                <div>
                                                    <p className="font-bold text-text-primary dark:text-cream-50">
                                                        {new Date(backup.created_at).toLocaleDateString('ar-LY')}
                                                    </p>
                                                    <p className="text-[10px] text-text-secondary dark:text-gold-400 font-poppins">
                                                        {new Date(backup.created_at).toLocaleTimeString('ar-LY')}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-bold font-poppins text-text-secondary dark:text-gold-400 rtl:text-left ltr:text-left">
                                                {formatFileSize(backup.file_size)}
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.color} ${s.bg} dark:bg-opacity-20`}>
                                                    <StatusIcon size={14} />
                                                    {s.label}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                {backup.status === 'ready' ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDownload(backup)}
                                                            className="p-2 text-text-muted dark:text-gold-400 hover:text-gold-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                            title="تحميل"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => setConfirmRestore(backup.id)}
                                                            disabled={restoringId === backup.id}
                                                            className="p-2 text-text-muted dark:text-gold-400 hover:text-red-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all disabled:opacity-50"
                                                            title="استعادة"
                                                        >
                                                            {restoringId === backup.id ? (
                                                                <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin"></div>
                                                            ) : (
                                                                <RotateCcw size={18} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
                                                                    handleDelete(backup.id);
                                                                }
                                                            }}
                                                            className="p-2 text-text-muted dark:text-gold-400 hover:text-red-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                            title="حذف"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-text-muted dark:text-gold-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-700 p-10 rounded-[48px] border border-gold-100 dark:border-dark-600 shadow-sm">
                <h3 className="text-xl font-black mb-2 flex items-center gap-3 text-text-primary dark:text-cream-50">
                    <Upload size={22} className="text-gold-500" />
                    استعادة من ملف خارجي
                </h3>
                <p className="text-sm text-text-secondary dark:text-gold-400 mb-6">قم بتحميل ملف النسخة الاحتياطية (ZIP) لاستعادة النظام بالكامل.</p>

                <div className="border-2 border-dashed border-gold-200 dark:border-dark-600 rounded-3xl p-8 text-center">
                    <input
                        type="file"
                        accept=".zip"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="hidden"
                        id="backup-upload"
                    />
                    <label htmlFor="backup-upload" className="cursor-pointer block">
                        <Upload size={48} className="mx-auto mb-4 text-gold-500" />
                        <p className="font-bold text-text-primary dark:text-cream-50">اختر ملف النسخة الاحتياطية</p>
                        <p className="text-sm text-text-secondary dark:text-gold-400 mt-1">ملف ZIP فقط</p>
                    </label>
                    {selectedFile && (
                        <div className="mt-4 inline-flex items-center gap-2 bg-cream-50 dark:bg-dark-600 px-4 py-2 rounded-2xl">
                            <span className="text-sm font-bold text-gold-600">{selectedFile.name}</span>
                            <button
                                onClick={() => setSelectedFile(null)}
                                className="p-1 hover:bg-gold-100 dark:hover:bg-dark-500 rounded-full transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleUploadRestore}
                    disabled={!selectedFile || uploading}
                    className="mt-6 w-full bg-gold-600 hover:bg-gold-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-gold-600/20 transition-all disabled:opacity-50"
                >
                    {uploading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <RotateCcw size={20} />
                    )}
                    استعادة من هذا الملف
                </button>
            </div>

            {confirmRestore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmRestore(null)}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">تأكيد الاستعادة</h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400">هذا الإجراء لا يمكن التراجع عنه</p>
                            </div>
                            <button
                                onClick={() => setConfirmRestore(null)}
                                className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <div className="bg-white dark:bg-dark-700 p-3 rounded-2xl text-red-500 shadow-sm border border-red-100 dark:border-dark-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="text-sm leading-relaxed font-bold text-red-700 dark:text-red-400">
                                    تحذير: ستؤدي الاستعادة إلى استبدال جميع البيانات الحالية بالكامل (قاعدة البيانات، الصور، الملفات). لا يمكن التراجع عن هذا الإجراء.
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        const backup = backups.find(b => b.id === confirmRestore);
                                        if (backup) handleRestore(backup);
                                    }}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                                >
                                    <RotateCcw size={20} />
                                    تأكيد الاستعادة
                                </button>
                                <button
                                    onClick={() => setConfirmRestore(null)}
                                    className="px-8 py-4 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-500 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {confirmUploadRestore && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmUploadRestore(false)}></div>
                    <div className="bg-white dark:bg-dark-700 w-full max-w-lg rounded-[48px] shadow-2xl relative z-10 overflow-hidden border border-gold-100 dark:border-dark-600">
                        <div className="p-8 border-b border-gold-50 dark:border-dark-600 flex justify-between items-center bg-cream-50 dark:bg-dark-800">
                            <div>
                                <h3 className="text-2xl font-black text-text-primary dark:text-cream-50">تأكيد الاستعادة من ملف خارجي</h3>
                                <p className="text-sm text-text-secondary dark:text-gold-400">هذا الإجراء لا يمكن التراجع عنه</p>
                            </div>
                            <button
                                onClick={() => setConfirmUploadRestore(false)}
                                className="p-2 hover:bg-gold-50 dark:hover:bg-dark-600 rounded-full transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="flex gap-4 p-6 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-900/30">
                                <div className="bg-white dark:bg-dark-700 p-3 rounded-2xl text-red-500 shadow-sm border border-red-100 dark:border-dark-600">
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="text-sm leading-relaxed font-bold text-red-700 dark:text-red-400">
                                    تحذير: ستؤدي الاستعادة من الملف الخارجي إلى استبدال جميع البيانات الحالية بالكامل (قاعدة البيانات، الصور، الملفات). لا يمكن التراجع عن هذا الإجراء.
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button
                                    onClick={executeUploadRestore}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all"
                                >
                                    <RotateCcw size={20} />
                                    تأكيد الاستعادة
                                </button>
                                <button
                                    onClick={() => setConfirmUploadRestore(false)}
                                    className="px-8 py-4 bg-gray-50 dark:bg-dark-600 text-text-secondary dark:text-gold-400 font-bold rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-500 transition-all"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardBackup;

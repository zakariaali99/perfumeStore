import { useState, useEffect, useCallback } from 'react';
import { productsApi, adminProductsApi } from '../../services/api';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    ExternalLink,
    Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Pagination from '../../components/common/Pagination';

const DashboardProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await adminProductsApi.getAll({
                search: searchTerm,
                category: filterCategory,
                page: currentPage,
                page_size: 10
            });
            setProducts(res.data.results || res.data || []);
            setTotalPages(Math.ceil((res.data.count || res.data.length) / 10));
        } catch (error) {
            console.error(error);
            toast.error('تعذر تحميل المنتجات');
        } finally {
            setLoading(false);
        }
    }, [currentPage, searchTerm, filterCategory]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await productsApi.getCategories();
            setCategories(res.data.results || res.data);
        } catch {
            // Silently fail for categories
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async (id) => {
        if (!window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً؟')) return;
        try {
            await adminProductsApi.delete(id);
            toast.success('تم حذف المنتج بنجاح');
            fetchProducts();
        } catch (error) {
            console.error(error);
            toast.error('خطأ في الحذف');
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-text-primary dark:text-cream-50 mb-1">المنتجات</h2>
                    <p className="text-text-secondary dark:text-gold-400 text-sm">إدارة الكتالوج، المخزون والأسعار.</p>
                </div>
                <Link
                    to="/dashboard/product/new"
                    className="bg-gold-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-700 transition-all shadow-lg shadow-gold-600/20"
                >
                    <Plus size={20} />
                    إضافة منتج جديد
                </Link>
            </div>

            {/* Filters bar */}
            <div className="bg-white dark:bg-dark-700 p-4 rounded-3xl border border-gold-100 dark:border-dark-600 flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative min-w-[300px]">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted dark:text-gold-400" size={18} />
                    <input
                        type="text"
                        placeholder="ابحث باسم المنتج، البراند أو SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 pr-12 pl-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all text-sm text-text-primary dark:text-cream-50"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-cream-50 dark:bg-dark-600 border border-gold-50 dark:border-dark-600 px-4 py-3 rounded-2xl focus:outline-none text-sm min-w-[150px] text-text-primary dark:text-cream-50"
                >
                    <option value="">كل التصنيفات</option>
                    {Array.isArray(categories) && categories.map(c => <option key={c.id} value={c.slug}>{c.name_ar}</option>)}
                </select>
            </div>

            {/* table */}
            <div className="bg-white dark:bg-dark-700 rounded-[32px] border border-gold-100 dark:border-dark-600 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-cream-50 dark:bg-dark-800 text-text-secondary dark:text-gold-400 text-xs uppercase font-bold">
                            <tr>
                                <th className="px-8 py-5">المنتج</th>
                                <th className="px-8 py-5">التصنيف</th>
                                <th className="px-8 py-5">الماركة</th>
                                <th className="px-8 py-5">الجنس</th>
                                <th className="px-8 py-5">السعر (يبدأ من)</th>
                                <th className="px-8 py-5">الحالة</th>
                                <th className="px-8 py-5">إجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gold-50 dark:divide-dark-600 text-sm">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse h-20 bg-white dark:bg-dark-700">
                                        <td colSpan="6" className="px-8 py-6"></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center opacity-50">
                                        <Package size={48} className="mx-auto mb-2" />
                                        <p className="font-bold">لا توجد منتجات</p>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gold-50/20 dark:hover:bg-dark-600 transition-colors">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-cream-50 dark:bg-dark-600 rounded-xl overflow-hidden border border-gold-50 dark:border-600">
                                                    <img src={product.main_image} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-text-primary dark:text-cream-50">{product.name_ar}</p>
                                                    <p className="text-xs text-text-secondary dark:text-gold-400 font-poppins">{product.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className="bg-gold-50 dark:bg-dark-600 text-gold-700 dark:text-gold-400 px-3 py-1 rounded-lg text-xs font-bold">
                                                {product.category?.name_ar}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-text-secondary dark:text-gold-400">
                                            {product.brand?.name_ar}
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black ${product.gender === 'men' ? 'bg-blue-50 text-blue-600' :
                                                    product.gender === 'women' ? 'bg-rose-50 text-rose-600' :
                                                        'bg-amber-50 text-amber-600'
                                                }`}>
                                                {product.gender === 'men' ? 'رجالي' : product.gender === 'women' ? 'نسائي' : 'للجنسين'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold font-poppins text-gold-700 dark:text-gold-400">
                                            {product.min_price} د.ل
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`flex items-center gap-1.5 font-bold ${product.is_active ? 'text-green-600' : 'text-red-500'}`}>
                                                <div className={`w-2 h-2 rounded-full ${product.is_active ? 'bg-green-600' : 'bg-red-500'}`}></div>
                                                {product.is_active ? 'نشط' : 'غير نشط'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/product/${product.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-text-muted dark:text-gold-400 hover:text-gold-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                                <Link
                                                    to={`/dashboard/product/edit/${product.id}`}
                                                    className="p-2 text-text-muted dark:text-gold-400 hover:text-blue-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-2 text-text-muted dark:text-gold-400 hover:text-red-600 bg-gray-50 dark:bg-dark-600 rounded-xl transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
};

export default DashboardProducts;

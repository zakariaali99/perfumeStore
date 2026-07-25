import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/common/Pagination';
import { Filter, ChevronDown, SlidersHorizontal, X, Tag, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSection = ({ filters, categories, brands, handleFilterChange }) => {
    const [catSearch, setCatSearch] = useState('');
    const [brandSearch, setBrandSearch] = useState('');

    const filteredCats = Array.isArray(categories)
        ? categories.filter(c => c.name_ar.toLowerCase().includes(catSearch.toLowerCase()))
        : [];

    const filteredBrands = Array.isArray(brands)
        ? brands.filter(b => b.name_ar.toLowerCase().includes(brandSearch.toLowerCase()))
        : [];

    return (
        <div className="space-y-6">
            {/* Categories Filter */}
            <div className="bg-cream-50/50 dark:bg-dark-700/50 p-4 rounded-2xl border border-gold-100 dark:border-dark-600">
                <div className="flex items-center justify-between mb-3 border-b border-gold-100 dark:border-dark-600 pb-2">
                    <h3 className="text-sm font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                        <Tag size={16} className="text-gold-500" />
                        التصنيفات
                    </h3>
                    {filters.categories && (
                        <button
                            onClick={() => handleFilterChange('categories', '')}
                            className="text-[10px] text-gold-600 dark:text-gold-400 font-bold hover:underline"
                        >
                            تفريغ
                        </button>
                    )}
                </div>

                {categories.length > 5 && (
                    <input
                        type="text"
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="بحث بالفئة..."
                        className="w-full bg-white dark:bg-dark-600 border border-gold-100 dark:border-dark-500 text-xs px-3 py-2 rounded-xl mb-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-text-primary dark:text-cream-50"
                    />
                )}

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 pb-4">
                    <button
                        onClick={() => handleFilterChange('categories', '')}
                        className={`block w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all ${filters.categories === '' ? 'bg-gold-500 text-white shadow-sm' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                    >
                        الكل
                    </button>
                    {filteredCats.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange('categories', String(cat.id))}
                            className={`block w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all ${filters.categories === String(cat.id) ? 'bg-gold-500 text-white shadow-sm' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                        >
                            {cat.name_ar}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brands Filter */}
            <div className="bg-cream-50/50 dark:bg-dark-700/50 p-4 rounded-2xl border border-gold-100 dark:border-dark-600">
                <div className="flex items-center justify-between mb-3 border-b border-gold-100 dark:border-dark-600 pb-2">
                    <h3 className="text-sm font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                        <Award size={16} className="text-gold-500" />
                        الماركات العطرية
                    </h3>
                    {filters.brand && (
                        <button
                            onClick={() => handleFilterChange('brand', '')}
                            className="text-[10px] text-gold-600 dark:text-gold-400 font-bold hover:underline"
                        >
                            تفريغ
                        </button>
                    )}
                </div>

                {brands.length > 5 && (
                    <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="بحث بالماركة..."
                        className="w-full bg-white dark:bg-dark-600 border border-gold-100 dark:border-dark-500 text-xs px-3 py-2 rounded-xl mb-3 focus:outline-none focus:ring-1 focus:ring-gold-500 text-text-primary dark:text-cream-50"
                    />
                )}

                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1 pb-4">
                    <button
                        onClick={() => handleFilterChange('brand', '')}
                        className={`block w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all ${filters.brand === '' ? 'bg-gold-500 text-white shadow-sm' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                    >
                        الكل
                    </button>
                    {filteredBrands.map(brand => (
                        <button
                            key={brand.id}
                            onClick={() => handleFilterChange('brand', String(brand.id))}
                            className={`block w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition-all ${filters.brand === String(brand.id) ? 'bg-gold-500 text-white shadow-sm' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                        >
                            {brand.name_ar}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters state
    const [filters, setFilters] = useState({
        categories: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        search: '',
        ordering: '-created_at'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, brandsRes] = await Promise.all([
                    productsApi.getCategories(),
                    productsApi.getBrands()
                ]);
                setCategories(catsRes.data.results || catsRes.data);
                setBrands(brandsRes.data.results || brandsRes.data);
            } catch (error) {
                console.error("Error fetching filters", error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const apiParams = {
                    search: filters.search,
                    ordering: filters.ordering,
                    page: currentPage,
                    page_size: 12,
                };
                if (filters.categories) apiParams.categories = filters.categories;
                if (filters.brand) apiParams.brand = filters.brand;
                
                const res = await productsApi.getAll(apiParams);
                setProducts(res.data.results || res.data);
                setTotalPages(Math.ceil((res.data.count || res.data.length) / 12));
            } catch (error) {
                console.error("Error fetching products", error);
                if (error.response?.status === 404 && currentPage > 1) {
                    setCurrentPage(1);
                } else {
                    setProducts([]);
                    setTotalPages(1);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, currentPage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const setPage = (page) => {
        setCurrentPage(page);
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', page);
        setSearchParams(newParams);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-dark-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-text-primary dark:text-cream-50 tracking-tight sm:text-5xl mb-4">
                        مجموعة العطور الفاخرة
                    </h1>
                    <p className="max-w-2xl mx-auto text-xl text-text-secondary dark:text-gold-400">
                        اكتشف تشكيلتنا الحصرية من أرقى العطور العالمية والشرقية
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Desktop Sidebar Filters */}
                    <div className="hidden md:block w-64 shrink-0">
                        <div className="bg-white dark:bg-dark-700 p-6 rounded-3xl border border-gold-100 dark:border-dark-500 shadow-sm sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8 mb-12">
                            <h2 className="text-xl font-bold mb-6 text-text-primary dark:text-cream-50 flex items-center space-x-2 space-x-reverse">
                                <Filter size={20} className="text-gold-500" />
                                <span>تصفية العطور</span>
                            </h2>
                            <FilterSection
                                filters={filters}
                                categories={categories}
                                brands={brands}
                                handleFilterChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Top Bar */}
                        <div className="bg-white dark:bg-dark-700 p-4 rounded-2xl border border-gold-100 dark:border-dark-500 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1 w-full">
                                <input
                                    type="text"
                                    placeholder="ابحث عن عطر أو ماركة..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-500 px-4 py-2.5 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="md:hidden flex-1 flex items-center justify-center space-x-2 space-x-reverse bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-500 px-4 py-2.5 rounded-xl text-gold-600 dark:text-gold-400 font-bold"
                                >
                                    <SlidersHorizontal size={18} />
                                    <span>الفلاتر</span>
                                </button>

                                <div className="relative flex-1 sm:flex-none">
                                    <select
                                        value={filters.ordering}
                                        onChange={(e) => handleFilterChange('ordering', e.target.value)}
                                        className="w-full bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-500 px-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 pr-10 text-text-primary dark:text-cream-50"
                                    >
                                        <option value="-created_at">الأحدث</option>
                                        <option value="min_price">السعر: من الأقل</option>
                                        <option value="-min_price">السعر: من الأعلى</option>
                                    </select>
                                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white dark:bg-dark-700 rounded-2xl h-[450px] animate-pulse border border-gold-100/50 dark:border-dark-500"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                    >
                                        <ProductCard product={product} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-dark-700 rounded-3xl p-8 md:p-20 text-center border border-gold-100 dark:border-dark-500 shadow-sm">
                                <Filter size={48} className="mx-auto text-gold-200 dark:text-dark-600 mb-4" />
                                <h3 className="text-xl font-bold text-text-primary dark:text-cream-50 mb-2">لا توجد منتجات</h3>
                                <p className="text-text-secondary dark:text-gold-400">حاول تغيير فلاتر البحث للعثور على ما تبحث عنه</p>
                                <button
                                    onClick={() => {
                                        setCurrentPage(1);
                                        setFilters({ categories: '', brand: '', search: '', ordering: '-created_at' });
                                    }}
                                    className="mt-6 text-gold-600 dark:text-gold-400 font-bold hover:underline"
                                >
                                    إعادة ضبط الفلاتر
                                </button>
                            </div>
                        )}

                        {/* Pagination */}
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setPage}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {showMobileFilters && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowMobileFilters(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-[85%] max-w-sm bg-white dark:bg-dark-800 z-[200] p-6 shadow-2xl overflow-y-auto flex flex-col justify-between"
                            dir="rtl"
                        >
                            <div>
                                <div className="flex justify-between items-center mb-6 border-b border-gold-100 dark:border-dark-600 pb-4">
                                    <h2 className="text-xl font-black text-text-primary dark:text-cream-50 flex items-center gap-2">
                                        <SlidersHorizontal size={20} className="text-gold-500" />
                                        تصفية العطور
                                    </h2>
                                    <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-cream-50 dark:hover:bg-dark-600 rounded-full transition-colors text-text-primary dark:text-cream-50">
                                        <X size={24} />
                                    </button>
                                </div>
                                <FilterSection
                                    filters={filters}
                                    categories={categories}
                                    brands={brands}
                                    handleFilterChange={handleFilterChange}
                                />
                            </div>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full mt-8 py-4 bg-gold-600 text-white rounded-2xl font-black shadow-lg shadow-gold-600/20 text-sm"
                            >
                                عرض النتائج
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Products;

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/common/Pagination';
import { Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters state
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        brand: searchParams.get('brand') || '',
        search: searchParams.get('search') || '',
        ordering: '-created_at'
    });

    // Sync with URL params
    useEffect(() => {
        const category = searchParams.get('category') || '';
        const brand = searchParams.get('brand') || '';
        const search = searchParams.get('search') || '';

        setFilters(prev => ({
            ...prev,
            category,
            brand,
            search
        }));
        setPage(1);
    }, [searchParams]);

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
                const params = {
                    page,
                    search: filters.search,
                    ordering: filters.ordering,
                    ...(filters.category && { category__slug: filters.category }),
                    ...(filters.brand && { brand__slug: filters.brand })
                };
                const res = await productsApi.getAll(params);

                // Handle different response structures (pagination vs flat)
                if (res.data.results) {
                    setProducts(res.data.results);
                    // Calculate total pages if count is provided
                    if (res.data.count) {
                        setTotalPages(Math.ceil(res.data.count / 12)); // Assuming page size is 12
                    }
                } else {
                    setProducts(res.data);
                    setTotalPages(1);
                }
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, page]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page on filter change
    };

    const FilterSection = () => (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-bold mb-4 border-b border-gold-100 dark:border-dark-600 pb-2 text-text-primary dark:text-cream-50">التصنيفات</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => handleFilterChange('category', '')}
                        className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.category === '' ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                    >
                        الكل
                    </button>
                    {Array.isArray(categories) && categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleFilterChange('category', cat.slug)}
                            className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.category === cat.slug ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                        >
                            {cat.name_ar}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold mb-4 border-b border-gold-100 dark:border-dark-600 pb-2 text-text-primary dark:text-cream-50">الماركات</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => handleFilterChange('brand', '')}
                        className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.brand === '' ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                    >
                        الكل
                    </button>
                    {Array.isArray(brands) && brands.map(brand => (
                        <button
                            key={brand.id}
                            onClick={() => handleFilterChange('brand', brand.slug)}
                            className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.brand === brand.slug ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                        >
                            {brand.name_ar}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="row g-4">

                    {/* PC Sidebar */}
                    <aside className="hidden md:block col-md-3">
                        <div className="bg-white dark:bg-dark-700 p-6 rounded-2xl border border-gold-100/50 dark:border-dark-600 sticky top-28 shadow-sm">
                            <FilterSection />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="col-12 col-md-9">
                        {/* Header & Sort */}
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                            <div className="w-full sm:w-auto">
                                <h1 className="text-3xl font-bold text-text-primary dark:text-cream-50">جميع العطور</h1>
                                <p className="text-text-secondary dark:text-gold-400 text-sm">اكتشف مجموعتنا المختارة من أرقى العطور</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="بحث عن عطر..."
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-600 px-4 py-2.5 rounded-xl pr-10 focus:outline-none focus:ring-2 focus:ring-gold-500/20 text-text-primary dark:text-cream-50"
                                    />
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <button
                                        onClick={() => setShowMobileFilters(true)}
                                        className="md:hidden flex-1 flex items-center justify-center space-x-2 space-x-reverse bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-600 px-4 py-2.5 rounded-xl text-gold-600 dark:text-gold-400 font-bold"
                                    >
                                        <SlidersHorizontal size={18} />
                                        <span>الفلاتر</span>
                                    </button>

                                    <div className="relative flex-1 sm:flex-none">
                                        <select
                                            value={filters.ordering}
                                            onChange={(e) => handleFilterChange('ordering', e.target.value)}
                                            className="w-full bg-white dark:bg-dark-700 border border-gold-100 dark:border-dark-600 px-4 py-2.5 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 pr-10 text-text-primary dark:text-cream-50"
                                        >
                                            <option value="-created_at">الأحدث</option>
                                            <option value="min_price">السعر: من الأقل</option>
                                            <option value="-min_price">السعر: من الأعلى</option>
                                        </select>
                                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gold-500" size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {loading ? (
                            <div className="row g-3 g-md-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="col-6 col-lg-4">
                                        <div className="bg-white dark:bg-dark-700 rounded-2xl h-[450px] animate-pulse border border-gold-100/50 dark:border-dark-600"></div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="row g-3 g-md-4 mb-12">
                                    {products.map((product, idx) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="col-6 col-lg-4"
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </>
                        ) : (
                            <div className="bg-white dark:bg-dark-700 rounded-3xl p-20 text-center border border-gold-100 dark:border-dark-600 shadow-sm">
                                <Filter size={48} className="mx-auto text-gold-200 dark:text-dark-600 mb-4" />
                                <h3 className="text-xl font-bold text-text-primary dark:text-cream-50 mb-2">لا توجد منتجات</h3>
                                <p className="text-text-secondary dark:text-gold-400">حاول تغيير فلاتر البحث للعثور على ما تبحث عنه</p>
                                <button
                                    onClick={() => setFilters({ category: '', brand: '', search: '', ordering: '-created_at' })}
                                    className="mt-6 text-gold-600 dark:text-gold-400 font-bold hover:underline"
                                >
                                    إعادة ضبط الفلاتر
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Drawer */}
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
                            className="fixed inset-y-0 right-0 w-[80%] max-w-sm bg-white dark:bg-dark-800 z-[200] p-6 shadow-2xl overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-text-primary dark:text-cream-50">تصفية المنتجات</h2>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-cream-50 dark:hover:bg-dark-600 rounded-full transition-colors text-text-primary dark:text-cream-50">
                                    <X size={24} />
                                </button>
                            </div>
                            <FilterSection />
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full mt-10 py-4 bg-gold-500 text-white rounded-xl font-bold shadow-lg shadow-gold-500/20"
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

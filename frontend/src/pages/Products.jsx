import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsApi } from '../services/api';
import ProductCard from '../components/products/ProductCard';
import Pagination from '../components/common/Pagination';
import { Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import Modal from '../components/common/Modal';

const FilterSection = ({ filters, categories, brands, handleFilterChange }) => (
    <div className="space-y-8">
        <div>
            <h3 className="text-lg font-bold mb-4 border-b border-gold-100 dark:border-dark-600 pb-2 text-text-primary dark:text-cream-50">التصنيفات</h3>
            <div className="space-y-2">
                <button
                    onClick={() => handleFilterChange('categories', '')}
                    className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.categories === '' ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
                >
                    الكل
                </button>
                {Array.isArray(categories) && categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => handleFilterChange('categories', cat.slug)}
                        className={`block w-full text-right px-3 py-2 rounded-lg transition-colors ${filters.categories === cat.slug ? 'bg-gold-500 text-white' : 'hover:bg-gold-50 dark:hover:bg-dark-600 text-text-secondary dark:text-gold-400'}`}
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

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
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
                if (filters.categories) apiParams.categories__slug = filters.categories;
                if (filters.brand) apiParams.brand__slug = filters.brand;
                
                const res = await productsApi.getAll(apiParams);
                setProducts(res.data.results || res.data);
                setTotalPages(Math.ceil((res.data.count || res.data.length) / 12));
            } catch (error) {
                console.error("Error fetching products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [filters, currentPage]);

    const handleFilterChange = (key, value) => {
        setCurrentPage(1);
        setFilters(prev => ({ ...prev, [key]: value }));
        
        // Update URL to reflect new category/brand
        if (key === 'categories' || key === 'brand') {
            const newParams = new URLSearchParams(searchParams);
            if (value) {
                // Map 'categories' internal key to 'category' in URL for consistency with other parts of the app
                const urlKey = key === 'categories' ? 'category' : key;
                newParams.set(urlKey, value);
            } else {
                const urlKey = key === 'categories' ? 'category' : key;
                newParams.delete(urlKey);
            }
            setSearchParams(newParams);
        }
    };

    return (
        <div className="bg-cream-50 dark:bg-dark-900 min-h-screen pt-24 pb-20 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* PC Sidebar */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="bg-white dark:bg-dark-700 p-6 rounded-2xl border border-gold-100/50 dark:border-dark-600 sticky top-28 shadow-sm">
                            <FilterSection
                                filters={filters}
                                categories={categories}
                                brands={brands}
                                handleFilterChange={handleFilterChange}
                            />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-white dark:bg-dark-700 rounded-2xl h-[450px] animate-pulse border border-gold-100/50 dark:border-dark-600"></div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <div className="bg-white dark:bg-dark-700 rounded-3xl p-20 text-center border border-gold-100 dark:border-dark-600 shadow-sm">
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
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    </main>
                </div>
            </div>

            <Modal variant="drawer" isOpen={showMobileFilters} onClose={() => setShowMobileFilters(false)}>
                <div className="p-6 space-y-8">
                    <h2 className="text-xl font-bold text-text-primary dark:text-cream-50">تصفية المنتجات</h2>
                    <FilterSection
                        filters={filters}
                        categories={categories}
                        brands={brands}
                        handleFilterChange={handleFilterChange}
                    />
                    <button
                        onClick={() => setShowMobileFilters(false)}
                        className="w-full py-4 bg-gold-500 text-white rounded-xl font-bold shadow-lg shadow-gold-500/20"
                    >
                        عرض النتائج
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Products;

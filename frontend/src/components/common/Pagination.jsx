import { ChevronRight, ChevronLeft } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const visible = [];

        visible.push(1);

        let rangeStart = Math.max(2, currentPage - 2);
        let rangeEnd = Math.min(totalPages - 1, currentPage + 2);

        if (currentPage <= 3) {
            rangeEnd = Math.min(5, totalPages - 1);
        }
        if (currentPage >= totalPages - 2) {
            rangeStart = Math.max(totalPages - 4, 2);
        }

        if (rangeStart > 2) {
            visible.push('...');
        }

        for (let i = rangeStart; i <= rangeEnd; i++) {
            visible.push(i);
        }

        if (rangeEnd < totalPages - 1) {
            visible.push('...');
        }

        visible.push(totalPages);

        return visible;
    };

    const visiblePages = getVisiblePages();

    return (
        <div className="w-full bg-white dark:bg-dark-800 border-t border-gold-100 dark:border-dark-600 rounded-b-[32px] px-4 py-4 sm:px-6 sm:py-5 shadow-sm">
            {/* Mobile Layout (< sm): Single compact inline bar with zero overflow */}
            <div className="flex sm:hidden items-center justify-between gap-2 w-full">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-cream-50 dark:bg-dark-700 text-gold-700 dark:text-gold-400 font-bold text-xs border border-gold-100 dark:border-dark-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                    <ChevronRight size={16} />
                    <span>السابق</span>
                </button>

                <div className="flex items-center gap-1.5 bg-gradient-to-r from-gold-500/10 via-gold-500/20 to-gold-500/10 dark:from-dark-700 dark:to-dark-700 px-3.5 py-1.5 rounded-2xl border border-gold-200/50 dark:border-dark-600 text-xs font-bold text-text-primary dark:text-cream-50">
                    <span className="text-gold-700 dark:text-gold-400">الصفحة</span>
                    <span className="font-poppins font-black text-gold-700 dark:text-gold-300">{currentPage}</span>
                    <span className="text-text-muted">/</span>
                    <span className="font-poppins font-black">{totalPages}</span>
                </div>

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-cream-50 dark:bg-dark-700 text-gold-700 dark:text-gold-400 font-bold text-xs border border-gold-100 dark:border-dark-600 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all"
                >
                    <span>التالي</span>
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Desktop / Tablet Layout (>= sm): Full expanded luxury bar */}
            <div className="hidden sm:flex items-center justify-between gap-4 w-full">
                {/* Page Count Badge */}
                <div className="flex items-center gap-2 bg-cream-50 dark:bg-dark-700/60 px-4 py-2 rounded-2xl border border-gold-100/60 dark:border-dark-600 text-xs font-bold text-text-secondary dark:text-gold-400 shrink-0">
                    <span>الصفحة</span>
                    <span className="font-poppins font-black text-gold-700 dark:text-gold-300">{currentPage}</span>
                    <span>من</span>
                    <span className="font-poppins font-black text-text-primary dark:text-cream-50">{totalPages}</span>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cream-50 dark:bg-dark-700 text-gold-700 dark:text-gold-400 font-bold text-xs border border-gold-100/80 dark:border-dark-600 hover:bg-gold-500 hover:text-white dark:hover:bg-gold-600 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="الصفحة السابقة"
                    >
                        <ChevronRight size={16} />
                        <span>السابق</span>
                    </button>

                    <div className="flex gap-1.5 items-center">
                        {visiblePages.map((page, idx) =>
                            page === '...' ? (
                                <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-text-muted dark:text-gold-400/50 text-xs font-bold">
                                    •••
                                </span>
                            ) : (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-9 h-9 rounded-2xl text-xs font-black transition-all ${
                                        currentPage === page
                                            ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-500/25 scale-105'
                                            : 'bg-cream-50 dark:bg-dark-700 text-text-secondary dark:text-gold-400 border border-gold-100/60 dark:border-dark-600 hover:bg-gold-100/80 hover:text-gold-700 dark:hover:bg-dark-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            )
                        )}
                    </div>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-cream-50 dark:bg-dark-700 text-gold-700 dark:text-gold-400 font-bold text-xs border border-gold-100/80 dark:border-dark-600 hover:bg-gold-500 hover:text-white dark:hover:bg-gold-600 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
                        title="الصفحة التالية"
                    >
                        <span>التالي</span>
                        <ChevronLeft size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;

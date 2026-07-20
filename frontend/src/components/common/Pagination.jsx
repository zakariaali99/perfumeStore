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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-8 py-4 bg-white dark:bg-dark-800 border-t border-gold-100 dark:border-dark-500 rounded-b-[32px]">
            <div className="text-xs text-text-secondary dark:text-gold-400 font-bold">
                الصفحة <span className="font-poppins">{currentPage}</span> من <span className="font-poppins">{totalPages}</span>
            </div>
            <div className="flex gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-2 rounded-xl bg-gold-50 dark:bg-dark-700 text-gold-600 dark:text-gold-400 disabled:opacity-30 hover:bg-gold-500 hover:text-white transition-all"
                >
                    <ChevronRight size={18} />
                </button>
                <div className="flex flex-wrap gap-1 items-center">
                    {visiblePages.map((page, idx) =>
                        page === '...' ? (
                            <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-text-muted dark:text-gold-400/50 text-xs font-bold">•••</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'bg-gold-50 dark:bg-dark-700 text-gold-600 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-dark-500'}`}
                            >
                                {page}
                            </button>
                        )
                    )}
                </div>
                <button
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-2 rounded-xl bg-gold-50 dark:bg-dark-700 text-gold-600 dark:text-gold-400 disabled:opacity-30 hover:bg-gold-500 hover:text-white transition-all"
                >
                    <ChevronLeft size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;

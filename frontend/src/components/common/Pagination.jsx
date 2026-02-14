import { ChevronRight, ChevronLeft } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex items-center justify-between px-8 py-4 bg-white dark:bg-dark-800 border-t border-gold-50 dark:border-dark-600 rounded-b-[32px]">
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
                <div className="flex gap-1">
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${currentPage === page ? 'bg-gold-500 text-white shadow-lg shadow-gold-500/20' : 'bg-gold-50 dark:bg-dark-700 text-gold-600 dark:text-gold-400 hover:bg-gold-100 dark:hover:bg-dark-600'}`}
                        >
                            {page}
                        </button>
                    ))}
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

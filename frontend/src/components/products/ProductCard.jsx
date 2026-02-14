import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="group bg-white dark:bg-dark-700 rounded-2xl overflow-hidden border border-gold-100/50 dark:border-dark-600 shadow-sm hover:shadow-xl transition-all duration-500"
        >
            <Link to={`/product/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden">
                <img
                    src={product.main_image || 'https://via.placeholder.com/400x500'}
                    alt={product.name_ar}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {product.is_new && (
                    <span className="absolute top-4 right-4 bg-gold-500 text-white text-[10px] px-3 py-1 rounded-full font-bold">جديد</span>
                )}
            </Link>

            <div className="p-5 text-center">
                <span className="text-xs text-gold-600 dark:text-gold-400 mb-2 block font-medium">{product.brand?.name_ar}</span>
                <Link to={`/product/${product.slug}`} className="text-lg font-bold text-text-primary dark:text-cream-50 hover:text-gold-500 transition-colors block mb-3 line-clamp-1">
                    {product.name_ar}
                </Link>
                <div className="flex items-center justify-center space-x-2 space-x-reverse mb-5">
                    <span className="text-xl font-bold text-gold-700 dark:text-gold-400 font-poppins">{product.min_price} د.ل</span>
                </div>

                <button className="w-full py-3 bg-cream-50 dark:bg-dark-600 hover:bg-gold-500 hover:text-white text-gold-600 dark:text-gold-400 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 space-x-reverse border border-gold-100 dark:border-dark-600">
                    <ShoppingCart size={18} />
                    <span>إضافة للسلة</span>
                </button>
            </div>
        </motion.div>
    );
};

export default ProductCard;

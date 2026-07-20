import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, updateItem, removeItem } = useCartStore();

    const handleUpdateQuantity = (item, newQuantity) => {
        if (newQuantity < 1) return;

        if (item.variant && item.variant.stock_quantity !== undefined) {
            if (newQuantity > item.variant.stock_quantity) {
                toast.error(`عذراً، الكمية المتوفرة ${item.variant.stock_quantity} فقط`);
                return;
            }
        }

        updateItem(item.id, newQuantity);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="absolute inset-y-0 left-0 w-3/4 max-w-lg bg-white dark:bg-dark-800 shadow-2xl flex flex-col"
                    >
                        <div className="p-6 border-b border-gold-100 dark:border-dark-500 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShoppingBag className="text-gold-600" size={24} />
                                <h2 className="text-xl font-black text-text-primary dark:text-cream-50">حقيبة التسوق</h2>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-gold-50 dark:hover:bg-dark-700 rounded-full transition-colors text-text-muted dark:text-gold-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {cart.items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 text-text-primary dark:text-cream-50">
                                    <ShoppingBag size={64} className="mb-4 text-gold-300" />
                                    <p className="font-bold text-lg">حقيبتك فارغة حالياً</p>
                                    <Link
                                        to="/products"
                                        onClick={onClose}
                                        className="mt-4 text-gold-600 font-bold hover:underline block"
                                    >
                                        استكشف العطور
                                    </Link>
                                </div>
                            ) : (
                                cart.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="w-24 h-24 bg-cream-50 dark:bg-dark-700 rounded-2xl overflow-hidden border border-gold-50 dark:border-dark-500 flex-shrink-0">
                                            {item.variant.product_main_image ? (
                                                <img
                                                    src={item.variant.product_main_image}
                                                    alt={item.variant.product_name_ar}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gold-400 text-2xl">🌸</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-text-primary dark:text-cream-50 truncate">{item.variant.product_name_ar}</h3>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="p-3 text-text-muted hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <p className="text-xs text-text-secondary dark:text-gold-400 mb-3">حجم {item.variant.size_ml} مل</p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 bg-cream-50 dark:bg-dark-700 rounded-xl px-3 py-2 border border-gold-50 dark:border-dark-500 text-text-primary dark:text-cream-50">
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-3 hover:text-gold-600 disabled:opacity-30 disabled:hover:text-inherit"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold text-sm min-w-[20px] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                                        className="p-3 hover:text-gold-600"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <p className="font-bold text-gold-700 dark:text-gold-400">
                                                    {item.total_price} د.ل
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.items.length > 0 && (
                            <div className="p-6 border-t border-gold-100 dark:border-dark-500 space-y-4">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-bold text-text-primary dark:text-cream-50">المجموع:</span>
                                    <span className="font-black text-gold-700 dark:text-gold-400">
                                        {cart.total_amount} د.ل
                                    </span>
                                </div>

                                <Link
                                    to="/checkout"
                                    onClick={onClose}
                                    className="block w-full bg-gold-600 hover:bg-gold-700 text-white text-center py-4 rounded-2xl font-black text-lg shadow-lg shadow-gold-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    إتمام الطلب
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;

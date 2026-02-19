import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import { cartApi } from '../services/api';

const useCartStore = create(
    persist(
        (set) => ({
            cart: { items: [], total_amount: 0 },
            loading: false,
            coupon: null, // { code, discount_value, discount_type }

            fetchCart: async () => {
                set({ loading: true });
                try {
                    const response = await cartApi.get();
                    set({ cart: response.data, loading: false });
                } catch (error) {
                    // On 401 or any error, just keep the default empty cart
                    console.error(error);
                    set({ loading: false, cart: { items: [], total_amount: 0 } });
                }
            },

            addItem: async (variantId, quantity = 1) => {
                try {
                    const response = await cartApi.addItem({ variant_id: variantId, quantity });
                    set({ cart: response.data });
                    toast.success('تمت الإضافة للسلة');
                } catch (error) {
                    console.error('Add item error', error);
                    const msg = error.response?.data?.error || 'فشل إضافة المنتج للسلة';
                    toast.error(msg);
                }
            },

            updateItem: async (itemId, quantity) => {
                try {
                    const response = await cartApi.updateItem({ item_id: itemId, quantity });
                    set({ cart: response.data });
                } catch (error) {
                    console.error('Update item error', error);
                    const msg = error.response?.data?.error || 'فشل تحديث الكمية';
                    toast.error(msg);
                }
            },

            removeItem: async (itemId) => {
                try {
                    const response = await cartApi.removeItem(itemId);
                    set({ cart: response.data });
                    toast.success('تم حذف المنتج');
                } catch (error) {
                    console.error('Remove item error', error);
                    const msg = error.response?.data?.error || 'فشل حذف المنتج';
                    toast.error(msg);
                }
            },

            applyCoupon: (couponData) => {
                set({ coupon: couponData });
            },

            removeCoupon: () => {
                set({ coupon: null });
            },

            clearCart: () => {
                set({ cart: { items: [], total_amount: 0 }, coupon: null });
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({ coupon: state.coupon }), // Only persist coupon
        }
    )
);

export default useCartStore;

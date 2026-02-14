import { create } from 'zustand';
import { cartApi } from '../services/api';

const useCartStore = create((set, get) => ({
    cart: { items: [], total_amount: 0 },
    loading: false,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const response = await cartApi.get();
            set({ cart: response.data, loading: false });
        } catch (error) {
            // On 401 or any error, just keep the default empty cart
            set({ loading: false, cart: { items: [], total_amount: 0 } });
        }
    },

    addItem: async (variantId, quantity = 1) => {
        try {
            const response = await cartApi.addItem({ variant_id: variantId, quantity });
            set({ cart: response.data });
        } catch (error) {
            console.error('Add item error', error);
        }
    },

    updateItem: async (itemId, quantity) => {
        try {
            const response = await cartApi.updateItem({ item_id: itemId, quantity });
            set({ cart: response.data });
        } catch (error) {
            console.error('Update item error', error);
        }
    },

    removeItem: async (itemId) => {
        try {
            const response = await cartApi.removeItem(itemId);
            set({ cart: response.data });
        } catch (error) {
            console.error('Remove item error', error);
        }
    },

    clearCart: () => {
        set({ cart: { items: [], total_amount: 0 } });
    },
}));

export default useCartStore;

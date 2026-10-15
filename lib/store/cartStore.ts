import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  quantity: number;
  imageURL: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        try {
          if (!item?.id || !item?.name || typeof item?.price !== 'number') {
            throw new Error('Invalid item data');
          }
          
          const existingItemIndex = state.items.findIndex(i => i.id === item.id);
          if (existingItemIndex >= 0) {
            const newQty = state.items[existingItemIndex].quantity + (item.quantity || 1);
            if (newQty <= 0) {
              return { items: state.items.filter((_, idx) => idx !== existingItemIndex) };
            }
            const newItems = [...state.items];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newQty
            };
            return { items: newItems };
          }
          
          return { 
            items: [...state.items, { ...item, quantity: Math.max(1, item.quantity || 1) }] 
          };
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Error adding item to cart:', error);
          }
          return state;
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        try {
          if (quantity < 0) return state;
          if (quantity === 0) {
            return { items: state.items.filter(item => item.id !== id) };
          }
          return {
            items: state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            )
          };
        } catch (error) {
          console.error('Error updating quantity:', error);
          return state;
        }
      }),
      
      clearCart: () => set({ items: [] }),
      
      getTotalItems: () => {
        try {
          return get().items.reduce((total, item) => total + (item?.quantity || 0), 0);
        } catch {
          return 0;
        }
      },
      
      getTotalPrice: () => {
        try {
          return get().items.reduce((total, item) => {
            const rawPrice = Number(item?.price) || 0;
            const rawSale = Number(item?.salePrice);
            const price =
              rawSale > 0 && rawSale < rawPrice ? rawSale : rawPrice;
            const quantity = item?.quantity || 0;
            return total + (price * quantity);
          }, 0);
        } catch {
          return 0;
        }
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
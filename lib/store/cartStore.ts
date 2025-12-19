import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
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
          // Comprehensive input validation
          if (!item || typeof item !== 'object') {
            throw new Error('Item must be an object');
          }
          
          if (!item.id || typeof item.id !== 'string' || item.id.trim().length === 0) {
            throw new Error('Item ID is required and must be a non-empty string');
          }
          
          if (!item.name || typeof item.name !== 'string' || item.name.trim().length === 0) {
            throw new Error('Item name is required and must be a non-empty string');
          }
          
          if (typeof item.price !== 'number' || item.price < 0 || !isFinite(item.price)) {
            throw new Error('Item price must be a valid positive number');
          }
          
          const quantity = item.quantity || 1;
          if (typeof quantity !== 'number' || quantity < 1 || !Number.isInteger(quantity)) {
            throw new Error('Item quantity must be a positive integer');
          }
          
          // Sanitize item data
          const sanitizedItem = {
            id: item.id.trim(),
            name: item.name.trim(),
            price: Math.round(item.price * 100) / 100, // Round to 2 decimal places
            quantity: Math.min(quantity, 999), // Max quantity limit
            imageURL: item.imageURL || ''
          };
          
          const existingItemIndex = state.items.findIndex(i => i.id === sanitizedItem.id);
          if (existingItemIndex >= 0) {
            const newItems = [...state.items];
            const newQuantity = Math.min(newItems[existingItemIndex].quantity + sanitizedItem.quantity, 999);
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              quantity: newQuantity
            };
            return { items: newItems };
          }
          
          return { 
            items: [...state.items, sanitizedItem] 
          };
        } catch (error) {
          console.error('Error adding item to cart:', error.message);
          return state;
        }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => {
        try {
          // Validate inputs
          if (!id || typeof id !== 'string') {
            throw new Error('Invalid item ID');
          }
          
          if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 0) {
            throw new Error('Quantity must be a non-negative integer');
          }
          
          if (quantity > 999) {
            throw new Error('Quantity cannot exceed 999');
          }
          
          if (quantity === 0) {
            return { items: state.items.filter(item => item.id !== id) };
          }
          
          return {
            items: state.items.map(item =>
              item.id === id ? { ...item, quantity } : item
            )
          };
        } catch (error) {
          console.error('Error updating quantity:', error.message);
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
            const price = item?.price || 0;
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
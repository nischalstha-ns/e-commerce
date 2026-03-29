import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  imageURL: string;
  categoryId?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isWishlisted: (id: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      toggleItem: (item) => {
        const { isWishlisted, addItem, removeItem } = get();
        if (isWishlisted(item.id)) {
          removeItem(item.id);
        } else {
          addItem(item);
        }
      },

      isWishlisted: (id) => get().items.some((i) => i.id === id),

      clearWishlist: () => set({ items: [] }),

      getTotalItems: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],
      
      addHistory: (action) => {
        const newHistory = {
          id: Date.now(),
          action: action.type,
          description: action.description,
          data: action.data,
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          history: [newHistory, ...state.history].slice(0, 50) // Keep last 50
        }));
      },
      
      clearHistory: () => set({ history: [] }),
      
      getRecentHistory: (limit = 10) => {
        return get().history.slice(0, limit);
      },
    }),
    {
      name: 'shop-history-storage',
    }
  )
);

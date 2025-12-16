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
          user: action.user || 'Unknown',
          role: action.role || 'admin',
          timestamp: new Date().toISOString(),
        };
        
        set((state) => ({
          history: [newHistory, ...state.history].slice(0, 100) // Keep last 100
        }));
      },
      
      clearHistory: () => set({ history: [] }),
      
      getRecentHistory: (limit = 10) => {
        return get().history.slice(0, limit);
      },
      
      deleteHistoryItem: (id) => {
        set((state) => ({
          history: state.history.filter(item => item.id !== id)
        }));
      },
    }),
    {
      name: 'shop-history-storage',
    }
  )
);

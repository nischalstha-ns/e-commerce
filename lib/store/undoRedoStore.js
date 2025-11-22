import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUndoRedoStore = create(
  persist(
    (set, get) => ({
      undoStack: [],
      redoStack: [],
      maxStackSize: 50,

      addAction: (action) => set((state) => ({
        undoStack: [...state.undoStack.slice(-state.maxStackSize + 1), action],
        redoStack: []
      })),

      undo: () => {
        const { undoStack, redoStack } = get();
        if (undoStack.length === 0) return null;
        
        const action = undoStack[undoStack.length - 1];
        set({
          undoStack: undoStack.slice(0, -1),
          redoStack: [...redoStack, action]
        });
        return action;
      },

      redo: () => {
        const { redoStack, undoStack } = get();
        if (redoStack.length === 0) return null;
        
        const action = redoStack[redoStack.length - 1];
        set({
          redoStack: redoStack.slice(0, -1),
          undoStack: [...undoStack, action]
        });
        return action;
      },

      canUndo: () => get().undoStack.length > 0,
      canRedo: () => get().redoStack.length > 0,
      clear: () => set({ undoStack: [], redoStack: [] })
    }),
    { name: 'undo-redo-storage' }
  )
);

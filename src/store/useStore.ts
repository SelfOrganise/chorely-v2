import { create } from 'zustand';

interface Store {
  showArchived: boolean;

  fn: {
    toggleShowArchived: () => void;
  };
}

export const useStore = create<Store>(set => ({
  showArchived: false,

  fn: {
    toggleShowArchived: () => set(state => ({ showArchived: !state.showArchived })),
  },
}));

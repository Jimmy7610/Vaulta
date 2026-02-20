import { create } from "zustand";

type UIState = {
  quickCaptureOpen: boolean;
  openQuickCapture: () => void;
  closeQuickCapture: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
};

export const useUIStore = create<UIState>((set) => ({
  quickCaptureOpen: false,
  openQuickCapture: () => set({ quickCaptureOpen: true }),
  closeQuickCapture: () => set({ quickCaptureOpen: false }),
  toastMessage: null,
  showToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set((state) => (state.toastMessage === msg ? { toastMessage: null } : {}));
    }, 2500);
  },
}));

import { create } from "zustand";

type UIState = {
    quickCaptureOpen: boolean;
    openQuickCapture: () => void;
    closeQuickCapture: () => void;
};

export const useUIStore = create<UIState>((set) => ({
    quickCaptureOpen: false,
    openQuickCapture: () => set({ quickCaptureOpen: true }),
    closeQuickCapture: () => set({ quickCaptureOpen: false })
}));

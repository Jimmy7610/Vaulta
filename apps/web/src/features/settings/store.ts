import { create } from "zustand";

type SettingsState = {
    selectedModel: string | null;
    setSelectedModel: (model: string | null) => void;
};

// Quick safe parse for local storage
function getStoredModel(): string | null {
    try {
        const val = localStorage.getItem("vaulta-settings");
        if (val) {
            const parsed = JSON.parse(val);
            return parsed.selectedModel ?? null;
        }
    } catch {
        // ignore
    }
    return null;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    selectedModel: getStoredModel(),
    setSelectedModel: (model: string | null) => {
        set({ selectedModel: model });
        try {
            localStorage.setItem("vaulta-settings", JSON.stringify({ selectedModel: model }));
        } catch {
            // ignore
        }
    }
}));

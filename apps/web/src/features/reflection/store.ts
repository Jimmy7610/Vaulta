import { create } from "zustand";
import { type Reflection, saveReflection, getLatestReflection } from "../../data/db";
import { reflect } from "../../lib/api";
import { useEntriesStore } from "../entries/store";

type ReflectionState = {
    reflection: Reflection | null;
    loading: boolean;
    error: string | null;

    loadLatest: () => Promise<void>;
    generateReflection: (model?: string) => Promise<void>;
};

function uid() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useReflectionStore = create<ReflectionState>((set) => ({
    reflection: null,
    loading: false,
    error: null,

    loadLatest: async () => {
        set({ loading: true, error: null });
        try {
            const ref = await getLatestReflection();
            set({ reflection: ref, loading: false });
        } catch (e: any) {
            set({ loading: false, error: "Failed to load reflection." });
        }
    },

    generateReflection: async (model) => {
        set({ loading: true, error: null });
        try {
            // Get last 7 days of entries from the main store for reflection
            const allEntries = useEntriesStore.getState().entries;
            const now = Date.now();
            const weekMs = 7 * 24 * 60 * 60 * 1000;
            const recent = allEntries.filter(e => (now - e.createdAt) <= weekMs);

            if (recent.length === 0) {
                set({ loading: false, error: "No fragments in the last 7 days to reflect on." });
                return;
            }

            const data = await reflect(recent, model);

            const newRef: Reflection = {
                id: uid(),
                createdAt: Date.now(),
                model: model ?? "default",
                highlights: data.highlights,
                themes: data.themes,
                note: data.note,
                entryCount: recent.length,
            };

            await saveReflection(newRef);
            set({ reflection: newRef, loading: false });
        } catch (e: any) {
            set({ loading: false, error: e?.message ?? "Reflection failed" });
        }
    }
}));

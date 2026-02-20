import { create } from "zustand";
import { type Entry, addEntry, listEntriesNewestFirst, updateEntry } from "../../data/db";

type EntriesState = {
    entries: Entry[];
    selectedId: string | null;
    loading: boolean;
    error: string | null;

    load: () => Promise<void>;
    select: (id: string | null) => void;
    create: (text: string) => Promise<Entry>;
    setMeta: (id: string, meta: Entry["meta"]) => Promise<void>;
};

function uid() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
    entries: [],
    selectedId: null,
    loading: false,
    error: null,

    load: async () => {
        set({ loading: true, error: null });
        try {
            const entries = await listEntriesNewestFirst();
            set({ entries, loading: false });
        } catch (e: any) {
            set({ loading: false, error: e?.message ?? "Failed to load entries" });
        }
    },

    select: (id) => set({ selectedId: id }),

    create: async (text) => {
        const entry: Entry = { id: uid(), text, createdAt: Date.now() };
        await addEntry(entry);
        // optimistic update: add to front
        set({ entries: [entry, ...get().entries] });
        return entry;
    },

    setMeta: async (id, meta) => {
        const current = get().entries.find((e) => e.id === id);
        if (!current) return;
        const updated: Entry = { ...current, meta: meta ?? undefined };
        await updateEntry(updated);
        set({
            entries: get().entries.map((e) => (e.id === id ? updated : e))
        });
    }
}));

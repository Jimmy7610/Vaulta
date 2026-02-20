import { create } from "zustand";
import { type Entry, addEntry, listEntriesNewestFirst, updateEntry } from "../../data/db";

type DateFilter = "any" | "7d" | "30d" | "year";

type EntriesState = {
    entries: Entry[];
    selectedId: string | null;
    loading: boolean;
    error: string | null;

    searchQuery: string;
    typeFilter: string[];
    themeFilter: string[];
    dateFilter: DateFilter;

    load: () => Promise<void>;
    select: (id: string | null) => void;
    create: (text: string) => Promise<Entry>;
    setMeta: (id: string, meta: Entry["meta"]) => Promise<void>;

    setSearchQuery: (q: string) => void;
    setTypeFilter: (types: string[]) => void;
    setThemeFilter: (themes: string[]) => void;
    setDateFilter: (df: DateFilter) => void;
    clearFilters: () => void;
};

function uid() {
    return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useEntriesStore = create<EntriesState>((set, get) => ({
    entries: [],
    selectedId: null,
    loading: false,
    error: null,

    searchQuery: "",
    typeFilter: [],
    themeFilter: [],
    dateFilter: "any",

    setSearchQuery: (q) => set({ searchQuery: q }),
    setTypeFilter: (types) => set({ typeFilter: types }),
    setThemeFilter: (themes) => set({ themeFilter: themes }),
    setDateFilter: (df) => set({ dateFilter: df }),
    clearFilters: () => set({
        searchQuery: "", typeFilter: [], themeFilter: [], dateFilter: "any"
    }),

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

import { useMemo } from "react";

export function useFilteredEntries() {
    const entries = useEntriesStore(s => s.entries);
    const q = useEntriesStore(s => s.searchQuery).toLowerCase().trim();
    const typeFilter = useEntriesStore(s => s.typeFilter);
    const themeFilter = useEntriesStore(s => s.themeFilter);
    const dateFilter = useEntriesStore(s => s.dateFilter);

    return useMemo(() => {
        let res = entries;

        if (q) {
            res = res.filter(e => {
                const textMatch = e.text.toLowerCase().includes(q);
                const themeMatch = e.meta?.themes?.some(t => t.toLowerCase().includes(q));
                const sumMatch = e.meta?.summary?.toLowerCase().includes(q);
                return textMatch || themeMatch || sumMatch;
            });
        }

        if (typeFilter.length > 0) {
            res = res.filter(e => {
                const t = e.meta?.type ?? "unfiled";
                return typeFilter.includes(t);
            });
        }

        if (themeFilter.length > 0) {
            res = res.filter(e => {
                const themes = e.meta?.themes ?? [];
                // OR logic: matches if ANY theme is in the themeFilter
                return themes.some(t => themeFilter.includes(t));
            });
        }

        if (dateFilter !== "any") {
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;
            res = res.filter(e => {
                if (dateFilter === "7d") return (now - e.createdAt) <= 7 * dayMs;
                if (dateFilter === "30d") return (now - e.createdAt) <= 30 * dayMs;
                if (dateFilter === "year") {
                    const yearOfEntry = new Date(e.createdAt).getFullYear();
                    const currentYear = new Date().getFullYear();
                    return yearOfEntry === currentYear;
                }
                return true;
            });
        }

        return res;
    }, [entries, q, typeFilter, themeFilter, dateFilter]);
}

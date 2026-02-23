import { useMemo } from "react";
import { useEntriesStore } from "../entries/store";
import { useReflectionStore } from "../reflection/store";

export function useGentleReminder(): string | null {
    const entries = useEntriesStore((s) => s.entries);
    const reflection = useReflectionStore((s) => s.reflection);

    return useMemo(() => {
        if (entries.length === 0) return null;

        // R1: Unfiled fragments
        if (entries.length >= 5) {
            const unfiledCount = entries.filter(e => !e.meta || !e.meta.type).length;
            if (unfiledCount >= 3) {
                return `${unfiledCount} fragments are still unfiled.`;
            }
        }

        // R2: Reflection cadence
        if (reflection) {
            const now = Date.now();
            const NINE_DAYS_MS = 9 * 24 * 60 * 60 * 1000;
            if (now - reflection.createdAt >= NINE_DAYS_MS) {
                return "You haven’t reflected in a while.";
            }
        }

        // R3: Returning theme
        const themeCounts: Record<string, Set<string>> = {};
        for (const entry of entries) {
            if (entry.meta?.themes) {
                for (const theme of entry.meta.themes) {
                    if (!themeCounts[theme]) {
                        themeCounts[theme] = new Set();
                    }
                    themeCounts[theme].add(entry.id);
                }
            }
        }

        for (const [_, entryIds] of Object.entries(themeCounts)) {
            if (entryIds.size >= 4) {
                return "This theme keeps returning.";
            }
        }

        return null;
    }, [entries, reflection]);
}

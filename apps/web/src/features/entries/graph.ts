import { type Entry } from "../../data/db";

export type GraphNode = {
    id: string;
    label: string;
    themes: string[];
    val: number; // Node size, e.g., based on number of themes or constant
};

export type GraphLink = {
    source: string;
    target: string;
    value: number; // Link thickness based on shared themes
};

export function buildGraph(entries: Entry[]): { nodes: GraphNode[]; links: GraphLink[] } {
    const nodes: GraphNode[] = [];
    const validEntries = entries.filter((e) => e.meta && e.meta.themes && e.meta.themes.length > 0);

    // Create Nodes
    for (const entry of validEntries) {
        let label = entry.text.trim().replace(/\s+/g, " ");
        if (label.length > 80) label = label.slice(0, 80) + "…";

        nodes.push({
            id: entry.id,
            label,
            themes: entry.meta!.themes,
            val: Math.max(1, entry.meta!.themes.length),
        });
    }

    // Create Links
    const links: GraphLink[] = [];
    // Max links per node to prevent hairballs (e.g. keep top 5 strongest links per node)
    const MAX_LINKS_PER_NODE = 5;

    // Build a map of nodeid -> array of { targetId, shared }
    const candMap = new Map<string, { target: string; shared: number }[]>();

    for (let i = 0; i < validEntries.length; i++) {
        const e1 = validEntries[i];
        candMap.set(e1.id, []);
        for (let j = i + 1; j < validEntries.length; j++) {
            const e2 = validEntries[j];

            // Calc shared themes
            let sharedCount = 0;
            for (const t1 of e1.meta!.themes) {
                if (e2.meta!.themes.includes(t1)) {
                    sharedCount++;
                }
            }

            if (sharedCount > 0) {
                candMap.get(e1.id)!.push({ target: e2.id, shared: sharedCount });
                // We also add to e2's list to determine local top links
                if (!candMap.has(e2.id)) candMap.set(e2.id, []);
                candMap.get(e2.id)!.push({ target: e1.id, shared: sharedCount });

                // We'll filter the global links list later to avoid duplicates
                links.push({ source: e1.id, target: e2.id, value: sharedCount });
            }
        }
    }

    // Prune Links to prevent hairballs
    // We want to keep a link if it is in the "top N" for EITHER the source OR the target.
    const keepLinks = new Set<string>();

    for (const [nodeId, neighbors] of candMap.entries()) {
        // Sort neighbors by shared themes descending
        neighbors.sort((a, b) => b.shared - a.shared);
        const topN = neighbors.slice(0, MAX_LINKS_PER_NODE);
        for (const n of topN) {
            // Create a consistent pair key to avoid duplicate unidirectional pairs
            const id1 = nodeId < n.target ? nodeId : n.target;
            const id2 = nodeId < n.target ? n.target : nodeId;
            keepLinks.add(`${id1}::${id2}`);
        }
    }

    const finalLinks = links.filter((l) => {
        const id1 = l.source < l.target ? l.source : l.target;
        const id2 = l.source < l.target ? l.target : l.source;
        return keepLinks.has(`${id1}::${id2}`);
    });

    return { nodes, links: finalLinks };
}

export function getThemeCounts(entries: Entry[]): { theme: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const e of entries) {
        if (!e.meta?.themes) continue;
        for (const t of e.meta.themes) {
            counts.set(t, (counts.get(t) || 0) + 1);
        }
    }
    return Array.from(counts.entries())
        .map(([theme, count]) => ({ theme, count }))
        .sort((a, b) => b.count - a.count || a.theme.localeCompare(b.theme));
}

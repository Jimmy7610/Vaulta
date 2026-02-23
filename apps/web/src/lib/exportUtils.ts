import type { Entry, Reflection } from "../data/db";
import { VAULTA_VERSION } from "./version";

function triggerDownload(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportVaultaJson(entries: Entry[], reflections: Reflection[]) {
    const data = {
        version: VAULTA_VERSION,
        exportedAt: new Date().toISOString(),
        entries,
        reflections
    };

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `vaulta-export-${dateStr}.json`;
    triggerDownload(filename, JSON.stringify(data, null, 2), "application/json");
}

export function exportVaultaMarkdown(entries: Entry[], reflections: Reflection[]) {
    const dateStr = new Date().toISOString().split("T")[0];
    const exportedAt = new Date().toLocaleString();

    let md = `# Vaulta Export\n\n`;
    md += `**Exported at:** ${exportedAt}\n`;
    md += `**Version:** ${VAULTA_VERSION}\n\n`;

    md += `---\n\n## Reflections\n\n`;

    // Sort newest first
    const sortedReflections = [...reflections].sort((a, b) => b.createdAt - a.createdAt);
    if (sortedReflections.length === 0) {
        md += `*No reflections.*\n\n`;
    } else {
        for (const ref of sortedReflections) {
            const date = new Date(ref.createdAt).toLocaleString();
            md += `### ${date}\n`;
            if (ref.highlights && ref.highlights.length > 0) {
                md += `**Highlights:**\n`;
                for (const h of ref.highlights) {
                    md += `- ${h}\n`;
                }
            }
            if (ref.themes && ref.themes.length > 0) {
                md += `\n**Themes:** ${ref.themes.join(", ")}\n`;
            }
            if (ref.note) {
                md += `\n**Note:**\n${ref.note}\n`;
            }
            md += `\n`;
        }
    }

    md += `---\n\n## Fragments\n\n`;
    const sortedEntries = [...entries].sort((a, b) => b.createdAt - a.createdAt);

    if (sortedEntries.length === 0) {
        md += `*No fragments.*\n\n`;
    } else {
        for (const entry of sortedEntries) {
            const date = new Date(entry.createdAt).toLocaleString();
            md += `### ${date}\n\n`;
            md += `${entry.text}\n\n`;

            const metaParts = [];
            if (entry.isSeed) metaParts.push("**Seed:** yes");
            if (entry.meta?.type) metaParts.push(`**Type:** ${entry.meta.type}`);
            if (entry.meta?.tone) metaParts.push(`**Tone:** ${entry.meta.tone}`);
            if (entry.meta?.themes && entry.meta.themes.length > 0) {
                metaParts.push(`**Themes:** ${entry.meta.themes.join(", ")}`);
            }

            if (metaParts.length > 0) {
                md += `- ${metaParts.join(" | ")}\n`;
            }
            md += `\n`;
        }
    }

    const filename = `vaulta-export-${dateStr}.md`;
    triggerDownload(filename, md, "text/markdown");
}

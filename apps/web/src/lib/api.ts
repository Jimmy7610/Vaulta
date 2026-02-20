export async function getModels(): Promise<string[]> {
    const base = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8787";
    try {
        const res = await fetch(`${base}/ollama/models`);
        if (!res.ok) throw new Error("Offline");
        const data = await res.json();
        return Array.isArray(data?.models) ? data.models : [];
    } catch {
        throw new Error("OLLAMA_OFFLINE");
    }
}

export async function analyze(text: string, model?: string | null): Promise<{
    themes: string[];
    tone: string;
    type: string;
    summary: string;
}> {
    const base = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8787";
    const res = await fetch(`${base}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, model: model || undefined })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
        const msg =
            data?.code === "OLLAMA_UNREACHABLE"
                ? "Ollama is not running (or not reachable)."
                : data?.message ?? "Analyze failed.";
        throw new Error(msg);
    }
    return data.meta;
}

export async function reflect(entries: import('./../data/db').Entry[], model?: string | null): Promise<{
    highlights: string[];
    themes: string[];
    note: string;
}> {
    const base = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8787";
    const res = await fetch(`${base}/reflect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries, model: model || undefined })
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
        const msg =
            data?.code === "OLLAMA_UNREACHABLE"
                ? "Ollama is not running (or not reachable)."
                : data?.message ?? "Reflect failed.";
        throw new Error(msg);
    }
    return data.reflection;
}

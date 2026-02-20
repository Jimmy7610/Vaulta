export async function analyze(text: string): Promise<{
    themes: string[];
    tone: string;
    type: string;
    summary: string;
}> {
    const base = import.meta.env.VITE_SERVER_URL ?? "http://localhost:8787";
    const res = await fetch(`${base}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
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

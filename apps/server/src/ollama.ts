type OllamaGenerateResponse = {
    response?: string;
};

export async function checkOllama(baseUrl = "http://localhost:11434"): Promise<{ ok: boolean; message?: string }> {
    try {
        const res = await fetch(`${baseUrl}/api/tags`, { method: "GET" });
        if (!res.ok) return { ok: false, message: `Ollama responded ${res.status}` };
        return { ok: true };
    } catch (e: any) {
        return { ok: false, message: e?.message ?? "Ollama not reachable" };
    }
}

export async function analyzeTextWithOllama(opts: {
    text: string;
    model?: string;
    baseUrl?: string;
}): Promise<{
    themes: string[];
    tone: string;
    type: string;
    summary: string;
}> {
    const baseUrl = opts.baseUrl ?? "http://localhost:11434";
    const model = opts.model ?? "llama3.1:latest";

    const prompt = `
You are a quiet metadata engine for a personal idea vault app.

Given the user's note, produce JSON ONLY with keys:
- themes: array of 3 to 6 short themes (max 3 words each), lowercase
- tone: one of [curious, technical, reflective, playful, urgent, uncertain, confident]
- type: one of [game, app, prompt, story, system, note]
- summary: one sentence, <= 18 words, neutral, no advice

Return STRICT JSON. No markdown. No extra text.

NOTE:
- themes must be helpful for clustering similar notes
- if unsure, choose tone "reflective" and type "note"

USER NOTE:
"""${opts.text}"""
`.trim();

    const res = await fetch(`${baseUrl}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            prompt,
            stream: false
        })
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Ollama generate failed: ${res.status} ${t}`.trim());
    }

    const data = (await res.json()) as OllamaGenerateResponse;
    const raw = (data.response ?? "").trim();

    // Parse strict JSON from response (defensive)
    let parsed: any;
    try {
        parsed = JSON.parse(raw);
    } catch {
        // Attempt to extract first {...}
        const m = raw.match(/\{[\s\S]*\}/);
        if (!m) throw new Error("Ollama returned non-JSON response");
        parsed = JSON.parse(m[0]);
    }

    const themes = Array.isArray(parsed.themes) ? parsed.themes.map(String) : [];
    const tone = typeof parsed.tone === "string" ? parsed.tone : "reflective";
    const type = typeof parsed.type === "string" ? parsed.type : "note";
    const summary = typeof parsed.summary === "string" ? parsed.summary : "";

    return { themes, tone, type, summary };
}

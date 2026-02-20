import express from "express";
import cors from "cors";
import { analyzeTextWithOllama, checkOllama } from "./ollama";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.1:latest";

app.get("/health", async (_req, res) => {
    const ollama = await checkOllama(OLLAMA_BASE_URL);
    res.json({
        ok: true,
        service: "vaulta-server",
        ollama: { ok: ollama.ok, baseUrl: OLLAMA_BASE_URL, message: ollama.message ?? null }
    });
});

app.post("/analyze", async (req, res) => {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) {
        return res.status(400).json({ ok: false, message: "Missing 'text' in request body" });
    }

    // Optional: allow passing model from client
    const model = typeof req.body?.model === "string" ? req.body.model : OLLAMA_MODEL;

    const ollamaStatus = await checkOllama(OLLAMA_BASE_URL);
    if (!ollamaStatus.ok) {
        return res.status(503).json({
            ok: false,
            code: "OLLAMA_UNREACHABLE",
            message: `Ollama not reachable at ${OLLAMA_BASE_URL}`,
            details: ollamaStatus.message ?? null
        });
    }

    try {
        const meta = await analyzeTextWithOllama({ text, model, baseUrl: OLLAMA_BASE_URL });
        return res.json({ ok: true, meta });
    } catch (e: any) {
        return res.status(500).json({
            ok: false,
            code: "ANALYZE_FAILED",
            message: e?.message ?? "Analyze failed"
        });
    }
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Vaulta server running on http://localhost:${port}`);
});

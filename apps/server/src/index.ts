import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "vaulta-server" });
});

// Placeholder endpoint for v0.2 (Ollama bridge)
app.post("/analyze", (_req, res) => {
    res.status(501).json({ ok: false, message: "Not implemented yet (v0.2)" });
});

const port = process.env.PORT ? Number(process.env.PORT) : 8787;
app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Vaulta server running on http://localhost:${port}`);
});

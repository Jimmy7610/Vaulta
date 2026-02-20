import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { cn } from "../lib/cn";
import { useEntriesStore } from "../features/entries/store";
import { analyze, getModels } from "../lib/api";
import { useSettingsStore } from "../features/settings/store";
import { useMemo, useState, useEffect } from "react";

export function EntryDetail() {
    const { entries, selectedId, select, setMeta } = useEntriesStore();
    const { selectedModel, setSelectedModel } = useSettingsStore();
    const entry = useMemo(() => entries.find((e) => e.id === selectedId) ?? null, [entries, selectedId]);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);

    useEffect(() => {
        if (!entry) return;
        let active = true;
        setModelsLoading(true);
        getModels().then(m => {
            if (active) {
                setModels(m);
                setModelsLoading(false);
            }
        });
        return () => { active = false; };
    }, [entry]);

    async function onAnalyze() {
        if (!entry) return;
        setBusy(true);
        setErr(null);
        try {
            const meta = await analyze(entry.text, selectedModel);
            await setMeta(entry.id, meta);
        } catch (e: any) {
            const msg = e?.message ?? "Analyze failed";
            if (msg.includes("model") && msg.includes("not found")) {
                setErr(`Model not installed in Ollama. Pull it first: ollama pull ${selectedModel || 'llama3.1'}`);
            } else {
                setErr(msg);
            }
        } finally {
            setBusy(false);
        }
    }

    return (
        <AnimatePresence>
            {entry && (
                <motion.div className="fixed inset-0 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => select(null)} />

                    <motion.div
                        className={cn(
                            "absolute right-0 top-0 h-full w-[min(560px,92vw)]",
                            "border-l border-neutral-900 bg-neutral-950 shadow-2xl"
                        )}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    >
                        <div className="flex items-start justify-between gap-3 border-b border-neutral-900 px-5 py-4">
                            <div className="min-w-0">
                                <div className="text-xs text-neutral-500">Entry</div>
                                <div className="mt-1 truncate text-lg font-semibold tracking-tight">Fragment detail</div>
                            </div>
                            <button
                                onClick={() => select(null)}
                                className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-2 hover:bg-neutral-900"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="flex h-[calc(100%-60px)] flex-col gap-4 overflow-auto px-5 py-5">
                            <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
                                <div className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-200">{entry.text}</div>
                                <div className="mt-3 text-xs text-neutral-600">{new Date(entry.createdAt).toLocaleString()}</div>
                            </div>

                            <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold">Analysis</div>
                                        <div className="mt-1 text-xs text-neutral-500">Local Ollama metadata. Quiet, not chatty.</div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-xs">
                                            {modelsLoading ? (
                                                <span className="text-neutral-500">Loading models…</span>
                                            ) : models.length === 0 ? (
                                                <span className="text-red-400">No models found. Run: ollama pull llama3.2</span>
                                            ) : (
                                                <select
                                                    className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 outline-none focus:border-neutral-500"
                                                    value={selectedModel || (models.length > 0 ? models[0] : "")}
                                                    onChange={(e) => setSelectedModel(e.target.value)}
                                                >
                                                    {models.map(m => <option key={m} value={m}>{m}</option>)}
                                                </select>
                                            )}
                                        </div>
                                        <button
                                            onClick={onAnalyze}
                                            disabled={busy || (!modelsLoading && models.length === 0)}
                                            className={cn(
                                                "flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold",
                                                (busy || (!modelsLoading && models.length === 0)) ? "bg-neutral-800 text-neutral-500" : "bg-neutral-100 text-neutral-950 hover:opacity-90"
                                            )}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            {busy ? "Analyzing…" : "Analyze"}
                                        </button>
                                    </div>
                                </div>

                                {err && <div className="mt-3 rounded-xl border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">{err}</div>}

                                {entry.meta ? (
                                    <div className="mt-4 space-y-3">
                                        <div className="flex flex-wrap gap-2">
                                            {entry.meta.themes.map((t) => (
                                                <span key={t} className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2.5 py-1 text-xs text-neutral-200">
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs text-neutral-400">
                                            <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-2">
                                                <div className="text-neutral-600">tone</div>
                                                <div className="mt-0.5 text-neutral-200">{entry.meta.tone}</div>
                                            </div>
                                            <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-2">
                                                <div className="text-neutral-600">type</div>
                                                <div className="mt-0.5 text-neutral-200">{entry.meta.type}</div>
                                            </div>
                                            <div className="rounded-xl border border-neutral-900 bg-neutral-950 p-2">
                                                <div className="text-neutral-600">summary</div>
                                                <div className="mt-0.5 truncate text-neutral-200">{entry.meta.summary}</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-3 text-sm text-neutral-500">No metadata yet.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Loader2 } from "lucide-react";
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
    const [success, setSuccess] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [modelsLoading, setModelsLoading] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        if (!entry) return;
        let active = true;
        setModelsLoading(true);
        setIsOffline(false);
        getModels()
            .then(m => {
                if (active) {
                    setModels(m);
                    setModelsLoading(false);
                }
            })
            .catch(() => {
                if (active) {
                    setIsOffline(true);
                    setModelsLoading(false);
                }
            });
        return () => { active = false; };
    }, [entry]);

    async function onAnalyze() {
        if (!entry) return;
        setBusy(true);
        setSuccess(false);
        setErr(null);
        try {
            const meta = await analyze(entry.text, selectedModel);
            await setMeta(entry.id, meta);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
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
                            "border-l border-neutral-900 bg-[var(--bg)] shadow-2xl flex flex-col"
                        )}
                        initial={{ x: 40, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 26 }}
                    >
                        {/* Header */}
                        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-neutral-900/50 bg-neutral-950/30 px-6 py-5 backdrop-blur-sm">
                            <div className="min-w-0">
                                <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">Entry</div>
                                <div className="mt-1 truncate text-lg font-medium tracking-tight text-neutral-100">Fragment detail</div>
                            </div>
                            <button
                                onClick={() => select(null)}
                                className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body scroll */}
                        <div className="flex-1 flex flex-col gap-6 overflow-y-auto p-6 scrollbar-hide">
                            {/* Entry Card */}
                            <div className="rounded-[20px] border border-neutral-900 bg-neutral-950/40 p-5 shadow-sm">
                                <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-neutral-200">{entry.text}</div>
                                <div className="mt-4 text-[11px] font-medium text-neutral-600">{new Date(entry.createdAt).toLocaleString()}</div>
                            </div>

                            {/* Analysis Card */}
                            {isOffline ? (
                                <div className="rounded-[20px] border border-neutral-900/60 bg-neutral-950/40 p-6 text-center shadow-sm">
                                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/50">
                                        <div className="h-4 w-4 rounded-full bg-red-500/80" />
                                    </div>
                                    <h3 className="text-[15px] font-medium text-neutral-200">Local AI offline</h3>
                                    <p className="mt-2 text-[13px] text-neutral-500">
                                        Ensure Ollama is running (`ollama serve`).<br />Vaulta requires a local model to generate metadata.
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-[20px] border border-neutral-900 bg-neutral-950/40 p-1 shadow-sm">
                                    {/* Header / Actions */}
                                    <div className="flex flex-col gap-4 rounded-[16px] bg-neutral-950/80 p-4 lg:flex-row lg:items-center lg:justify-between">
                                        <div>
                                            <div className="text-sm font-medium tracking-tight text-neutral-200">Analysis</div>
                                            <div className="mt-0.5 text-[12px] text-neutral-500">Local intelligence. Quiet, hidden.</div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center">
                                                {modelsLoading ? (
                                                    <span className="text-[12px] text-neutral-500">Loading models…</span>
                                                ) : models.length === 0 ? (
                                                    <span className="text-[12px] text-red-400">No models found. Run: ollama pull llama3.2</span>
                                                ) : (
                                                    <div className="relative flex items-center">
                                                        <select
                                                            className="appearance-none rounded-xl border border-neutral-800 bg-neutral-900/60 py-1.5 pl-3 pr-8 text-[12px] font-medium text-neutral-300 outline-none transition-colors hover:border-neutral-700 focus:border-neutral-500 focus:bg-neutral-900"
                                                            value={selectedModel || (models.length > 0 ? models[0] : "")}
                                                            onChange={(e) => setSelectedModel(e.target.value)}
                                                        >
                                                            {models.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                        <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={onAnalyze}
                                                disabled={busy || (!modelsLoading && models.length === 0) || success}
                                                className={cn(
                                                    "flex items-center gap-2 rounded-xl px-3 py-1.5 text-[13px] font-medium transition-all",
                                                    (busy || success || (!modelsLoading && models.length === 0)) ? "bg-neutral-900 text-neutral-600" : "bg-neutral-100 text-neutral-950 hover:bg-white/90 hover:shadow-sm",
                                                    success && "bg-green-500/10 text-green-400"
                                                )}
                                            >
                                                {success ? <Check className="h-4 w-4" /> : busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                {success ? "Done" : busy ? "Analyzing…" : "Analyze"}
                                            </button>
                                        </div>
                                    </div>

                                    {err && (
                                        <div className="mx-4 mb-4 mt-2 rounded-xl bg-red-950/30 px-3 py-2.5 text-[13px] text-red-200/90 border border-red-900/30">
                                            {err}
                                        </div>
                                    )}

                                    {/* Metadata Display */}
                                    {entry.meta ? (
                                        <div className="px-4 pb-4 pt-2">
                                            {/* Themes Chips */}
                                            <div className="flex flex-wrap gap-1.5 mb-5">
                                                {entry.meta.themes.map((t) => (
                                                    <span key={t} className="rounded-md border border-neutral-800/60 bg-neutral-900/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-neutral-400">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Badges row */}
                                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                                <div className="flex items-center gap-2 rounded-lg bg-neutral-900/30 px-2.5 py-1.5 border border-neutral-800/50">
                                                    <span className="text-[10px] uppercase tracking-wider text-neutral-500">Tone</span>
                                                    <span className="text-[12px] font-medium text-neutral-200">{entry.meta.tone}</span>
                                                </div>
                                                <div className="flex items-center gap-2 rounded-lg bg-neutral-900/30 px-2.5 py-1.5 border border-neutral-800/50">
                                                    <span className="text-[10px] uppercase tracking-wider text-neutral-500">Type</span>
                                                    <span className="text-[12px] font-medium text-neutral-200">{entry.meta.type}</span>
                                                </div>
                                            </div>

                                            {/* Summary Callout */}
                                            <div className="rounded-xl border border-neutral-800/50 bg-neutral-900/20 px-4 py-3">
                                                <div className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 mb-1">Summary</div>
                                                <div className="text-[14px] leading-relaxed text-neutral-300">{entry.meta.summary}</div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="px-4 pb-4 pt-1 text-[13px] text-neutral-500">Analysis pending. Click above to extract metadata.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

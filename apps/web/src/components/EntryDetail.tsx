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
                <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                        <div className="flex shrink-0 items-start justify-between gap-3 px-8 py-8">
                            <div className="min-w-0">
                                <div className="text-[16px] text-neutral-400">Fragment</div>
                            </div>
                            <button
                                onClick={() => select(null)}
                                className="text-neutral-500 transition-colors hover:text-neutral-300"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body scroll */}
                        <div className="flex-1 flex flex-col overflow-y-auto px-8 pb-8 scrollbar-hide">
                            {/* Entry Content */}
                            <div className="mb-8">
                                <div className="whitespace-pre-wrap text-[22px] font-serif leading-[1.4] text-neutral-100">{entry.text}</div>
                                <div className="mt-4 text-[13px] text-neutral-500">
                                    {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date(entry.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                                </div>
                            </div>

                            <hr className="border-neutral-900/60 mb-8" />

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
                                <div className="flex flex-col">
                                    {/* Header / Actions */}
                                    <div className="mb-6">
                                        <div className="text-[16px] text-neutral-300">Analysis</div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="relative flex items-center flex-1">
                                            {modelsLoading ? (
                                                <span className="text-[13px] text-neutral-500">Loading models…</span>
                                            ) : models.length === 0 ? (
                                                <span className="text-[13px] text-red-500/80">Ollama models not found.</span>
                                            ) : (
                                                <div className="relative flex items-center w-full">
                                                    <select
                                                        className="appearance-none w-full rounded-lg border border-neutral-800/60 bg-neutral-900/40 py-2.5 pl-4 pr-8 text-[13px] font-medium text-neutral-300 outline-none transition-colors hover:border-neutral-700 focus:border-neutral-500"
                                                        value={selectedModel || (models.length > 0 ? models[0] : "")}
                                                        onChange={(e) => setSelectedModel(e.target.value)}
                                                    >
                                                        {models.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={onAnalyze}
                                            disabled={busy || (!modelsLoading && models.length === 0) || success}
                                            className={cn(
                                                "flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all shadow-sm",
                                                (busy || success || (!modelsLoading && models.length === 0)) ? "bg-neutral-800/50 text-neutral-500 border border-neutral-800/50" : "bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 border border-neutral-700/50",
                                                success && "bg-neutral-800/80 text-neutral-300"
                                            )}
                                        >
                                            {success ? <Check className="h-4 w-4" /> : busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                            {success ? "Done" : busy ? "Analyzing…" : "Analyze"}
                                        </button>
                                    </div>

                                    {err && (
                                        <div className="mx-4 mb-4 mt-2 rounded-xl bg-red-950/30 px-3 py-2.5 text-[13px] text-red-200/90 border border-red-900/30">
                                            {err}
                                        </div>
                                    )}

                                    {/* Metadata Display */}
                                    {entry.meta && (
                                        <div className="flex flex-col gap-4">
                                            {/* Themes Chips */}
                                            {entry.meta.themes && entry.meta.themes.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {entry.meta.themes.map((t) => (
                                                        <span key={t} className="rounded-full border border-neutral-800 bg-neutral-900/20 px-3 py-1 text-[12px] text-neutral-400">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Tone / Type Box */}
                                            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5 flex flex-col gap-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-medium text-neutral-300 w-12">Tone</span>
                                                    <span className="text-[14px] text-neutral-400">{entry.meta.tone}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[13px] font-medium text-neutral-300 w-12">Type</span>
                                                    <span className="text-[14px] text-neutral-400">{entry.meta.type}</span>
                                                </div>
                                            </div>

                                            {/* Summary Box */}
                                            <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5 mt-2">
                                                <div className="text-[13px] font-medium text-neutral-300 mb-2">Summary</div>
                                                <div className="text-[14px] leading-relaxed text-neutral-400">{entry.meta.summary}</div>
                                            </div>
                                        </div>
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

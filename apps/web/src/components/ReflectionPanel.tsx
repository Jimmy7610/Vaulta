import { useEffect } from "react";
import { Sparkles, Loader2, Sparkle } from "lucide-react";
import { useReflectionStore } from "../features/reflection/store";
import { useEntriesStore } from "../features/entries/store";
import { cn } from "../lib/cn";

export function ReflectionPanel() {
    const { reflection, loading, error, loadLatest, generateReflection } = useReflectionStore();
    const { entries } = useEntriesStore();

    useEffect(() => {
        loadLatest();
    }, [loadLatest]);

    if (entries.length === 0) return null; // No need to reflect on nothing

    const hasReflection = !!reflection;

    // Check if reflection is older than 7 days
    const isStale = hasReflection && reflection
        ? (Date.now() - reflection.createdAt > 7 * 24 * 60 * 60 * 1000)
        : false;

    return (
        <div className="mb-10 w-full max-w-4xl rounded-3xl border border-neutral-900/60 bg-neutral-950/40 p-6 md:p-8">
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <h2 className="text-[18px] font-serif text-neutral-200 flex items-center gap-2">
                        <Sparkle className="h-4 w-4 text-neutral-500" />
                        Weekly Reflection
                    </h2>
                    {hasReflection && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[12px] text-neutral-500">
                                {new Date(reflection.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[12px] text-neutral-600">&bull;</span>
                            <span className="text-[12px] text-neutral-500">{reflection.entryCount} fragments</span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => generateReflection()}
                    disabled={loading}
                    className={cn(
                        "flex items-center gap-2 rounded-xl px-3 py-1.5 text-[12px] font-medium transition-colors border",
                        loading ? "bg-neutral-900 border-neutral-800 text-neutral-600"
                            : "bg-neutral-900/50 border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                    )}
                >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    {loading ? "Reflecting..." : hasReflection ? "Regenerate" : "Generate"}
                </button>
            </div>

            {error ? (
                <div className="rounded-xl border border-red-900/30 bg-red-950/20 px-4 py-3 text-[13px] text-red-200/80">
                    {error}
                </div>
            ) : !hasReflection && !loading ? (
                <div className="text-[14px] text-neutral-500 font-serif italic py-4">
                    No reflection yet. Take a quiet moment to synthesize your recent fragments.
                </div>
            ) : loading ? (
                <div className="py-8 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-5 w-5 text-neutral-500 animate-spin" />
                        <span className="text-[13px] text-neutral-500 animate-pulse">Synthesizing fragments...</span>
                    </div>
                </div>
            ) : hasReflection && reflection && (
                <div className="space-y-6 mt-6">
                    {/* Note */}
                    <div className="rounded-2xl bg-neutral-900/30 p-4 border border-neutral-800/40">
                        <p className="text-[15px] font-serif leading-relaxed text-neutral-300 italic">
                            {reflection.note}
                        </p>
                    </div>

                    {/* Highlights */}
                    <div>
                        <ul className="space-y-2.5">
                            {reflection.highlights.map((h, i) => (
                                <li key={i} className="flex gap-3 text-[14px] text-neutral-300 leading-relaxed font-serif">
                                    <span className="text-neutral-600 mt-1.5 w-1.5 h-1.5 rounded-full bg-neutral-700 shrink-0" />
                                    <span>{h}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Themes */}
                    {reflection.themes && reflection.themes.length > 0 && (
                        <div className="pt-2">
                            <div className="flex flex-wrap gap-2">
                                {reflection.themes.map(t => (
                                    <span key={t} className="rounded-full border border-neutral-800 bg-neutral-900/30 px-3 py-1 text-[12px] font-medium text-neutral-400">
                                        {t.toLowerCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {isStale && (
                        <div className="mt-4 text-[12px] text-neutral-500 flex items-center gap-1.5">
                            A week has passed. You might want to reflect again.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

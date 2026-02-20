import { Plus, Search } from "lucide-react";
import { useUIStore } from "./store";
import { QuickCaptureModal } from "../components/QuickCaptureModal";

export function AppShell() {
    const openQuickCapture = useUIStore((s) => s.openQuickCapture);

    return (
        <div className="min-h-full">
            <header className="sticky top-0 z-10 border-b border-neutral-900 bg-neutral-950/70 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
                    <div className="flex items-baseline gap-3">
                        <div className="text-xl font-semibold tracking-tight">Vaulta</div>
                        <div className="text-xs text-neutral-500">A calm place for unfinished thoughts.</div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            className="hidden items-center gap-2 rounded-2xl border border-neutral-800 bg-neutral-900/30 px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-900 md:flex"
                            aria-label="Search (coming soon)"
                        >
                            <Search className="h-4 w-4" />
                            Search
                        </button>

                        <button
                            onClick={openQuickCapture}
                            className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90"
                        >
                            <Plus className="h-4 w-4" />
                            Capture
                        </button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-5 py-8">
                <div className="mb-6">
                    <div className="text-sm text-neutral-400">Vault</div>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">Fragments, safely held.</h1>
                    <p className="mt-2 max-w-2xl text-neutral-400">
                        Vaulta is local-first. You capture quickly; the system connects the dots later.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div
                            key={i}
                            className="rounded-2xl border border-neutral-900 bg-neutral-950 p-5 shadow-sm hover:border-neutral-800"
                        >
                            <div className="text-xs text-neutral-500">Unfiled</div>
                            <div className="mt-2 line-clamp-3 text-base leading-relaxed text-neutral-200">
                                Placeholder fragment #{i + 1}. In v0.2 these become real entries stored locally.
                            </div>
                            <div className="mt-4 text-xs text-neutral-600">Today</div>
                        </div>
                    ))}
                </div>
            </main>

            <QuickCaptureModal />
        </div>
    );
}

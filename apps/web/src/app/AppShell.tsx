import { Plus, Search } from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "./store";
import { QuickCaptureModal } from "../components/QuickCaptureModal";
import { useEntriesStore } from "../features/entries/store";
import { EntryDetail } from "../components/EntryDetail";
import { cn } from "../lib/cn";

function snippet(text: string) {
  const s = text.trim().replace(/\s+/g, " ");
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}

export function AppShell() {
  const openQuickCapture = useUIStore((s) => s.openQuickCapture);
  const { entries, load, select, loading, error } = useEntriesStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-5">
          <div className="flex items-baseline gap-3">
            <div className="text-[20px] font-medium tracking-tight text-neutral-100">Vaulta</div>
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

      <main className="mx-auto max-w-[1000px] px-6 py-10">
        <div className="mb-10">
          <div className="text-[13px] font-medium tracking-wide text-neutral-500 uppercase">Vault</div>
          <h1 className="mt-2 text-neutral-100">Fragments, safely held.</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-400">
            Vaulta is local-first. You capture quickly; the system connects the dots later.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-sm text-neutral-500">Loading…</div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-6">
            <div className="text-sm text-neutral-400">No entries yet.</div>
            <div className="mt-2 text-neutral-500">
              Hit <span className="text-neutral-200">Capture</span> and drop the first fragment.
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((e) => (
              <button
                key={e.id}
                onClick={() => select(e.id)}
                className={cn(
                  "group relative flex flex-col items-start text-left w-full h-full",
                  "rounded-[20px] border border-neutral-900/60 bg-neutral-950/40 p-5",
                  "shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-800 hover:shadow-md hover:shadow-black/40 hover:bg-neutral-900/40"
                )}
              >
                <div className="flex w-full items-center justify-between mb-3">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-neutral-500">{e.meta?.type ?? "unfiled"}</div>
                  <div className="text-[10px] font-medium text-neutral-600">{new Date(e.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="mb-2 line-clamp-4 text-[14px] leading-relaxed text-neutral-300 transition-colors group-hover:text-neutral-100">
                  {snippet(e.text)}
                </div>

                <div className="mt-auto pt-4 flex flex-wrap gap-1.5 self-start">
                  {(e.meta?.themes ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="rounded-md border border-neutral-800/60 bg-neutral-900/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      {t}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <QuickCaptureModal />
      <EntryDetail />
    </div>
  );
}

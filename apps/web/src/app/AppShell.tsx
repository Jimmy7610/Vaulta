import { Plus, Search } from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "./store";
import { QuickCaptureModal } from "../components/QuickCaptureModal";
import { useEntriesStore } from "../features/entries/store";
import { EntryDetail } from "../components/EntryDetail";

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
                className="text-left rounded-2xl border border-neutral-900 bg-neutral-950 p-5 shadow-sm hover:border-neutral-800"
              >
                <div className="text-xs text-neutral-500">{e.meta?.type ?? "unfiled"}</div>
                <div className="mt-2 line-clamp-3 text-base leading-relaxed text-neutral-200">{snippet(e.text)}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(e.meta?.themes ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full border border-neutral-800 bg-neutral-900/40 px-2 py-0.5 text-[11px] text-neutral-300">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-4 text-xs text-neutral-600">{new Date(e.createdAt).toLocaleDateString()}</div>
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

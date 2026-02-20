import { Search, Video, MoreHorizontal, Menu } from "lucide-react";
import { useEffect } from "react";
import { useUIStore } from "./store";
import { QuickCaptureModal } from "../components/QuickCaptureModal";
import { useEntriesStore } from "../features/entries/store";
import { EntryDetail } from "../components/EntryDetail";
import { Toast } from "../components/Toast";
import { cn } from "../lib/cn";

function snippet(text: string) {
  const s = text.trim().replace(/\s+/g, " ");
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}

export function AppShell() {
  const openQuickCapture = useUIStore((s) => s.openQuickCapture);
  const closeQuickCapture = useUIStore((s) => s.closeQuickCapture);
  const { entries, load, select, loading, error, selectedId } = useEntriesStore();

  useEffect(() => {
    load();
  }, [load]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        openQuickCapture();
      } else if (e.key === "Escape") {
        closeQuickCapture();
        if (selectedId) select(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openQuickCapture, closeQuickCapture, selectedId, select]);

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-10 border-b border-neutral-900 bg-[var(--bg)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-5">
          <div className="flex items-center gap-4">
            <button className="text-neutral-400 hover:text-neutral-200 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
            <div className="text-[22px] font-medium tracking-tight text-neutral-100 font-serif">Vaulta</div>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="hidden items-center text-neutral-400 hover:text-neutral-200 transition-colors md:flex"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              className="hidden items-center text-neutral-400 hover:text-neutral-200 transition-colors md:flex"
              aria-label="Video"
            >
              <Video className="h-5 w-5" />
            </button>

            <button
              onClick={openQuickCapture}
              className="flex items-center gap-2 rounded-lg bg-neutral-800/80 px-4 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition-colors ml-2"
            >
              Capture
            </button>

            <button className="text-neutral-500 hover:text-neutral-400 ml-2">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-12">
        <div className="mb-12">
          <h1 className="text-[42px] leading-tight text-neutral-100 font-serif">Fragments, safely held.</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-400 font-serif italic">
            Vaulta is local-first. You capture quickly, the system connects the dots later.
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                <div className="flex w-full items-start justify-between mb-4">
                  <div className="rounded-md bg-neutral-800/50 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                    {e.meta?.type ?? "unfiled"}
                  </div>
                  <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                </div>

                <div className="mb-5 line-clamp-3 text-[18px] leading-[1.4] text-neutral-200 font-serif">
                  {snippet(e.text)}
                </div>

                <div className="mt-auto pt-2 w-full">
                  {e.meta?.themes && e.meta.themes.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {e.meta.themes.slice(0, 3).map((t) => (
                        <span key={t} className="rounded-full border border-neutral-800 bg-neutral-900/20 px-2.5 py-0.5 text-[11px] font-medium text-neutral-500">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[11px] font-medium text-neutral-600">
                    {new Date(e.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <QuickCaptureModal />
      <EntryDetail />
      <Toast />
    </div>
  );
}

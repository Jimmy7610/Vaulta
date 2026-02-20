import { Search, PenLine, Sparkles, MoreHorizontal, FileText, Check, Trash2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useUIStore } from "./store";
import { QuickCaptureModal } from "../components/QuickCaptureModal";
import { useEntriesStore, useFilteredEntries } from "../features/entries/store";
import { EntryDetail } from "../components/EntryDetail";
import { ReflectionPanel } from "../components/ReflectionPanel";
import { Toast } from "../components/Toast";
import { cn } from "../lib/cn";
import { ConfirmDialog } from "../components/ConfirmDialog";

function snippet(text: string) {
  const s = text.trim().replace(/\s+/g, " ");
  return s.length > 120 ? s.slice(0, 120) + "…" : s;
}

export function AppShell() {
  const openQuickCapture = useUIStore((s) => s.openQuickCapture);
  const closeQuickCapture = useUIStore((s) => s.closeQuickCapture);
  const {
    entries, load, select, loading, error, selectedId,
    searchQuery, setSearchQuery,
    typeFilter, setTypeFilter,
    themeFilter, setThemeFilter,
    dateFilter, setDateFilter,
    clearFilters,
    remove
  } = useEntriesStore();

  const filteredEntries = useFilteredEntries();

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    entries.forEach(e => types.add(e.meta?.type ?? "unfiled"));
    return Array.from(types).sort();
  }, [entries]);

  const availableThemes = useMemo(() => {
    const themes = new Set<string>();
    entries.forEach(e => e.meta?.themes?.forEach(t => themes.add(t)));
    return Array.from(themes).sort();
  }, [entries]);

  useEffect(() => {
    load();
  }, [load]);

  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // Sync to URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q"); if (q) setSearchQuery(q);
    const types = params.getAll("type"); if (types.length) setTypeFilter(types);
    const themes = params.getAll("theme"); if (themes.length) setThemeFilter(themes);
    const df = params.get("date") as any; if (df) setDateFilter(df);
  }, []); // eslint-disable-line

  // Sync back to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    typeFilter.forEach(t => params.append("type", t));
    themeFilter.forEach(t => params.append("theme", t));
    if (dateFilter !== "any") params.set("date", dateFilter);

    const qs = params.toString();
    const url = qs ? `? ${qs} ` : window.location.pathname;
    window.history.replaceState({}, "", url);
  }, [searchQuery, typeFilter, themeFilter, dateFilter]);

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
            <div className="text-[22px] font-medium tracking-tight text-neutral-100 font-serif flex items-center gap-3">
              Vaulta
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={openQuickCapture}
              className="flex items-center gap-2 rounded-lg bg-neutral-800/80 px-4 py-1.5 text-sm font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              Capture
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-6 py-12">
        <div className="mb-12">
          <h1 className="text-[42px] leading-tight text-neutral-100 font-serif">Fragments, safely held.</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-neutral-400 font-serif italic mb-8">
            Vaulta is local-first. You capture quickly, the system connects the dots later.
          </p>

          {/* Search + Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full max-w-4xl">
            <div className="relative flex-1 min-w-[240px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search fragments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-800/80 bg-neutral-900/40 py-2 pl-9 pr-4 text-[14px] text-neutral-200 outline-none transition-colors placeholder:text-neutral-600 focus:border-neutral-600 focus:bg-neutral-900"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full sm:w-auto">
              <select
                className="appearance-none rounded-lg border border-neutral-800/80 bg-neutral-900/40 px-3 py-2 text-[13px] font-medium text-neutral-300 outline-none hover:bg-neutral-800"
                value={typeFilter.length ? typeFilter[0] : ""}
                onChange={(e) => setTypeFilter(e.target.value ? [e.target.value] : [])}
              >
                <option value="">All Types</option>
                {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                className="appearance-none rounded-lg border border-neutral-800/80 bg-neutral-900/40 px-3 py-2 text-[13px] font-medium text-neutral-300 outline-none hover:bg-neutral-800"
                value={themeFilter.length ? themeFilter[0] : ""}
                onChange={(e) => setThemeFilter(e.target.value ? [e.target.value] : [])}
              >
                <option value="">All Themes</option>
                {availableThemes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                className="appearance-none rounded-lg border border-neutral-800/80 bg-neutral-900/40 px-3 py-2 text-[13px] font-medium text-neutral-300 outline-none hover:bg-neutral-800"
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
              >
                <option value="any">Any Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="year">This year</option>
              </select>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchQuery || typeFilter.length > 0 || themeFilter.length > 0 || dateFilter !== "any") && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-[13px] text-neutral-500">
                Found {filteredEntries.length} {filteredEntries.length === 1 ? 'result' : 'results'}
              </div>
              <button
                onClick={clearFilters}
                className="text-[13px] font-medium text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <ReflectionPanel />

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
        ) : filteredEntries.length === 0 ? (
          <div className="rounded-2xl border border-neutral-900 bg-neutral-950 p-8 text-center max-w-2xl mx-auto">
            <div className="text-[15px] text-neutral-400 mb-4">No fragments match your current search and filters.</div>
            <button
              onClick={clearFilters}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-[13px] font-medium text-neutral-200 hover:bg-neutral-700 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEntries.map((e) => (
              <div key={e.id} className="relative w-full h-full">
                <button
                  onClick={() => select(e.id)}
                  className={cn(
                    "group relative flex flex-col items-start text-left w-full h-full cursor-pointer",
                    "rounded-[20px] border border-neutral-900/60 bg-neutral-950/40 p-5",
                    "shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-neutral-800 hover:shadow-lg hover:shadow-black/60 hover:bg-neutral-900/40"
                  )}
                >
                  <div className="flex w-full items-start justify-between mb-4">
                    <div className="rounded-md bg-neutral-800/50 px-2 py-0.5 text-[11px] font-medium text-neutral-400">
                      {e.meta?.type ?? "unfiled"}
                    </div>
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

                {/* Kebab Menu Trigger */}
                <div className="absolute top-5 right-5 z-10">
                  <button
                    onClick={(evt) => {
                      evt.stopPropagation();
                      setMenuOpenId(menuOpenId === e.id ? null : e.id);
                    }}
                    className="p-1 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/80 transition-colors"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>

                  {/* Dropdown Panel */}
                  {menuOpenId === e.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={(evt) => {
                          evt.stopPropagation();
                          setMenuOpenId(null);
                        }}
                      />
                      <div className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-neutral-800 bg-neutral-900/95 py-1.5 shadow-xl backdrop-blur-md">
                        <button
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setMenuOpenId(null);
                            setEntryToDelete(e.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-red-400/90 transition-colors hover:bg-neutral-800/60 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <QuickCaptureModal />

      <ConfirmDialog
        isOpen={!!entryToDelete}
        title="Delete fragment?"
        description="This will permanently drop it from this device. Once deleted, this local operation cannot be reversed."
        confirmText="Delete permanently"
        onConfirm={() => {
          if (entryToDelete) remove(entryToDelete);
          setEntryToDelete(null);
        }}
        onCancel={() => setEntryToDelete(null)}
      />

      <EntryDetail />
      <Toast />
    </div>
  );
}

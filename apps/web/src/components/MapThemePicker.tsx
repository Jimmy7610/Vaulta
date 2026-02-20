import { useState, useRef, useEffect, useMemo } from "react";
import { Filter, ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../lib/cn";
import { useEntriesStore, useFilteredEntries } from "../features/entries/store";
import { getThemeCounts } from "../features/entries/graph";

export function MapThemePicker() {
    const { mapTheme, setMapTheme, showUnclustered } = useEntriesStore();
    const entries = useFilteredEntries();
    const [isOpen, setIsOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [search, setSearch] = useState("");
    const popoverRef = useRef<HTMLDivElement>(null);

    // Derive theme frequencies based on currently filtered entries
    // If showUnclustered is false, the graph only uses entries with themes anyway
    const themeCounts = useMemo(() => {
        let activeEntries = entries;
        if (!showUnclustered) {
            activeEntries = activeEntries.filter((e) => e.meta?.themes && e.meta.themes.length > 0);
        }
        return getThemeCounts(activeEntries);
    }, [entries, showUnclustered]);

    const topThemes = useMemo(() => themeCounts.slice(0, 8), [themeCounts]);
    const displayThemes = showAll
        ? themeCounts.filter((t: { theme: string; count: number }) => t.theme.toLowerCase().includes(search.toLowerCase()))
        : topThemes;

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setShowAll(false);
                setSearch("");
            }
        };
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (theme: string) => {
        setMapTheme(theme);
        setIsOpen(false);
        setShowAll(false);
        setSearch("");
    };

    return (
        <div className="relative" ref={popoverRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] font-medium transition-colors outline-none",
                    isOpen || mapTheme ? "bg-neutral-800 text-neutral-100" : "bg-transparent text-neutral-300 hover:text-neutral-200"
                )}
            >
                <Filter className="h-3.5 w-3.5 text-neutral-500" />
                <span className="truncate max-w-[140px]">{mapTheme || "All Map Themes"}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-500 transition-transform", isOpen && "rotate-180")} />
            </button>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-[240px] rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur shadow-xl overflow-hidden z-[50]">
                    {!showAll ? (
                        <div className="flex flex-col py-1">
                            {/* Top Themes */}
                            <div className="px-3 py-2 text-[11px] font-medium tracking-wider text-neutral-500 uppercase">
                                Top Themes
                            </div>
                            <button
                                onClick={() => handleSelect("")}
                                className="flex items-center justify-between px-3 py-2 text-[13px] text-neutral-300 hover:bg-neutral-800/80 transition-colors w-full text-left"
                            >
                                <span>All Themes</span>
                                {!mapTheme && <Check className="h-3.5 w-3.5 text-neutral-400" />}
                            </button>

                            {topThemes.map((t: { theme: string; count: number }) => (
                                <button
                                    key={t.theme}
                                    onClick={() => handleSelect(t.theme)}
                                    className="flex items-center justify-between px-3 py-2 text-[13px] text-neutral-300 hover:bg-neutral-800/80 transition-colors w-full text-left"
                                >
                                    <span className="truncate pr-4">{t.theme} <span className="text-neutral-600 text-[11px] ml-1">({t.count})</span></span>
                                    {mapTheme === t.theme && <Check className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                                </button>
                            ))}

                            {/* More Toggle */}
                            {themeCounts.length > 8 && (
                                <>
                                    <div className="h-px bg-neutral-800 my-1"></div>
                                    <button
                                        onClick={() => setShowAll(true)}
                                        className="flex justify-center items-center px-3 py-2 text-[12px] text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 transition-colors w-full"
                                    >
                                        More themes...
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col max-h-[300px]">
                            {/* Search Bar */}
                            <div className="sticky top-0 bg-neutral-900/95 p-2 border-b border-neutral-800 shrink-0 z-10">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                                    <input
                                        type="text"
                                        autoFocus
                                        placeholder="Search themes..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full rounded-md border border-neutral-800 bg-neutral-950 py-1.5 pl-8 pr-2 text-[13px] text-neutral-200 outline-none placeholder:text-neutral-600 focus:border-neutral-600"
                                    />
                                </div>
                            </div>
                            {/* Scrollable Theme List */}
                            <div className="overflow-y-auto flex-1 py-1 scrollbar-hide">
                                <button
                                    onClick={() => handleSelect("")}
                                    className="flex items-center justify-between px-3 py-2 text-[13px] text-neutral-300 hover:bg-neutral-800/80 transition-colors w-full text-left"
                                >
                                    <span>All Themes</span>
                                    {!mapTheme && <Check className="h-3.5 w-3.5 text-neutral-400" />}
                                </button>
                                {displayThemes.length === 0 ? (
                                    <div className="px-3 py-4 text-center text-[12px] text-neutral-500">No themes found.</div>
                                ) : (
                                    displayThemes.map((t: { theme: string; count: number }) => (
                                        <button
                                            key={t.theme}
                                            onClick={() => handleSelect(t.theme)}
                                            className="flex items-center justify-between px-3 py-2 text-[13px] text-neutral-300 hover:bg-neutral-800/80 transition-colors w-full text-left"
                                        >
                                            <span className="truncate pr-4">{t.theme} <span className="text-neutral-600 text-[11px] ml-1">({t.count})</span></span>
                                            {mapTheme === t.theme && <Check className="h-3.5 w-3.5 text-neutral-400 shrink-0" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useEntriesStore, useFilteredEntries } from "../features/entries/store";
import { buildGraph } from "../features/entries/graph";
import { cn } from "../lib/cn";
import { Zap, LayoutGrid } from "lucide-react";
import { MapThemePicker } from "./MapThemePicker";

export function ConnectionsMap() {
    const { select, mapTheme, focusMode, setFocusMode, showUnclustered, setShowUnclustered } = useEntriesStore();
    const entries = useFilteredEntries();

    const graphRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [hoverNode, setHoverNode] = useState<any>(null);

    // Derive graph nodes and links locally from filtered entries + map filter toggles
    const graphData = useMemo(() => {
        let activeEntries = [...entries];
        if (mapTheme) {
            activeEntries = activeEntries.filter(e => e.meta?.themes?.includes(mapTheme));
        }
        if (!showUnclustered) {
            activeEntries = activeEntries.filter(e => e.meta?.themes && e.meta.themes.length > 0);
        }
        return buildGraph(activeEntries);
    }, [entries, mapTheme, showUnclustered]);

    // Calculate neighbors for focus mode
    const highlightNodes = useMemo(() => new Set<string>(), []);
    const highlightLinks = useMemo(() => new Set<any>(), []);

    useEffect(() => {
        highlightNodes.clear();
        highlightLinks.clear();
        if (hoverNode && focusMode) {
            highlightNodes.add(hoverNode.id);
            graphData.links.forEach((link: any) => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;

                if (sourceId === hoverNode.id || targetId === hoverNode.id) {
                    highlightLinks.add(link);
                    highlightNodes.add(sourceId);
                    highlightNodes.add(targetId);
                }
            });
        }
    }, [hoverNode, focusMode, graphData]);

    // Resize Observer for dynamic fit
    useEffect(() => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
                }
            }
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Re-center graph on load OR theme change
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            graphRef.current.d3Force('charge')?.strength(-160); // slightly stronger repulsion to space out larger nodes
            setTimeout(() => {
                if (graphRef.current) graphRef.current.zoomToFit(600, 80);
            }, 50); // small delay ensures nodes are somewhat settled before zoom calc
        }
    }, [graphData, mapTheme]);

    if (graphData.nodes.length < 2 || graphData.links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto border border-neutral-900/60 rounded-3xl bg-neutral-950/40 mt-12">
                <div className="text-[15px] text-neutral-300 font-serif italic mb-2">
                    No connections yet.
                </div>
                <div className="text-[13px] text-neutral-500">
                    Analyze a few fragments to reveal shared themes.
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full h-full relative group flex flex-col items-center">

            {/* Subtle Context Label */}
            <div className="absolute top-10 pointer-events-none z-0 flex flex-col items-center opacity-40">
                <div className="text-[20px] font-serif text-neutral-300">Connections Map</div>
                <div className="text-[12px] italic font-serif text-neutral-500 mt-1 tracking-wide">Fragments linked by shared themes.</div>
            </div>

            {/* Minimal Map UI Controls */}
            <div className="absolute top-4 z-10 flex items-center gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/80 backdrop-blur-md px-4 py-2 shadow-sm transition-opacity opacity-100 md:group-hover:opacity-100">

                <MapThemePicker />

                <div className="w-px h-4 bg-neutral-800"></div>

                <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[13px] font-medium transition-colors",
                        focusMode ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:text-neutral-200"
                    )}
                >
                    <Zap className={cn("h-3.5 w-3.5", focusMode && "text-yellow-500/80 fill-yellow-500/20")} />
                    Focus
                </button>

                <div className="w-px h-4 bg-neutral-800"></div>

                <button
                    onClick={() => setShowUnclustered(!showUnclustered)}
                    className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded-md text-[13px] font-medium transition-colors",
                        showUnclustered ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:text-neutral-200"
                    )}
                >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Unclustered
                </button>
            </div>

            {dimensions.width > 0 && dimensions.height > 0 && (
                <ForceGraph2D
                    width={dimensions.width}
                    height={dimensions.height}
                    ref={graphRef}
                    graphData={graphData}
                    nodeRelSize={4}
                    nodeVal={(n: any) => n.val}
                    nodeColor={(node: any) => {
                        if (focusMode && hoverNode && !highlightNodes.has(node.id)) return "rgba(82,82,82,0.15)";
                        return "#737373"; // brighter base node color (neutral-500)
                    }}
                    linkColor={(link: any) => {
                        if (focusMode && hoverNode && !highlightLinks.has(link)) return "rgba(38,38,38,0.15)";
                        if (hoverNode && highlightLinks.has(link)) return "rgba(163,163,163,0.7)"; // highlighted link color
                        return "rgba(64,64,64,0.5)"; // brighter standard link wireframe
                    }}
                    linkWidth={(l: any) => Math.min(4, 0.8 + l.value * 0.6)} // slightly thicker
                    onNodeHover={(n: any) => setHoverNode(n || null)}
                    onNodeClick={(n: any) => select(n.id)}
                    nodeLabel={(n: any) => `<div style="padding:4px; border-radius:4px; max-width:260px; word-wrap:break-word; font-family:'Playfair Display',serif; font-size:13px; color:#e5e5e5; background:rgba(10,10,10,0.9); border:1px solid rgba(38,38,38,0.8);">${n.label}<br/><div style="margin-top:6px;font-size:11px;color:#737373">${n.themes.join(' • ')}</div></div>`}
                    nodePointerAreaPaint={(node, color, ctx) => {
                        ctx.fillStyle = color;
                        const bckgDimensions = [ctx.measureText(node.label as string).width, 12].map(n => n + 12 * 0.2); // match render
                        ctx.fillRect(
                            (node.x as number) - bckgDimensions[0] / 2,
                            (node.y as number) - bckgDimensions[1] / 2 + 8,
                            bckgDimensions[0],
                            bckgDimensions[1]
                        );
                        ctx.beginPath();
                        ctx.arc(node.x as number, node.y as number, 6, 0, 2 * Math.PI, false);
                        ctx.fill();
                    }}
                    nodeCanvasObject={(node: any, ctx, globalScale) => {
                        // Alpha dimming
                        const isDimmed = focusMode && hoverNode && !highlightNodes.has(node.id);
                        ctx.globalAlpha = isDimmed ? 0.15 : 1.0;
                        const label = node.label;
                        const fontSize = 12 / globalScale;
                        ctx.font = `${fontSize}px "Playfair Display", serif`;
                        const textWidth = ctx.measureText(label).width;
                        const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

                        ctx.fillStyle = "rgba(10, 10, 10, 0.8)";
                        ctx.fillRect(
                            node.x - bckgDimensions[0] / 2,
                            node.y - bckgDimensions[1] / 2 + 8, // offset slightly below node
                            bckgDimensions[0],
                            bckgDimensions[1]
                        );

                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = '#a3a3a3'; // neutral-400 equivalent
                        ctx.fillText(label, node.x, node.y + 8);

                        // Subtle Glow
                        if (!isDimmed) {
                            ctx.shadowColor = "rgba(163,163,163,0.15)";
                            ctx.shadowBlur = 10;
                        }

                        // Node dot itself
                        ctx.beginPath();
                        ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI, false);
                        ctx.fillStyle = isDimmed ? "rgba(82, 82, 82, 0.4)" : "#737373";
                        ctx.fill();

                        // Reset context properties
                        ctx.shadowBlur = 0;
                        ctx.globalAlpha = 1.0;
                    }}
                />
            )}
        </div>
    );
}

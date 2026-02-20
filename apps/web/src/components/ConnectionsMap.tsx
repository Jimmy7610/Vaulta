import { useEffect, useMemo, useRef } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useEntriesStore, useFilteredEntries } from "../features/entries/store";
import { buildGraph } from "../features/entries/graph";

export function ConnectionsMap() {
    const { select } = useEntriesStore();
    const entries = useFilteredEntries();

    const graphRef = useRef<any>(null);

    // Derive graph nodes and links locally from filtered entries
    const graphData = useMemo(() => {
        return buildGraph(entries);
    }, [entries]);

    // Re-center graph on load
    useEffect(() => {
        if (graphRef.current && graphData.nodes.length > 0) {
            graphRef.current.d3Force('charge')?.strength(-120);
            graphRef.current.zoomToFit(400, 50);
        }
    }, [graphData]);

    if (graphData.nodes.length < 2 || graphData.links.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center max-w-lg mx-auto border border-neutral-900/60 rounded-3xl bg-neutral-950/40">
                <div className="text-[15px] text-neutral-300 font-serif italic mb-3">
                    No connections yet.
                </div>
                <div className="text-[13px] text-neutral-500">
                    Analyze a few more fragments to generate themes and reveal the hidden structure of your vault.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-[600px] border border-neutral-900/60 bg-neutral-950/20 rounded-3xl overflow-hidden relative">
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeRelSize={4}
                nodeVal={(n: any) => n.val}
                nodeColor={() => "#525252"} // subtle dark gray node color
                linkColor={() => "#262626"} // extremely subtle dark wireframe link
                linkWidth={(l: any) => Math.min(3, 0.5 + l.value * 0.5)}
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
                    ctx.arc(node.x as number, node.y as number, 4, 0, 2 * Math.PI, false);
                    ctx.fill();
                }}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
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

                    // Node dot itself
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
                    ctx.fillStyle = "#525252";
                    ctx.fill();
                }}
            />
        </div>
    );
}

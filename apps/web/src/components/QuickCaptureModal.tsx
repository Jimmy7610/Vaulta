import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../app/store";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useEffect, useRef } from "react";

export function QuickCaptureModal() {
    const open = useUIStore((s) => s.quickCaptureOpen);
    const close = useUIStore((s) => s.closeQuickCapture);
    const ref = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
        if (open) setTimeout(() => ref.current?.focus(), 50);
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={close}
                    />
                    <motion.div
                        className={cn(
                            "absolute left-1/2 top-1/2 w-[min(720px,92vw)] -translate-x-1/2 -translate-y-1/2",
                            "rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl"
                        )}
                        initial={{ y: 16, scale: 0.98, opacity: 0 }}
                        animate={{ y: 0, scale: 1, opacity: 1 }}
                        exit={{ y: 16, scale: 0.98, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                        <div className="flex items-center justify-between px-5 py-4">
                            <div className="space-y-1">
                                <div className="text-sm text-neutral-400">Quick Capture</div>
                                <div className="text-lg font-semibold tracking-tight">Drop the fragment.</div>
                            </div>
                            <button
                                onClick={close}
                                className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-2 hover:bg-neutral-900"
                                aria-label="Close"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="px-5 pb-5">
                            <textarea
                                ref={ref}
                                placeholder="Write anything… a game mechanic, a prompt idea, a sentence, a weird thought."
                                className={cn(
                                    "min-h-[180px] w-full resize-none rounded-2xl",
                                    "border border-neutral-800 bg-neutral-950 px-4 py-4",
                                    "text-base leading-relaxed outline-none",
                                    "placeholder:text-neutral-600 focus:border-neutral-600"
                                )}
                            />
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-neutral-500">
                                    Enter saves (wired in v0.2). Esc closes.
                                </div>
                                <button
                                    className="rounded-2xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-950 hover:opacity-90"
                                    onClick={close}
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

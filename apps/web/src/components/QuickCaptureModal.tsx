import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../app/store";
import { useEntriesStore } from "../features/entries/store";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { useEffect, useRef, useState } from "react";

export function QuickCaptureModal() {
  const open = useUIStore((s) => s.quickCaptureOpen);
  const close = useUIStore((s) => s.closeQuickCapture);
  const showToast = useUIStore((s) => s.showToast);
  const createEntry = useEntriesStore((s) => s.create);
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        close();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close]);

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
              "rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl",
            )}
            initial={{ y: 16, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 16, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
          >
            <div className="flex flex-col items-center justify-center px-10 pt-10 pb-6 text-center">
              <div className="flex w-full justify-between items-start mb-2">
                <div className="flex-1" />
                <div className="text-[13px] text-neutral-400 font-medium tracking-wide flex-1 text-center">Quick Capture</div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={close}
                    className="text-neutral-500 transition-colors hover:text-neutral-300"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-[24px] tracking-tight text-neutral-100 font-medium">
                Drop the fragment. No structure required.
              </div>
            </div>

            <div className="px-10 pb-10">
              <div className="relative">
                <textarea
                  ref={ref}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      const t = text.trim();
                      if (!t) return;
                      await createEntry(t);
                      showToast("Saved fragment");
                      setText("");
                      close();
                    }
                  }}
                  placeholder="Write anything... a game mechanic, a prompt idea,&#10;a sentence, a weird thought."
                  className={cn(
                    "min-h-[160px] w-full resize-none rounded-xl",
                    "border border-neutral-800/60 bg-neutral-900/50 px-5 py-5",
                    "text-[15px] leading-relaxed text-neutral-200 outline-none transition-colors",
                    "placeholder:text-neutral-500 focus:border-neutral-700 focus:bg-neutral-900/80",
                  )}
                />

                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between pointer-events-none">
                  <div className="text-[13px] text-neutral-500 font-medium">
                    Enter saves. &nbsp;Esc closes. &nbsp;Shift+Enter for newline.
                  </div>
                  <button
                    className="pointer-events-auto rounded-lg bg-neutral-800/80 border border-neutral-700/50 px-4 py-1.5 text-[13px] font-medium text-neutral-300 hover:bg-neutral-700 hover:text-neutral-200 transition-colors"
                    onClick={async () => {
                      const t = text.trim();
                      if (t) {
                        await createEntry(t);
                        showToast("Saved fragment");
                        setText("");
                      }
                      close();
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-3 text-[12px] text-neutral-500">
                <div className="flex items-center gap-1.5"><kbd className="rounded bg-neutral-800/60 px-1.5 py-0.5 font-sans border border-neutral-800">C</kbd> to open.</div>
                <div className="flex items-center gap-1.5"><kbd className="rounded bg-neutral-800/60 px-1.5 py-0.5 font-sans border border-neutral-800">Shift</kbd> + <kbd className="rounded bg-neutral-800/60 px-1.5 py-0.5 font-sans border border-neutral-800">Enter</kbd></div>
                <div className="flex items-center gap-1.5"><kbd className="rounded bg-neutral-800/60 px-1.5 py-0.5 font-sans border border-neutral-800">Esc</kbd> to close fragment capture.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { AnimatePresence, motion } from "framer-motion";
import { useUIStore } from "../app/store";

export function Toast() {
    const toastMessage = useUIStore((s) => s.toastMessage);

    return (
        <AnimatePresence>
            {toastMessage && (
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-neutral-800/80 bg-neutral-900/90 px-4 py-2 text-[13px] font-medium text-neutral-200 shadow-xl backdrop-blur-md"
                >
                    {toastMessage}
                </motion.div>
            )}
        </AnimatePresence>
    );
}

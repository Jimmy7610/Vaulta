import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

export type ConfirmDialogProps = {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel
}: ConfirmDialogProps) {

    useEffect(() => {
        if (!isOpen) return;
        const handleDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                onCancel();
            }
        };
        window.addEventListener("keydown", handleDown, { capture: true });
        return () => window.removeEventListener("keydown", handleDown, { capture: true });
    }, [isOpen, onCancel]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-[min(400px,90vw)] overflow-hidden rounded-[20px] border border-neutral-800/80 bg-[var(--bg)] shadow-2xl p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-[18px] font-medium text-neutral-100">{title}</h2>
                            <button
                                onClick={onCancel}
                                className="text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <p className="text-[14px] text-neutral-400 mb-8 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={onCancel}
                                className="px-4 py-2 text-[13px] font-medium text-neutral-300 hover:text-neutral-100 transition-colors bg-neutral-900/40 hover:bg-neutral-800 rounded-lg"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className="px-4 py-2 text-[13px] font-medium text-red-400 hover:text-red-300 transition-colors bg-red-950/30 hover:bg-red-900/40 border border-red-900/30 rounded-lg"
                            >
                                {confirmText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

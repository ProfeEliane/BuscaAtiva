import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, AlertTriangle, Check, HelpCircle } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-xl border border-line bg-white p-6 shadow-xl z-10"
          >
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-soft hover:bg-paper hover:text-ink transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "info",
}) => {
  const getColorScheme = () => {
    switch (type) {
      case "danger":
        return {
          bg: "bg-limit-bg",
          text: "text-limit",
          border: "border-limit",
          btnBg: "bg-limit hover:bg-limit/90 focus:ring-limit/20",
          icon: AlertTriangle,
        };
      case "warning":
        return {
          bg: "bg-attn-bg",
          text: "text-attn",
          border: "border-attn",
          btnBg: "bg-attn hover:bg-attn/90 focus:ring-attn/20",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-ok-bg",
          text: "text-ok",
          border: "border-ok",
          btnBg: "bg-ink hover:bg-ink/95 focus:ring-ink/20",
          icon: HelpCircle,
        };
    }
  };

  const scheme = getColorScheme();
  const Icon = scheme.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/40 backdrop-blur-xs"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-sm overflow-hidden rounded-xl border border-line bg-white p-5 shadow-xl z-10"
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-full p-2 ${scheme.bg} ${scheme.text}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-ink mb-1">{title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{message}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-line/50">
              <button
                onClick={onClose}
                className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper border border-transparent hover:border-line transition-all duration-200"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white shadow-xs focus:ring-2 focus:outline-hidden transition-all duration-200 ${scheme.btnBg}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from "react";
import { Cursista } from "../types";
import { Modal } from "./Modal";
import { Send, Phone } from "lucide-react";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  cursista: Cursista | null;
  initialText: string;
  title: string;
}

export const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  cursista,
  initialText,
  title,
}) => {
  const [text, setText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setText(initialText);
    }
  }, [isOpen, initialText]);

  if (!cursista) return null;

  // Normalizes Brazilian phone numbers
  const normalizePhone = (raw: string): string => {
    let d = raw.replace(/\D/g, "");
    if (d.startsWith("0")) d = d.slice(1);
    if (d.length <= 11) d = "55" + d;
    return d;
  };

  const phone = normalizePhone(cursista.whatsapp);
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[10px] text-ink mb-1.5">
            Mensagem personalizada
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            className="w-full rounded-2xl border border-line bg-white p-4 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all leading-relaxed resize-y"
          />
        </div>

        <div className="rounded-2xl bg-paper-soft/40 border border-line p-4 flex items-start gap-2.5">
          <Phone className="h-4 w-4 text-ink-soft shrink-0 mt-0.5" />
          <div className="text-xs text-ink-soft">
            <p className="font-bold text-ink">Número de destino:</p>
            <p className="font-mono mt-0.5">+{phone}</p>
            <p className="mt-1 text-[10px] italic">
              Número cadastrado: <span className="font-semibold">{cursista.whatsapp}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-line/50">
          <button
            onClick={onClose}
            className="rounded-full px-4 py-2 text-xs font-semibold text-ink-soft hover:bg-paper-soft transition-all duration-200 cursor-pointer"
          >
            Cancelar
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              // Automatically close modal shortly after opening WhatsApp link
              setTimeout(onClose, 200);
            }}
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-xs px-5 py-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer select-none no-underline uppercase"
          >
            <Send className="h-3.5 w-3.5" />
            Abrir no WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  );
};

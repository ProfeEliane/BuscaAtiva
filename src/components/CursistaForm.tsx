import React, { useState } from "react";
import { Plus, UserPlus } from "lucide-react";

interface CursistaFormProps {
  onAdd: (nome: string, whatsapp: string) => Promise<void>;
  selectedTurmaNome: string;
}

export const CursistaForm: React.FC<CursistaFormProps> = ({ onAdd, selectedTurmaNome }) => {
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeTrimmed = nome.trim();
    const whatsappTrimmed = whatsapp.trim();
    if (!nomeTrimmed || !whatsappTrimmed) return;

    await onAdd(nomeTrimmed, whatsappTrimmed);
    setNome("");
    setWhatsapp("");
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-soft/30 p-6 shadow-xs">
      <h2 className="font-serif text-base font-bold text-ink mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-ink-soft" />
        Adicionar Cursista à {selectedTurmaNome}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Nome completo do cursista"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-ink-soft/65"
            required
          />
          <input
            type="tel"
            placeholder="WhatsApp (DDD + número, ex: 41991234567)"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-xs font-medium text-ink focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-ink-soft/65"
            required
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 rounded-full bg-ink hover:bg-ink/90 active:scale-95 transition-all text-xs font-semibold text-white px-6 py-2.5 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Cadastrar Cursista
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-ink-soft leading-relaxed">
          ℹ️ Não precisa digitar o código do país — o sistema adiciona o <span className="font-semibold text-ink">55 (Brasil)</span> automaticamente. Digite só DDD + número, por exemplo: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-line/45">41991234567</code>.
        </p>
      </form>
    </div>
  );
};

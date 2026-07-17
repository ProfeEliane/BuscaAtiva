import React, { useState } from "react";
import { Templates } from "../types";
import { ChevronDown, ChevronUp, Save, CheckCircle, Info } from "lucide-react";

interface TemplateEditorProps {
  templates: Templates;
  onSave: (newTemplates: Templates) => Promise<void>;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ templates, onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTemplates, setTempTemplates] = useState<Templates>({ ...templates });
  const [isSaved, setIsSaved] = useState(false);

  // Sync state if prop changes (e.g. on CSV import)
  React.useEffect(() => {
    setTempTemplates({ ...templates });
  }, [templates]);

  const handleChange = (key: keyof Templates, value: string) => {
    setTempTemplates((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    await onSave(tempTemplates);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-soft/30 p-6 shadow-xs transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-serif font-bold text-ink group cursor-pointer"
      >
        <span className="text-base flex items-center gap-2">
          Editar textos de busca ativa <span className="text-xs font-sans font-semibold text-ink-soft bg-white/60 border border-line px-3 py-0.5 rounded-full">(5 Modelos)</span>
        </span>
        <div className="rounded-full p-1 group-hover:bg-paper-soft transition-colors text-ink-soft">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-line/60 space-y-4">
          <div className="rounded-2xl bg-white/70 p-4 border border-line flex items-start gap-2.5 text-xs text-ink-soft leading-relaxed">
            <Info className="h-4 w-4 text-attn shrink-0 mt-0.5" />
            <div>
              Use <code className="font-mono bg-paper px-1.5 py-0.5 rounded text-ink font-semibold">{"{nome}"}</code>,{" "}
              <code className="font-mono bg-paper px-1.5 py-0.5 rounded text-ink font-semibold">{"{turma}"}</code>,{" "}
              <code className="font-mono bg-paper px-1.5 py-0.5 rounded text-ink font-semibold">{"{faltas}"}</code> e{" "}
              <code className="font-mono bg-paper px-1.5 py-0.5 rounded text-ink font-semibold">{"{percentual}"}</code> —{" "}
              eles são substituídos automaticamente antes de abrir o WhatsApp.
              O limite de aprovação é de 75% de presença (máximo de 2 faltas em 10 encontros).
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px]">
                1ª falta (aviso amigável — até 1 falta)
              </label>
              <textarea
                value={tempTemplates.leve}
                onChange={(e) => handleChange("leve", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px]">
                Atenção (2 faltas — 20%, perto do limite)
              </label>
              <textarea
                value={tempTemplates.atencao}
                onChange={(e) => handleChange("atencao", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px]">
                Limite ultrapassado (3+ faltas — acima de 25%)
              </label>
              <textarea
                value={tempTemplates.limite}
                onChange={(e) => handleChange("limite", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px]">
                RAF pendente (cobrança da atividade avaliativa)
              </label>
              <textarea
                value={tempTemplates.raf}
                onChange={(e) => handleChange("raf", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5 uppercase tracking-wider text-[10px]">
                Falta com lembrete de gravação (assistir e fazer atividades, incluindo RAF)
              </label>
              <textarea
                value={tempTemplates.gravacao}
                onChange={(e) => handleChange("gravacao", e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-xs md:text-sm text-ink font-sans focus:outline-hidden focus:ring-1 focus:ring-ink transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              Salvar textos
            </button>
            {isSaved && (
              <span className="text-xs font-semibold text-ok flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                Modelos de mensagens atualizados!
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

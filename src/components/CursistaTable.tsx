import React, { useState } from "react";
import { Cursista, TOTAL_ENCONTROS } from "../types";
import { Trash2, Edit2, MessageSquare, AlertCircle, CheckCircle2, UserCheck, Trash, Save, X, Minus, Plus } from "lucide-react";
import { ConfirmModal } from "./Modal";

interface CursistaTableProps {
  cursistas: Cursista[];
  onUpdate: (cursistaId: string, updated: Partial<Cursista>) => Promise<void>;
  onRemove: (cursistaId: string) => Promise<void>;
  onSendBuscaAtiva: (cursista: Cursista) => void;
  onSendRaf: (cursista: Cursista) => void;
  onSendGravacao: (cursista: Cursista) => void;
  selectedTurmaNome: string;
}

export const CursistaTable: React.FC<CursistaTableProps> = ({
  cursistas,
  onUpdate,
  onRemove,
  onSendBuscaAtiva,
  onSendRaf,
  onSendGravacao,
  selectedTurmaNome,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNome, setEditNome] = useState("");
  const [editWhats, setEditWhats] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const pctFaltas = (faltas: number) => {
    return Math.round((faltas / TOTAL_ENCONTROS) * 100);
  };

  const situacao = (faltas: number) => {
    if (faltas >= 3) return "limite";
    if (faltas === 2) return "attn";
    if (faltas === 1) return "leve";
    return "ok";
  };

  const renderBadge = (faltas: number) => {
    const s = situacao(faltas);
    const pct = pctFaltas(faltas);
    if (s === "limite") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-limit-bg px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-limit italic">
          Crítico ({pct}%)
        </span>
      );
    }
    if (s === "attn") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-attn-bg px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-attn italic">
          Atenção ({pct}%)
        </span>
      );
    }
    if (s === "leve") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-[#E7EFE3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B8F71] italic">
          1ª falta ({pct}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#E7EFE3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#6B8F71] italic">
        Em dia
      </span>
    );
  };

  const handleStartEdit = (c: Cursista) => {
    setEditingId(c.id);
    setEditNome(c.nome);
    setEditWhats(c.whatsapp);
  };

  const handleSaveEdit = async (id: string) => {
    const nomeTrimmed = editNome.trim();
    const whatsTrimmed = editWhats.trim();
    if (!nomeTrimmed || !whatsTrimmed) return;

    await onUpdate(id, { nome: nomeTrimmed, whatsapp: whatsTrimmed });
    setEditingId(null);
  };

  const getPendingDeleteName = () => {
    if (!pendingDeleteId) return "";
    return cursistas.find((c) => c.id === pendingDeleteId)?.nome || "este cursista";
  };

  // Sort: highest number of absences first
  const sortedCursistas = [...cursistas].sort((a, b) => b.faltas - a.faltas);

  return (
    <div className="rounded-3xl border border-line bg-white shadow-sm overflow-hidden">
      <div className="border-b border-line bg-paper-soft/45 px-6 py-4">
        <h2 className="font-serif text-base font-bold text-ink">
          Cursistas cadastrados — {selectedTurmaNome}
        </h2>
      </div>

      {sortedCursistas.length === 0 ? (
        <div className="py-12 px-6 text-center text-ink-soft text-sm font-medium">
          Nenhum cursista cadastrado nesta turma ainda. Use o painel acima para registrar o primeiro.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-paper-soft/20">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                  Nome / WhatsApp
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft text-center w-36">
                  Faltas (Max 10)
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft text-center w-32">
                  RAF
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft text-center w-40">
                  Situação
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-ink-soft text-right">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {sortedCursistas.map((c) => {
                const isEditing = c.id === editingId;
                const isRafPendente = c.rafPendente;

                if (isEditing) {
                  return (
                    <tr key={c.id} className="bg-paper-soft/10">
                      <td colSpan={2} className="px-6 py-4">
                        <div className="space-y-1.5 max-w-sm">
                          <input
                            type="text"
                            value={editNome}
                            onChange={(e) => setEditNome(e.target.value)}
                            className="w-full rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink focus:outline-hidden focus:ring-1 focus:ring-ink"
                            placeholder="Nome"
                          />
                          <input
                            type="tel"
                            value={editWhats}
                            onChange={(e) => setEditWhats(e.target.value)}
                            className="w-full rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-medium text-ink focus:outline-hidden focus:ring-1 focus:ring-ink"
                            placeholder="WhatsApp"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-ink-soft">-</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderBadge(c.faltas)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(c.id)}
                            className="inline-flex items-center gap-1 rounded-full bg-ok-bg border border-ok/30 px-3.5 py-1.5 text-xs font-semibold text-ok hover:bg-ok hover:text-white transition-colors cursor-pointer"
                          >
                            <Save className="h-3.5 w-3.5" />
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-soft hover:bg-paper-soft transition-colors cursor-pointer"
                          >
                            <X className="h-3.5 w-3.5" />
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={c.id} className="hover:bg-paper-soft/10 transition-colors">
                    {/* Name / Contact */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sm text-ink">{c.nome}</div>
                      <div className="text-[11px] font-medium text-ink-soft mt-0.5">{c.whatsapp}</div>
                    </td>

                    {/* Stepper Absence Counter */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => onUpdate(c.id, { faltas: Math.max(0, c.faltas - 1) })}
                          className="w-7 h-7 rounded-full border border-line hover:bg-paper-soft text-ink flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
                          title="Remover Falta"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-sm font-bold text-ink w-5 text-center">
                          {c.faltas.toString().padStart(2, "0")}
                        </span>
                        <button
                          onClick={() => onUpdate(c.id, { faltas: Math.min(TOTAL_ENCONTROS, c.faltas + 1) })}
                          className="w-7 h-7 rounded-full border border-line hover:bg-paper-soft text-ink flex items-center justify-center transition-all cursor-pointer select-none active:scale-90"
                          title="Adicionar Falta"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* RAF Status Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onUpdate(c.id, { rafPendente: !isRafPendente })}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer select-none border ${
                          isRafPendente
                            ? "bg-attn-bg border-attn/30 text-attn hover:bg-attn-bg/70"
                            : "bg-ok-bg border-ok/30 text-ok hover:bg-ok-bg/70"
                        }`}
                        title="Clique para alternar status do RAF"
                      >
                        {isRafPendente ? "Pendente" : "OK"}
                      </button>
                    </td>

                    {/* Badge */}
                    <td className="px-6 py-4 text-center">
                      {renderBadge(c.faltas)}
                    </td>

                    {/* Action buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap md:flex-nowrap">
                        {/* Send Active Search button */}
                        <button
                          onClick={() => onSendBuscaAtiva(c)}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] hover:bg-[#1DA851] text-white font-bold text-[10px] px-3 py-1.5 shadow-sm transition-colors cursor-pointer uppercase"
                          title="Abrir busca ativa"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          Busca Ativa
                        </button>

                        {/* Send Recording reminder button */}
                        <button
                          onClick={() => onSendGravacao(c)}
                          className="inline-flex items-center gap-1 rounded-lg border border-transparent hover:border-line hover:bg-paper-soft text-ink-soft hover:text-ink font-bold text-[10px] px-3 py-1.5 transition-colors cursor-pointer uppercase"
                          title="Lembrar gravação"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-ink-soft" />
                          Lembrar Gravação
                        </button>

                        {/* Send RAF charge button */}
                        {isRafPendente && (
                          <button
                            onClick={() => onSendRaf(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-wa border border-wa-dark hover:bg-wa-dark text-white font-bold text-[10px] px-3 py-1.5 shadow-sm transition-colors cursor-pointer uppercase"
                            title="Cobrar atividade RAF"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Cobrar RAF
                          </button>
                        )}

                        <button
                          onClick={() => handleStartEdit(c)}
                          className="p-1.5 text-ink-soft hover:text-ink hover:bg-paper-soft rounded-full transition-colors cursor-pointer"
                          title="Editar cursista"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => setPendingDeleteId(c.id)}
                          className="p-1.5 text-ink-soft hover:text-limit hover:bg-limit-bg/40 rounded-full transition-colors cursor-pointer"
                          title="Excluir cursista"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId) {
            await onRemove(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        title="Excluir cursista?"
        message={`Deseja mesmo remover "${getPendingDeleteName()}"? Esta ação deletará permanentemente os dados do cursista nesta turma.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

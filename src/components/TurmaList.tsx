import React, { useState } from "react";
import { Turma } from "../types";
import { Plus, Edit2, Trash2, Check, X, GraduationCap } from "lucide-react";
import { ConfirmModal } from "./Modal";

interface TurmaListProps {
  turmas: Turma[];
  selectedTurmaId: string | null;
  onSelect: (id: string) => void;
  onAdd: (nome: string) => Promise<string>;
  onRename: (id: string, novoNome: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TurmaList: React.FC<TurmaListProps> = ({
  turmas,
  selectedTurmaId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}) => {
  const [novaTurma, setNovaTurma] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nomeTrimmed = novaTurma.trim();
    if (!nomeTrimmed) return;
    await onAdd(nomeTrimmed);
    setNovaTurma("");
  };

  const startRename = (t: Turma) => {
    setEditingId(t.id);
    setEditingName(t.nome);
  };

  const handleSaveRename = async (id: string) => {
    const nomeTrimmed = editingName.trim();
    if (!nomeTrimmed) return;
    await onRename(id, nomeTrimmed);
    setEditingId(null);
  };

  const getPendingDeleteName = () => {
    if (!pendingDeleteId) return "";
    return turmas.find((t) => t.id === pendingDeleteId)?.nome || "esta turma";
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-soft/30 p-6 shadow-xs">
      <h2 className="font-serif text-base font-bold text-ink mb-3 flex items-center gap-2">
        <GraduationCap className="h-5 w-5 text-ink-soft" />
        Turmas Cadastradas
      </h2>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Classes Chips Grid */}
        <div className="flex flex-wrap gap-2 flex-1">
          {turmas.length === 0 ? (
            <p className="text-xs text-ink-soft italic py-2">
              Nenhuma turma adicionada. Use o campo ao lado para cadastrar sua primeira turma.
            </p>
          ) : (
            turmas.map((t) => {
              const isSelected = t.id === selectedTurmaId;
              const isEditing = t.id === editingId;

              if (isEditing) {
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 rounded-full border border-line-strong bg-white px-3.5 py-1.5 text-xs shadow-xs"
                  >
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border-b border-line-strong px-1 text-ink focus:outline-hidden font-sans font-medium max-w-[130px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveRename(t.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button
                      onClick={() => handleSaveRename(t.id)}
                      className="rounded-full p-1 text-ok hover:bg-paper-soft transition-colors cursor-pointer"
                      title="Salvar"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full p-1 text-limit hover:bg-paper-soft transition-colors cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={t.id}
                  className={`flex items-center gap-1.5 rounded-full border transition-all duration-200 ${
                    isSelected
                      ? "bg-ink border-ink text-white shadow-md"
                      : "bg-white/85 border-line text-ink hover:bg-paper-soft hover:border-ink"
                  }`}
                >
                  <button
                    onClick={() => onSelect(t.id)}
                    className="text-xs font-semibold px-4 py-2 cursor-pointer text-left focus:outline-hidden"
                  >
                    {t.nome}
                  </button>
                  <div className="flex items-center pr-2 gap-0.5 border-l border-line-strong/30 h-4 my-auto pl-1.5">
                    <button
                      onClick={() => startRename(t)}
                      className={`p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer ${
                        isSelected ? "text-paper-soft" : "text-ink-soft hover:text-ink"
                      }`}
                      title="Renomear Turma"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteId(t.id)}
                      className={`p-1 rounded-full hover:bg-black/10 transition-colors cursor-pointer ${
                        isSelected ? "text-paper-soft hover:text-limit-bg" : "text-ink-soft hover:text-limit"
                      }`}
                      title="Excluir Turma"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Class Form */}
        <form onSubmit={handleAddSubmit} className="flex gap-2 shrink-0 w-full md:w-auto">
          <input
            type="text"
            placeholder="Nova turma (ex: Lógica — Turma A)"
            value={novaTurma}
            onChange={(e) => setNovaTurma(e.target.value)}
            className="flex-1 md:w-56 rounded-full border border-line bg-white px-4 py-2 text-xs text-ink focus:outline-hidden focus:ring-1 focus:ring-ink transition-all font-sans font-medium placeholder:text-ink-soft/65"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-full bg-ink hover:bg-ink/90 active:scale-95 transition-all text-xs font-semibold text-white px-4 py-2 shadow-md cursor-pointer shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </button>
        </form>
      </div>

      <ConfirmModal
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (pendingDeleteId) {
            await onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        title="Excluir turma?"
        message={`Deseja mesmo excluir a turma "${getPendingDeleteName()}"? Todos os cursistas e registros de faltas desta turma serão deletados permanentemente.`}
        confirmText="Excluir turma"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

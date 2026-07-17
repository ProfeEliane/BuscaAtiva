import React, { useRef, useState } from "react";
import { Turma, Cursista, TOTAL_ENCONTROS } from "../types";
import { Download, Upload, HelpCircle } from "lucide-react";
import { ConfirmModal } from "./Modal";

interface CsvBackupProps {
  turmas: Turma[];
  getCursistas: (turmaId: string) => Promise<Cursista[]> | Cursista[];
  onImportComplete: (importedTurmas: Turma[], importedCursistas: Record<string, Cursista[]>) => Promise<void>;
}

export const CsvBackup: React.FC<CsvBackupProps> = ({ turmas, getCursistas, onImportComplete }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Helper to escape CSV values correctly
  const csvEscape = (v: any): string => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };

  // Helper to parse standard CSV rows supporting escaped double quotes
  const parseCSV = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          row.push(field);
          field = "";
        } else if (c === "\n" || c === "\r") {
          if (c === "\r" && text[i + 1] === "\n") {
            i++;
          }
          row.push(field);
          field = "";
          rows.push(row);
          row = [];
        } else {
          field += c;
        }
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => !(r.length === 1 && r[0] === ""));
  };

  const handleExport = async () => {
    if (turmas.length === 0) {
      alert("Não há turmas ou dados cadastrados para exportar.");
      return;
    }

    try {
      const rows = [["turma", "nome", "whatsapp", "faltas", "raf_pendente"]];
      
      for (const t of turmas) {
        const lista = await getCursistas(t.id);
        lista.forEach((c) => {
          rows.push([
            t.nome,
            c.nome,
            c.whatsapp,
            String(c.faltas),
            c.rafPendente ? "sim" : "nao"
          ]);
        });
      }

      const csvContent = rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
      // Add UTF-8 BOM to ensure Excel opens Portuguese characters correctly
      const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `busca_ativa_backup_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar planilha:", e);
      alert("Houve um erro ao gerar a planilha. Tente novamente.");
    }
  };

  const generateUid = () => Math.random().toString(36).slice(2, 10);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setShowConfirmModal(true);
    }
  };

  const processImport = async () => {
    if (!pendingFile) return;

    try {
      const text = await pendingFile.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        alert("O arquivo selecionado está vazio ou é inválido.");
        return;
      }

      let startIdx = 0;
      const firstRow = (rows[0] || []).map((h) => h.trim().toLowerCase());
      // Check if header exists
      if (firstRow[0] === "turma" || firstRow[0] === "turma_nome") {
        startIdx = 1;
      }

      const newTurmas: Turma[] = [];
      const cache: Record<string, Cursista[]> = {};

      for (let i = startIdx; i < rows.length; i++) {
        const r = rows[i];
        if (!r || r.length < 3) continue;
        const [turmaNome, nome, whatsapp, faltasStr, rafStr] = r;
        if (!turmaNome || !nome) continue;

        let turma = newTurmas.find((t) => t.nome === turmaNome);
        if (!turma) {
          turma = { id: generateUid(), nome: turmaNome };
          newTurmas.push(turma);
          cache[turma.id] = [];
        }

        cache[turma.id].push({
          id: generateUid(),
          nome: nome.trim(),
          whatsapp: whatsapp ? whatsapp.trim() : "",
          faltas: Math.max(0, Math.min(TOTAL_ENCONTROS, parseInt(faltasStr, 10) || 0)),
          rafPendente: (rafStr || "").trim().toLowerCase() === "sim",
        });
      }

      await onImportComplete(newTurmas, cache);
      setPendingFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (e) {
      console.error("Erro na importação do CSV:", e);
      alert("Falha ao ler o arquivo CSV. Verifique a codificação e formato.");
    }
  };

  return (
    <div className="rounded-3xl border border-line bg-paper-soft/40 p-6 shadow-xs">
      <h2 className="font-serif text-base font-bold text-ink mb-1.5">Planilha de dados (Backup Manual)</h2>
      <p className="text-xs text-ink-soft mb-4 leading-relaxed font-medium">
        Como você está visualizando no navegador, use o download manual de planilhas para salvar seus dados entre sessões. Baixe antes de fechar a janela, e simplesmente importe de volta quando reabrir.
      </p>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-ink/90 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="h-3.5 w-3.5" />
          Baixar planilha (.csv)
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-xs font-semibold text-ink shadow-xs hover:bg-paper-soft active:scale-95 transition-all cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5 text-ink-soft" />
          Importar planilha (.csv)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          className="hidden"
        />
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setPendingFile(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }}
        onConfirm={processImport}
        title="Substituir dados atuais?"
        message="A importação substituirá todas as turmas, cursistas e contatos cadastrados no momento por estes novos registros da planilha. Essa ação não pode ser desfeita."
        confirmText="Sim, importar"
        cancelText="Cancelar"
        type="warning"
      />
    </div>
  );
};

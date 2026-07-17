import { useState, useEffect } from "react";
import { Turma, Cursista, Templates, DEFAULT_TEMPLATES, TOTAL_ENCONTROS } from "./types";
import { storeGet, storeSet, storeDelete, testStorageSupport } from "./lib/storage";
import { CsvBackup } from "./components/CsvBackup";
import { TurmaList } from "./components/TurmaList";
import { CursistaForm } from "./components/CursistaForm";
import { CursistaTable } from "./components/CursistaTable";
import { TemplateEditor } from "./components/TemplateEditor";
import { SendModal } from "./components/SendModal";
import { MessageSquare, AlertTriangle, HelpCircle, FileSpreadsheet } from "lucide-react";

export default function App() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [cursistas, setCursistas] = useState<Cursista[]>([]);
  const [templates, setTemplates] = useState<Templates>(DEFAULT_TEMPLATES);
  const [storageWarning, setStorageWarning] = useState(false);

  // Send WhatsApp Modal state
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [sendModalCursista, setSendModalCursista] = useState<Cursista | null>(null);
  const [sendModalText, setSendModalText] = useState("");
  const [sendModalTitle, setSendModalTitle] = useState("");

  // 1. Initial Load and storage support verification
  useEffect(() => {
    const initialize = async () => {
      // Test browser storage (safely handle sandboxed iframe blocks)
      await testStorageSupport(() => {
        setStorageWarning(true);
      });

      // Load templates
      const storedTemplates = await storeGet("templates", DEFAULT_TEMPLATES);
      setTemplates(storedTemplates);

      // Load turmas
      const storedTurmas = await storeGet("turmas", []);
      setTurmas(storedTurmas);

      if (storedTurmas.length > 0) {
        setSelectedTurmaId(storedTurmas[0].id);
      }
    };
    initialize();
  }, []);

  // 2. Load cursistas whenever active class (turma) changes
  useEffect(() => {
    const loadCursistas = async () => {
      if (!selectedTurmaId) {
        setCursistas([]);
        return;
      }
      const list = await storeGet(`cursistas:${selectedTurmaId}`, []);
      setCursistas(list);
    };
    loadCursistas();
  }, [selectedTurmaId]);

  // Handle Adding Turma
  const handleAddTurma = async (nome: string): Promise<string> => {
    const generateUid = () => Math.random().toString(36).slice(2, 10);
    const newTurma: Turma = { id: generateUid(), nome };
    const updated = [...turmas, newTurma];
    setTurmas(updated);
    await storeSet("turmas", updated, () => setStorageWarning(true));
    setSelectedTurmaId(newTurma.id);
    return newTurma.id;
  };

  // Handle Renaming Turma
  const handleRenameTurma = async (id: string, novoNome: string) => {
    const updated = turmas.map((t) => (t.id === id ? { ...t, nome: novoNome } : t));
    setTurmas(updated);
    await storeSet("turmas", updated, () => setStorageWarning(true));
  };

  // Handle Deleting Turma and all related students
  const handleDeleteTurma = async (id: string) => {
    const updated = turmas.filter((t) => t.id !== id);
    setTurmas(updated);
    await storeSet("turmas", updated, () => setStorageWarning(true));
    await storeDelete(`cursistas:${id}`);

    if (selectedTurmaId === id) {
      setSelectedTurmaId(updated.length > 0 ? updated[0].id : null);
    }
  };

  // Handle Adding Cursista to Selected Turma
  const handleAddCursista = async (nome: string, whatsapp: string) => {
    if (!selectedTurmaId) return;
    const generateUid = () => Math.random().toString(36).slice(2, 10);
    const newCursista: Cursista = {
      id: generateUid(),
      nome,
      whatsapp,
      faltas: 0,
      rafPendente: false,
    };
    const updated = [...cursistas, newCursista];
    setCursistas(updated);
    await storeSet(`cursistas:${selectedTurmaId}`, updated, () => setStorageWarning(true));
  };

  // Handle Updating Cursista fields (e.g., absences, RAF toggles, in-line renames)
  const handleUpdateCursista = async (cursistaId: string, updatedFields: Partial<Cursista>) => {
    if (!selectedTurmaId) return;
    const updated = cursistas.map((c) => (c.id === cursistaId ? { ...c, ...updatedFields } : c));
    setCursistas(updated);
    await storeSet(`cursistas:${selectedTurmaId}`, updated, () => setStorageWarning(true));
  };

  // Handle Removing Cursista
  const handleRemoveCursista = async (cursistaId: string) => {
    if (!selectedTurmaId) return;
    const updated = cursistas.filter((c) => c.id !== cursistaId);
    setCursistas(updated);
    await storeSet(`cursistas:${selectedTurmaId}`, updated, () => setStorageWarning(true));
  };

  // Save customized message templates
  const handleSaveTemplates = async (newTemplates: Templates) => {
    setTemplates(newTemplates);
    await storeSet("templates", newTemplates, () => setStorageWarning(true));
  };

  // Sync complete dataset on CSV import
  const handleImportComplete = async (
    importedTurmas: Turma[],
    importedCursistas: Record<string, Cursista[]>
  ) => {
    setTurmas(importedTurmas);
    await storeSet("turmas", importedTurmas, () => setStorageWarning(true));

    // Store all lists in database
    for (const tid of Object.keys(importedCursistas)) {
      await storeSet(`cursistas:${tid}`, importedCursistas[tid], () => setStorageWarning(true));
    }

    if (importedTurmas.length > 0) {
      setSelectedTurmaId(importedTurmas[0].id);
      setCursistas(importedCursistas[importedTurmas[0].id] || []);
    } else {
      setSelectedTurmaId(null);
      setCursistas([]);
    }
  };

  // Retrieve student list synchronously/asynchronously (needed by CSV component for exports)
  const getCursistasSync = async (turmaId: string): Promise<Cursista[]> => {
    if (turmaId === selectedTurmaId) return cursistas;
    return await storeGet(`cursistas:${turmaId}`, []);
  };

  const getActiveTurmaNome = () => {
    return turmas.find((t) => t.id === selectedTurmaId)?.nome || "";
  };

  // Helper to replace placeholders
  const replacePlaceholders = (text: string, cursista: Cursista) => {
    const activeTurmaName = getActiveTurmaNome();
    const pct = Math.round((cursista.faltas / TOTAL_ENCONTROS) * 100);
    return text
      .replaceAll("{nome}", cursista.nome)
      .replaceAll("{turma}", activeTurmaName)
      .replaceAll("{faltas}", String(cursista.faltas))
      .replaceAll("{percentual}", `${pct}%`);
  };

  // Launch Active Search modal
  const triggerSendBuscaAtiva = (cursista: Cursista) => {
    const s = cursista.faltas >= 3 ? "limite" : cursista.faltas === 2 ? "atencao" : "leve";
    let templateText = templates.leve;
    if (s === "limite") templateText = templates.limite;
    else if (s === "atencao") templateText = templates.atencao;

    const replacedText = replacePlaceholders(templateText, cursista);
    setSendModalCursista(cursista);
    setSendModalText(replacedText);
    setSendModalTitle(`Enviar busca ativa — ${cursista.nome}`);
    setSendModalOpen(true);
  };

  // Launch RAF charging modal
  const triggerSendRaf = (cursista: Cursista) => {
    const templateText = templates.raf || DEFAULT_TEMPLATES.raf;
    const replacedText = replacePlaceholders(templateText, cursista);
    setSendModalCursista(cursista);
    setSendModalText(replacedText);
    setSendModalTitle(`Cobrar RAF — ${cursista.nome}`);
    setSendModalOpen(true);
  };

  // Launch Recording reminder modal
  const triggerSendGravacao = (cursista: Cursista) => {
    const templateText = templates.gravacao || DEFAULT_TEMPLATES.gravacao;
    const replacedText = replacePlaceholders(templateText, cursista);
    setSendModalCursista(cursista);
    setSendModalText(replacedText);
    setSendModalTitle(`Lembrete de gravação — ${cursista.nome}`);
    setSendModalOpen(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 antialiased">
      {/* Title Header */}
      <header className="border-b border-line pb-6 mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-ink tracking-tight flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-ink shrink-0" />
          Busca Ativa — WhatsApp
        </h1>
        <p className="mt-2 text-sm md:text-base text-ink-soft leading-relaxed font-sans font-medium">
          Registre as faltas por turma e gere a mensagem de busca ativa pronta para enviar no WhatsApp com um clique.
        </p>
      </header>

      <div className="space-y-6">
        {/* Iframe Storage Security warning notice */}
        {storageWarning && (
          <div className="rounded-3xl border border-[#B14C2E]/25 bg-limit-bg p-5 flex gap-3 text-limit shadow-xs">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm leading-relaxed font-sans">
              <p className="font-bold">⚠️ Atenção ao salvamento automático nesta sessão</p>
              <p className="mt-1 opacity-95">
                O salvamento automático do navegador está desabilitado ou restrito nesta sessão (geralmente por políticas de segurança do iframe).
              </p>
              <p className="mt-1.5 font-semibold">
                Para não perder seus cadastros, use o painel "Planilha de dados" abaixo para baixar o arquivo .csv antes de fechar esta página e importe-o de volta na próxima visita!
              </p>
            </div>
          </div>
        )}

        {/* CSV Backup / Recovery */}
        <section id="backup-section" aria-label="Backup de Dados">
          <CsvBackup
            turmas={turmas}
            getCursistas={getCursistasSync}
            onImportComplete={handleImportComplete}
          />
        </section>

        {/* Turmas list management */}
        <section id="turmas-section" aria-label="Gestão de Turmas">
          <TurmaList
            turmas={turmas}
            selectedTurmaId={selectedTurmaId}
            onSelect={setSelectedTurmaId}
            onAdd={handleAddTurma}
            onRename={handleRenameTurma}
            onDelete={handleDeleteTurma}
          />
        </section>

        {/* Cursista Form & Table view (visible if a class is selected) */}
        {selectedTurmaId && (
          <>
            <section id="add-cursista-section" aria-label="Adicionar Cursista">
              <CursistaForm
                onAdd={handleAddCursista}
                selectedTurmaNome={getActiveTurmaNome()}
              />
            </section>

            <section id="cursistas-table-section" aria-label="Lista de Cursistas">
              <CursistaTable
                cursistas={cursistas}
                onUpdate={handleUpdateCursista}
                onRemove={handleRemoveCursista}
                onSendBuscaAtiva={triggerSendBuscaAtiva}
                onSendRaf={triggerSendRaf}
                onSendGravacao={triggerSendGravacao}
                selectedTurmaNome={getActiveTurmaNome()}
              />
            </section>
          </>
        )}

        {/* Custom Message Template customizer editor */}
        <section id="template-editor-section" aria-label="Editor de Modelos">
          <TemplateEditor templates={templates} onSave={handleSaveTemplates} />
        </section>

        {/* Fine-print details footer */}
        <footer className="pt-4 border-t border-line/40 text-[11px] md:text-xs text-ink-soft leading-relaxed space-y-1">
          <p>
            ℹ️ Os dados ficam salvos em segurança no armazenamento do seu navegador e continuam disponíveis quando você reabrir esta ferramenta.
          </p>
          <p>
            🛡️ Em conformidade com a <strong>LGPD</strong>, nenhuma mensagem é enviada de forma automática — cada clique abre o WhatsApp Oficial pré-carregado com a mensagem selecionada para você revisar, editar e autorizar o envio manualmente, protegendo sua linha telefônica contra bloqueios por disparos em massa.
          </p>
        </footer>
      </div>

      {/* Sending popup trigger */}
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSendModalCursista(null);
        }}
        cursista={sendModalCursista}
        initialText={sendModalText}
        title={sendModalTitle}
      />
    </div>
  );
}

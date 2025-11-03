"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { ChecklistTemplate } from "./components/types";
import { categorias, novoTemplateVazio } from "./components/utils";
import { listarModelos, criarModelo, atualizarModelo, excluirModelo } from "./components/api";

import { TemplateForm } from "./components/template-form";
import { TemplatesList } from "./components/template-list";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function Page() {
  const [items, setItems] = useState<ChecklistTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modeloEmEdicao, setModeloEmEdicao] = useState<ChecklistTemplate>(novoTemplateVazio());

  async function reload() {
    try {
      setErro(null);
      setLoading(true);
      const data = await listarModelos();
      setItems(data);
    } catch (e: any) {
      setErro(e?.message || "Não foi possível carregar os modelos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const iniciarNovo = () => {
    setEditandoId(null);
    setModeloEmEdicao(novoTemplateVazio());
    setOpen(true);
  };

  const editar = (tpl: ChecklistTemplate) => {
    setEditandoId(tpl.id);
    setModeloEmEdicao(JSON.parse(JSON.stringify(tpl)));
    setOpen(true);
  };

  const excluir = async (id: string) => {
    try {
      setErro(null);
      await excluirModelo(id);
      setItems((lst) => lst.filter((c) => c.id !== id));
      if (editandoId === id) {
        setEditandoId(null);
        setOpen(false);
      }
    } catch (e: any) {
      setErro(e?.message || "Erro ao excluir modelo.");
    }
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setOpen(false);
  };

  const salvar = async (tpl: ChecklistTemplate) => {
    setSalvando(true);
    setErro(null);

    const payload = {
      nome: tpl.nome,
      descricao: tpl.descricao,
      categoria: tpl.categoria,
      itens: tpl.itens,
      ativo: tpl.ativo ?? true,
    };

    try {
      if (editandoId) {
        const atualizado = await atualizarModelo(editandoId, payload);
        setItems((lst) => lst.map((c) => (c.id === editandoId ? atualizado : c)));
      } else {
        const criado = await criarModelo(payload);
        setItems((lst) => [criado, ...lst]);
      }
      cancelarEdicao();
    } catch (e: any) {
      setErro(e?.message || "Erro ao salvar modelo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="mx-auto space-y-6">
      <TemplatesList
        items={items}
        loading={loading}
        error={erro}
        onReload={reload}
        onNew={iniciarNovo}
        onEdit={editar}
        onDelete={excluir}
      />

      {/* Dialog MAIOR + separador sob o título */}
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) cancelarEdicao();
          else setOpen(true);
        }}
      >
        <DialogContent className="w-[98vw] max-w-6xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-3">
            <DialogTitle>{editandoId ? "Editar checklist" : "Novo checklist"}</DialogTitle>
          </DialogHeader>
          <Separator />

          <div className="px-6 py-4">
            <TemplateForm
              value={modeloEmEdicao}
              categorias={categorias}
              editando={!!editandoId}
              onSave={salvar}
              onCancel={cancelarEdicao}
              variant="bare"
            />
            {salvando && (
              <div className="mt-3 text-sm text-muted-foreground inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

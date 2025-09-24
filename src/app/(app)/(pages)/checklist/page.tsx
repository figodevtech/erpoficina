"use client";

import { useEffect, useMemo, useState } from "react";
import { TemplateForm } from "./components/template-form";
import { TemplatesList } from "./components/template-list";
import type { ChecklistTemplate } from "./components/types";
import { categorias, novoTemplateVazio } from "./components/utils";
import { listarModelos, criarModelo, atualizarModelo, excluirModelo } from "./components/api";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [checklists, setChecklists] = useState<ChecklistTemplate[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [modeloEmEdicao, setModeloEmEdicao] = useState<ChecklistTemplate>(novoTemplateVazio());
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Carrega da API ao montar
  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        setErro(null);
        setLoading(true);
        const items = await listarModelos(ctrl.signal);
        setChecklists(items);
      } catch (e: any) {
        setErro(e?.message || "Não foi possível carregar os modelos.");
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, []);

  const iniciarNovo = () => {
    setEditandoId(null);
    setModeloEmEdicao(novoTemplateVazio());
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
        setChecklists((lst) => lst.map((c) => (c.id === editandoId ? atualizado : c)));
      } else {
        const criado = await criarModelo(payload);
        setChecklists((lst) => [criado, ...lst]);
      }
      iniciarNovo();
    } catch (e: any) {
      setErro(e?.message || "Erro ao salvar modelo.");
    } finally {
      setSalvando(false);
    }
  };

  const editar = (tpl: ChecklistTemplate) => {
    setEditandoId(tpl.id);
    // clona para evitar mutação acidental
    setModeloEmEdicao(JSON.parse(JSON.stringify(tpl)));
  };

  const excluir = async (id: string) => {
    try {
      setErro(null);
      await excluirModelo(id);
      setChecklists((lst) => lst.filter((c) => c.id !== id));
      if (editandoId === id) iniciarNovo();
    } catch (e: any) {
      setErro(e?.message || "Erro ao excluir modelo.");
    }
  };

  const cancelarEdicao = () => iniciarNovo();

  const headerRight = useMemo(() => {
    if (loading) {
      return (
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando modelos…
        </span>
      );
    }
    if (erro) {
      return <span className="text-red-600 text-sm">{erro}</span>;
    }
    return null;
  }, [loading, erro]);

  return (
    <div className=" mx-auto  space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Criação de Checklists</h1>
          <p className="text-muted-foreground">
            Crie e gerencie modelos de checklist para aplicar nas Ordens de Serviço
          </p>
        </div>
        {headerRight}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TemplateForm
          value={modeloEmEdicao}
          categorias={categorias}
          editando={!!editandoId}
          onSave={salvar}
          onCancel={cancelarEdicao}
        />

        <TemplatesList items={checklists} onEdit={editar} onDelete={excluir} />
      </div>

      {salvando && (
        <div className="fixed bottom-4 right-4 rounded-md bg-background border px-3 py-2 shadow">
          <span className="inline-flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Salvando…
          </span>
        </div>
      )}
    </div>
  );
}

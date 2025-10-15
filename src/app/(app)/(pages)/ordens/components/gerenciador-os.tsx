"use client";

import { useState } from "react";
import { OrdensTabs } from "../components/ordens-tabs";
import { NovaOSDialog } from "../components/dialogs/ordem-dialog";
import { EditarOSDialog } from "../components/dialogs/editar-ordem-dialog";
import { OrcamentoDialog } from "../components/dialogs/orcamento-dialog";
import { criarOrdem, editarOrdem } from "../lib/api";

type Ordem = any;

export default function GerenciadorOS() {
  const [selected, setSelected] = useState<Ordem | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openBudget, setOpenBudget] = useState(false);

  const handleNovaOS = () => setOpenCreate(true);

  return (
    <>
      {/* Tabs já inclui o botão "Nova OS" dentro da tabela */}
      <OrdensTabs
        onNovaOS={handleNovaOS}
        onOpenOrcamento={(row) => {
          setSelected(row as Ordem);
          setOpenBudget(true);
        }}
        onEditar={(row) => {
          setSelected(row as Ordem);
          setOpenEdit(true);
        }}
      />

      <NovaOSDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        onCreate={async (payload) => {
          await criarOrdem(payload);
          setOpenCreate(false);
          // atualiza todas as listas / abas
          if (typeof window !== "undefined") window.dispatchEvent(new Event("os:refresh"));
        }}
      />

      <EditarOSDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        defaultValues={selected}
        onEdit={async (payload) => {
          await editarOrdem(payload.id, payload);
          setOpenEdit(false);
          if (typeof window !== "undefined") window.dispatchEvent(new Event("os:refresh"));
        }}
      />

      <OrcamentoDialog
        open={openBudget}
        onOpenChange={setOpenBudget}
        osSelecionada={selected}
        onGerarOrcamento={async () => {
          console.log("Gerar Orçamento", selected?.id);
        }}
        onEnviarFinanceiro={async () => {
          console.log("Enviar ao Financeiro", selected?.id);
        }}
      />
    </>
  );
}

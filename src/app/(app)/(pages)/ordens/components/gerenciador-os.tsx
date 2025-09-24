"use client";

import { useState } from "react";
import { OrdensHeader } from "../components/ordens-header";
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

  return (
    <>
      <OrdensHeader onNovaOS={() => setOpenCreate(true)} />

      <OrdensTabs
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
        }}
      />

      <EditarOSDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        defaultValues={selected}
        onEdit={async (payload) => {
          await editarOrdem(payload.id, payload);
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

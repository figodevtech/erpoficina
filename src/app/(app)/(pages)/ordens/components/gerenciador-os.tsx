"use client";

import { useState } from "react";
import { OrdensTabs } from "../components/ordens-tabs";
import { NovaOSDialog } from "../components/novaOS/ordem-dialog";
import { EditarOSDialog } from "./editarOS/editar-ordem-dialog";
import { OrcamentoDialog } from "../components/orcamento/orcamento-dialog";
import { criarOrdem, editarOrdem } from "../lib/api";
import type { StatusOS } from "../components/ordens-tabs";
import { toast } from "sonner";

type Ordem = any;

const PODE_EDITAR_ORCAMENTO = new Set<StatusOS>(["ORCAMENTO", "ORCAMENTO_RECUSADO"]);

export default function GerenciadorOS() {
  const [selecionada, setSelecionada] = useState<Ordem | null>(null);
  const [abrirCriar, setAbrirCriar] = useState(false);
  const [abrirEditar, setAbrirEditar] = useState(false);
  const [abrirOrcamento, setAbrirOrcamento] = useState(false);

  return (
    <>
      <OrdensTabs
        onNovaOS={() => setAbrirCriar(true)}
        onOpenOrcamento={(row) => {
          const st = String(row?.status || "").toUpperCase().replaceAll(" ", "_") as StatusOS;
          if (!PODE_EDITAR_ORCAMENTO.has(st)) {
            toast.error("Orçamento só pode ser editado em ORÇAMENTO ou ORÇAMENTO RECUSADO.");
            return;
          }
          setSelecionada(row as Ordem);
          setAbrirOrcamento(true);
        }}
        onEditar={(row) => {
          setSelecionada(row as Ordem);
          setAbrirEditar(true);
        }}
        data-testid="ordens-tabs"
      />

      {/* Nova OS */}
      <NovaOSDialog
        open={abrirCriar}
        onOpenChange={(v) => setAbrirCriar(v)}
        onCreate={async (payload) => {
          await criarOrdem({ ...payload, status: "ORCAMENTO" }); // nova OS começa em ORÇAMENTO
          setAbrirCriar(false);
          window.dispatchEvent(new CustomEvent("os:refresh"));
        }}
      />

      {/* Editar OS */}
      <EditarOSDialog
        open={abrirEditar}
        onOpenChange={(v) => setAbrirEditar(v)}
        defaultValues={selecionada}
        onEdit={async (payload) => {
          await editarOrdem(payload.id, payload);
          setAbrirEditar(false);
          window.dispatchEvent(new CustomEvent("os:refresh"));
        }}
      />

      {/* Orçamento */}
      <OrcamentoDialog
        open={abrirOrcamento}
        onOpenChange={(v) => {
          setAbrirOrcamento(v);
          if (!v) {
            window.dispatchEvent(new CustomEvent("os:refresh"));
          }
        }}
        osSelecionada={selecionada}
      />
    </>
  );
}

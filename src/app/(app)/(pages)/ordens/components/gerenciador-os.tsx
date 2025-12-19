"use client";

import { useState } from "react";
import { OrdensTabs } from "./ordens-tabs";
import { NovaOSDialog } from "./novaOS/ordem-dialog";
import { EditarOSDialog } from "./editarOS/editar-ordem-dialog";
import { OrcamentoDialog } from "./orcamento/orcamento-dialog";
import { editarOrdem } from "../lib/api";

type Ordem = any;

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
          setSelecionada(row as Ordem);
          setAbrirOrcamento(true);
        }}
        onEditar={(row) => {
          setSelecionada(row as Ordem);
          setAbrirEditar(true);
        }}
      />

      {/* Nova OS (sem onCreate; vamos apenas refrescar ao fechar) */}
      <NovaOSDialog
        open={abrirCriar}
        onOpenChange={(v) => {
          setAbrirCriar(v);
          if (!v) {
            // ao fechar, atualiza a lista (se o usuário criou algo dentro do dialog)
            window.dispatchEvent(new CustomEvent("os:refresh"));
          }
        }}
      />

      {/* Editar OS */}
      <EditarOSDialog
        open={abrirEditar}
        onOpenChange={(v) => setAbrirEditar(v)}
        defaultValues={selecionada}
        // onEdit={async (payload) => {
        //   await editarOrdem(payload.id, payload);
        //   setAbrirEditar(false);
        //   window.dispatchEvent(new CustomEvent("os:refresh"));
        // }}
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

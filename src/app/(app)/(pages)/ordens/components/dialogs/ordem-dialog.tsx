"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "./dialog-shell";
import { FormularioNovaOS } from "../forms/ordem-form";

export function NovaOSDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (dados: any) => Promise<void> | void;
}) {
  const submitRef = useRef<null | (() => void)>(null);

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Ordem de Serviço"
      description="Preencha os dados para criar uma nova OS"
      footer={
        <>
          <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => submitRef.current?.()}>Criar OS</Button>
        </>
      }
    >
      <FormularioNovaOS
        exposeSubmit={(fn) => (submitRef.current = fn)}
        onSubmit={async (payload) => {
          await onCreate?.(payload);
          onOpenChange(false);
        }}
      />
    </DialogShell>
  );
}

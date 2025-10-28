"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "../dialogs/dialog-shell";
import { OrdemEditForm } from "./ordem-edit-form";

export function EditarOSDialog({
  open, onOpenChange, defaultValues, onEdit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues: any | null;
  onEdit?: (dados: any) => Promise<void> | void;
}) {
  const submitRef = useRef<null | (() => void)>(null);

  const titulo = `Editar OS ${defaultValues?.numero ?? defaultValues?.id ?? ""}`;
  const desc = `${defaultValues?.cliente?.nome ?? ""}${
    defaultValues?.veiculo ? ` • ${defaultValues.veiculo?.modelo ?? ""} • ${defaultValues.veiculo?.placa ?? ""}` : ""
  }`;

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={titulo}
      description={desc}
      footer={
        <>
          <Button variant="outline" className="bg-transparent" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => submitRef.current?.()}>Salvar alterações</Button>
        </>
      }
    >
      <OrdemEditForm
        defaultValues={defaultValues}
        exposeSubmit={(fn) => (submitRef.current = fn)}
        onSubmit={async (dados) => {
          await onEdit?.(dados);
          onOpenChange(false);
        }}
      />
    </DialogShell>
  );
}

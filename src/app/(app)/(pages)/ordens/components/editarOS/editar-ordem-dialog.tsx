// src/app/(app)/(pages)/ordens/components/editarOS/editar-ordem-dialog.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "../dialogs/dialog-shell";
import { OrdemEditForm } from "./ordem-edit-form";
import { Loader2 } from "lucide-react";

export function EditarOSDialog({
  open,
  onOpenChange,
  defaultValues,
  // onEdit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues: any | null;
  // onEdit?: (dados: any) => Promise<void> | void;
}) {
  const submitRef = useRef<null | (() => void)>(null);
  const [saving, setSaving] = useState(false);

  const titulo = `Editar OS ${defaultValues?.numero ?? defaultValues?.id ?? ""}`;
  const desc = `${defaultValues?.cliente?.nome ?? ""}${
    defaultValues?.veiculo
      ? ` • ${defaultValues.veiculo?.modelo ?? ""} • ${
          defaultValues.veiculo?.placa ?? ""
        }`
      : ""
  }`;

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={titulo}
      description={desc}
      footer={
        <>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={() => submitRef.current?.()} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </>
      }
    >
      <OrdemEditForm
        defaultValues={defaultValues}
        exposeSubmit={(fn) => (submitRef.current = fn)}
        onSavingChange={setSaving}
      />
    </DialogShell>
  );
}

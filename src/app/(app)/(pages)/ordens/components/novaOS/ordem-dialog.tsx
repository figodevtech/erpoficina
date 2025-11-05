"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
// ajuste o caminho do DialogShell conforme seu projeto
import { DialogShell } from "../dialogs/dialog-shell";
import { FormularioNovaOS } from "./ordem-form";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function NovaOSDialog({ open, onOpenChange }: Props) {
  const submitRef = useRef<null | (() => Promise<void>)>(null);
  const [saving, setSaving] = useState(false);

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Ordem de Serviço"
      description="Preencha o formulario para criação da ordem de serviço."
      maxW="lg:max-w-5xl xl:max-w-6xl"
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
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              "Criar OS"
            )}
          </Button>
        </>
      }
    >
      <FormularioNovaOS
        exposeSubmit={(fn) => (submitRef.current = fn)}
        onDone={() => onOpenChange(false)}
        onSavingChange={setSaving}
      />
    </DialogShell>
  );
}

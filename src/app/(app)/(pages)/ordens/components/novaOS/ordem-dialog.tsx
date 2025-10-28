"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogShell } from "../dialogs/dialog-shell";
import { FormularioNovaOS } from "./ordem-form";
import { criarOrdem } from "../../lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function NovaOSDialog({
  open,
  onOpenChange,
  onCreate, // opcional
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate?: (dados: any) => Promise<void> | void;
}) {
  const submitRef = useRef<null | (() => void)>(null);
  const [saving, setSaving] = useState(false);

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Nova Ordem de Serviço"
      description="Preencha os dados para criar uma nova OS"
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
        onSubmit={async (payload) => {
          setSaving(true);
          try {
            if (onCreate) {
              await onCreate(payload);
            } else {
              await criarOrdem(payload);
            }
            toast.success("OS criada com sucesso!");
            onOpenChange(false); // ✅ fecha o dialog no sucesso
          } catch (e: any) {
            toast.error(e?.message || "Erro ao criar OS"); // ✅ Sonner (sem alert)
          } finally {
            setSaving(false);
          }
        }}
      />
    </DialogShell>
  );
}

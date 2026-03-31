"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

export function EmissaoNfseDialog({
  open,
  onOpenChange,
  osId,
  onAfterGenerate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osId: number | null;
  onAfterGenerate?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleEmitir = async () => {
    if (!osId) return;

    setLoading(true);
    const toastId = toast.loading("Emitindo NFS-e pela Focus NFe...");

    try {
      const res = await fetch(`/api/nfse/de-os/${osId}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        toast.error(json.message || "Erro ao gerar NFS-e", { id: toastId });
        return;
      }

      toast.success("NFS-e registrada com sucesso!", { id: toastId });
      if (onAfterGenerate) onAfterGenerate();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro de rede ao conectar à API", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" /> Emissão de NFS-e (Serviço)
          </DialogTitle>
          <DialogDescription>
            Isto irá transmitir os serviços da OS prestados na prefeitura através da Focus NFe.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium">Tem certeza que deseja emitir a Nota Fiscal de Serviço?</p>
          <p className="text-xs text-muted-foreground mt-2">
            Todos os itens classificados como <b>Serviço</b> na Ordem serão unidos em uma única descrição e valores transmitidos à Sefaz Municipal.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleEmitir} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            Emitir NFS-e
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

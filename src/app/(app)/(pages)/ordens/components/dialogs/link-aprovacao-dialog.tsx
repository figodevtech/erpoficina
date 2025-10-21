// src/app/(app)/(pages)/ordens/components/dialogs/link-aprovacao-dialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Link2, Copy, ExternalLink, MessageCircleMore, RefreshCw } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osId?: number | null;
  clienteNome?: string | null;
};

export function LinkAprovacaoDialog({ open, onOpenChange, osId, clienteNome }: Props) {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const canRequest = open && !!osId;

  const titulo = useMemo(
    () => `Link de aprovação ${clienteNome ? `• ${clienteNome}` : ""}`,
    [clienteNome]
  );

  async function fetchLink({ regenerate = false }: { regenerate?: boolean } = {}) {
    if (!osId) return;
    setLoading(true);
    try {
      // 1) tenta obter; se não existir ou se regenerate=true, cria
      const endpoint = `/api/ordens/${osId}/aprovacao/link`;
      const r = await fetch(endpoint, { cache: "no-store" });
      let j: any = {};
      if (r.ok) {
        j = await r.json();
      } else {
        // 404 (sem link) ou outro erro → segue para criar
        j = {};
      }

      if (!j?.url || regenerate) {
        const r2 = await fetch(endpoint, { method: "POST" });
        const j2 = await r2.json();
        if (!r2.ok) throw new Error(j2?.error || "Falha ao gerar link");
        setUrl(j2.url as string);
        toast.success(regenerate ? "Link regenerado" : "Link criado");
        return;
      }

      setUrl(j.url as string);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao obter link");
      setUrl("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (canRequest) fetchLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRequest, osId]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Não foi possível copiar o link");
    }
  };

  const abrirWhatsapp = () => {
    if (!url) return;
    const msg = `Olá! Segue seu orçamento para aprovação: ${url}`;
    const wa = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            {titulo}
          </DialogTitle>
          <DialogDescription>Copie e compartilhe o link com o cliente para aprovar o orçamento.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="link">URL do orçamento público</Label>
          <div className="flex gap-2">
            <Input id="link" value={url} readOnly className="font-mono" />
            <Button variant="outline" onClick={copiar} disabled={!url}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => fetchLink({ regenerate: true })} disabled={loading || !osId}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Regenerar link
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => url && window.open(url, "_blank")} disabled={!url}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir
            </Button>
            <Button onClick={abrirWhatsapp} disabled={!url}>
              <MessageCircleMore className="mr-2 h-4 w-4" />
              WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
  const [servicos, setServicos] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open && osId) {
      carregarServicos();
    } else {
      setServicos([]);
    }
  }, [open, osId]);

  const carregarServicos = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/nfse/servicos-de-os/${osId}`);
      const json = await res.json();
      if (json.ok) setServicos(json.servicos || []);
    } catch(e) {
      toast.error("Erro ao carregar serviços da OS");
    } finally {
      setFetching(false);
    }
  };

  const handleEmitir = async (osservicoId: number) => {
    if (!osId) return;

    setLoading(true);
    const toastId = toast.loading("Emitindo NFS-e pela Focus NFe...");

    try {
      const res = await fetch(`/api/nfse/de-os/${osId}`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ osservicoId }) 
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.ok) {
        toast.error(json.message || "Erro ao gerar NFS-e", { id: toastId });
        return;
      }

      toast.success("NFS-e registrada com sucesso!", { id: toastId });
      carregarServicos();
      if (onAfterGenerate) onAfterGenerate();
    } catch (e: any) {
      toast.error(e?.message || "Erro de rede ao conectar à API", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" /> Emissão de NFS-e por Serviço
          </DialogTitle>
          <DialogDescription>
            Abaixo estão os serviços atrelados a esta Ordem. Cada serviço pode ser gerado numa Nota Fiscal Eletrônica individual.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 overflow-x-auto max-h-[60vh] overflow-y-auto">
          {fetching ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
          ) : servicos.length === 0 ? (
            <p className="text-sm text-center text-muted-foreground p-8">Nenhum serviço encontrado nesta OS.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status NFS-e</TableHead>
                  <TableHead className="text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicos.map((s, index) => {
                  const valorTotal = (s.quantidade || 1) * (s.precounitario || 0);
                  const status = s.notaFiscalStatus;
                  const canEmit = !status || status === "REJEITADA" || status === "ERRO";

                  return (
                    <TableRow key={s.servicoid || index}>
                      <TableCell className="font-medium">
                        {s.quantidade}x {s.servico?.descricao || "Serviço Padrão"}
                      </TableCell>
                      <TableCell>
                        R$ {valorTotal.toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell>
                         {!status && <Badge variant="outline">Não emitido</Badge>}
                         {status === "AUTORIZADA" && <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Autorizada</Badge>}
                         {status === "PROCESSANDO" && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Processando</Badge>}
                         {(status === "REJEITADA" || status === "ERRO") && (
                             <Badge variant="destructive" title={s.notaFiscalErros && JSON.stringify(s.notaFiscalErros)}>Rejeitada</Badge>
                         )}
                         {status && !["AUTORIZADA","PROCESSANDO","REJEITADA","ERRO"].includes(status) && (
                            <Badge variant="secondary">{status}</Badge>
                         )}
                      </TableCell>
                      <TableCell className="text-right">
                        {canEmit ? (
                           <Button 
                             size="sm" 
                             disabled={loading} 
                             onClick={() => handleEmitir(s.servicoid)}
                           >
                             Emitir Nota
                           </Button>
                        ) : (
                           <Button size="sm" variant="ghost" disabled>
                             <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" /> Emitida
                           </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

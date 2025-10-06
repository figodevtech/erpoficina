"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RowOS } from "../../types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  os?: RowOS | null;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
};

export default function ConfirmAssumirDialog({ open, onOpenChange, os, onConfirm, loading }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assumir OS #{os?.id}</DialogTitle>
          <DialogDescription>
            Confirme para assumir esta ordem de serviço. Ela ficará vinculada a você/equipe como responsável.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-2 text-sm">
          <div><span className="text-muted-foreground">Cliente:</span> {os?.cliente?.nome ?? "—"}</div>
          <div><span className="text-muted-foreground">Descrição:</span> {os?.descricao ?? "—"}</div>
          <div><span className="text-muted-foreground">Veículo:</span> {os?.veiculo ? `${os.veiculo.modelo} • ${os.veiculo.placa}` : "—"}</div>
          {os?.setor?.nome && <div><span className="text-muted-foreground">Setor:</span> {os.setor.nome}</div>}
          {os?.prioridade && <div><span className="text-muted-foreground">Prioridade:</span> {os.prioridade}</div>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!loading}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={!!loading}>
            {loading ? "Assumindo..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

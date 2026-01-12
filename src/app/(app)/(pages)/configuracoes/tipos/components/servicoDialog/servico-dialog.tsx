"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Servico } from "@/types/servico";
type ServicoForm = {
  codigo: string;
  descricao: string;
  precohora: string;
  ativo: boolean;
};

interface ServicoDialogProps {
  loadServicos?: () => Promise<void>;
  editing?: Servico | null;
  setEditing?: (value: Servico | null) => void;
  setOpen?: (value: boolean) => void;
  open?: boolean;
  openNovo?: () => void;
  openEditar?: () => void;
  form: ServicoForm;
  setForm: (form: ServicoForm) => void;
  onRegister?: () => void;
}
export default function ServicoDialog({
  loadServicos,
  editing,
  setEditing,
  open,
  setOpen,
  openNovo,
  openEditar,
  form,
  setForm,
  onRegister,
}: ServicoDialogProps) {
  const emptyForm = {
    codigo: "",
    descricao: "",
    precohora: "",
    ativo: true,
  };
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  async function handleSave() {
    if (!form.codigo.trim() || !form.descricao.trim()) {
      toast.error("Insira uma descrição.");
      return;
    }
    if (!form.precohora.trim() || Number.isNaN(Number(form.precohora))) {
      toast.error("Preço inválido.");
      return;
    }

    const payload = {
      codigo: form.codigo.trim(),
      descricao: form.descricao.trim(),
      precohora: Number(form.precohora),
      ativo: form.ativo,
    };

    try {
      setIsSaving(true);

      if (editing) {
        const res = await fetch(`/api/tipos/servicos/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (res.ok){

            toast.success("Serviço atualizado");
        }
      } else {
        const res = await fetch("/api/tipos/servicos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json();
        if (res.ok) {
          toast.success("Serviço cadastrado");
        }
      }

      setOpen?.(false);
      setEditing?.(null);
      setForm(emptyForm);
      onRegister?.()
      await loadServicos?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Erro ao salvar serviço");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar serviço" : "Novo serviço"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Linha 1: Código + Descrição */}
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                value={form.codigo}
                onChange={(e) => handleChange("codigo", e.target.value)}
                placeholder="Ex.: ALINH001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Input
                value={form.descricao}
                onChange={(e) => handleChange("descricao", e.target.value)}
                placeholder="Ex.: Alinhamento e balanceamento"
              />
            </div>
          </div>

          {/* Linha 2: Preço/hora + Cód. Serv. Municipal */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preço</label>
              <Input
                value={form.precohora}
                onChange={(e) => handleChange("precohora", e.target.value)}
                placeholder="0,00"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
            <div className="space-y-0.5">
              <span className="text-sm font-medium">Status do serviço</span>
              <p className="text-xs text-muted-foreground">
                Defina se este serviço está ativo para uso nas ordens de
                serviço.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {form.ativo ? "Ativo" : "Inativo"}
              </span>
              <Switch
                checked={form.ativo}
                onCheckedChange={(val) => handleChange("ativo", val)}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              setOpen?.(false);
              setEditing?.(null);
              setForm(emptyForm);
            }}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Fornecedor } from "@/types/fornecedor";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FornecedorForm = {
  cpfcnpj: string;
  nomerazaosocial: string;
  nomefantasia: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  contato: string;
  ativo: boolean;
};

const emptyForm: FornecedorForm = {
  cpfcnpj: "",
  nomerazaosocial: "",
  nomefantasia: "",
  endereco: "",
  cidade: "",
  estado: "",
  cep: "",
  contato: "",
  ativo: true,
};

export default function FornecedorDialog(){
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editing, setEditing] = useState<Fornecedor | null>(null);
    const [form, setForm] = useState<FornecedorForm>({
      cpfcnpj: "",
      nomerazaosocial: "",
        nomefantasia: "",
        endereco: "",
        cidade: "",
        estado: "",
        cep: "",
        contato: "",
        ativo: true,
    });
    
    function handleChange<K extends keyof FornecedorForm>(key: K, value: FornecedorForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

async function handleSave() {
    if (!form.cpfcnpj.trim() || !form.nomerazaosocial.trim()) {
      toast.error("CNPJ e Razão Social são obrigatórios.");
      return;
    }

    const payload = {
      cpfcnpj: form.cpfcnpj.trim(),
      nomerazaosocial: form.nomerazaosocial.trim(),
      nomefantasia: form.nomefantasia.trim() || null,
      endereco: form.endereco.trim() || null,
      cidade: form.cidade.trim() || null,
      estado: form.estado.trim() || null,
      cep: form.cep.trim() || null,
      contato: form.contato.trim() || null,
      ativo: form.ativo,
    };

    try {
      setIsSaving(true);

      if (editing) {
        const res = await fetch(`/api/tipos/fornecedores/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Falha ao atualizar fornecedor");
        toast.success("Fornecedor atualizado");
      } else {
        const res = await fetch("/api/tipos/fornecedores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Falha ao cadastrar fornecedor");
        toast.success("Fornecedor cadastrado");
      }

      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erro ao salvar fornecedor");
    } finally {
      setIsSaving(false);
    }
  }
    return(
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="hover:cursor-pointer">
              <Plus className="mr-1 h-4 w-4" />
              Novo fornecedor
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editing ? "Editar fornecedor" : "Novo fornecedor"}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
                <div className="space-y-1.5">
                  <Label>CNPJ</Label>
                  <Input
                    value={form.cpfcnpj}
                    onChange={(e) => handleChange("cpfcnpj", e.target.value)}
                    placeholder="Somente números"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Razão Social</Label>
                  <Input
                    value={form.nomerazaosocial}
                    onChange={(e) => handleChange("nomerazaosocial", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Nome Fantasia (opcional)</Label>
                <Input
                  value={form.nomefantasia}
                  onChange={(e) => handleChange("nomefantasia", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  placeholder="Rua, número, bairro..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
                <div className="space-y-1.5">
                  <Label>Cidade</Label>
                  <Input
                    value={form.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Estado</Label>
                  <Input
                    value={form.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    placeholder="UF"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>CEP</Label>
                  <Input
                    value={form.cep}
                    onChange={(e) => handleChange("cep", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Contato (telefone/email)</Label>
                <Input
                  value={form.contato}
                  onChange={(e) => handleChange("contato", e.target.value)}
                />
              </div>

              {/* Status dentro do diálogo */}
              <div className="mt-4 flex items-center justify-between rounded-md border px-3 py-2 bg-muted/40">
                <div className="space-y-0.5">
                  <Label>Status do fornecedor</Label>
                  <p className="text-xs text-muted-foreground">
                    Defina se este fornecedor está ativo para uso nas telas do sistema.
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
                  setDialogOpen(false);
                  setEditing(null);
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
    )
}
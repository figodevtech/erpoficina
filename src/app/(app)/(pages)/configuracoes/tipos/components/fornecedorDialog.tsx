import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Fornecedor = {
  id: number;
  cpfcnpj: string;
  nomerazaosocial: string;
  nomefantasia: string | null;
  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  contato: string | null;
  ativo: boolean | null;
};

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

interface FornecedorDialogProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  loadFornecedores?: () => Promise<void>;
  fornecedorToEdit?: Fornecedor | null;
  setFornecedorToEdit?: (fornecedor: Fornecedor | null) => void;
  children?: React.ReactNode;
  dadosNovoFornecedor?: FornecedorForm;
  handleGetFornecedor?: () => Promise<void>;

}

export default function FornecedorDialog({
  dialogOpen,
  setDialogOpen,
  loadFornecedores,
  fornecedorToEdit,
  setFornecedorToEdit,
  dadosNovoFornecedor,
  children,
  handleGetFornecedor,

}: FornecedorDialogProps) {
  const [form, setForm] = useState<FornecedorForm>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  function openNovo() {
    if(setFornecedorToEdit){

      setFornecedorToEdit(null);
    }
   
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function handleChange<K extends keyof FornecedorForm>(
    key: K,
    value: FornecedorForm[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
      if (!form.cpfcnpj.trim() || !form.nomerazaosocial.trim()) {
        toast.error("CNPJ e Razão Social são obrigatórios.");
        return;
      }
  
      const payload = {
        cpfcnpj: form.cpfcnpj?.trim(),
        nomerazaosocial: form.nomerazaosocial?.trim(),
        nomefantasia: form.nomefantasia?.trim() || null,
        endereco: form.endereco?.trim() || null,
        cidade: form.cidade?.trim() || null,
        estado: form.estado?.trim() || null,
        cep: form.cep?.trim() || null,
        contato: form.contato?.trim() || null,
        ativo: form.ativo,
      };
  
      try {
        setIsSaving(true);
  
        if (fornecedorToEdit) {
          const res = await fetch(`/api/tipos/fornecedores/${fornecedorToEdit.id}`, {
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
          handleGetFornecedor?.()
        }
  
        setDialogOpen(false);
        

          setFornecedorToEdit?.(null);
        
        setForm(emptyForm);
        await loadFornecedores?.();
      } catch (err: any) {
        console.error(err);
        toast.error(err?.message || "Erro ao salvar fornecedor");
      } finally {
        setIsSaving(false);
      }
    }

    useEffect(()=>{
      if(fornecedorToEdit){
        setForm({
      cpfcnpj: fornecedorToEdit.cpfcnpj ?? "",
      nomerazaosocial: fornecedorToEdit.nomerazaosocial ?? "",
      nomefantasia: fornecedorToEdit.nomefantasia ?? "",
      endereco: fornecedorToEdit.endereco ?? "",
      cidade: fornecedorToEdit.cidade ?? "",
      estado: fornecedorToEdit.estado ?? "",
      cep: fornecedorToEdit.cep ?? "",
      contato: fornecedorToEdit.contato ?? "",
      ativo: fornecedorToEdit.ativo ?? true,
    });
      }
    },[fornecedorToEdit])

    return (
      <Dialog open={dialogOpen} onOpenChange={(nextOpen)=>{

        setDialogOpen(nextOpen)
        if(dadosNovoFornecedor && nextOpen){
          setForm(dadosNovoFornecedor)
        }
      }
      }>
        <DialogTrigger asChild>
          {children ? children :(

          <Button size="sm" className="hover:cursor-pointer" onClick={openNovo}>
            <Plus className="mr-1 h-4 w-4" />
            Novo fornecedor
          </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {fornecedorToEdit ? "Editar fornecedor" : "Novo fornecedor"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
              <div className="space-y-1.5">
                <Label>CNPJ</Label>
                <Input
                  value={form.cpfcnpj || ""}
                  onChange={(e) => handleChange("cpfcnpj", e.target.value)}
                  placeholder="Somente números"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Razão Social</Label>
                <Input
                  value={form.nomerazaosocial || ""}
                  onChange={(e) =>
                    handleChange("nomerazaosocial", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nome Fantasia (opcional)</Label>
              <Input
                value={form.nomefantasia || ""}
                onChange={(e) => handleChange("nomefantasia", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Endereço</Label>
              <Input
                value={form.endereco || ""}
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
                  value={form.estado || ""}
                  onChange={(e) => handleChange("estado", e.target.value)}
                  placeholder="UF"
                />
              </div>
              <div className="space-y-1.5">
                <Label>CEP</Label>
                <Input
                  value={form.cep || ""}
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
                  Defina se este fornecedor está ativo para uso nas telas do
                  sistema.
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
                if(setFornecedorToEdit){

                  setFornecedorToEdit(null);
                }
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


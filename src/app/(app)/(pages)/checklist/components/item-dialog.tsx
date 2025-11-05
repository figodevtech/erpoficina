"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { ItemChecklist } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (novo: { titulo: string; descricao?: string; categoria: string; obrigatorio: boolean }) => void;
  categorias: ReadonlyArray<string>;
  initialValue?: ItemChecklist;
};

export function ItemDialog({
  open,
  onOpenChange,
  onSave,
  categorias,
  initialValue,
}: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [obrigatorio, setObrigatorio] = useState(false);

  // sincroniza ao abrir com o initialValue
  useEffect(() => {
    if (open) {
      setTitulo(initialValue?.titulo ?? "");
      setDescricao(initialValue?.descricao ?? "");
      setCategoria(initialValue?.categoria ?? "");
      setObrigatorio(!!initialValue?.obrigatorio);
    }
  }, [open, initialValue]);

  const salvar = () => {
    if (!titulo.trim()) return;
    onSave({ titulo: titulo.trim(), descricao: descricao.trim() || undefined, categoria, obrigatorio });
    onOpenChange(false);
  };

  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent
    onOpenAutoFocus={(e) => e.preventDefault()}
    className="
      p-0
      w-[96vw] max-w-[96vw]
      sm:max-w-[90vw] md:max-w-[700px] lg:max-w-[900px]
      max-h-[80vh] overflow-hidden
    "
  >
    {/* grid fixo: header | separator | body rolável */}
    <div className="grid grid-rows-[auto_1px_1fr] h-[80vh]">
      <DialogHeader className="px-6 pt-4 pb-3 text-center">
        <DialogTitle className="text-lg font-semibold">
          {initialValue ? "Editar item" : "Adicionar item"}
        </DialogTitle>
      </DialogHeader>
      <div className="bg-border" /> {/* Separator */}

      <div className="overflow-y-auto px-6 py-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título</Label>
          <Input id="titulo" className="w-full" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao">Descrição (opcional)</Label>
          <Textarea id="descricao" className="w-full" rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger id="categoria" className="w-full">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="obrigatorio" checked={obrigatorio} onCheckedChange={(v) => setObrigatorio(!!v)} />
          <Label htmlFor="obrigatorio">Obrigatório</Label>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={salvar} disabled={!titulo.trim()}>Salvar</Button>
        </div>
      </div>
    </div>
  </DialogContent>
</Dialog>

  );
}

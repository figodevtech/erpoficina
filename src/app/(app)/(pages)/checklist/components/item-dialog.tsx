"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (payload: { titulo: string; descricao?: string; categoria: string; obrigatorio: boolean }) => void;
  categorias: readonly string[];
  initial?: { titulo: string; descricao?: string; categoria: string; obrigatorio: boolean };
};

export function ItemDialog({ open, onOpenChange, onSave, categorias, initial }: Props) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [obrigatorio, setObrigatorio] = useState(false);

  useEffect(() => {
    if (open) {
      setTitulo(initial?.titulo ?? "");
      setDescricao(initial?.descricao ?? "");
      setCategoria(initial?.categoria ?? "");
      setObrigatorio(initial?.obrigatorio ?? false);
    }
  }, [open, initial]);

  const salvar = () => {
    if (!titulo.trim()) return;
    onSave({ titulo: titulo.trim(), descricao: descricao.trim() || undefined, categoria, obrigatorio });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] max-w-2xl p-0 overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid w-full max-h-[90vh] grid-rows-[auto_1fr_auto]">
          <DialogHeader className="px-4 sm:px-6 pt-4">
            <DialogTitle>Adicionar Item</DialogTitle>
            <DialogDescription>Defina os detalhes do item do checklist</DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input
                placeholder="Ex: Verificar nível do óleo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger className="w-full min-h-10">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Instruções detalhadas..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox checked={obrigatorio} onCheckedChange={(v) => setObrigatorio(!!v)} />
              <span className="text-sm">Item obrigatório</span>
            </div>
          </div>

          <div className="border-t px-4 sm:px-6 py-3 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={!titulo.trim()}>Salvar item</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

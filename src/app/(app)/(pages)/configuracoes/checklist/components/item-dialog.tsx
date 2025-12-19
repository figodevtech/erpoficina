"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import type { ItemChecklist } from "./types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (item: Partial<ItemChecklist>) => void;
  categorias: ReadonlyArray<string>;
  initialValue?: ItemChecklist | null;
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

  useEffect(() => {
    if (open) {
      const src = initialValue ?? null;
      setTitulo(src?.titulo ?? "");
      setDescricao(src?.descricao ?? "");
      setCategoria(src?.categoria ?? "");
      setObrigatorio(!!src?.obrigatorio);
    }
  }, [open, initialValue]);

  const salvar = () => {
    const t = titulo.trim();
    if (!t) return;
    onSave({
      titulo: t,
      descricao: descricao.trim(),
      categoria: categoria || "",
      obrigatorio,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialValue ? "Editar item" : "Adicionar item"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Verificar nível de óleo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais do item…"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoriaItem">Categoria do item (opcional)</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger id="categoriaItem">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="obrigatorio"
              checked={obrigatorio}
              onCheckedChange={(v) => setObrigatorio(!!v)}
            />
            <Label htmlFor="obrigatorio">Obrigatório</Label>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={salvar}
            disabled={!titulo.trim()}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

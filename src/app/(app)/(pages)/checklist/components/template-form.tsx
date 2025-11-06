"use client";

import { useEffect, useState } from "react";
import type { ChecklistTemplate, ItemChecklist } from "./types";
import { uid } from "./utils";

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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Edit3 } from "lucide-react";
import { ItemDialog } from "./item-dialog";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";

type Props = {
  value: ChecklistTemplate;
  categorias: ReadonlyArray<string>;   // << corrigido (readonly)
  editando?: boolean;
  onSave: (tpl: ChecklistTemplate) => void;
  onCancel: () => void;
  variant?: "card" | "bare";
};

export function TemplateForm({
  value,
  categorias,
  editando,
  onSave,
  onCancel,
  variant = "card",
}: Props) {
  const [tpl, setTpl] = useState<ChecklistTemplate>(value);
  const [addOpen, setAddOpen] = useState(false);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemChecklist | null>(null);

  useEffect(() => {
    setTpl(value);
  }, [value]);

  const adicionarItem = (it: Partial<ItemChecklist>) => {
    const novo: ItemChecklist = {
      id: uid(),
      titulo: (it.titulo ?? "").trim(),
      descricao: (it.descricao ?? "").trim(),
      obrigatorio: !!it.obrigatorio,
      categoria: it.categoria ?? "",
    };
    setTpl((prev) => ({ ...prev, itens: [...prev.itens, novo] }));
  };

  const atualizarItem = (it: Partial<ItemChecklist> & { id: string }) => {
    setTpl((prev) => ({
      ...prev,
      itens: prev.itens.map((i) => (i.id === it.id ? { ...i, ...it } as ItemChecklist : i)),
    }));
  };

  const removerItem = (id: string) => {
    setTpl((prev) => ({ ...prev, itens: prev.itens.filter((i) => i.id !== id) }));
  };

  const salvar = () => {
    if (!tpl.nome.trim() || tpl.itens.length === 0) return;
    const toSave: ChecklistTemplate = {
      ...tpl,
      id: tpl.id || uid(),
      criadoEm: tpl.criadoEm || new Date().toISOString(),
    };
    onSave(toSave);
  };

  const Content = (
    <div className="space-y-6">
      {/* Dados do modelo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do checklist</Label>
          <Input
            id="nome"
            placeholder="Ex.: Inspeção de entrada"
            value={tpl.nome}
            onChange={(e) => setTpl((p) => ({ ...p, nome: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select
            value={tpl.categoria || ""}
            onValueChange={(v) => setTpl((p) => ({ ...p, categoria: v }))}
          >
            <SelectTrigger id="categoria">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            placeholder="Uma descrição curta para identificar o checklist…"
            value={tpl.descricao || ""}
            onChange={(e) => setTpl((p) => ({ ...p, descricao: e.target.value }))}
            rows={3}
          />
        </div>
      </div>

      <Separator />

      {/* Itens */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Itens do checklist</h4>
          <Button size="sm" onClick={() => { setItemEditando(null); setAddOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            Adicionar item
          </Button>
        </div>

        {tpl.itens.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum item adicionado. Use “Adicionar item” para começar.
          </p>
        ) : (
          <div className="space-y-2">
            {tpl.itens.map((it) => (
              <div
                key={it.id}
                className="flex items-start justify-between gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{it.titulo}</span>
                    {it.obrigatorio && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                    {it.categoria && <Badge variant="outline" className="text-xs">{it.categoria}</Badge>}
                  </div>
                  {it.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">{it.descricao}</p>
                  )}
                </div>

                <div className="shrink-0 flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => { setItemEditando(it); setEditItemOpen(true); }}
                    title="Editar item"
                    aria-label="Editar item"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removerItem(it.id)}
                    title="Excluir item"
                    aria-label="Excluir item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="border-t pt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={salvar} disabled={!tpl.nome.trim() || tpl.itens.length === 0}>
          <Save className="h-4 w-4 mr-1" />
          {editando ? "Salvar alterações" : "Criar checklist"}
        </Button>
      </div>

      {/* Dialog de item (adicionar/editar) */}
      <ItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={(novo) => adicionarItem(novo)}
        categorias={categorias}               // << readonly ok
      />

      {itemEditando && (
        <ItemDialog
          open={editItemOpen}
          onOpenChange={(v) => {
            setEditItemOpen(v);
            if (!v) setItemEditando(null);
          }}
          onSave={(novo) => atualizarItem({ ...novo, id: itemEditando.id })}
          categorias={categorias}            
          initialValue={itemEditando}      
        />
      )}
    </div>
  );

  if (variant === "bare") return Content;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">
          {editando ? "Editar Checklist" : "Novo Checklist"}
        </CardTitle>
        <CardDescription>
          {editando ? "Atualize os campos e salve para aplicar as alterações."
                    : "Preencha os campos para criar um novo modelo."}
        </CardDescription>
      </CardHeader>
      <CardContent>{Content}</CardContent>
    </Card>
  );
}

"use client";

import { useState } from "react";
import type { ChecklistTemplate, ItemChecklist } from "./types";
import { uid } from "./utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, X, Save, Edit3 } from "lucide-react";
import { ItemDialog } from "./item-dialog";

type Props = {
  value: ChecklistTemplate;
  categorias: readonly string[];
  editando?: boolean;
  onSave: (tpl: ChecklistTemplate) => void;
  onCancel: () => void;
};

export function TemplateForm({ value, categorias, editando, onSave, onCancel }: Props) {
  const [tpl, setTpl] = useState<ChecklistTemplate>(value);
  const [addOpen, setAddOpen] = useState(false);

  // Mantém o form sincronizado quando `value` mudar (ex.: iniciar edição)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  if (value.id !== tpl.id || value.criadoEm !== tpl.criadoEm) {
    // Reidrata
    setTpl(value);
  }

  const adicionarItem = (payload: { titulo: string; descricao?: string; categoria: string; obrigatorio: boolean }) => {
    const item: ItemChecklist = { id: uid(), ...payload };
    setTpl((prev) => ({ ...prev, itens: [...prev.itens, item] }));
  };

  const removerItem = (itemId: string) => {
    setTpl((prev) => ({ ...prev, itens: prev.itens.filter((i) => i.id !== itemId) }));
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

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editando ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          {editando ? "Editar Checklist" : "Novo Checklist"}
        </CardTitle>
        <CardDescription>
          {editando ? "Modifique o modelo existente" : "Crie um novo modelo para aplicar nas OS"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome do Checklist *</Label>
            <Input
              placeholder="Ex: Revisão Completa"
              value={tpl.nome}
              onChange={(e) => setTpl((p) => ({ ...p, nome: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select
              value={tpl.categoria}
              onValueChange={(v) => setTpl((p) => ({ ...p, categoria: v }))}
            >
              <SelectTrigger className="w-full min-h-10">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            placeholder="Descreva o propósito deste checklist..."
            value={tpl.descricao}
            onChange={(e) => setTpl((p) => ({ ...p, descricao: e.target.value }))}
            rows={3}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Itens do Checklist ({tpl.itens.length})</h3>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </div>

        {tpl.itens.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {tpl.itens.map((item) => (
              <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg bg-muted/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{item.titulo}</h4>
                    {item.obrigatorio && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                    {item.categoria && <Badge variant="outline" className="text-xs">{item.categoria}</Badge>}
                  </div>
                  {item.descricao && <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removerItem(item.id)}
                  className="ml-2 h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={salvar}
            disabled={!tpl.nome.trim() || tpl.itens.length === 0}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            {editando ? "Atualizar" : "Salvar"} Checklist
          </Button>
          {editando && (
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>

      {/* Dialog de item */}
      <ItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={adicionarItem}
        categorias={categorias}
      />
    </Card>
  );
}

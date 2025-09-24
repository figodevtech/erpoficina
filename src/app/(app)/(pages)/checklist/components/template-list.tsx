"use client";

import { useState } from "react";
import type { ChecklistTemplate } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit3, Trash2 } from "lucide-react";

type Props = {
  items: ChecklistTemplate[];
  onEdit: (tpl: ChecklistTemplate) => void;
  onDelete: (id: string) => void;
};

export function TemplatesList({ items, onEdit, onDelete }: Props) {
  const [openView, setOpenView] = useState(false);
  const [selecionado, setSelecionado] = useState<ChecklistTemplate | null>(null);

  const abrir = (tpl: ChecklistTemplate) => {
    setSelecionado(tpl);
    setOpenView(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checklists Criados ({items.length})</CardTitle>
        <CardDescription>Gerencie seus modelos</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Nenhum checklist criado ainda.</p>
            <p className="text-sm">Crie seu primeiro checklist ao lado.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {items.map((c) => (
              <div key={c.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{c.nome}</h3>
                      {c.categoria && <Badge variant="secondary" className="text-xs">{c.categoria}</Badge>}
                    </div>
                    {c.descricao && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{c.descricao}</p>}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{c.itens.length} itens</span>
                      <span>Criado em {new Date(c.criadoEm).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => abrir(c)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Visualizar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onEdit(c)}>
                    <Edit3 className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(c.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Visualização */}
      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent
          className="w-[95vw] max-w-3xl p-0 overflow-hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="grid w-full max-h-[90vh] grid-rows-[auto_1fr_auto]">
            <DialogHeader className="px-4 sm:px-6 pt-4">
              <DialogTitle>{selecionado?.nome}</DialogTitle>
              <DialogDescription>{selecionado?.descricao}</DialogDescription>
            </DialogHeader>

            <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-3">
              {selecionado?.itens.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50">
                  <Checkbox disabled className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{item.titulo}</h4>
                      {item.obrigatorio && <Badge variant="destructive" className="text-xs">Obrigatório</Badge>}
                      {item.categoria && <Badge variant="outline" className="text-xs">{item.categoria}</Badge>}
                    </div>
                    {item.descricao && <p className="text-sm text-muted-foreground">{item.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t px-4 sm:px-6 py-3 flex justify-end">
              <Button variant="ghost" onClick={() => setOpenView(false)}>Fechar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

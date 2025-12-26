"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import ValueInput from "../entrada-valor";
import { Grupo_produto, Produto, Unidade_medida } from "../../../types";
import { formatDate } from "@/utils/formatDate";
import { onlyDigits } from "../lib/utils";
import { ESTOQUE_STATUS_BADGES } from "../lib/options-fiscais";
import type { UnidadeFromApi } from "../hooks/use-unidades-medida";
import { GrupoFromApi } from "../hooks/use-grupo-produtos";

type Props = {
  mode: "create" | "edit";
  produto: Produto;
  onChange: (field: keyof Produto, value: any) => void;
  unidades: UnidadeFromApi[];
  loadingUnidades: boolean;
  errorUnidades: string | null;
  showDates?: boolean;
  grupos: GrupoFromApi[];
};

export function TabGeral({
  mode,
  produto,
  onChange,
  unidades,
  grupos,
  loadingUnidades,
  errorUnidades,
  showDates,
}: Props) {
  return (
    <TabsContent value="Geral" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex flex-nowrap space-x-2">
            <Label htmlFor="status_estoque">Status do Estoque:</Label>
            {ESTOQUE_STATUS_BADGES.filter((s) => s.value === produto.status_estoque).map((s) => (
              <Badge key={s.value} variant={s.badge}>
                {s.value}
              </Badge>
            ))}
          </div>

          <div className="flex flex-nowrap space-x-2">
            <Label>Grupo:</Label>
            <Select value={produto.grupo_produto_id?.toString() || "OUTROS"} onValueChange={(v) => onChange("grupo_produto_id", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {grupos.map((g) => (
                  <SelectItem className="hover:cursor-pointer" key={g.id} value={g.id.toString()}>
                    {g.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titulo">Título *</Label>
          <Input
            id="titulo"
            value={produto.titulo || ""}
            onChange={(e) => onChange("titulo", e.target.value)}
            placeholder={mode === "edit" ? "Nome comercial / vitrine" : "Título interno"}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            value={produto.descricao || ""}
            onChange={(e) => onChange("descricao", e.target.value)}
            placeholder="Descrição do produto"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fabricante">Fabricante</Label>
            <Input
              id="fabricante"
              value={(produto as any).fabricante || ""}
              onChange={(e) => onChange("fabricante", e.target.value)}
              placeholder="Fabricante"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia">Referência</Label>
            <Input
              id="referencia"
              value={produto.referencia || ""}
              onChange={(e) => onChange("referencia", e.target.value)}
              placeholder="SKU / Referência interna"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigobarras">Código de Barras</Label>
            <Input
              id="codigobarras"
              value={produto.codigobarras || ""}
              onChange={(e) => onChange("codigobarras", onlyDigits(e.target.value))}
              placeholder="7891234567890"
              inputMode="numeric"
              maxLength={14}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="precovenda">Preço Unitário</Label>
            <ValueInput price={produto.precovenda} setPrice={(v) => onChange("precovenda", v)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidade">Unidade</Label>
            <Select
              value={produto.unidade || undefined}
              onValueChange={(v) => onChange("unidade", v as Unidade_medida)}
              disabled={loadingUnidades || !!errorUnidades}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={loadingUnidades ? "Carregando..." : errorUnidades ? "Erro ao carregar" : "Selecione"}
                />
              </SelectTrigger>
              <SelectContent>
                {unidades.map((u) => (
                  <SelectItem key={u.id} value={u.sigla as Unidade_medida} className="hover:cursor-pointer">
                    {u.sigla}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errorUnidades && <p className="mt-1 text-xs text-destructive">{errorUnidades}</p>}
          </div>
        </div>

        {showDates ? (
          <>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-nowrap">
              <div className="space-x-1 flex items-center text-muted-foreground text-xs">
                <Label>Criado em:</Label>
                <span className="text-muted-foreground">{formatDate((produto as any).createdat)}</span>
              </div>
              <div className="space-x-1 flex items-center text-muted-foreground text-xs">
                <Label>Última modificação:</Label>
                <span className="text-muted-foreground">{formatDate((produto as any).updatedat)}</span>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </TabsContent>
  );
}

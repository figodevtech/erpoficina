"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type OrdemEditFormProps = {
  defaultValues: {
    id: number;
    numero?: string;
    tipoos?: string | null;
    setorid?: number | null;
    tecnicoid?: string | null;
    descricao?: string | null;
    observacoes?: string | null;
    cliente?: { id: number; nome: string } | null;
    veiculo?: { id: number; placa: string; modelo: string } | null;
  } | null;
  exposeSubmit?: (fn: () => void) => void;
  onSubmit?: (payload: {
    id: number;
    tipoos: string | null;
    setorid: number | null;
    tecnicoid: string | null;
    descricao: string | null;
    observacoes: string | null;
  }) => void | Promise<void>;
};

export function OrdemEditForm({ defaultValues, exposeSubmit, onSubmit }: OrdemEditFormProps) {
  const [tipoOS, setTipoOS] = useState<string>(defaultValues?.tipoos ?? "");
  const [setor, setSetor] = useState<string>(defaultValues?.setorid ? String(defaultValues.setorid) : "");
  const [tecnico, setTecnico] = useState<string>(defaultValues?.tecnicoid ?? "");
  const [descricao, setDescricao] = useState<string>(defaultValues?.descricao ?? "");
  const [observacoes, setObservacoes] = useState<string>(defaultValues?.observacoes ?? "");

  useEffect(() => {
    setTipoOS(defaultValues?.tipoos ?? "");
    setSetor(defaultValues?.setorid ? String(defaultValues.setorid) : "");
    setTecnico(defaultValues?.tecnicoid ?? "");
    setDescricao(defaultValues?.descricao ?? "");
    setObservacoes(defaultValues?.observacoes ?? "");
  }, [defaultValues]);

  useEffect(() => {
    exposeSubmit?.(() => {
      if (!defaultValues?.id) return;
      onSubmit?.({
        id: defaultValues.id,
        tipoos: tipoOS || null,
        setorid: setor ? Number(setor) : null,
        tecnicoid: tecnico || null,
        descricao: descricao || null,
        observacoes: observacoes || null,
      });
    });
  }, [exposeSubmit, onSubmit, defaultValues, tipoOS, setor, tecnico, descricao, observacoes]);

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">OS {defaultValues?.numero ?? defaultValues?.id ?? "—"}</CardTitle>
          <CardDescription className="text-sm">
            {defaultValues?.cliente?.nome ?? "—"}
            {defaultValues?.veiculo ? ` • ${defaultValues.veiculo.modelo} • ${defaultValues.veiculo.placa}` : ""}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-2 border rounded-lg p-3 md:p-4 bg-muted/40 border-border">
        <p className="text-sm font-medium text-foreground">Definições da OS</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo de OS</Label>
            <Select value={tipoOS} onValueChange={setTipoOS}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ORCAMENTO">Orçamento</SelectItem>
                <SelectItem value="SERVICO">Serviço</SelectItem>
                <SelectItem value="GARANTIA">Garantia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Setor responsável</Label>
            <Select value={setor} onValueChange={setSetor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Mecânica Geral</SelectItem>
                <SelectItem value="2">Elétrica</SelectItem>
                <SelectItem value="3">Funilaria</SelectItem>
                <SelectItem value="4">Pintura</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Técnico (opcional)</Label>
            <Select value={tecnico} onValueChange={setTecnico}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o técnico" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="carlos-uuid">Carlos Mecânico</SelectItem>
                <SelectItem value="pedro-uuid">Pedro Técnico</SelectItem>
                <SelectItem value="jose-uuid">José Eletricista</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Descrição do Problema</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[100px] resize-y"
            value={descricao ?? ""}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[80px] resize-y"
            value={observacoes ?? ""}
            onChange={(e) => setObservacoes(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">Cliente e Veículo</CardTitle>
          <CardDescription className="text-sm">Somente para conferência visual.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Cliente</Label>
            <Input value={defaultValues?.cliente?.nome ?? "—"} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>Modelo</Label>
            <Input value={defaultValues?.veiculo?.modelo ?? "—"} readOnly />
          </div>
          <div className="space-y-1.5">
            <Label>Placa</Label>
            <Input value={defaultValues?.veiculo?.placa ?? "—"} readOnly />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

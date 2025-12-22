"use client";

import * as React from "react";
import type { Perfil, Permissao } from "../types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

type Props = {
  aberto: boolean;
  setAberto: (v: boolean) => void;
  modo: "criar" | "editar";
  perfilInicial?: Perfil | null;
  permissoesDisponiveis: Permissao[];
  carregandoConteudo?: boolean;        // <- usa isso para mostrar só o spinner
  salvando: boolean;
  onSalvar: (dados: { nome: string; descricao: string; permissoesIds: number[] }) => Promise<void>;
};

export function DialogPerfil({
  aberto,
  setAberto,
  modo,
  perfilInicial,
  permissoesDisponiveis,
  carregandoConteudo = false,
  salvando,
  onSalvar,
}: Props) {
  const [nome, setNome] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [selecionadas, setSelecionadas] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    if (!aberto) return;

    if (modo === "editar" && perfilInicial) {
      setNome(perfilInicial.nome ?? "");
      setDescricao(perfilInicial.descricao ?? "");
      setSelecionadas(new Set((perfilInicial.permissoes ?? []).map((p) => p.id)));
    } else {
      setNome("");
      setDescricao("");
      setSelecionadas(new Set());
    }
  }, [aberto, modo, perfilInicial]);

  const alternarPermissao = (id: number) => {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const salvar = async () => {
    const nomeOk = nome.trim();
    if (!nomeOk) return;

    await onSalvar({
      nome: nomeOk,
      descricao: descricao.trim(),
      permissoesIds: Array.from(selecionadas.values()),
    });
  };

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>{modo === "criar" ? "Criar Perfil" : "Editar Perfil"}</DialogTitle>
        </DialogHeader>

        {carregandoConteudo ? (
          // === SOMENTE SPINNER / LOADING ===
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          // === CONTEÚDO NORMAL DO DIALOG ===
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex. Administrador"
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="space-y-2 mt-2">
              <Label>Permissões</Label>

              <div className="rounded-md border">
                <ScrollArea className="h-[320px]">
                  <div className="p-3 space-y-2">
                    {permissoesDisponiveis.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma permissão cadastrada.
                      </p>
                    ) : (
                      permissoesDisponiveis.map((perm) => {
                        const marcado = selecionadas.has(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/50 cursor-pointer"
                          >
                            <Checkbox
                              checked={marcado}
                              onCheckedChange={() => alternarPermissao(perm.id)}
                              className="mt-0.5"
                            />
                            <div className="leading-tight">
                              <div className="text-sm font-medium">{perm.nome}</div>
                              {perm.descricao ? (
                                <div className="text-xs text-muted-foreground">{perm.descricao}</div>
                              ) : null}
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setAberto(false)} disabled={salvando}>
                Cancelar
              </Button>

              <Button onClick={salvar} disabled={salvando || !nome.trim()}>
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

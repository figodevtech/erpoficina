"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TabsContent } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import type { ProdutoImagem } from "../hooks/use-produto-imagens";

type Props = {
  previews: string[];
  carregando: boolean;
  subindo: boolean;
  imagens: ProdutoImagem[];
  imgUrlPrincipal?: string | null;
  onPick: (files: File[]) => void;
  onEnviar: () => void;
  onDefinirPrincipal: (id: number) => void;
  onRemover: (id: number) => void;
  hasSelection: boolean;
};

export function TabImagensEdit({
  previews,
  carregando,
  subindo,
  imagens,
  imgUrlPrincipal,
  onPick,
  onEnviar,
  onDefinirPrincipal,
  onRemover,
  hasSelection,
}: Props) {
  return (
    <TabsContent value="Imagens" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-6">
        <div className="space-y-2">
          <Label>Adicionar imagens</Label>
          <Input type="file" accept="image/*" multiple onChange={(e) => onPick(Array.from(e.target.files ?? []))} />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={!hasSelection || subindo}
              onClick={onEnviar}
              className="hover:cursor-pointer"
            >
              {subindo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Enviar imagens
                </>
              )}
            </Button>
          </div>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {previews.map((src, idx) => (
              <div key={idx} className="aspect-square rounded-md border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`preview-${idx}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Imagens cadastradas</Label>
            {carregando && <span className="text-xs text-muted-foreground">Carregando...</span>}
          </div>

          {!carregando && imagens.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma imagem cadastrada.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {imagens.map((img) => {
                const ehPrincipal = !!imgUrlPrincipal && imgUrlPrincipal === img.url;
                return (
                  <div key={img.id} className="rounded-md border overflow-hidden">
                    <div className="aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={`img-${img.id}`} className="h-full w-full object-cover" />
                    </div>

                    <div className="p-2 flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={ehPrincipal ? "default" : "outline"}
                        onClick={() => onDefinirPrincipal(img.id)}
                        disabled={ehPrincipal}
                        className="hover:cursor-pointer"
                      >
                        {ehPrincipal ? "Principal" : "Definir"}
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemover(img.id)}
                        className="hover:cursor-pointer"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </TabsContent>
  );
}

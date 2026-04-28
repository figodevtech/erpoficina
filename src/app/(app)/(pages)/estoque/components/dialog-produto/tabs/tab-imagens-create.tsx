"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { Image as ImageIcon, Upload } from "lucide-react";

type Props = {
  previews: string[];
  onPick: (files: File[]) => void;
};

export function TabImagensCreate({ previews, onPick }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <TabsContent value="Imagens" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-2 py-3 md:px-6 md:py-6 space-y-6">
      
      <div className="space-y-4">
        {/* Upload Header */}
        <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Imagens do Produto
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Selecione as imagens do produto. As imagens serão enviadas após o cadastro.
            </p>
            <p className="text-xs font-medium text-muted-foreground">
              {previews.length} {previews.length === 1 ? "imagem selecionada" : "imagens selecionadas"}.
            </p>
          </div>
          
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[200px]">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={(e) => onPick(Array.from(e.target.files ?? []))}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              Selecionar Imagens
            </Button>
          </div>
        </div>

        {/* Previews */}
        {previews.length === 0 ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-25" />
            <p className="text-sm">Nenhuma imagem selecionada.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {previews.map((src, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg border bg-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="h-32 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="truncate text-sm font-semibold text-muted-foreground">
                    Nova Imagem {idx + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Será enviada ao salvar
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </TabsContent>
  );
}

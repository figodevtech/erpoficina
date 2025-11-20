"use client";

import { useCallback, useEffect, useState } from "react";
import { DialogShell } from "./dialog-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UploadCloud, X, CarFront, ClipboardList, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadChecklistImages } from "../../lib/upload-checklist-images";

type ChecklistTemplateModel = {
  id: string;
  nome: string;
  itens: { titulo: string; descricao?: string | null; obrigatorio?: boolean }[];
};

const CHECK_OPTIONS = ["OK", "ALERTA", "FALHA"] as const;
type Marcacao = (typeof CHECK_OPTIONS)[number] | "";

const toDbStatus = (sel: Marcacao): "OK" | "ALERTA" | "FALHA" | null =>
  sel === "OK" || sel === "ALERTA" || sel === "FALHA" ? sel : null;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osId: number;
};

export function ChecklistDialog({ open, onOpenChange, osId }: Props) {
  const [saving, setSaving] = useState(false);

  // modelos
  const [templates, setTemplates] = useState<ChecklistTemplateModel[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState("");
  const [templateItems, setTemplateItems] = useState<ChecklistTemplateModel["itens"]>([]);

  // marcações
  const [checklist, setChecklist] = useState<Record<string, Marcacao>>({});
  const [obsByItem, setObsByItem] = useState<Record<string, string>>({});
  const [imagesByItem, setImagesByItem] = useState<Record<string, File[]>>({});

  // carrega modelos quando o dialog abre
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        setLoadingTemplates(true);
        setTemplatesError(null);
        const url = new URL("/api/checklist-modelos", window.location.origin);
        url.searchParams.set("ativos", "1");
        const r = await fetch(url.toString(), { cache: "no-store" });
        const j = await r.json();
        setTemplates(Array.isArray(j) ? j : Array.isArray(j?.items) ? j.items : []);
      } catch (e: any) {
        setTemplatesError(e?.message ?? "Não foi possível carregar os modelos de checklist.");
      } finally {
        setLoadingTemplates(false);
      }
    })();
  }, [open]);

  // aplica template
  const applyTemplate = useCallback(
    (id: string) => {
      setTemplateId(id);
      const itens = (templates.find((t) => t.id === id)?.itens ?? []).filter(Boolean);
      setTemplateItems(itens);

      const novo: Record<string, Marcacao> = {};
      const imgs: Record<string, File[]> = {};
      const obs: Record<string, string> = {};

      itens.forEach((it) => {
        if (it.titulo) {
          novo[it.titulo] = checklist[it.titulo] ?? "";
          imgs[it.titulo] = imagesByItem[it.titulo] ?? [];
          obs[it.titulo] = obsByItem[it.titulo] ?? "";
        }
      });

      setChecklist(novo);
      setImagesByItem(imgs);
      setObsByItem(obs);
    },
    [templates, checklist, imagesByItem, obsByItem]
  );

  // validações básicas
  const validateAll = (): string | null => {
    if (!osId) return "OS inválida.";

    if (!templateId) return "Selecione um modelo de checklist.";

    if (templateItems?.length) {
      const faltando = templateItems
        .filter((it) => it.obrigatorio)
        .filter((it) => !checklist[it.titulo]);

      if (faltando.length) {
        const nomes = faltando
          .slice(0, 3)
          .map((f) => f.titulo)
          .join(", ");
        return `Marque todos os itens obrigatórios do checklist. Ex.: ${nomes}${
          faltando.length > 3 ? "…" : ""
        }`;
      }
    }

    const semStatusComImagem = Object.keys(imagesByItem).filter(
      (k) => (imagesByItem[k]?.length ?? 0) > 0 && !toDbStatus(checklist[k] as Marcacao)
    );
    if (semStatusComImagem.length) {
      return `Há imagens em itens sem status: ${semStatusComImagem
        .slice(0, 3)
        .join(", ")}${
        semStatusComImagem.length > 3 ? "…" : ""
      }. Marque OK/ALERTA/FALHA antes de anexar imagens.`;
    }

    return null;
  };

  const onPickFiles = (itemTitle: string, files: FileList | null) => {
    if (!files?.length) return;
    setImagesByItem((prev) => ({
      ...prev,
      [itemTitle]: [...(prev[itemTitle] ?? []), ...Array.from(files)],
    }));
  };

  const removeFile = (itemTitle: string, idx: number) => {
    setImagesByItem((prev) => {
      const list = [...(prev[itemTitle] ?? [])];
      list.splice(idx, 1);
      return { ...prev, [itemTitle]: list };
    });
  };

  const salvar = async () => {
    if (saving) return;
    const err = validateAll();
    if (err) {
      toast.error(err);
      return;
    }

    setSaving(true);
    try {
      const checklistArray = templateItems
        .map((it) => {
          const sel = checklist[it.titulo] ?? "";
          const db = toDbStatus(sel as Marcacao);
          if (!db) return null;
          return {
            item: it.titulo,
            status: db,
            observacao: (obsByItem[it.titulo] || "").trim() || null,
          };
        })
        .filter(Boolean) as Array<{
        item: string;
        status: "OK" | "ALERTA" | "FALHA";
        observacao: string | null;
      }>;

      const payload: any = {
        checklistTemplateId: templateId || null,
        checklist: checklistArray,
      };

      // 1) Salva checklist da OS
      const r = await fetch(`/api/ordens/${osId}/checklist`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao salvar checklist");

      const created: Array<{ id: number; item: string }> = j?.checklistCreated ?? [];
      const mapItemToChecklistId: Record<string, number> = {};
      for (const row of created) {
        if (row?.item && row?.id) mapItemToChecklistId[row.item] = row.id;
      }

      // 2) Upload de imagens (se houver)
      const hasAnyImage = Object.values(imagesByItem).some((arr) => (arr?.length ?? 0) > 0);
      if (osId && hasAnyImage) {
        await uploadChecklistImages(osId, imagesByItem, mapItemToChecklistId, {
          concurrency: 3,
          compress: {
            maxWidth: 1600,
            maxHeight: 1600,
            targetMaxBytes: 800 * 1024,
            minQuality: 0.6,
            maxQuality: 0.95,
          },
        });
      }

      // 3) Opcional: muda status para ORCAMENTO
      await fetch(`/api/ordens/${osId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ORCAMENTO" }),
      }).catch(() => {});

      toast.success("Checklist salvo com sucesso.");
      window.dispatchEvent(new CustomEvent("os:refresh"));
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar checklist");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="inline-flex items-center gap-2">
          <CarFront className="h-4 w-4 text-primary" />
          Checklist da OS #{osId || "—"}
        </span>
      }
      description="Preencha o checklist de inspeção antes de seguir para orçamento."
      maxW="lg:max-w-5xl xl:max-w-6xl"
      footer={
        <>
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={salvar} disabled={saving || !osId}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              "Salvar checklist"
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* MODELO DE CHECKLIST */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <Label className="font-medium">Modelo de checklist</Label>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <Select
              value={templateId}
              onValueChange={applyTemplate}
              disabled={loadingTemplates || (!!templatesError && templates.length === 0)}
            >
              <SelectTrigger className="h-10 w-full sm:w-[380px] min-w-[220px] truncate">
                <SelectValue
                  placeholder={
                    loadingTemplates
                      ? "Carregando…"
                      : templates.length
                      ? "Selecione um modelo"
                      : "Nenhum modelo disponível"
                  }
                />
              </SelectTrigger>
              <SelectContent
                position="popper"
                sideOffset={6}
                className="w-[var(--radix-select-trigger-width)]"
              >
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="truncate">
                    {t.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {templateId && (
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  setTemplateId("");
                  setTemplateItems([]);
                  setChecklist({});
                  setImagesByItem({});
                  setObsByItem({});
                }}
              >
                Limpar
              </Button>
            )}
          </div>
          {templatesError && <p className="text-sm text-red-500">{templatesError}</p>}
        </div>

        {/* ITENS DO CHECKLIST */}
        {templateItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {templateItems.map((it) => {
              const key = it.titulo ?? "";
              const marcado = checklist[key] ?? "";
              const files = imagesByItem[key] ?? [];
              const obs = obsByItem[key] ?? "";

              return (
                <div
                  key={key}
                  className="p-3 rounded-lg border bg-muted/50 border-border text-foreground"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">{it.titulo}</div>
                      {it.descricao ? (
                        <div className="text-xs text-muted-foreground mt-1">
                          {it.descricao}
                        </div>
                      ) : null}
                    </div>
                    {it.obrigatorio && (
                      <Badge variant="secondary" className="text-[11px]">
                        Obrigatório
                      </Badge>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {CHECK_OPTIONS.map((status) => {
                      const selected = marcado === status;
                      const base =
                        "px-3 py-1.5 rounded-md text-sm border transition";
                      const selectedClass =
                        status === "OK"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : status === "ALERTA"
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-red-600 text-white border-red-600";
                      const unselectedClass =
                        "bg-background hover:bg-muted border-border text-foreground";
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() =>
                            setChecklist((prev) => ({
                              ...prev,
                              [key]: selected ? "" : status,
                            }))
                          }
                          className={[
                            base,
                            selected ? selectedClass : unselectedClass,
                          ].join(" ")}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <Label className="text-xs">Observação (opcional)</Label>
                    <Textarea
                      value={obs}
                      onChange={(e) =>
                        setObsByItem((p) => ({ ...p, [key]: e.target.value }))
                      }
                      placeholder="Observações sobre o item…"
                      rows={3}
                    />
                  </div>

                  <div className="mt-3 space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Imagens do item (opcional)
                    </Label>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-muted">
                        <UploadCloud className="h-4 w-4" />
                        Adicionar imagens
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => onPickFiles(key, e.target.files)}
                        />
                      </label>
                      {files.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {files.length} arquivo(s) selecionado(s)
                        </span>
                      )}
                    </div>

                    {files.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {files.map((f, idx) => (
                          <div
                            key={`${f.name}-${idx}`}
                            className="inline-flex items-center gap-2 border rounded px-2 py-1 text-xs"
                          >
                            <span className="max-w-[180px] truncate">
                              {f.name}
                            </span>
                            <button
                              type="button"
                              className="opacity-70 hover:opacity-100"
                              onClick={() => removeFile(key, idx)}
                              title="Remover"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {templateId
              ? "Este modelo não possui itens."
              : "Selecione um modelo para exibir os itens do checklist."}
          </p>
        )}
      </div>
    </DialogShell>
  );
}

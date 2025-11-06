import { supabase } from "@/lib/supabase";
import { safeUUID } from "./safe-uuid";
import { compressImage, runWithConcurrency, type CompressOpts } from "./image-compress";

export type UploadChecklistImagesOptions = {
  /** bucket do Supabase Storage */
  bucket?: string;
  /** quantas imagens sobem ao mesmo tempo */
  concurrency?: number;
  /** opções de compressão */
  compress?: CompressOpts;
  /** endpoint para registrar URLs no banco em lote */
  bulkEndpoint?: string; // default: "/api/checklists/images/bulk"
};

/**
 * Faz compressão (com preservação de orientação), upload para o Storage
 * e registra as URLs no banco em lote. Retorna o total de imagens gravadas.
 */
export async function uploadChecklistImages(
  osId: number,
  imagesByItem: Record<string, File[]>,
  mapItemToChecklistId: Record<string, number>,
  opts: UploadChecklistImagesOptions = {}
): Promise<number> {
  const BUCKET = opts.bucket ?? "vistoria";
  const CONC = Math.max(1, Math.min(8, opts.concurrency ?? 3));
  const BULK = opts.bulkEndpoint ?? "/api/checklists/images/bulk";

  // Monta a fila de tarefas
  const tasks = Object.keys(imagesByItem).flatMap((itemTitle) => {
    const files = imagesByItem[itemTitle] || [];
    const checklistId = mapItemToChecklistId[itemTitle];
    if (!checklistId || files.length === 0) return [];
    return files.map((file) => ({ file, checklistId }));
  });

  if (tasks.length === 0) return 0;

  // Executa compressão + upload com concorrência controlada
  const uploaded = await runWithConcurrency(tasks, CONC, async ({ file, checklistId }) => {
    const { blob, ext, type } = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      targetMaxBytes: 800 * 1024,
      minQuality: 0.6,
      maxQuality: 0.95,
      ...(opts.compress || {}),
    });

    const filename = `${safeUUID()}.${ext}`;
    const path = `os-${osId}/check-${checklistId}/${filename}`;

    const up = await supabase.storage.from(BUCKET).upload(path, blob, {
      cacheControl: "604800",
      upsert: false,
      contentType: type,
    });
    if (up.error) throw new Error(up.error.message);

    const pub = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { checklistid: checklistId, url: pub.data.publicUrl };
  });

  // Registra todas as imagens em uma tacada só
  const r = await fetch(BULK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: uploaded }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || "Falha ao salvar imagens");

  return uploaded.length;
}

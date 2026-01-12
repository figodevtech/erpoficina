import { safeUUID } from "./safe-uuid";
import { compressImage, runWithConcurrency, type CompressOpts } from "./image-compress";

export type UploadChecklistImagesOptions = {
  concurrency?: number;
  compress?: CompressOpts;
};

export async function uploadChecklistImages(
  osId: number,
  imagesByItem: Record<string, File[]>,
  mapItemToChecklistId: Record<string, number>,
  opts: UploadChecklistImagesOptions = {}
): Promise<number> {
  const CONC = Math.max(1, Math.min(8, opts.concurrency ?? 3));

  const tasks = Object.keys(imagesByItem).flatMap((itemTitle) => {
    const files = imagesByItem[itemTitle] || [];
    const checklistId = mapItemToChecklistId[itemTitle];
    if (!checklistId || files.length === 0) return [];
    return files.map((file) => ({ file, checklistId }));
  });

  if (tasks.length === 0) return 0;

  const uploadedCount = await runWithConcurrency(tasks, CONC, async ({ file, checklistId }) => {
    const { blob, ext, type } = await compressImage(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      targetMaxBytes: 800 * 1024,
      minQuality: 0.6,
      maxQuality: 0.95,
      ...(opts.compress || {}),
    });

    // recria um File com extensão correta (ajuda o server a receber nome ok)
    const filename = `${safeUUID()}.${ext}`;
    const f = new File([blob], filename, { type });

    const fd = new FormData();
    fd.append("files", f);

    const r = await fetch(`/api/checklists/${checklistId}/images/upload`, {
      method: "POST",
      body: fd,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j?.error || "Falha ao enviar imagem");

    return true;
  });

  return uploadedCount.length;
}

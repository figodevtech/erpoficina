"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";

type Props = {
  previews: string[];
  onPick: (files: File[]) => void;
};

export function TabImagensCreate({ previews, onPick }: Props) {
  return (
    <TabsContent value="Imagens" className="h-full min-h-0 overflow-auto dark:bg-muted-foreground/5 px-6 py-10 space-y-2">
      <div className="h-full min-h-0 overflow-auto rounded-md px-4 py-8 space-y-4">
        <div className="space-y-2">
          <Label>Imagens do produto</Label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onPick(Array.from(e.target.files ?? []))}
          />
          <p className="text-xs text-muted-foreground">As imagens serão enviadas depois que o produto for cadastrado.</p>
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
      </div>
    </TabsContent>
  );
}

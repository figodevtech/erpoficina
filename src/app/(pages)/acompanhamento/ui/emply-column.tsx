"use client";

import { Card } from "@/components/ui/card";

export default function EmptyColumn({ label }: { label: string }) {
  return (
    <Card className="border-dashed bg-muted/20 p-4">
      <p className="text-center text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

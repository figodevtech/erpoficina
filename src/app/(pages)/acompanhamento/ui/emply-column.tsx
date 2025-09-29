"use client";

import { Card } from "@/components/ui/card";

export default function EmptyColumn({ label }: { label: string }) {
  return (
    <Card className="p-6 text-center text-muted-foreground bg-muted/30 border-dashed">
      {label}
    </Card>
  );
}

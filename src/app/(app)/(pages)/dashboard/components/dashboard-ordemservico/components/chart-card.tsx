"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ChartCardProps = {
  title: string;
  description?: string;
  badge?: string;
  badgeIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function ChartCard({ title, description, badge, badgeIcon, className, children }: ChartCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{title}</p>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {badge ? (
          <Badge variant="outline" className="gap-1 whitespace-nowrap">
            {badgeIcon}
            {badge}
          </Badge>
        ) : null}
      </div>
      {children}
    </div>
  );
}

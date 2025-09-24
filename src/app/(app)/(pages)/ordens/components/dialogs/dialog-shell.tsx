"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function DialogShell({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  maxW = "lg:max-w-5xl xl:max-w-6xl",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  maxW?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`p-0 w-[96vw] sm:max-w-[95vw] md:max-w-3xl ${maxW}`}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="grid w-full max-h-[85vh] grid-rows-[auto_1fr_auto]">
          <div className="flex items-start justify-between gap-4 border-b px-4 py-3 sm:px-6">
            <div className="space-y-1">
              <DialogTitle className="text-lg sm:text-xl lg:text-2xl">{title}</DialogTitle>
              {description ? (
                <DialogDescription className="text-sm sm:text-base">{description}</DialogDescription>
              ) : null}
            </div>
          </div>
          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">{children}</div>
          <div className="flex items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">{footer}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function DialogShell({
  open,
  onOpenChange,
  title,
  titleSuffix,
  description,
  children,
  footer,
  loading = false,
  maxW = "lg:max-w-5xl xl:max-w-6xl",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: ReactNode;
  titleSuffix?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  loading?: boolean;
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
        <div
          className={`grid w-full max-h-[85vh] ${loading ? "grid-rows-[1fr]" : "grid-rows-[auto_1fr_auto]"}`}
        >
          {loading ? (
            <div className="sr-only">
              <DialogTitle>
                {title}
                {titleSuffix ? ` | ${String(titleSuffix)}` : ""}
              </DialogTitle>
              {description ? <DialogDescription>{description}</DialogDescription> : null}
            </div>
          ) : null}
          {!loading ? (
            <div className="flex items-start justify-between gap-4 border-b px-4 py-3 sm:px-6">
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold tracking-tight sm:text-lg">
                  {title}
                  {titleSuffix ? (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      | {titleSuffix}
                    </span>
                  ) : null}
                </DialogTitle>
                {description ? (
                  <DialogDescription className="text-sm">{description}</DialogDescription>
                ) : null}
              </div>
            </div>
          ) : null}
          <div className={loading ? "overflow-y-auto" : "overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"}>
            {children}
          </div>
          {!loading ? (
            <div className="flex items-center justify-end gap-2 border-t px-4 py-3 sm:px-6">
              {footer}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

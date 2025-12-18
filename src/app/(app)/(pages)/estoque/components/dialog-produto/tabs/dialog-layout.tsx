"use client";

import * as React from "react";
import { Tabs, TabsList } from "@/components/ui/tabs";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description?: string;
  defaultTab: string;

  tabs: React.ReactNode;
  children: React.ReactNode;

  submitLabel: string;
  submitIcon?: React.ReactNode;
  submitting?: boolean;
  onSubmit: () => void | Promise<void>;

  /** ✅ NOVO */
  submitDisabled?: boolean;
};

export function ProductDialogLayout({
  title,
  description,
  defaultTab,
  tabs,
  children,
  submitLabel,
  submitting = false,
  onSubmit,
  submitDisabled = false,
}: Props) {
  return (
    <DialogContent className="h-svh min-w-screen p-0 overflow-hidden sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0">
      <div className="flex h-full min-h-0 flex-col">
        <DialogHeader className="shrink-0 px-6 py-4 border-b-1">
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="flex-1 min-h-0 overflow-hidden pb-0 mt-4">
          <TabsList className="shrink-0 sticky top-0 z-10 bg-background ml-4">{tabs}</TabsList>

          {children}
        </Tabs>

        <DialogFooter className="px-6 py-4">
          <div className="flex sm:flex-row gap-2">
            <Button
              type="button"
              disabled={submitting || submitDisabled}
              className="flex-1 hover:cursor-pointer"
              onClick={onSubmit}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Salvando...
                </>
              ) : (
                <>{submitLabel}</>
              )}
            </Button>

            <DialogClose asChild>
              <Button className="hover:cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </div>
    </DialogContent>
  );
}

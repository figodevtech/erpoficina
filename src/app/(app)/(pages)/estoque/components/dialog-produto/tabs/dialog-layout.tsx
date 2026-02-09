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
import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description?: string;
  defaultTab: string;

  tabs: React.ReactNode;
  children: React.ReactNode;

  submitLabel: string;
  submitLabel2?: string;
  submitIcon?: React.ReactNode;
  submitting?: boolean;
  onSubmit: (value?: boolean) => void | Promise<void>;

  currentTab: string;

  /** ✅ NOVO */
  submitDisabled?: boolean;
  isDesktop?: boolean;
};

export function ProductDialogLayout({
  title,
  description,
  defaultTab,
  currentTab,
  tabs,
  children,
  submitLabel,
  submitLabel2,
  submitting = false,
  onSubmit,
  submitDisabled = false,
  isDesktop = true,
}: Props) {
  const Content = isDesktop ? DialogContent : DrawerContent;
  const Header = isDesktop ? DialogHeader : DrawerHeader;
  const Footer = isDesktop ? DialogFooter : DrawerFooter;
  const Title = isDesktop ? DialogTitle : DrawerTitle;
  const Description = isDesktop ? DialogDescription : DrawerDescription;
  const Close = isDesktop ? DialogClose : DrawerClose;

  return (
    <Content
      className={
        isDesktop
          ? `
        h-svh w-[100dvw] max-w-[100dvw] p-0 overflow-hidden min-w-0
        sm:max-w-[1100px] sm:max-h-[850px] sm:w-[95vw] sm:min-w-0
      `
          : `h-[100dvh] min-h-dvh mt-0 rounded-none max-h-none flex flex-col`
      }
    >
      <div className="flex h-full min-h-0 min-w-0 flex-col">
        <Header className={isDesktop ? "shrink-0 px-6 py-4 border-b-1" : "shrink-0 px-4 py-2"}>
          <Title className={isDesktop ? "text-sm sm:text-lg pr-4" : ""}>{title}</Title>
          {description ? <Description>{description}</Description> : null}
        </Header>

        <Tabs
          value={currentTab}
          defaultValue={defaultTab}
          className="flex-1 min-h-0 min-w-0 overflow-hidden mt-4"
        >
          <div className="shrink-0 sticky top-0 z-10">
            <div
              className={
                isDesktop
                  ? `
                overflow-x-auto overflow-y-hidden px-6 pb-2
                [-ms-overflow-style:none] [scrollbar-width:none] 
              `
                  : `overflow-x-auto overflow-y-hidden px-4 pb-2`
              }
            >
              <TabsList className="w-max justify-start bg-transparent">{tabs}</TabsList>
            </div>
          </div>

          {children}
        </Tabs>

        <Footer className={isDesktop ? "px-6 py-4" : "px-4 py-4"}>
          <div className="flex sm:flex-row gap-2">
            <Button
              type="button"
              disabled={submitting || submitDisabled}
              className="flex-1 hover:cursor-pointer"
              onClick={() => onSubmit()}
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
            {submitLabel2 && (
              <Button
                variant={"secondary"}
                type="button"
                disabled={submitting || submitDisabled}
                className="flex-1 hover:cursor-pointer"
                onClick={() => onSubmit(true)}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>{submitLabel2}</>
                )}
              </Button>
            )}

            <Close asChild>
              <Button className="hover:cursor-pointer" variant={"outline"}>
                Cancelar
              </Button>
            </Close>
          </div>
        </Footer>
      </div>
    </Content>
  );
}

"use client";

import { Toaster } from "sonner";
import { usePathname } from "next/navigation";

export function RouteAwareToaster() {
  const pathname = usePathname() || "/";

  // Ajuste a regex/lista abaixo com as suas rotas públicas
  const isPublic =
    /^\/(login|recuperar-senha|senha-alterada)(\/|$)/.test(pathname);

  return (
    <Toaster
      richColors
      closeButton
      // público: topo-centro | app: canto inferior direito
      position={isPublic ? "top-center" : "bottom-right"}
      toastOptions={{
        duration: 4000,
      }}
    />
  );
}

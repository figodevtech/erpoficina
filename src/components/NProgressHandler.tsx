"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "@/lib/NProgress";

const NProgressHandler = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    NProgress.start();
    const frame = window.requestAnimationFrame(() => {
      NProgress.done();
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
};

export default NProgressHandler;

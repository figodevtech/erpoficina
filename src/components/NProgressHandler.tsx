"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NProgress from "@/lib/NProgress";

const NProgressHandler = () => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [loading]);

  useEffect(() => {
    if (pathname) {
      setLoading(true);
      // Simula o tempo de carregamento da nova página
      setTimeout(() => setLoading(false), 500); // Ajuste o tempo conforme necessário
    }
  }, [pathname]);

  return null;
};

export default NProgressHandler;
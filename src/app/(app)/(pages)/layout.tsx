// src/app/(app)/(shell)/layout.tsx
"use client";

import { use, useEffect, useState, type ReactNode } from "react";
import ClientAppShell from "./ClientAppShell";
import { Loader2, Pizza } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Settings } from "@/components/animate-ui/icons/settings";
import { Config } from "./type";
import { ConfigProvider } from "./config-context";

export default function ShellLayout({ children }: { children: ReactNode }) {
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [progress, setProgress] = useState(0);
  const [config, setConfig] = useState<Config | undefined>(undefined);

  const handleGetConfig = async () => {
    setProgress(10);
    try {
      setProgress(40);
      const response = await fetch("/api/config");
      setProgress(70);
      const data = await response.json();
      setProgress(90);
      if (data.config) {
        setProgress(100);
        setTimeout(() => setConfig(data.config), 500);
      }
    } catch (error) {
      console.error("Erro ao buscar configuração:", error);
    } finally {
      setLoadingConfigs(false);
    }
  };

  useEffect(() => {
    handleGetConfig();
  }, []);

  if (loadingConfigs || !config) {
    return (
      <div className="w-screen h-screen flex items-center justify-center gap-2">
        <div className="flex flex-col items-center justify-center">
          <div className="flex flex-row gap-2 items-center justify-center mb-4">
            <Settings
              animateOnView
              loop={true}
              className="text-muted-foreground"
            />
          </div>

          <Progress value={progress} className="w-50" />
          <span className="text-xs text-muted-foreground mt-2 text-nowrap flex flex-row gap-1 items-center">
            Estamos esquentando a pizza.{" "}
            <Pizza className="w-3 h-3 animate-bounce" />
          </span>
          <span className="text-[10px] text-muted-foreground font-serif">
            Powered by FIGO.
          </span>
        </div>
      </div>
    );
  }

  if (!loadingConfigs && config) {
    return (
      <ConfigProvider config={config}>
        <ClientAppShell>{children}</ClientAppShell>
      </ConfigProvider>
    );
  }
}

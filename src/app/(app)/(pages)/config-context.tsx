"use client";

import * as React from "react";
import type { Config } from "./type";

type ConfigContextValue = {
  config: Config | null;
};

const ConfigContext = React.createContext<ConfigContextValue | null>(null);

export function ConfigProvider({
  config,
  children,
}: {
  config: Config | null;
  children: React.ReactNode;
}) {


    
    return (
      <ConfigContext.Provider value={{ config }}>
        {children}
      </ConfigContext.Provider>
    );
  
}

export function useConfig() {
  const ctx = React.useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useConfig deve ser usado dentro de <ConfigProvider />");
  }
  return ctx.config;
}

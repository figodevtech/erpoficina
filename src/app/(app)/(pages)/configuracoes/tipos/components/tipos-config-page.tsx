// src/app/(app)/(pages)/configuracoes/tipos/components/tipos-config-page.tsx
"use client";

import { useState } from "react";
import {
  PackageSearch,
  Ruler,
  Wrench,
  Factory,
  Landmark,
  Tags,
  LayoutPanelLeft,
  Palette,
} from "lucide-react";

import GruposProdutoSection from "./grupos-produto-section";
import UnidadesMedidaSection from "./unidades-medida-section";
import ServicosSection from "./servicos-section";
import FornecedoresSection from "./fornecedores-section";
import BancosSection from "./contas-bancarias-section";
import CategoriasTransacaoSection from "./categorias-transacao-section";
import SetoresSection from "./setores-section";
import CoresVeiculosSection from "./cores-veiculos-section";

type TabId =
  | "grupos"
  | "unidades"
  | "servicos"
  | "fornecedores"
  | "setores"
  | "bancos"
  | "categorias"
  | "cores_veiculos";

export default function TiposConfigPage() {
  const [activeTab, setActiveTab] = useState<TabId>("grupos");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Lateral de tabs */}
        <div className="w-full lg:w-64 border rounded-md overflow-hidden bg-background">
          <div className="bg-muted/60 border-b px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Cadastros
          </div>
          <nav className="flex flex-col">
            <TabButton
              active={activeTab === "grupos"}
              icon={PackageSearch}
              title="Grupos de Produtos"
              subtitle="Organize por área do carro"
              onClick={() => setActiveTab("grupos")}
            />
            <TabButton
              active={activeTab === "unidades"}
              icon={Ruler}
              title="Unidades de Medida"
              subtitle="UN, JGO, KIT..."
              onClick={() => setActiveTab("unidades")}
            />
            <TabButton
              active={activeTab === "servicos"}
              icon={Wrench}
              title="Serviços"
              subtitle="Mão de obra / diagnósticos"
              onClick={() => setActiveTab("servicos")}
            />
            <TabButton
              active={activeTab === "fornecedores"}
              icon={Factory}
              title="Fornecedores"
              subtitle="Cadastro de fornecedores"
              onClick={() => setActiveTab("fornecedores")}
            />
            <TabButton
              active={activeTab === "setores"}
              icon={LayoutPanelLeft}
              title="Setores"
              subtitle="Áreas internas da empresa"
              onClick={() => setActiveTab("setores")}
            />
            <TabButton
              active={activeTab === "bancos"}
              icon={Landmark}
              title="Contas bancárias"
              subtitle="Contas / bancos"
              onClick={() => setActiveTab("bancos")}
            />
            <TabButton
              active={activeTab === "categorias"}
              icon={Tags}
              title="Categorias de transação"
              subtitle="Organize o financeiro"
              onClick={() => setActiveTab("categorias")}
            />

            {/* NOVO: Cores de Veículo */}
            <TabButton
              active={activeTab === "cores_veiculos"}
              icon={Palette}
              title="Cores de veículo"
              subtitle="Cores para o cadastro"
              onClick={() => setActiveTab("cores_veiculos")}
            />
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="rounded-md border bg-background px-4 py-5 sm:px-6 sm:py-6 min-h-[460px]">
            {activeTab === "grupos" && <GruposProdutoSection />}
            {activeTab === "unidades" && <UnidadesMedidaSection />}
            {activeTab === "servicos" && <ServicosSection />}
            {activeTab === "fornecedores" && <FornecedoresSection />}
            {activeTab === "setores" && <SetoresSection />}
            {activeTab === "bancos" && <BancosSection />}
            {activeTab === "categorias" && <CategoriasTransacaoSection />}
            {activeTab === "cores_veiculos" && <CoresVeiculosSection />}
          </div>
        </div>
      </div>
    </div>
  );
}

type TabButtonProps = {
  active: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle?: string;
  onClick: () => void;
};

function TabButton({
  active,
  icon: Icon,
  title,
  subtitle,
  onClick,
}: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 text-left border-b last:border-b-0 transition-colors ${
        active
          ? "bg-background text-foreground"
          : "bg-muted/40 text-muted-foreground hover:bg-muted/70"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-md border ${
          active ? "bg-primary/10 border-primary/40" : "bg-background"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{title}</span>
        {subtitle && (
          <span className="text-xs text-muted-foreground truncate">
            {subtitle}
          </span>
        )}
      </div>
    </button>
  );
}

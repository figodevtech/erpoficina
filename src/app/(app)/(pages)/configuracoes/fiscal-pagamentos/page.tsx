"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Receipt, Landmark, CreditCard, Webhook, Loader2 } from "lucide-react";

import { EmpresaTab } from "./components/empresa-tab";
import { NFeTab } from "./components/nfe-tab";
import { NFSeTab } from "./components/nfse-tab";
import { PagamentosTab } from "./components/pagamentos-tab";
import { WebhooksTab } from "./components/webhooks-tab";

const limparDigitos = (s: string) => (s || "").replace(/\D+/g, "");

type Empresa = {
  empresaId: number;
  cnpj: string;
  razaosocial: string;
  nomefantasia?: string;
  inscricaoestadual?: string;
  inscricaomunicipal?: string;
  endereco: string;
  codigomunicipio: string;
  regimetributario: "SIMPLES_NACIONAL" | "LUCRO_PRESUMIDO" | "LUCRO_REAL";
  ambiente: "HOMOLOGACAO" | "PRODUCAO";
};
type NFeCfg = {
  serieNFe: string;
  serieNFCe?: string;
  cscHomologacao?: string;
  cscProducao?: string;
  idCSC?: string;
  naturezaOperacao: string;
};
type NFSecfg = {
  provedor: string;
  inscricaoMunicipal?: string;
  serieRPS?: string;
  usuario?: string;
  senha?: string;
  token?: string;
  certificadoA1Base64?: string;
  senhaCertificado?: string;
};
type CartaoCfg = {
  habilitado: boolean;
  provider: "stone";
  merchantId: string;
  apiKey: string;
  webhookUrl?: string;
  parcelasMax: number;
  capturaAutomatica: boolean;
  terminalIds?: string[];
};
type PixCfg = {
  habilitado: boolean;
  provider: "stone" | "banco";
  chave: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  expiracaoSegundos: number;
};
type DinheiroCfg = { habilitado: boolean };

type FormValues = {
  empresa: Empresa;
  nfe: NFeCfg;
  nfse: NFSecfg;
  pagamentos: {
    cartao: CartaoCfg;
    pix: PixCfg;
    dinheiro: DinheiroCfg;
  };
};

export default function ConfigFiscalPagamentosPage() {
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [activeTab, setActiveTab] = useState("empresa");

  const { register, handleSubmit, setValue, watch, getValues, reset } = useForm<FormValues>({
    defaultValues: {
      empresa: {
        empresaId: 1,
        cnpj: "",
        razaosocial: "",
        nomefantasia: "",
        inscricaoestadual: "",
        inscricaomunicipal: "",
        endereco: "",
        codigomunicipio: "2507507",
        regimetributario: "SIMPLES_NACIONAL",
        ambiente: "HOMOLOGACAO",
      },
      nfe: {
        serieNFe: "1",
        serieNFCe: "",
        cscHomologacao: "",
        cscProducao: "",
        idCSC: "",
        naturezaOperacao: "Venda de mercadoria",
      },
      nfse: {
        provedor: "",
        inscricaoMunicipal: "",
        serieRPS: "",
        usuario: "",
        senha: "",
        token: "",
        certificadoA1Base64: "",
        senhaCertificado: "",
      },
      pagamentos: {
        cartao: {
          habilitado: true,
          provider: "stone",
          merchantId: "",
          apiKey: "",
          webhookUrl: "",
          parcelasMax: 1,
          capturaAutomatica: true,
          terminalIds: [],
        },
        pix: {
          habilitado: true,
          provider: "stone",
          chave: "",
          clientId: "",
          clientSecret: "",
          webhookUrl: "",
          expiracaoSegundos: 1800,
        },
        dinheiro: {
          habilitado: true,
        },
      },
    },
  });

  function applyEmpresa(e: any) {
    if (!e) return;
    setValue("empresa.empresaId", Number(e.id ?? 1));
    setValue("empresa.cnpj", e.cnpj ?? "");
    setValue("empresa.razaosocial", e.razaosocial ?? "");
    setValue("empresa.nomefantasia", e.nomefantasia ?? "");
    setValue("empresa.inscricaoestadual", e.inscricaoestadual ?? "");
    setValue("empresa.inscricaomunicipal", e.inscricaomunicipal ?? "");
    setValue("empresa.endereco", e.endereco ?? "");
    setValue("empresa.codigomunicipio", e.codigomunicipio ?? "");
    setValue("empresa.regimetributario", (e.regimetributario as any) ?? "SIMPLES_NACIONAL");
    setValue("empresa.ambiente", (e.ambiente as any) ?? "HOMOLOGACAO");
  }
  function applyNfe(n: any) {
    if (!n) return;
    setValue("nfe.serieNFe", n.serieNFe ?? n.serienfe ?? "1");
    setValue("nfe.serieNFCe", n.serieNFCe ?? n.serienfce ?? "");
    setValue("nfe.cscHomologacao", n.cscHomologacao ?? "");
    setValue("nfe.cscProducao", n.cscProducao ?? "");
    setValue("nfe.idCSC", n.idCSC ?? "");
    setValue("nfe.naturezaOperacao", n.naturezaOperacao ?? "Venda de mercadoria");
  }
  function applyNfse(n: any) {
    if (!n) return;
    setValue("nfse.provedor", n.provedor ?? "");
    setValue("nfse.inscricaoMunicipal", n.inscricaoMunicipal ?? "");
    setValue("nfse.serieRPS", n.serieRPS ?? "");
    setValue("nfse.usuario", n.usuario ?? "");
    setValue("nfse.senha", n.senha ?? "");
    setValue("nfse.token", n.token ?? "");
    setValue("nfse.certificadoA1Base64", n.certificadoA1Base64 ?? "");
    setValue("nfse.senhaCertificado", n.senhaCertificado ?? "");
  }
  function applyPagamentos(p: any) {
    if (!p) return;
    setValue("pagamentos.cartao.habilitado", p.cartao?.habilitado ?? true);
    setValue("pagamentos.cartao.provider", p.cartao?.provider ?? "stone");
    setValue("pagamentos.cartao.merchantId", p.cartao?.merchantId ?? "");
    setValue("pagamentos.cartao.apiKey", p.cartao?.apiKey ?? "");
    setValue("pagamentos.cartao.webhookUrl", p.cartao?.webhookUrl ?? "");
    setValue("pagamentos.cartao.parcelasMax", Number(p.cartao?.parcelasMax ?? 1));
    setValue("pagamentos.cartao.capturaAutomatica", !!p.cartao?.capturaAutomatica);
    setValue("pagamentos.cartao.terminalIds", Array.isArray(p.cartao?.terminalIds) ? p.cartao.terminalIds : []);
    setValue("pagamentos.pix.habilitado", p.pix?.habilitado ?? true);
    setValue("pagamentos.pix.provider", p.pix?.provider ?? "stone");
    setValue("pagamentos.pix.chave", p.pix?.chave ?? "");
    setValue("pagamentos.pix.clientId", p.pix?.clientId ?? "");
    setValue("pagamentos.pix.clientSecret", p.pix?.clientSecret ?? "");
    setValue("pagamentos.pix.webhookUrl", p.pix?.webhookUrl ?? "");
    setValue("pagamentos.pix.expiracaoSegundos", Number(p.pix?.expiracaoSegundos ?? 1800));
    setValue("pagamentos.dinheiro.habilitado", p.dinheiro?.habilitado ?? true);
  }

  async function carregarTudo() {
    setCarregando(true);
    try {
      const [rEmp, rNfe, rNfse, rPay] = await Promise.all([
        fetch("/api/config/empresa", { cache: "no-store" }),
        fetch("/api/config/nfe", { cache: "no-store" }),
        fetch("/api/config/nfse", { cache: "no-store" }),
        fetch("/api/config/pagamentos", { cache: "no-store" }),
      ]);
      const jEmp = await rEmp.json().catch(() => ({}));
      const jNfe = await rNfe.json().catch(() => ({}));
      const jNfse = await rNfse.json().catch(() => ({}));
      const jPay = await rPay.json().catch(() => ({}));
      if (rEmp.ok && jEmp?.empresa) applyEmpresa(jEmp.empresa);
      if (rNfe.ok && jNfe?.nfe) applyNfe(jNfe.nfe);
      if (rNfse.ok && jNfse?.nfse) applyNfse(jNfse.nfse);
      if (rPay.ok && jPay?.pagamentos) applyPagamentos(jPay.pagamentos);
    } catch (e) {
      console.warn(e);
    } finally {
      setCarregando(false);
    }
  }
  useEffect(() => {
    carregarTudo();
  }, []);

  function validar(v: FormValues, tab: string) {
    const errs: string[] = [];
    if (tab === "empresa") {
      const cnpj = limparDigitos(v.empresa.cnpj);
      if (cnpj.length < 14) errs.push("CNPJ inválido.");
      if (!v.empresa.razaosocial?.trim()) errs.push("Razão social obrigatória.");
      if (!v.empresa.endereco?.trim()) errs.push("Endereço obrigatório.");
      const ibge = limparDigitos(v.empresa.codigomunicipio);
      if (ibge.length !== 7) errs.push("Código do Município (IBGE) deve ter 7 dígitos.");
      if (!v.empresa.regimetributario?.trim()) errs.push("Regime tributário obrigatório.");
    }
    if (tab === "nfe") {
      if (!v.nfe.naturezaOperacao?.trim()) errs.push("Natureza de operação (NF-e) obrigatória.");
    }
    if (tab === "pagamentos") {
      if (v.pagamentos.cartao.habilitado) {
        if (!v.pagamentos.cartao.merchantId?.trim()) errs.push("Merchant ID (Cartão) é obrigatório quando habilitado.");
        if (!v.pagamentos.cartao.apiKey?.trim()) errs.push("API Key (Cartão) é obrigatória quando habilitado.");
      }
      if (v.pagamentos.pix.habilitado) {
        if (!v.pagamentos.pix.chave?.trim()) errs.push("Chave Pix é obrigatória quando habilitado.");
      }
    }
    return errs;
  }

  async function onSalvar(values: FormValues) {
    if (activeTab === "empresa") {
      values.empresa.cnpj = limparDigitos(values.empresa.cnpj);
      values.empresa.codigomunicipio = limparDigitos(values.empresa.codigomunicipio);
      if (values.empresa.inscricaoestadual)
        values.empresa.inscricaoestadual = limparDigitos(values.empresa.inscricaoestadual);
      if (values.empresa.inscricaomunicipal)
        values.empresa.inscricaomunicipal = limparDigitos(values.empresa.inscricaomunicipal);
    }

    const erros = validar(values, activeTab);
    if (erros.length) {
      toast.error(erros[0]);
      return;
    }

    setSalvando(true);
    try {
      if (activeTab === "empresa") {
        const r = await fetch("/api/config/empresa", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ empresa: values.empresa }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao salvar Empresa");
      }
      if (activeTab === "nfe") {
        const r = await fetch("/api/config/nfe", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nfe: values.nfe }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao salvar NFe");
      }
      if (activeTab === "nfse") {
        const r = await fetch("/api/config/nfse", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nfse: values.nfse }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao salvar NFS-e");
      }
      if (activeTab === "pagamentos") {
        const r = await fetch("/api/config/pagamentos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pagamentos: values.pagamentos }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao salvar Pagamentos");
      }
      if (activeTab === "webhooks") {
        const { pagamentos } = values;
        const r = await fetch("/api/config/webhooks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cartao_webhook_url: pagamentos?.cartao?.webhookUrl ?? null,
            pix_webhook_url: pagamentos?.pix?.webhookUrl ?? null,
          }),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao salvar Webhooks");
      }

      toast.success("Configurações salvas!");
      await carregarTudo();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="min-h-screen w-full">
      {/* header local removido */}

      <main className="w-full">
        <Tabs defaultValue="empresa" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted/60 p-1">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="nfe" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">NF-e / NFC-e</span>
            </TabsTrigger>
            <TabsTrigger value="nfse" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" /> <span className="hidden sm:inline">NFS-e</span>
            </TabsTrigger>
            <TabsTrigger value="pagamentos" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" /> <span className="hidden sm:inline">Webhooks</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="empresa" className="mt-6">
            <EmpresaTab register={register} setValue={setValue} watch={watch} />
          </TabsContent>

          <TabsContent value="nfe" className="mt-6">
            <NFeTab register={register} setValue={setValue} watch={watch} />
          </TabsContent>

          <TabsContent value="nfse" className="mt-6">
            <NFSeTab register={register} setValue={setValue} />
          </TabsContent>

          <TabsContent value="pagamentos" className="mt-6">
            <PagamentosTab register={register} setValue={setValue} watch={watch} getValues={getValues} />
          </TabsContent>

          <TabsContent value="webhooks" className="mt-6">
            <WebhooksTab />
          </TabsContent>

          {/* ⬇️ Botão abaixo do conteúdo das abas */}
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSubmit(onSalvar)}
              disabled={salvando || carregando}
              aria-label="Salvar alterações"
              title="Salvar alterações"
            >
              {salvando || carregando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {carregando ? "Carregando…" : "Salvando…"}
                </>
              ) : (
                "Salvar alterações"
              )}
            </Button>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

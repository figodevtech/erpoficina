"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Receipt, Landmark, Loader2 } from "lucide-react";

import { EmpresaTab } from "./components/empresa-tab";
import { NFeTab } from "./components/nfe-tab";
import { NFSeTab } from "./components/nfse-tab";
import type { FormValues } from "./types";

const limparDigitos = (s: string) => (s || "").replace(/\D+/g, "");

export default function ConfigFiscalPagamentosPage() {
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [activeTab, setActiveTab] = useState("empresa");

  const { register, handleSubmit, setValue, watch, getValues } = useForm<FormValues>({
    defaultValues: {
      empresa: {
        empresaId: 1,
        cnpj: "",
        razaosocial: "",
        nomefantasia: "",
        inscricaoestadual: "",
        inscricaomunicipal: "",
        inscricaoestadualst: "",
        endereco: "",
        numero: "",
        complemento: "",
        bairro: "",
        cep: "",
        uf: "PB",
        codigomunicipio: "2507507",
        codigopais: "1058",
        nomepais: "BRASIL",
        telefone: "",
        cnae: "",
        regimetributario: "1",
        ambiente: "HOMOLOGACAO",
        certificadocaminho: "",
        certificadosenha: "",
        cschomologacao: "",
        cscproducao: "",
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
    },
  });

  const applyEmpresa = useCallback(
    (e: any) => {
      if (!e) return;
      setValue("empresa.empresaId", Number(e.id ?? 1));
      setValue("empresa.cnpj", e.cnpj ?? "");
      setValue("empresa.razaosocial", e.razaosocial ?? "");
      setValue("empresa.nomefantasia", e.nomefantasia ?? "");
      setValue("empresa.inscricaoestadual", e.inscricaoestadual ?? "");
      setValue("empresa.inscricaomunicipal", e.inscricaomunicipal ?? "");
      setValue("empresa.inscricaoestadualst", e.inscricaoestadualst ?? "");
      setValue("empresa.endereco", e.endereco ?? "");
      setValue("empresa.numero", e.numero ?? "");
      setValue("empresa.complemento", e.complemento ?? "");
      setValue("empresa.bairro", e.bairro ?? "");
      setValue("empresa.cep", e.cep ?? "");
      setValue("empresa.uf", e.uf ?? "PB");
      setValue("empresa.codigomunicipio", e.codigomunicipio ?? "");
      setValue("empresa.codigopais", e.codigopais ?? "1058");
      setValue("empresa.nomepais", e.nomepais ?? "BRASIL");
      setValue("empresa.telefone", e.telefone ?? "");
      setValue("empresa.cnae", e.cnae ?? "");
      setValue("empresa.regimetributario", (e.regimetributario as any) ?? "1");
      setValue("empresa.ambiente", (e.ambiente as any) ?? "HOMOLOGACAO");
      setValue("empresa.certificadocaminho", e.certificadocaminho ?? "");
      setValue("empresa.certificadosenha", e.certificadosenha ?? "");
      setValue("empresa.cschomologacao", e.cschomologacao ?? "");
      setValue("empresa.cscproducao", e.cscproducao ?? "");
    },
    [setValue]
  );

  const applyNfe = useCallback(
    (n: any) => {
      if (!n) return;
      setValue("nfe.serieNFe", n.serieNFe ?? n.serienfe ?? "1");
      setValue("nfe.serieNFCe", n.serieNFCe ?? n.serienfce ?? "");
      setValue("nfe.cscHomologacao", n.cscHomologacao ?? "");
      setValue("nfe.cscProducao", n.cscProducao ?? "");
      setValue("nfe.idCSC", n.idCSC ?? "");
      setValue("nfe.naturezaOperacao", n.naturezaOperacao ?? "Venda de mercadoria");
    },
    [setValue]
  );

  const applyNfse = useCallback(
    (n: any) => {
      if (!n) return;
      setValue("nfse.provedor", n.provedor ?? "");
      setValue("nfse.inscricaoMunicipal", n.inscricaoMunicipal ?? "");
      setValue("nfse.serieRPS", n.serieRPS ?? "");
      setValue("nfse.usuario", n.usuario ?? "");
      setValue("nfse.senha", n.senha ?? "");
      setValue("nfse.token", n.token ?? "");
      setValue("nfse.certificadoA1Base64", n.certificadoA1Base64 ?? "");
      setValue("nfse.senhaCertificado", n.senhaCertificado ?? "");
    },
    [setValue]
  );

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    try {
      const [rEmp, rNfe, rNfse] = await Promise.all([
        fetch("/api/config/empresa", { cache: "no-store" }),
        fetch("/api/config/nfe", { cache: "no-store" }),
        fetch("/api/config/nfse", { cache: "no-store" }),
      ]);
      const jEmp = await rEmp.json().catch(() => ({}));
      const jNfe = await rNfe.json().catch(() => ({}));
      const jNfse = await rNfse.json().catch(() => ({}));
      if (rEmp.ok && jEmp?.empresa) applyEmpresa(jEmp.empresa);
      if (rNfe.ok && jNfe?.nfe) applyNfe(jNfe.nfe);
      if (rNfse.ok && jNfse?.nfse) applyNfse(jNfse.nfse);
    } catch (e) {
      console.warn(e);
    } finally {
      setCarregando(false);
    }
  }, [applyEmpresa, applyNfe, applyNfse]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  function validar(v: FormValues, tab: string) {
    const errs: string[] = [];
    if (tab === "empresa") {
      const cnpj = limparDigitos(v.empresa.cnpj);
      if (cnpj.length < 14) errs.push("CNPJ invalido.");
      if (!v.empresa.razaosocial?.trim()) errs.push("Razao social obrigatoria.");
      if (!v.empresa.endereco?.trim()) errs.push("Endereco obrigatorio.");
      if (!v.empresa.numero?.trim()) errs.push("Numero do endereco obrigatorio.");
      const ibge = limparDigitos(v.empresa.codigomunicipio);
      if (ibge.length !== 7) errs.push("Codigo do Municipio (IBGE) deve ter 7 digitos.");
      if (!v.empresa.regimetributario?.trim()) errs.push("Regime tributario obrigatorio.");
    }
    if (tab === "nfe") {
      if (!v.nfe.naturezaOperacao?.trim()) errs.push("Natureza de operacao (NF-e) obrigatoria.");
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
      if (values.empresa.inscricaoestadualst)
        values.empresa.inscricaoestadualst = limparDigitos(values.empresa.inscricaoestadualst);
      if (values.empresa.cep) values.empresa.cep = limparDigitos(values.empresa.cep);
      if (values.empresa.telefone) values.empresa.telefone = limparDigitos(values.empresa.telefone);
      if (values.empresa.codigopais) values.empresa.codigopais = limparDigitos(values.empresa.codigopais);
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
      <main className="w-full">
        <Tabs defaultValue="empresa" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-muted/60">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" /> <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="nfe" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" /> <span className="hidden sm:inline">NF-e / NFC-e</span>
            </TabsTrigger>
            <TabsTrigger value="nfse" className="flex items-center gap-2">
              <Landmark className="h-4 w-4" /> <span className="hidden sm:inline">NFS-e</span>
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

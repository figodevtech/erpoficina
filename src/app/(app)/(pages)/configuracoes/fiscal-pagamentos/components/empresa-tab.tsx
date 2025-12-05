"use client"

import type { UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info, AlertCircle } from "lucide-react"

type Empresa = {
  id?: number
  cnpj: string
  razaosocial: string
  nomefantasia?: string
  inscricaoestadual?: string
  inscricaomunicipal?: string
  inscricaoestadualst?: string
  endereco: string
  numero?: string
  complemento?: string
  bairro?: string
  cep?: string
  uf?: string
  codigomunicipio: string
  codigopais?: string
  nomepais?: string
  telefone?: string
  cnae?: string
  regimetributario: "1" | "2" | "3"
  ambiente: "HOMOLOGACAO" | "PRODUCAO"
  certificadocaminho?: string
  certificadosenha?: string
  cschomologacao?: string
  cscproducao?: string
}

type FormValues = {
  empresa: Empresa
  nfe?: any
  nfse?: any
  pagamentos?: any
}

type Props = {
  register: UseFormRegister<FormValues>
  setValue: UseFormSetValue<FormValues>
  watch: UseFormWatch<FormValues>
}

const REGIME_TRIBUTARIO_OPTIONS = [
  { value: "1", label: "Simples Nacional" },
  { value: "2", label: "Lucro Presumido" },
  { value: "3", label: "Lucro Real" },
]

const UF_OPTIONS = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export function EmpresaTab({ register, setValue, watch }: Props) {
  const regTrib = watch("empresa.regimetributario") || "1"
  const ambiente = watch("empresa.ambiente") || "HOMOLOGACAO"

  return (
    <div className="space-y-6">
      {/* Seção: Identificação da Empresa */}
      <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Identificação da Empresa</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <Label className="mb-2 block text-sm font-medium">CNPJ *</Label>
              <Input
                {...register("empresa.cnpj", { required: true })}
                placeholder="00.000.000/0000-00"
                inputMode="numeric"
                maxLength={18}
              />
              <p className="text-xs text-muted-foreground mt-1">Formato: 00.000.000/0000-00</p>
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-2 block text-sm font-medium">Razão Social *</Label>
              <Input {...register("empresa.razaosocial", { required: true })} placeholder="Razão Social Completa" />
            </div>

            <div className="sm:col-span-3">
              <Label className="mb-2 block text-sm font-medium">Nome Fantasia</Label>
              <Input {...register("empresa.nomefantasia")} placeholder="Nome comercial (opcional)" />
            </div>

            <div className="sm:col-span-1">
              <Label className="mb-2 block text-sm font-medium">Inscrição Estadual</Label>
              <Input {...register("empresa.inscricaoestadual")} placeholder="Apenas números" inputMode="numeric" />
            </div>

            <div className="sm:col-span-1">
              <Label className="mb-2 block text-sm font-medium">IE Substituta</Label>
              <Input {...register("empresa.inscricaoestadualst")} placeholder="Opcional" inputMode="numeric" />
            </div>

            <div className="sm:col-span-1">
              <Label className="mb-2 block text-sm font-medium">Inscrição Municipal</Label>
              <Input {...register("empresa.inscricaomunicipal")} placeholder="Apenas números" inputMode="numeric" />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-2 block text-sm font-medium">CNAE</Label>
              <Input {...register("empresa.cnae")} placeholder="Ex: 6202100" inputMode="numeric" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Endereço */}
      <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Endereço</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <Label className="mb-2 block text-sm font-medium">Endereço *</Label>
              <Input {...register("empresa.endereco", { required: true })} placeholder="Rua, avenida, etc." />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Número *</Label>
              <Input {...register("empresa.numero", { required: true })} placeholder="123" inputMode="numeric" />
            </div>

            <div className="sm:col-span-2">
              <Label className="mb-2 block text-sm font-medium">Complemento</Label>
              <Input {...register("empresa.complemento")} placeholder="Apto, sala, etc." />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Bairro</Label>
              <Input {...register("empresa.bairro")} placeholder="Bairro" />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">CEP</Label>
              <Input {...register("empresa.cep")} placeholder="00000-000" inputMode="numeric" />
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">UF</Label>
              <Select
                value={watch("empresa.uf") || ""}
                onValueChange={(v) => setValue("empresa.uf", v, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {UF_OPTIONS.map((uf) => (
                    <SelectItem key={uf} value={uf}>
                      {uf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Código do Município (IBGE) *</Label>
              <Input
                {...register("empresa.codigomunicipio", { required: true })}
                placeholder="Ex: 2507507"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground mt-1">Código IBGE com 7 dígitos</p>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Telefone</Label>
              <Input {...register("empresa.telefone")} placeholder="(83) 98765-4321" inputMode="tel" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Regime Tributário e Ambiente */}
      <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Configuração Fiscal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Regime Tributário *</Label>
              <Select
                value={regTrib}
                onValueChange={(v) => setValue("empresa.regimetributario", v as "1" | "2" | "3", { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {REGIME_TRIBUTARIO_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Ambiente *</Label>
              <Select
                value={ambiente}
                onValueChange={(v) =>
                  setValue("empresa.ambiente", v as "HOMOLOGACAO" | "PRODUCAO", { shouldDirty: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOMOLOGACAO">Homologação</SelectItem>
                  <SelectItem value="PRODUCAO">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-amber-900 dark:text-amber-100">
              Ambiente em <strong>Homologação</strong> é para testes. Mude para <strong>Produção</strong> apenas após
              validar todas as configurações.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Certificado Digital */}
      <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Certificado Digital</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Caminho do Certificado</Label>
              <Input {...register("empresa.certificadocaminho")} placeholder="/path/to/certificate.pfx" />
              <p className="text-xs text-muted-foreground mt-1">Caminho para o arquivo .pfx ou .p12</p>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">Senha do Certificado</Label>
              <Input {...register("empresa.certificadosenha")} type="password" placeholder="Senha segura" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: CSC (Código de Segurança do Contribuinte) */}
      <Card className="border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <CardContent className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">CSC - Código de Segurança</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">CSC Homologação</Label>
              <Input
                {...register("empresa.cschomologacao")}
                type="password"
                placeholder="Código para ambiente de teste"
              />
              <p className="text-xs text-muted-foreground mt-1">Obtenha no portal NFS-e</p>
            </div>

            <div>
              <Label className="mb-2 block text-sm font-medium">CSC Produção</Label>
              <Input
                {...register("empresa.cscproducao")}
                type="password"
                placeholder="Código para ambiente de produção"
              />
              <p className="text-xs text-muted-foreground mt-1">Obtenha no portal NFS-e</p>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            <p>
              Para emissão de NFS-e, confirme no portal municipal qual é o provedor de NFS-e e as credenciais exigidas.
              Tanto certificado digital quanto CSC podem ser obrigatórios dependendo do município.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

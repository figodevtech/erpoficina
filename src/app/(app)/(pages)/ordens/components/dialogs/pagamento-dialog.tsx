"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, CreditCard, QrCode, Wallet, CheckCircle2, ShoppingCart, Wrench } from "lucide-react";

type Metodo = "CARTAO_CREDITO" | "CARTAO_DEBITO" | "PIX" | "DINHEIRO";

type ItemProduto = {
  produtoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number;
  subtotal: number;
};

type ItemServico = {
  servicoid: number;
  descricao: string;
  quantidade: number;
  precounitario: number;
  subtotal: number;
};

const money = (v: number | string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0);

export function PagamentoDialog({
  open,
  onOpenChange,
  osId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  osId: number | null;
}) {
  // resumo orçamento
  const [carregandoResumo, setCarregandoResumo] = useState(false);
  const [produtos, setProdutos] = useState<ItemProduto[]>([]);
  const [servicos, setServicos] = useState<ItemServico[]>([]);

  const totalProdutos = useMemo(() => produtos.reduce((a, b) => a + Number(b.subtotal || 0), 0), [produtos]);
  const totalServicos = useMemo(() => servicos.reduce((a, b) => a + Number(b.subtotal || 0), 0), [servicos]);
  const totalGeral = totalProdutos + totalServicos;

  // pagamento
  const [metodo, setMetodo] = useState<Metodo>("CARTAO_CREDITO");
  const [valor, setValor] = useState<string>("0");
  const [parcelas, setParcelas] = useState(1);

  // emissão fiscal
  const [emitirNFeProdutos, setEmitirNFeProdutos] = useState(true);
  const [emitirNFSeServicos, setEmitirNFSeServicos] = useState(true);

  // processamento
  const [criando, setCriando] = useState(false);
  const [pagamentoId, setPagamentoId] = useState<number | null>(null);
  const [status, setStatus] = useState<"CRIADO" | "PROCESSANDO" | "APROVADO" | "NEGADO" | "CANCELADO" | "ERRO">("CRIADO");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [comprovante, setComprovante] = useState<string | null>(null);

  const valorNum = useMemo(() => Number(valor) || 0, [valor]);
  const estaProcessando = criando || (pagamentoId != null && status === "PROCESSANDO");

  useEffect(() => {
    if (!open) {
      // reset
      setMetodo("CARTAO_CREDITO");
      setValor("0");
      setParcelas(1);
      setCriando(false);
      setPagamentoId(null);
      setStatus("CRIADO");
      setQrCode(null);
      setComprovante(null);
      setEmitirNFeProdutos(true);
      setEmitirNFSeServicos(true);
      setProdutos([]);
      setServicos([]);
      return;
    }
    // ao abrir: carregar itens
    if (osId) carregarResumo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, osId]);

  async function carregarResumo() {
    if (!osId) return;
    setCarregandoResumo(true);
    try {
      const r = await fetch(`/api/ordens/${osId}/orcamento`, { cache: "no-store" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao carregar orçamento da OS");

      const listP: ItemProduto[] = Array.isArray(j?.produtos) ? j.produtos : [];
      const listS: ItemServico[] = Array.isArray(j?.servicos) ? j.servicos : [];

      setProdutos(listP);
      setServicos(listS);
      setValor(String(listP.reduce((a: number, it: any) => a + Number(it.subtotal || 0), 0) +
                      listS.reduce((a: number, it: any) => a + Number(it.subtotal || 0), 0)));
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar resumo");
    } finally {
      setCarregandoResumo(false);
    }
  }

  async function iniciarPagamento() {
    if (!osId) return;
    if (valorNum <= 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setCriando(true);
    try {
      const r = await fetch("/api/pagamentos/iniciar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          osId,
          metodo,
          valor: valorNum,
          parcelas: metodo === "CARTAO_CREDITO" ? parcelas : 1,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao iniciar pagamento");

      setPagamentoId(j.id);
      setStatus(j.status || "PROCESSANDO");
      setQrCode(j.qrcode || null);
      setComprovante(j.comprovante || null);

      if (metodo === "CARTAO_CREDITO" || metodo === "CARTAO_DEBITO" || metodo === "PIX") {
        pollStatus(j.id);
      } else {
        toast.success("Pagamento registrado.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao iniciar pagamento");
    } finally {
      setCriando(false);
    }
  }

  async function pollStatus(id: number) {
    const int = setInterval(async () => {
      try {
        const r = await fetch(`/api/pagamentos/${id}/status`, { cache: "no-store" });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j?.error || "Falha ao consultar status");

        setStatus(j.status || "PROCESSANDO");
        setComprovante(j.comprovante || comprovante);

        if (["APROVADO", "NEGADO", "CANCELADO", "ERRO"].includes(j.status)) {
          clearInterval(int);
          if (j.status === "APROVADO") toast.success("Pagamento aprovado.");
          else toast.error(`Pagamento ${j.status.toLowerCase()}.`);
        }
      } catch { /* noop */ }
    }, 2000);
    setTimeout(() => clearInterval(int), 120000);
  }

  async function concluirOS() {
    if (!osId) return;
    if (!pagamentoId || status !== "APROVADO") {
      toast.error("Aguarde a aprovação do pagamento.");
      return;
    }
    try {
      const r = await fetch(`/api/ordens/${osId}/pagar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagamentoId,
          emitirNFeProdutos,
          emitirNFSeServicos,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j?.error || "Falha ao concluir OS");

      toast.success("OS concluída e documentos emitidos (quando selecionados).");
      window.dispatchEvent(new CustomEvent("os:refresh"));
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao concluir");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Receber pagamento</DialogTitle>
        </DialogHeader>

        {/* Resumo do orçamento (produtos + serviços) */}
        <div className="space-y-5">
          <div className="rounded-md border">
            <div className="flex items-center gap-2 p-3 border-b">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <div className="font-medium">Produtos</div>
              <div className="ml-auto text-xs text-muted-foreground">
                {carregandoResumo ? "Carregando…" : `${produtos.length} item(ns)`}
              </div>
            </div>
            <div className="max-h-56 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[90px] text-center">Qtd.</TableHead>
                    <TableHead className="w-[140px] text-right">Preço unit.</TableHead>
                    <TableHead className="w-[140px] text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Sem produtos</TableCell></TableRow>
                  ) : produtos.map((it, i) => (
                    <TableRow key={`${it.produtoid}-${i}`}>
                      <TableCell className="pr-2">{it.descricao}</TableCell>
                      <TableCell className="text-center">{it.quantidade}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(it.precounitario)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(it.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end p-3 border-t text-sm">
              <div className="text-muted-foreground mr-2">Total Produtos:</div>
              <div className="font-medium">{money(totalProdutos)}</div>
            </div>
          </div>

          <div className="rounded-md border">
            <div className="flex items-center gap-2 p-3 border-b">
              <Wrench className="h-4 w-4 text-primary" />
              <div className="font-medium">Serviços</div>
              <div className="ml-auto text-xs text-muted-foreground">
                {carregandoResumo ? "Carregando…" : `${servicos.length} item(ns)`}
              </div>
            </div>
            <div className="max-h-56 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[90px] text-center">Qtd.</TableHead>
                    <TableHead className="w-[140px] text-right">Preço unit.</TableHead>
                    <TableHead className="w-[140px] text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {servicos.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-sm text-muted-foreground">Sem serviços</TableCell></TableRow>
                  ) : servicos.map((it, i) => (
                    <TableRow key={`${it.servicoid}-${i}`}>
                      <TableCell className="pr-2">{it.descricao}</TableCell>
                      <TableCell className="text-center">{it.quantidade}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(it.precounitario)}</TableCell>
                      <TableCell className="text-right tabular-nums">{money(it.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-end p-3 border-t text-sm">
              <div className="text-muted-foreground mr-2">Total Serviços:</div>
              <div className="font-medium">{money(totalServicos)}</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Total geral do orçamento</div>
            <div className="text-lg font-semibold">{money(totalGeral)}</div>
          </div>

          <Separator />

          {/* Forma de pagamento */}
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <RadioGroup
              className="grid grid-cols-2 gap-2"
              value={metodo}
              onValueChange={(v) => setMetodo(v as Metodo)}
              disabled={pagamentoId != null}
            >
              <Label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                <RadioGroupItem value="CARTAO_CREDITO" /> <CreditCard className="h-4 w-4" />
                Cartão de Crédito
              </Label>
              <Label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                <RadioGroupItem value="CARTAO_DEBITO" /> <CreditCard className="h-4 w-4" />
                Cartão de Débito
              </Label>
              <Label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                <RadioGroupItem value="PIX" /> <QrCode className="h-4 w-4" />
                PIX
              </Label>
              <Label className="flex items-center gap-2 border rounded-md p-2 cursor-pointer">
                <RadioGroupItem value="DINHEIRO" /> <Wallet className="h-4 w-4" />
                Dinheiro
              </Label>
            </RadioGroup>
          </div>

          {/* Valor + Parcelas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valor a receber</Label>
              <Input
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                disabled={pagamentoId != null}
              />
              <p className="text-xs text-muted-foreground">{money(valorNum)}</p>
            </div>

            {metodo === "CARTAO_CREDITO" && (
              <div className="space-y-2">
                <Label>Parcelas</Label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={parcelas}
                  onChange={(e) => setParcelas(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                  disabled={pagamentoId != null}
                />
              </div>
            )}
          </div>

          {/* PIX payload */}
          {metodo === "PIX" && qrCode && (
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium mb-1">PIX Copia & Cola</div>
              <textarea className="w-full text-xs bg-muted p-2 rounded" rows={4} readOnly value={qrCode} />
            </div>
          )}

          {/* Comprovante (cartão) */}
          {comprovante && (
            <div className="rounded-md border p-3 text-sm">
              <div className="font-medium mb-1">Comprovante</div>
              <pre className="text-xs whitespace-pre-wrap">{comprovante}</pre>
            </div>
          )}

          <Separator />

          {/* Emissão fiscal */}
          <div className="space-y-2">
            <Label>Emissão de Nota Fiscal</Label>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={emitirNFeProdutos} onCheckedChange={(v) => setEmitirNFeProdutos(Boolean(v))} />
                Emitir NF-e (produtos)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={emitirNFSeServicos} onCheckedChange={(v) => setEmitirNFSeServicos(Boolean(v))} />
                Emitir NFS-e (serviços)
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Os dados fiscais serão montados a partir do cadastro de produtos/serviços desta OS.
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">Status do pagamento:</div>
            <div className="font-medium">
              {status === "APROVADO" ? (
                <span className="text-emerald-600 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Aprovado
                </span>
              ) : (
                status
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {!pagamentoId ? (
            <Button onClick={iniciarPagamento} disabled={estaProcessando || !osId || valorNum <= 0}>
              {estaProcessando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Iniciar pagamento
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={estaProcessando}>
                Fechar
              </Button>
              <Button onClick={concluirOS} disabled={status !== "APROVADO"}>
                Concluir OS
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

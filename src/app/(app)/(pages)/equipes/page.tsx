"use client";

import { useState, useEffect } from "react";
import type { DetalheOS, RowOS, StatusOS } from "./types";
import { listarOrdensEquipe, assumirOS, obterDetalhesOS, finalizarOS } from "./lib/api";
import { TabelaOrdens } from "./components/tabela-ordens";
import { PainelDetalhes } from "./components/painel-detalhes";
import { Paginacao } from "./components/paginacao";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export default function EquipesPage() {
  const [ordens, setOrdens] = useState<RowOS[]>([]);
  const [ordemSelecionada, setOrdemSelecionada] = useState<DetalheOS>();
  const [filtroStatus, setFiltroStatus] = useState<StatusOS>("TODAS");
  const [busca, setBusca] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);
  const [totalItens, setTotalItens] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarOrdens();
  }, [filtroStatus, busca, paginaAtual, itensPorPagina]);

  const carregarOrdens = async () => {
    try {
      setCarregando(true);
      const resultado = await listarOrdensEquipe({
        status: filtroStatus,
        q: busca,
        page: paginaAtual,
        limit: itensPorPagina,
      });
      setOrdens(resultado.items);
      setTotalItens(resultado.total);
      setTotalPaginas(resultado.totalPages);
    } catch (error) {
      console.error("[v0] Erro ao carregar ordens:", error);
    } finally {
      setCarregando(false);
    }
  };

  const aoSelecionarOrdem = async (ordem: RowOS) => {
    try {
      const detalhes = await obterDetalhesOS(ordem.id);
      setOrdemSelecionada(detalhes);
    } catch (error) {
      console.error("[v0] Erro ao carregar detalhes:", error);
    }
  };

  const aoMudarFiltros = (novoFiltro: StatusOS) => {
    setFiltroStatus(novoFiltro);
    setPaginaAtual(1);
  };

  const aoMudarBusca = (novaBusca: string) => {
    setBusca(novaBusca);
    setPaginaAtual(1);
  };

  const aoMudarItensPorPagina = (novosItens: number) => {
    setItensPorPagina(novosItens);
    setPaginaAtual(1);
  };

  const aoAssumirOrdem = async (ordemId: number) => {
    try {
      await assumirOS(ordemId);
      await carregarOrdens();
      if (ordemSelecionada?.id === ordemId) {
        const detalhes = await obterDetalhesOS(ordemId);
        setOrdemSelecionada(detalhes);
      }
    } catch (error) {
      console.error("[v0] Erro ao assumir ordem:", error);
    }
  };

  const aoFinalizarOrdem = async (ordemId: number, observacoes: string) => {
    try {
      await finalizarOS(ordemId, observacoes);
      await carregarOrdens();
      if (ordemSelecionada?.id === ordemId) {
        const detalhes = await obterDetalhesOS(ordemId);
        setOrdemSelecionada(detalhes);
      }
    } catch (error) {
      console.error("[v0] Erro ao finalizar ordem:", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 border-b bg-card/60 px-4 py-4">
        <div className="flex items-end justify-between">
          {/* <div className="space-y-1">
            <h1 className="text-2xl font-bold leading-tight">Equipes</h1>
            <p className="text-sm text-muted-foreground">Gerencie ordens de serviço da oficina</p>
          </div> */}
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground">
            {totalItens} Ordem{totalItens !== 1 && "s"} de Serviço
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="min-h-0 flex-1 overflow-hidden py-4">
        <div className="flex h-full gap-6 overflow-hidden">
          {/* Lista de Ordens */}
          <div className="min-h-0 flex flex-1 flex-col gap-4 overflow-hidden">
            {/* Filtros */}
            <div className="shrink-0 rounded-lg border bg-card p-3">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar por OS, cliente, placa ou descrição..."
                    value={busca}
                    onChange={(e) => aoMudarBusca(e.target.value)}
                    className="bg-card pl-10"
                  />
                </div>
                <Select value={filtroStatus} onValueChange={(value) => aoMudarFiltros(value as StatusOS)}>
                  <SelectTrigger className="bg-card sm:w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas</SelectItem>
                    <SelectItem value="ABERTA">Aberta</SelectItem>
                    <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                    <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabela/Cards */}
            <div className="min-h-0 flex-1 overflow-auto rounded-lg">
              {carregando ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium text-muted-foreground">Carregando...</p>
                  </div>
                </div>
              ) : ordens.length > 0 ? (
                <TabelaOrdens
                  ordens={ordens}
                  ordemSelecionada={ordemSelecionada}
                  aoSelecionarOrdem={aoSelecionarOrdem}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-lg font-medium text-muted-foreground">Nenhuma ordem encontrada</p>
                    <p className="text-sm text-muted-foreground">Tente ajustar os filtros de busca</p>
                  </div>
                </div>
              )}
            </div>

            {/* Páginação */}
            {ordens.length > 0 && (
              <div className="shrink-0 rounded-lg border bg-card p-3">
                <Paginacao
                  paginaAtual={paginaAtual}
                  totalPaginas={totalPaginas}
                  itensPorPagina={itensPorPagina}
                  totalItens={totalItens}
                  aoMudarPagina={setPaginaAtual}
                  aoMudarItensPorPagina={aoMudarItensPorPagina}
                />
              </div>
            )}
          </div>

          {/* Painel de Detalhes - Desktop */}
          {ordemSelecionada && (
            <div className="hidden min-h-0 w-[400px] shrink-0 overflow-auto border-l pl-6 lg:block xl:w-[480px]">
              <PainelDetalhes
                ordem={ordemSelecionada}
                aoAssumirOrdem={aoAssumirOrdem}
                aoFinalizarOrdem={aoFinalizarOrdem}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal Mobile - Painel de Detalhes */}
      {ordemSelecionada && (
        <div className="fixed inset-0 z-50 bg-background p-3 lg:hidden">
          <PainelDetalhes
            ordem={ordemSelecionada}
            aoFechar={() => setOrdemSelecionada(undefined)}
            aoAssumirOrdem={aoAssumirOrdem}
            aoFinalizarOrdem={aoFinalizarOrdem}
          />
        </div>
      )}
    </div>
  );
}

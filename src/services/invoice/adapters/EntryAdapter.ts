import { CreateInvoiceDTO } from "../invoice.types";
import { NFeItem } from "@/lib/nfe/types";

export class EntryAdapter {
    constructor(
        private entrada: any, // Tipo any por enquanto para flexibilidade, mas deveria ser tipado
        private itens: any[],
        private empresaId: number
    ) { }

    toInvoiceDTO(): CreateInvoiceDTO {
        // Mapear Fornecedor -> Parceiro
        // NOTA: O fornecedor no schema tem colunas: cpfcnpj, nomerazaosocial, endereco, cidade, estado, cep...
        // Precisamos garantir que esses dados venham na query (join).

        const fornecedor = this.entrada.fornecedor;
        if (!fornecedor) throw new Error("Dados do fornecedor não carregados na entrada.");

        const parceiro = {
            tipo: "FORNECEDOR" as const,
            id: fornecedor.id,
            documento: fornecedor.cpfcnpj.replace(/\D/g, ""),
            razaoSocial: fornecedor.nomerazaosocial,
            endereco: {
                logradouro: fornecedor.endereco || "",
                numero: fornecedor.endereconumero || "S/N",
                codigoMunicipio: fornecedor.codigomunicipio || "0000000",
                complemento: fornecedor.enderecocomplemento,
                bairro: fornecedor.bairro || "",
                cidade: fornecedor.cidade || "",
                uf: fornecedor.estado || "SP", // Fallback perigoso, melhor validar
                cep: fornecedor.cep || "",
            },
            inscricaoEstadual: fornecedor.inscricaoestadual,
        };

        const invoiceItens: NFeItem[] = this.itens.map((item, idx) => {
            return {
                numeroItem: idx + 1,
                codigoProduto: String(item.produto_id),
                descricao: item.descricao || item.titulo || "ITEM SEM DESCRICAO",
                ncm: item.ncm || "00000000",
                cfop: item.cfop || "1102", // Default entrada
                unidade: item.unidade || "UN",
                quantidade: Number(item.quantidade),
                valorUnitario: Number(item.precovenda), // Atenção: verificar se é preço de custo
                valorTotal: Number(item.quantidade) * Number(item.precovenda),

                // Impostos
                cst: item.cst,
                csosn: item.csosn,
                aliquotaIcms: item.aliquotaicms,

                cstPis: item.cst_pis,
                aliquotaPis: item.aliquota_pis,

                cstCofins: item.cst_cofins,
                aliquotaCofins: item.aliquota_cofins
            };
        });

        return {
            empresaId: this.empresaId,
            tipoOperacao: "0", // Entrada
            finalidade: "1",   // Normal
            naturezaOperacao: "ENTRADA DE MERCADORIA", // Pode parametrizar depois
            origem: {
                entradaId: this.entrada.id
            },
            parceiro,
            itens: invoiceItens
        };
    }
}

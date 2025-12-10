// src/lib/nfe/mapClienteToDestinatario.ts
import type { ClienteRow, EmpresaRow, NFeDestinatario } from "./types";

function soNumeros(value: string | null | undefined): string {
  return value ? value.replace(/\D/g, "") : "";
}

/**
 * Converte um cliente da OS em um destinatario pronto para o XML da NF-e.
 * Usa dados da empresa como fallback para UF/codigo do municipio/CEP.
 */
export function mapClienteToDestinatario(
  cliente: ClienteRow,
  empresa?: EmpresaRow
): NFeDestinatario {
  const documento = soNumeros(cliente.cpfcnpj);
  const isCnpj = documento.length > 11;

  const codigoMunicipio =
    cliente.codigomunicipio ||
    empresa?.codigomunicipio ||
    "0000000";

  const nomeMunicipio = cliente.cidade || "NAO INFORMADO";
  const uf = cliente.estado || empresa?.uf || "PB";
  const cep = soNumeros(cliente.cep) || soNumeros(empresa?.cep ?? "");
  const telefone = soNumeros(cliente.telefone);
  const ie = soNumeros(cliente.inscricaoestadual);

  const dest: NFeDestinatario = {
    cnpj: isCnpj ? documento : undefined,
    cpf: !isCnpj ? documento : undefined,
    razaoSocial: cliente.nomerazaosocial,
    indIEDest: cliente.inscricaoestadual ? "1" : "9",
    inscricaoEstadual: cliente.inscricaoestadual ? ie : undefined,
    endereco: {
      logradouro: cliente.endereco || "NAO INFORMADO",
      numero: cliente.endereconumero || "S/N",
      complemento: cliente.enderecocomplemento || undefined,
      bairro: cliente.bairro || "CENTRO",
      codigoMunicipio,
      nomeMunicipio,
      uf,
      cep: cep || "00000000",
      codigoPais: "1058",
      nomePais: "BRASIL",
      telefone: telefone || undefined,
    },
  };

  return dest;
}

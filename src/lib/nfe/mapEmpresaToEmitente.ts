// src/lib/nfe/mapEmpresaToEmitente.ts
import type { EmpresaRow, NFeEmitente } from './types';
import { normalizarCRT } from './fiscal';

function soNumeros(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

function normalizarCrtNFe(valor: string | null | undefined): CrtNFe {
  const crt = String(valor || '').trim();

  if (crt === '1' || crt === '2' || crt === '3' || crt === '4') {
    return crt;
  }

  throw new Error(
    `Regime tributário (CRT) inválido para NF-e: ${crt || 'não informado'}. Use 1, 2, 3 ou 4.`
  );
}

/**
 * Converte o registro da tabela "empresa" em um objeto NFeEmitente
 * pronto pra ser usado na geração do XML.
 */
export function mapEmpresaToEmitente(
  empresa: EmpresaRow,
  nomeMunicipio: string
): NFeEmitente {
  return {
    cnpj: soNumeros(empresa.cnpj),
    razaoSocial: empresa.razaosocial,
    nomeFantasia: empresa.nomefantasia || undefined,
    inscricaoEstadual: soNumeros(empresa.inscricaoestadual),
    inscricaoEstadualST: soNumeros(empresa.inscricaoestadualst),
    inscricaoMunicipal: soNumeros(empresa.inscricaomunicipal),
    cnae: empresa.cnae || undefined,
    crt: normalizarCRT(empresa.regimetributario),
    endereco: {
      logradouro: empresa.endereco,
      numero: empresa.numero || 'S/N',
      complemento: empresa.complemento || undefined,
      bairro: empresa.bairro || 'CENTRO',
      codigoMunicipio: empresa.codigomunicipio,
      nomeMunicipio,
      uf: empresa.uf || 'PB',
      cep: soNumeros(empresa.cep),
      codigoPais: empresa.codigopais || '1058',
      nomePais: empresa.nomepais || 'BRASIL',
      telefone: soNumeros(empresa.telefone),
    },
  };
}

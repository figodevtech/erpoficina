// src/lib/nfe/mapEmpresaToEmitente.ts
import type { EmpresaRow, NFeEmitente } from './types';

function soNumeros(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
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
    crt: empresa.regimetributario as '1' | '2' | '3',
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

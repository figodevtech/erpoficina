// src/lib/nfe/xmlDest.ts
import type { NFeDestinatario } from './types';
import { escapeXml } from './xmlUtils';

export function buildDestXml(dest: NFeDestinatario): string {
  const p: string[] = [];

  p.push('<dest>');
  if (dest.cnpj) {
    p.push(`<CNPJ>${dest.cnpj}</CNPJ>`);
  } else if (dest.cpf) {
    p.push(`<CPF>${dest.cpf}</CPF>`);
  }

  p.push(`<xNome>${escapeXml(dest.razaoSocial)}</xNome>`);

  p.push('<enderDest>');
  p.push(`<xLgr>${escapeXml(dest.endereco.logradouro)}</xLgr>`);
  p.push(`<nro>${escapeXml(dest.endereco.numero)}</nro>`);
  if (dest.endereco.complemento) {
    p.push(`<xCpl>${escapeXml(dest.endereco.complemento)}</xCpl>`);
  }
  p.push(`<xBairro>${escapeXml(dest.endereco.bairro)}</xBairro>`);
  p.push(`<cMun>${dest.endereco.codigoMunicipio}</cMun>`);
  p.push(`<xMun>${escapeXml(dest.endereco.nomeMunicipio)}</xMun>`);
  p.push(`<UF>${dest.endereco.uf}</UF>`);
  p.push(`<CEP>${dest.endereco.cep}</CEP>`);
  p.push(`<cPais>${dest.endereco.codigoPais}</cPais>`);
  p.push(`<xPais>${escapeXml(dest.endereco.nomePais)}</xPais>`);
  if (dest.endereco.telefone) {
    p.push(`<fone>${dest.endereco.telefone}</fone>`);
  }
  p.push('</enderDest>');

  p.push(`<indIEDest>${dest.indIEDest}</indIEDest>`);
  if (dest.inscricaoEstadual) {
    p.push(`<IE>${dest.inscricaoEstadual}</IE>`);
  }

  p.push('</dest>');

  return p.join('');
}

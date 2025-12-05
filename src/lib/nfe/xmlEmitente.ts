// src/lib/nfe/xmlEmitente.ts
import type { NFeEmitente } from './types';

function escapeXml(value: string | undefined): string {
  if (!value) return '';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Gera o bloco <emit> da NF-e a partir do NFeEmitente.
 */
export function buildEmitXml(emit: NFeEmitente): string {
  const partes: string[] = [];

  partes.push('<emit>');
  partes.push(`<CNPJ>${emit.cnpj}</CNPJ>`);
  partes.push(`<xNome>${escapeXml(emit.razaoSocial)}</xNome>`);

  if (emit.nomeFantasia) {
    partes.push(`<xFant>${escapeXml(emit.nomeFantasia)}</xFant>`);
  }

  partes.push('<enderEmit>');
  partes.push(`<xLgr>${escapeXml(emit.endereco.logradouro)}</xLgr>`);
  partes.push(`<nro>${escapeXml(emit.endereco.numero)}</nro>`);
  if (emit.endereco.complemento) {
    partes.push(`<xCpl>${escapeXml(emit.endereco.complemento)}</xCpl>`);
  }
  partes.push(`<xBairro>${escapeXml(emit.endereco.bairro)}</xBairro>`);
  partes.push(`<cMun>${emit.endereco.codigoMunicipio}</cMun>`);
  partes.push(`<xMun>${escapeXml(emit.endereco.nomeMunicipio)}</xMun>`);
  partes.push(`<UF>${emit.endereco.uf}</UF>`);
  if (emit.endereco.cep) {
    partes.push(`<CEP>${emit.endereco.cep}</CEP>`);
  }
  partes.push(`<cPais>${emit.endereco.codigoPais}</cPais>`);
  partes.push(`<xPais>${escapeXml(emit.endereco.nomePais)}</xPais>`);
  if (emit.endereco.telefone) {
    partes.push(`<fone>${emit.endereco.telefone}</fone>`);
  }
  partes.push('</enderEmit>');

  if (emit.inscricaoEstadual) {
    partes.push(`<IE>${emit.inscricaoEstadual}</IE>`);
  } else {
    // em tese emitente PJ sempre tem IE, mas deixei solto
    partes.push('<IE>ISENTO</IE>');
  }

  if (emit.inscricaoEstadualST) {
    partes.push(`<IEST>${emit.inscricaoEstadualST}</IEST>`);
  }

  if (emit.inscricaoMunicipal) {
    partes.push(`<IM>${emit.inscricaoMunicipal}</IM>`);
  }

  if (emit.cnae) {
    partes.push(`<CNAE>${emit.cnae}</CNAE>`);
  }

  partes.push(`<CRT>${emit.crt}</CRT>`);
  partes.push('</emit>');

  return partes.join('');
}

// src/lib/nfe/validarEmitente.ts

import type { EmpresaRow } from './types';

type ErroValidacao = {
  campo: string;
  mensagem: string;
};

function vazio(valor: string | null | undefined): boolean {
  return !valor || String(valor).trim() === '';
}

function soNumeros(valor: string | null | undefined): string {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

/**
 * Valida se o registro da tabela "empresa" tem todos os dados
 * mínimos necessários para ser usado como emitente da NF-e.
 */
export function validarEmitenteEmpresa(empresa: EmpresaRow): ErroValidacao[] {
  const erros: ErroValidacao[] = [];

  // CNPJ
  if (vazio(empresa.cnpj)) {
    erros.push({ campo: 'cnpj', mensagem: 'CNPJ é obrigatório.' });
  } else if (soNumeros(empresa.cnpj).length !== 14) {
    erros.push({ campo: 'cnpj', mensagem: 'CNPJ deve ter 14 dígitos numéricos.' });
  }

  // Razão social
  if (vazio(empresa.razaosocial)) {
    erros.push({ campo: 'razaosocial', mensagem: 'Razão social é obrigatória.' });
  }

  // Inscrição estadual (normalmente PJ sempre tem IE; se sua realidade for diferente, dá pra relaxar isso)
  if (vazio(empresa.inscricaoestadual)) {
    erros.push({ campo: 'inscricaoestadual', mensagem: 'Inscrição estadual é obrigatória.' });
  }

  // Endereço
  if (vazio(empresa.endereco)) {
    erros.push({ campo: 'endereco', mensagem: 'Endereço (logradouro) é obrigatório.' });
  }

  if (vazio(empresa.numero)) {
    erros.push({ campo: 'numero', mensagem: 'Número do endereço é obrigatório.' });
  }

  if (vazio(empresa.bairro)) {
    erros.push({ campo: 'bairro', mensagem: 'Bairro é obrigatório.' });
  }

  // CEP
  const cep = soNumeros(empresa.cep);
  if (!cep) {
    erros.push({ campo: 'cep', mensagem: 'CEP é obrigatório.' });
  } else if (cep.length !== 8) {
    erros.push({ campo: 'cep', mensagem: 'CEP deve ter 8 dígitos numéricos.' });
  }

  // UF
  if (vazio(empresa.uf)) {
    erros.push({ campo: 'uf', mensagem: 'UF é obrigatória.' });
  } else if ((empresa.uf || '').length !== 2) {
    erros.push({ campo: 'uf', mensagem: 'UF deve ter 2 caracteres (ex: PB).' });
  }

  // Código do município (IBGE)
  if (vazio(empresa.codigomunicipio)) {
    erros.push({ campo: 'codigomunicipio', mensagem: 'Código do município (IBGE) é obrigatório.' });
  } else if (soNumeros(empresa.codigomunicipio).length !== 7) {
    erros.push({
      campo: 'codigomunicipio',
      mensagem: 'Código do município (IBGE) deve ter 7 dígitos numéricos.',
    });
  }

  // Regime tributário (CRT)
  if (vazio(empresa.regimetributario)) {
    erros.push({ campo: 'regimetributario', mensagem: 'Regime tributário (CRT) é obrigatório.' });
  } else if (!['1', '2', '3'].includes(empresa.regimetributario)) {
    erros.push({
      campo: 'regimetributario',
      mensagem: 'Regime tributário (CRT) deve ser 1, 2 ou 3.',
    });
  }

  // País (opcional, mas se estiver vazio, vamos avisar)
  if (vazio(empresa.codigopais)) {
    erros.push({
      campo: 'codigopais',
      mensagem: 'Código do país é obrigatório (Brasil = 1058).',
    });
  }

  if (vazio(empresa.nomepais)) {
    erros.push({
      campo: 'nomepais',
      mensagem: 'Nome do país é obrigatório (BRASIL).',
    });
  }

  // Telefone não é estritamente obrigatório pela NF-e, então vou só validar se preencher
  if (!vazio(empresa.telefone)) {
    const fone = soNumeros(empresa.telefone);
    if (fone.length < 10 || fone.length > 11) {
      erros.push({
        campo: 'telefone',
        mensagem: 'Telefone deve ter 10 ou 11 dígitos (com DDD), apenas números.',
      });
    }
  }

  return erros;
}

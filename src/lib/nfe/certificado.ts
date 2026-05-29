// src/lib/nfe/certificado.ts

import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { EmpresaRow } from './types';

const CERT_BUCKET = 'empresa';
const CERT_PREFIX = 'certificado';

async function carregarPfxDoStorage(): Promise<Buffer | null> {
  const { data: arquivos, error: listError } = await supabaseAdmin.storage
    .from(CERT_BUCKET)
    .list(CERT_PREFIX, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });

  if (listError) {
    throw new Error(
      `Falha ao listar certificados no bucket ${CERT_BUCKET}/${CERT_PREFIX}: ${listError.message}`
    );
  }

  const primeiroArquivo = (arquivos ?? []).find((arquivo) => {
    return arquivo.name && arquivo.name !== '.emptyFolderPlaceholder';
  });

  if (!primeiroArquivo) return null;

  const storagePath = `${CERT_PREFIX}/${primeiroArquivo.name}`;
  const { data, error: downloadError } = await supabaseAdmin.storage
    .from(CERT_BUCKET)
    .download(storagePath);

  if (downloadError) {
    throw new Error(
      `Falha ao baixar certificado do bucket ${CERT_BUCKET}/${storagePath}: ${downloadError.message}`
    );
  }

  return Buffer.from(await data.arrayBuffer());
}

function carregarPfxDoDisco(empresa: EmpresaRow): Buffer | null {
  const pfxPathRaw = empresa.certificadocaminho || process.env.NFE_CERT_PFX_PATH || '';

  if (!pfxPathRaw) return null;

  const pfxPath = path.resolve(pfxPathRaw);

  if (!fs.existsSync(pfxPath)) {
    throw new Error(`Arquivo PFX nao encontrado em: ${pfxPath}`);
  }

  return fs.readFileSync(pfxPath);
}

/**
 * Le o PFX do Supabase Storage e extrai:
 *  - chave privada em PEM (privateKeyPem)
 *  - certificado em PEM (certificatePem)
 *
 * Fonte principal: bucket "empresa", pasta "certificado", primeiro arquivo.
 * Fallback local: empresa.certificadocaminho ou NFE_CERT_PFX_PATH.
 */
export async function carregarCertificadoA1(empresa: EmpresaRow): Promise<{
  privateKeyPem: string;
  certificatePem: string;
}> {
  const pfxBuffer = (await carregarPfxDoStorage()) ?? carregarPfxDoDisco(empresa);

  if (!pfxBuffer) {
    throw new Error(
      `Nenhum arquivo PFX encontrado no bucket ${CERT_BUCKET}/${CERT_PREFIX}.`
    );
  }

  const p12Asn1 = forge.asn1.fromDer(
    forge.util.createBuffer(pfxBuffer.toString('binary')).getBytes()
  );

  const senha = empresa.certificadosenha ?? '';

  let p12;
  try {
    p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, senha);
  } catch (e: any) {
    throw new Error(
      `Falha ao abrir o PFX. Verifique a senha do certificado. Detalhe: ${String(
        e?.message ?? e
      )}`
    );
  }

  const pkcs8Bags =
    p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[
      forge.pki.oids.pkcs8ShroudedKeyBag
    ];

  const keyBags =
    pkcs8Bags && pkcs8Bags.length > 0
      ? pkcs8Bags
      : p12.getBags({ bagType: forge.pki.oids.keyBag })[
          forge.pki.oids.keyBag
        ];

  const keyObj = keyBags && keyBags.length > 0 ? keyBags[0].key : undefined;

  if (!keyObj) {
    throw new Error('Nao foi possivel localizar a chave privada dentro do PFX.');
  }

  const privateKeyPem = forge.pki.privateKeyToPem(keyObj);

  const certBags =
    p12.getBags({ bagType: forge.pki.oids.certBag })[
      forge.pki.oids.certBag
    ];
  const certObj =
    certBags && certBags.length > 0 ? certBags[0].cert : undefined;

  if (!certObj) {
    throw new Error('Nao foi possivel localizar o certificado dentro do PFX.');
  }

  const certificatePem = forge.pki.certificateToPem(certObj);

  if (!privateKeyPem || !privateKeyPem.trim()) {
    throw new Error('Chave privada PEM extraida do PFX esta vazia.');
  }

  console.log(
    '[certificadoA1] privateKeyPem length =',
    privateKeyPem.length,
    'certificatePem length =',
    certificatePem.length
  );

  return { privateKeyPem, certificatePem };
}

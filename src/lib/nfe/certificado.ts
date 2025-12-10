// src/lib/nfe/certificado.ts

import fs from 'fs';
import path from 'path';
import forge from 'node-forge';
import type { EmpresaRow } from './types';

/**
 * Lê o PFX do disco e extrai:
 *  - chave privada em PEM (privateKeyPem)
 *  - certificado em PEM (certificatePem)
 */
export async function carregarCertificadoA1(empresa: EmpresaRow): Promise<{
  privateKeyPem: string;
  certificatePem: string;
}> {
  // 1) Caminho do .pfx
  const pfxPathRaw =
    empresa.certificadocaminho ||
    process.env.NFE_CERT_PFX_PATH ||
    'C:\\certs\\certificado.pfx';

  const pfxPath = path.resolve(pfxPathRaw);

  if (!fs.existsSync(pfxPath)) {
    throw new Error(`Arquivo PFX não encontrado em: ${pfxPath}`);
  }

  const pfxBuffer = fs.readFileSync(pfxPath);

  // 2) Converte PFX (DER) para ASN.1
  const p12Asn1 = forge.asn1.fromDer(
    forge.util.createBuffer(pfxBuffer).getBytes()
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

  // 3) Tenta pegar chave privada (pkcs8ShroudedKeyBag > keyBag)
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
    throw new Error('Não foi possível localizar a chave privada dentro do PFX.');
  }

  const privateKeyPem = forge.pki.privateKeyToPem(keyObj);

  // 4) Pega o certificado X.509
  const certBags =
    p12.getBags({ bagType: forge.pki.oids.certBag })[
      forge.pki.oids.certBag
    ];
  const certObj =
    certBags && certBags.length > 0 ? certBags[0].cert : undefined;

  if (!certObj) {
    throw new Error('Não foi possível localizar o certificado dentro do PFX.');
  }

  const certificatePem = forge.pki.certificateToPem(certObj);

  // 5) Sanidade extra (pra evitar exatamente esse erro que você recebeu)
  if (!privateKeyPem || !privateKeyPem.trim()) {
    throw new Error('Chave privada PEM extraída do PFX está vazia.');
  }

  // (Opcional) debug leve – não loga chave, só tamanho
  console.log(
    '[certificadoA1] privateKeyPem length =',
    privateKeyPem.length,
    'certificatePem length =',
    certificatePem.length
  );

  return { privateKeyPem, certificatePem };
}

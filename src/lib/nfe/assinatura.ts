// src/lib/nfe/assinatura.ts

import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';

/**
 * Assina a tag <infNFe> dentro do XML da NF-e,
 * gerando o bloco <Signature> conforme exigido pela SEFAZ.
 */
export function assinarNFeXml(
  xmlNFe: string,
  privateKeyPem: string,
  certificatePem: string
): string {
  // 1) Parse do XML pra pegar o Id da infNFe
  const doc = new DOMParser().parseFromString(xmlNFe, 'text/xml');

  const infNFeNode =
    doc.getElementsByTagName('infNFe')[0] ||
    doc.getElementsByTagNameNS(
      'http://www.portalfiscal.inf.br/nfe',
      'infNFe'
    )[0];

  if (!infNFeNode) {
    throw new Error('Tag <infNFe> não encontrada no XML da NFe.');
  }

  const idInfNFe =
    infNFeNode.getAttribute('Id') ||
    infNFeNode.getAttribute('ID') ||
    infNFeNode.getAttribute('id');

  if (!idInfNFe) {
    throw new Error(
      'Atributo Id não encontrado na tag <infNFe> para assinatura.'
    );
  }

  // 2) Configura o SignedXml
  const sx: any = new SignedXml();

  // Canonicalização c14n (exigido pela NF-e)
  sx.canonicalizationAlgorithm =
    'http://www.w3.org/TR/2001/REC-xml-c14n-20010315';

  // Algoritmo de assinatura RSA-SHA1
  sx.signatureAlgorithm =
    'http://www.w3.org/2000/09/xmldsig#rsa-sha1';

  // A lib que está rodando no runtime espera this.privateKey
  sx.privateKey = privateKeyPem;

  console.log(
    '[assinarNFeXml] privateKey está setado?',
    !!sx.privateKey
  );

  // 3) Referência para a tag <infNFe>, com transforms enveloped + c14n e SHA1
  sx.addReference({
    xpath: "/*[local-name()='NFe']/*[local-name()='infNFe']",
    uri: `#${idInfNFe}`,
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
  });

  // 4) Gera a assinatura logo DEPOIS da tag <infNFe>
  sx.computeSignature(xmlNFe, {
    location: {
      reference: "/*[local-name()='NFe']/*[local-name()='infNFe']",
      action: 'after',
    },
  });

  let signedXml: string = sx.getSignedXml();

  // 5) Garante que existe <KeyInfo> com o certificado (SEFAZ costuma exigir)
  if (!signedXml.includes('<KeyInfo')) {
    const cleanCert = certificatePem
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\r?\n|\r/g, '');

    const keyInfoXml =
      '<KeyInfo>' +
        '<X509Data>' +
          `<X509Certificate>${cleanCert}</X509Certificate>` +
        '</X509Data>' +
      '</KeyInfo>';

    signedXml = signedXml.replace(
      '</Signature>',
      `${keyInfoXml}</Signature>`
    );
  }

  console.log(
    '[assinarNFeXml] XML assinado contém <Signature>?',
    signedXml.includes('<Signature')
  );
  console.log(
    '[assinarNFeXml] XML assinado contém <KeyInfo>?',
    signedXml.includes('<KeyInfo')
  );

  return signedXml;
}

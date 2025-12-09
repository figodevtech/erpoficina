// src/lib/nfe/assinatura-evento.ts

import { SignedXml } from 'xml-crypto';
import { DOMParser } from '@xmldom/xmldom';

/**
 * Assina a tag <infEvento> dentro do XML de evento (envEvento),
 * gerando o bloco <Signature> conforme exigido pela SEFAZ.
 */
export function assinarEventoNFeXml(
  xmlEnvEvento: string,
  privateKeyPem: string,
  certificatePem: string
): string {
  // 1) Parse do XML pra pegar o Id da infEvento
  const doc = new DOMParser().parseFromString(xmlEnvEvento, 'text/xml');

  const infEventoNode =
    doc.getElementsByTagName('infEvento')[0] ||
    doc.getElementsByTagNameNS(
      'http://www.portalfiscal.inf.br/nfe',
      'infEvento'
    )[0];

  if (!infEventoNode) {
    throw new Error('Tag <infEvento> não encontrada no XML de evento.');
  }

  const idInfEvento =
    infEventoNode.getAttribute('Id') ||
    infEventoNode.getAttribute('ID') ||
    infEventoNode.getAttribute('id');

  if (!idInfEvento) {
    throw new Error(
      'Atributo Id não encontrado na tag <infEvento> para assinatura.'
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
    '[assinarEventoNFeXml] privateKey está setado?',
    !!sx.privateKey
  );

  // 3) Referência para a tag <infEvento>, com transforms enveloped + c14n e SHA1
  sx.addReference({
    xpath:
      "/*[local-name()='envEvento']/*[local-name()='evento']/*[local-name()='infEvento']",
    uri: `#${idInfEvento}`,
    digestAlgorithm: 'http://www.w3.org/2000/09/xmldsig#sha1',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/TR/2001/REC-xml-c14n-20010315',
    ],
  });

  // 4) Gera a assinatura logo DEPOIS da tag <infEvento>
  sx.computeSignature(xmlEnvEvento, {
    location: {
      reference:
        "/*[local-name()='envEvento']/*[local-name()='evento']/*[local-name()='infEvento']",
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
    '[assinarEventoNFeXml] XML assinado contém <Signature>?',
    signedXml.includes('<Signature')
  );
  console.log(
    '[assinarEventoNFeXml] XML assinado contém <KeyInfo>?',
    signedXml.includes('<KeyInfo')
  );

  return signedXml;
}

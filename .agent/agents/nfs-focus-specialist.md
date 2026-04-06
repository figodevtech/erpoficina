# Skill de Implementação: Emissão de NFS-e via Focus NFe (João Pessoa - PB)

Este guia consolida o conhecimento necessário para integrar sistemas de software à API da Focus NFe para a emissão de Notas Fiscais de Serviço eletrônicas no município de João Pessoa.

## 1. Contexto Arquitetural

A API da Focus NFe funciona como um **Proxy/Adapter**. Ela recebe um JSON padronizado e converte para o XML (geralmente padrão ABRASF ou proprietário) exigido pela prefeitura de João Pessoa.

### Fluxo de Comunicação Assíncrono
Diferente de uma API REST tradicional onde o POST já retorna o recurso criado, a NFS-e segue o fluxo:
1.  **Envio (POST):** Você envia os dados e recebe um protocolo de recepção.
2.  **Processamento:** A Focus coloca na fila e comunica-se com os servidores da prefeitura (PMJP).
3.  **Consulta (GET):** Você consulta o status da nota usando sua referencia própria após alguns segundos.

## 2. Configurações de Autenticação e Endpoints

### Credenciais
*   **Base Auth:** Use seu token de API como usuário e deixe a senha em branco.
*   **Token de Homologação:** Utilizado para testes (não gera valor fiscal).
*   **Token de Produção:** Utilizado para emissões reais.

### Endpoints (V2)

| Ambiente    | URL Base                                     |
| :---------- | :------------------------------------------- |
| Homologação | `https://homologacao.focusnfe.com.br/v2`     |
| Produção    | `https://api.focusnfe.com.br/v2`             |

## 3. Especificidades de João Pessoa (PB)

Para emitir em João Pessoa, os seguintes dados são cruciais:
*   **Código IBGE do Município:** `2507507`
*   **Provedor:** A prefeitura de João Pessoa costuma utilizar sistemas que exigem o **Código de Tributação Municipal** além do **Item da Lista de Serviço (LC 116)**.
*   **Certificado Digital:** É obrigatório o uso de Certificado Digital A1 (arquivo `.pfx`) configurado no painel da Focus.

## 4. Estrutura do Payload de Envio (JSON)

Ao realizar o POST para `/nfse?ref=SUA_REFERENCIA`, o corpo deve seguir este padrão:

```json
{
  "data_emissao": "2024-04-02T10:00:00",
  "natureza_operacao": "1",
  "prestador": {
    "cnpj": "00.000.000/0001-00",
    "inscricao_municipal": "123456",
    "codigo_municipio": "2507507"
  },
  "tomador": {
    "cnpj": "11.111.111/1111-11",
    "razao_social": "Cliente Exemplo",
    "email": "financeiro@cliente.com",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "bairro": "Centro",
      "codigo_municipio": "2507507",
      "uf": "PB",
      "cep": "58000000"
    }
  },
  "servico": {
    "aliquota": 3,
    "item_lista_servico": "0107",
    "codigo_tributario_municipio": "10701",
    "valor_servicos": 250.00,
    "iss_retido": "false",
    "discriminacao": "Serviços de desenvolvimento de software conforme contrato 45."
  }
}
```

**Campos Chave:**
*   **referencia (na URL):** Identificador único no seu banco de dados (ex: ID do pedido).
*   **item_lista_servico:** Código da LC 116/03 (ex: 0101, 0702).
*   **codigo_tributario_municipio:** Verifique no portal da prefeitura de JP qual o código específico para a sua atividade.

## 5. Estados da Nota (Ciclo de Vida)

Após o envio, a nota passará por estados que devem ser tratados pela sua aplicação:
*   **processando_autorizacao:** A Focus está tentando falar com a prefeitura.
*   **autorizado:** Nota emitida com sucesso. Você receberá `url_pdf`, `xml` e `numero`.
*   **erro_autorizacao:** A prefeitura rejeitou a nota. O campo `erros` conterá a lista de motivos (ex: "Alíquota inválida", "Tomador com CPF inválido").
*   **cancelado:** Se você solicitou o cancelamento da nota autorizada.

## 6. Tratamento de Erros e Retentativas

### Erros de Conexão (HTTP 5xx ou Timeout)
Implemente uma estratégia de **Exponential Backoff**:
1. Tente novamente após 2 segundos.
2. Se falhar, tente após 4, 8, 16... até um limite de 5 tentativas.

### Erros de Validação (HTTP 4xx)
Geralmente indicam erro no seu JSON ou Token inválido. Não adianta repetir a chamada sem corrigir os dados.

## 7. Melhores Práticas de Integração

*   **Webhooks:** Configure uma URL de Webhook no painel da Focus. Em vez de ficar consultando o status a cada 5 segundos (polling), a Focus avisa seu servidor assim que a prefeitura responder.
*   **Armazenamento de PDF:** Não faça hotlink do PDF da Focus no seu sistema para o cliente final. Baixe o PDF e armazene no seu storage (S3, Google Cloud Storage) ou faça cache.
*   **Ambiente de Homologação:** Nunca pule os testes em homologação. João Pessoa tem validações rigorosas de campos que variam conforme o regime tributário (Simples Nacional vs Lucro Presumido).
*   **Logs:** Salve o JSON enviado e a resposta completa da Focus para fins de suporte e auditoria.

---
*Este documento foi gerado para auxiliar na implementação técnica da API Focus NFe para o município de João Pessoa - PB.*

# TEF Rede + Software Express

## O que a pesquisa oficial confirma

- A trilha para pinpad/TEF físico não é a API web `e.Rede`.
- Para TEF, a Rede aponta para integração de parceiros de automação comercial.
- A API de geração de número lógico da Rede é voltada a `TEF terminals` e `Partner working with Commercial Automation`.
- O onboarding de produção da Rede exige cadastro da organização, usuário e aplicação por e-mail para `produtosapi@userede.com.br`.
- A Software Express expõe a integração do SiTef via `CliSiTefI` e `CliSiTef`, com fluxo interativo.

## Fontes oficiais

- Rede Logical Number Generation:
  - https://developer.userede.com.br/files/traducoes/numero-logico/logic-number-generation_18092024.pdf
- Software Express CliSiTef - Introdução:
  - https://dev.softwareexpress.com.br/en/docs/clisitef/clisitef_introducao/
- Software Express Especificação Técnica:
  - https://dev.softwareexpress.com.br/docs/clisitef/clisitef_documento_principal/
- Software Express Processo de homologação:
  - https://dev.softwareexpress.com.br/docs/clisitef/processo_homologacao/
- Software Express Configuração do PinPad:
  - https://dev.softwareexpress.com.br/en/docs/sitef-interface-simplificada/configuracao_do_pinpad/

## O que vocês precisam obter antes da integração real

### 1. Rede

- Cadastro do integrador/parceiro na trilha TEF.
- Credenciais da API de geração de número lógico, se a solução exigir essa etapa.
- Confirmação do fluxo de homologação para o cliente final.
- Dados do estabelecimento recebedor:
  - PV / afiliação
  - CNPJ
  - dados do cliente final
  - ambiente de homologação / produção

### 2. TEF house / Software Express

- Kit oficial da CliSiTef para Windows.
- DLLs e arquivos de configuração suportados para o pinpad usado pelo cliente.
- Manual operacional da modalidade contratada.
- Tabelas de retorno, eventos e códigos de erro.
- Procedimento de homologação e evidências exigidas.

### 3. Caixa local

- Windows compatível com a biblioteca homologada.
- Pinpad suportado.
- Porta serial/USB configurada.
- `CliSiTef.ini` com parâmetros de rede, pinpad e trace.
- Certificados e comunicação liberados com o SiTef / adquirente.

## Fluxo técnico real da integração

### No ERP

1. ERP cria a venda ou o pagamento pendente.
2. ERP chama o agente local em `localhost`.
3. Agente local executa a transação no CliSiTef.
4. Agente retorna:
   - status
   - NSU
   - autorização
   - bandeira
   - parcelas
   - identificadores do comprovante
5. ERP confirma no backend e baixa a venda.

### No agente local

1. Carrega configuração do TEF.
2. Inicializa a biblioteca com `ConfiguraIntSiTefInterativoEx`.
3. Inicia a cobrança com `IniciaFuncaoSiTefInterativo`.
4. Executa o loop de `ContinuaFuncaoSiTefInterativo` até sair de `10000`.
5. Finaliza com `FinalizaFuncaoSiTefInterativo`.
6. Persiste logs locais e devolve o resultado para o ERP.

## Decisão de arquitetura

### Recomendação

- ERP continua web.
- Agente local roda no computador do caixa.
- ERP fala com `http://127.0.0.1:18181`.
- O agente encapsula todo o acoplamento com a TEF house.

### Motivo

- O navegador não deve falar direto com DLL, USB ou serial do pinpad.
- A troca futura de adquirente/TEF fica isolada no agente.
- O ERP mantém o mesmo fluxo de pagamento por provider.

## Contrato recomendado entre ERP e agente

### `GET /health`

Retorna:

```json
{
  "ok": true,
  "provider": "mock",
  "agentVersion": "0.1.0"
}
```

### `POST /v1/payments`

Entrada:

```json
{
  "idempotencyKey": "uuid",
  "ordemServicoId": 123,
  "vendaId": 456,
  "amount": 150.75,
  "method": "credit",
  "installments": 1,
  "description": "OS #123"
}
```

Saída:

```json
{
  "id": "agent-txn-id",
  "status": "PENDING",
  "provider": "clisitef"
}
```

### `GET /v1/payments/:id`

Saída:

```json
{
  "id": "agent-txn-id",
  "status": "APPROVED",
  "provider": "clisitef",
  "amount": 150.75,
  "method": "credit",
  "installments": 1,
  "nsu": "123456",
  "authorizationCode": "ABC123",
  "brand": "VISA",
  "receiptCustomer": "..."
}
```

### `POST /v1/payments/:id/cancel`

Cancela a transação local e devolve o status final.

## Pendências para a implementação real do provider CliSiTef

- Bind nativo para a biblioteca:
  - Java + JNA
  - .NET + P/Invoke
  - Node + FFI, se a TEF house homologar esse caminho
- Mapeamento dos buffers e campos retornados pela rotina interativa.
- Captura e armazenamento dos comprovantes.
- Cancelamento e desfazimento.
- Tratamento de timeout, queda de comunicação e reprocessamento.
- Homologação com a Software Express e com a adquirente.

## Entrega técnica deixada neste repositório

- `agents/tef-local-agent`
  - agente localhost scaffoldado
  - provider `mock`
  - placeholder `clisitef`
- `src/lib/payments/tef-local-agent.ts`
  - client do ERP para consumir o agente

## Próximo passo recomendado

1. Obter o kit oficial da CliSiTef e o checklist de homologação.
2. Confirmar se a TEF house aceita Java, .NET ou outro binding.
3. Trocar o provider `mock` pelo provider real `clisitef`.
4. Integrar o PDV/assistente de pagamento do ERP com o client compartilhado.

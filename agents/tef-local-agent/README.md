# TEF Local Agent

Agente local `localhost` para o ERP conversar com a TEF house sem acoplar o navegador ao pinpad.

## Status

- `mock`: funcional para integração de fluxo.
- `clisitef`: scaffoldado, ainda sem binding nativo para a biblioteca oficial.

## Endpoints

- `GET /health`
- `GET /v1/capabilities`
- `POST /v1/payments`
- `GET /v1/payments/:id`
- `POST /v1/payments/:id/cancel`

## Executar

```bash
cd agents/tef-local-agent
node src/server.mjs
```

Ou:

```bash
cd agents/tef-local-agent
npm start
```

## Variáveis

Use `.env.example` como base.

## Observação importante

Para produção, o provider `clisitef` precisa ser implementado com o SDK oficial da TEF house. O scaffold atual só define o contrato e o ponto de encaixe.

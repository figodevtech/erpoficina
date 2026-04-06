# Documentação NFS-e — João Pessoa/PB (Focus NFe)

## Visão geral

Esta documentação resume os requisitos técnicos para emissão de **NFS-e em João Pessoa/PB** utilizando a **API da Focus NFe**, com base no guia específico do município.

## Informações gerais

- **Município:** João Pessoa/PB
- **Provedor:** DSF
- **Formato:** Próprio (ABRASF)
- **Autenticação:** Certificado digital
- **Cancelamento:** Ativo

## Ambientes disponíveis

| Ambiente     | Disponível | Portal de acesso |
|--------------|------------|------------------|
| Produção     | Sim        | Portal da Prefeitura de João Pessoa |
| Homologação  | Sim        | Não disponível |

## Campos importantes

### Obrigatórios

1. **CPF/CNPJ do tomador**
2. **Endereço do tomador**
3. **Item da lista de serviço**
4. **Código CNAE**

### Observações importantes

- O **item da lista de serviço** deve seguir o padrão da **Lei Complementar 116/2003**.
- O **código CNAE** deve ser informado com **9 dígitos**.
- Para localizar o CNAE correto, consultar o portal da prefeitura em:
  - **Configuração Empresa**
  - final da página
  - seção **Atividades**
- **Código tributário do município:** não utilizado neste município.

## Estrutura mínima esperada no JSON

Abaixo está uma estrutura resumida com os principais blocos exigidos:

```json
{
  "data_emissao": "YYYY-MM-DDTHH:mm:ss",
  "natureza_operacao": 1,
  "optante_simples_nacional": true,
  "regime_especial_tributacao": 6,
  "prestador": {
    "cnpj": "00000000000000",
    "inscricao_municipal": "123445",
    "codigo_municipio": 2507507
  },
  "tomador": {
    "cnpj": "00.000.000/0000-00",
    "razao_social": "Nome do Tomador",
    "endereco": {
      "logradouro": "Rua Exemplo",
      "numero": "123",
      "complemento": "Sala 1",
      "bairro": "Centro",
      "codigo_municipio": 2507507,
      "uf": "PB",
      "cep": "58000-000"
    },
    "telefone": "83 0000-0000",
    "email": "email@exemplo.com"
  },
  "servico": {
    "discriminacao": "Descrição do serviço prestado",
    "valor_servicos": 1.0,
    "aliquota": 0.0,
    "item_lista_servico": "28.01",
    "codigo_cnae": "829979900",
    "iss_retido": false
  }
}
```

## Regras práticas para implementação

### 1. Prestador
O bloco `prestador` deve conter:
- CNPJ
- inscrição municipal
- código do município

### 2. Tomador
O bloco `tomador` deve conter, no mínimo:
- CPF/CNPJ
- razão social
- endereço completo

### 3. Serviço
O bloco `servico` deve conter, no mínimo:
- discriminação do serviço
- valor dos serviços
- alíquota
- item da lista de serviço
- código CNAE
- indicação de ISS retido

## Pontos de atenção

- João Pessoa utiliza integração com **certificado digital**.
- O ambiente de **homologação** consta como disponível, mas o guia informa que o **portal de acesso não está disponível**.
- Valide com atenção o **CNAE** e o **item da lista de serviço**, pois são campos críticos para autorização.
- O endereço do tomador é obrigatório.

## Checklist de integração

- [ ] Configurar certificado digital
- [ ] Informar CNPJ e inscrição municipal do prestador
- [ ] Informar CPF/CNPJ do tomador
- [ ] Preencher endereço completo do tomador
- [ ] Definir item da lista de serviço conforme LC 116/2003
- [ ] Consultar e informar o CNAE com 9 dígitos
- [ ] Montar o bloco `servico` com valores e descrição
- [ ] Enviar a requisição para o ambiente correto

## Fonte

Documento baseado no guia da Focus NFe para João Pessoa/PB:
- [Guia técnico de emissão de NFS-e em João Pessoa/PB pela API da Focus NFe](https://focusnfe.com.br/guides/nfse/municipios-integrados/joao-pessoa-pb/)

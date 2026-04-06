![1775000561385](image/focus-api/1775000561385.png)![1775000561385](image/focus-api/1775000561385.png)![1775000561385](image/focus-api/1775000561385.png)

# NFSe

Através da API NFSe é possível:

* Emitir NFSe para qualquer município utilizando um único modelo de dados. Este processo é  **assíncrono** . Ou seja, após a emissão a nota será enfileirada para processamento.
* Cancelar NFSe
* Consultar NFSe’s emitidas
* Encaminhar uma NFSe autorizada por email

---

## URLs

| **Método** | **URL (recurso)**       | **Ação**                                                                   |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| POST              | `/v2/nfse?ref=REFERENCIA`   | Cria uma nota fiscal e a envia para processamento.                                 |
| GET               | `/v2/nfse/REFERENCIA`       | Consulta a nota fiscal com a referência informada e o seu status de processamento |
| DELETE            | `/v2/nfse/REFERENCIA`       | Cancela uma nota fiscal com a referência informada                                |
| POST              | `/v2/nfse/REFERENCIA/email` | Envia um email com uma cópia da nota fiscal com a referência informada           |

---

## Campos

Cada prefeitura pode utilizar um formato diferente de XML, mas utilizando nossa API você utiliza um formato único de campos para todas as prefeituras.

A listagem completa dos campos segue abaixo. Aqueles denotados com (*) são obrigatórios.

> **Reforma Tributária**
>
> * Abaixo, campos novos da API de NFSe são denotados com `<sup>`(RT)`</sup>` e destacados em  **verde** . Durante a transição, alguns municípios podem não aceitar ou não interpretar estes campos.
> * Muitos municípios estão migrando para o novo padrão da [API de NFSe Nacional](https://www.google.com/search?q=%23nfse-nacional&authuser=2), verifique em nosso [Guia da Reforma Tributária](https://focusnfe.com.br/guides/reforma-tributaria/#nfs-e).

> ⚠️  **ATENÇÃO** : Alguns municípios podem ter campos adicionais ou regras específicas para preenchimento de campos. Estas exceções tem se mostrado frequentes em função da  **Reforma Tributária** .
>
> Consulte nossa lista de [Municípios Integrados](https://focusnfe.com.br/cidades-integradas-nfse/) para orientações sobre especificidades de seu município.

### Geral

> Exemplo de um arquivo JSON:

**JSON**

```
{
   "data_emissao":"2017-09-21T22:15:00",
   "prestador":{
      "cnpj":"18765499000199",
      "inscricao_municipal":"12345",
      "codigo_municipio":"3516200"
   },
   "tomador":{
      "cnpj":"07504505000132",
      "razao_social":"Acras Tecnologia da Informação LTDA",
      "email":"contato@focusnfe.com.br",
      "endereco":{
         "logradouro":"Rua Dias da Rocha Filho",
         "numero":"999",
         "complemento":"Prédio 04 - Sala 34C",
         "bairro":"Alto da XV",
         "codigo_municipio":"4106902",
         "uf":"PR",
         "cep":"80045165"
      }
   },
   "servico":{
      "aliquota":3,
      "discriminacao":"Nota fiscal referente a serviços prestados",
      "iss_retido":"false",
      "item_lista_servico":"0107",
      "codigo_tributario_municipio": "620910000",
      "valor_servicos":1.0
   }
}
```

* **data_emissao** (*): (Data) Data/hora de emissão da NFSe. Alguns municípios não utilizam hora e ela será descartada caso seja fornecida. Formato padrão ISO, exemplo: “2016-12-25T12:00-0300”.
* **natureza_operacao** (*): (String) Natureza da operação. Valores aceitos: 1 (Tributação no município), 2 (Tributação fora do município), 3 (Isenção), 4 (Imune), 5 (Exigibilidade suspensa por de**cisão judicial), 6 (Exigibilidade suspensa por procedimento administrativo). Valor padrão: 1. Campo ignorado em alguns municípios.**^^
* **regime_especial_tributacao** **: (String) Código de identificação do regime especial. Valores aceitos: 1 (Microempresa municipal), 2 (Estimativa), 3 (S**^^ociedade de profissionais), 4 (Cooperativa), 5 (MEI - Simples Nacional), 6 (ME EPP - Simples Nacional). Campo ignorado em alguns municípios**.**^^
* **optante_simples_nacional** **(*): (Boolean) Informar true (verdadeiro) ou false (falso) se a empresa for optante pelo Simples Nacional. Campo ignorado por alguns municípios.**^^
* **incentivador_cultural** **: (Boolean) Informe true (verdadeiro) ou false (falso). Valor padrão: false. Campo ignorado em alguns municípios.**^^
* **codigo_obra^^** : (String) Código da obra quando construção civil. Tamanho: 15 caracteres.
* **art** : (String) Código ART quando construção civil. Este campo é ignorado em alguns municípios.
* **numero_rps_substituido** : (String) Número do RPS que será substituído, caso permitido pelo município (padrão ABRASF).
* **serie_rps_substituido** : (String) Série do RPS a ser substituído (Obrigatório se informado o numero_rps_substituido).
* **tipo_rps_substituido** : (String) Tipo do RPS a ser substituído. Caso desconheça este valor, utiliza o valor "1" (Obrigatório se informado o numero_rps_substituido).

### Prestador

* **cnpj** (*): (String) CNPJ do prestador de serviços. Caracteres não numéricos são ignorados.
* **codigo_municipio** (*): (String) Código IBGE de 7 dígitos do município do prestador.
* **inscricao_municipal** (*): (String) Inscrição municipal do prestador de serviços. Caracteres não numéricos são ignorados.

### Tomador

* **cpf** (*): (String) CPF do tomador, se aplicável. Caracteres não numéricos são ignorados.
* **cnpj** (*): (String) CNPJ do tomador, se aplicável. Caracteres não numéricos são ignorados.
* **nif** : (String) NIF (Número de Identificação Fiscal) do tomador estrangeiro, fornecido por órgão de administração tributária no exterior, se aplicável.
* **motivo_ausencia_nif** : (String) Motivo para não informação do NIF do tomador estrangeiro. Valores: 0 (Não informado na nota de origem), 1 (Dispensado do NIF), 2 (Não exigência do NIF).
* **inscricao_municipal** : (String) Inscrição municipal do tomador. Caracteres não numéricos são ignorados.
* **razao_social** : (String) Razão social ou nome do tomador. Tamanho: 115 caracteres.
* **telefone** : (String) Telefone do tomador. Tamanho: 11 caracteres.
* **email** : (String) Email do tomador. Tamanho: 80 caracteres.
* **endereco.logradouro** : (String) Nome do logradouro. Tamanho: 125 caracteres.
* **endereco.tipo_logradouro** : (String) Tipo do logradouro. Usado apenas para alguns municípios. Valor padrão: os 3 primeiros caracteres do logradouro. Tamanho: 3 caracteres.
* **endereco.numero** : (String) Número do endereço. Tamanho: 10 caracteres.
* **endereco.complemento** : (String) Complemento do endereço. Tamanho: 60 caracteres.
* **endereco.bairro** : Bairro. (String) Tamanho: 60 caracteres.
* **endereco.codigo_municipio** : (String) Código IBGE do município.
* **endereco.uf** : (String) UF do endereço. Tamanho: 2 caracteres.
* **endereco.cep** : (String) CEP do endereço. Caracteres não numéricos são ignorados.

### Serviço

* **valor_servicos** (*): (Decimal) Valor dos serviços.
* **valor_deducoes** : (Decimal) Valor das deduções.
* **valor_pis** : (Decimal) Valor do PIS.
* **valor_cofins** : (Decimal) Valor do COFINS.
* **valor_inss** : (Decimal) Valor do INSS.
* **valor_ir** : (Decimal) Valor do IRRF.
* **valor_csll** : (Decimal) Valor do CSLL.
* **iss_retido** (*): (Boolean) Informar true (verdadeiro) ou false (falso) se o ISS foi retido.
* **valor_iss** : (Decimal) Valor do ISS. Campo ignorado por alguns municípios que realizam seu próprio cálculo.
* **valor_iss_retido** : (Decimal) Valor do ISS Retido. Campo ignorado em alguns municípios.
* **outras_retencoes** : (Decimal) Valor de outras retenções. Campo ignorado em alguns municípios.
* **base_calculo** : (Decimal) Base de cálculo do ISS, valor padrão igual ao valor_servicos. Campo ignorado em alguns municípios.
* **aliquota** : (Decimal) Aliquota do ISS. Algumas cidades permitem usar 4 dígitos decimais.
* **desconto_incondicionado** : (Decimal) Valor do desconto incondicionado. Campo ignorado em alguns municípios.
* **desconto_condicionado** : (Decimal) Valor do desconto condicionado. Campo ignorado em alguns municípios.
* **item_lista_servico** (*): (String) Código da lista de serviços, normalmente de acordo com a Lei Complementar 116/2003. Com a Reforma Tributária, alguns municípios passaram a adotar o padrão nacional.
* **codigo_cnae** : (String) Código CNAE de 7 dígitos. Campo ignorado em alguns municípios.
* **codigo_tributario_municipio** : (String) Código tributário de acordo com a tabela de cada município (não há um padrão).
* **discriminacao** (*): (String) Discriminação dos serviços. Tamanho: Varia por município.
* **codigo_municipio** (*): (String) Código IBGE de 7 dígitos do município de prestação do serviço.
* **percentual_total_tributos** : (Decimal) Percentual aproximado de todos os impostos.
* **fonte_total_tributos** : (String) Fonte de onde foi retirada a informação de total de impostos (ex: "IBPT").
* **codigo_nbs** : (String) Código da lista de Nomenclatura Brasileira de Serviços.
* **codigo_indicador_operacao** : (String) Código indicador de operação.
* **ibs_cbs_classificacao_tributaria** : (String) Código de Classificação Tributária do IBS e CBS.
* **ibs_cbs_situacao_tributaria** : (String) Código de Situação Tributária do IBS e CBS.
* **ibs_cbs_base_calculo** : (Decimal) Base de cálculo do IBS e CBS.
* **ibs_uf_aliquota** : (Decimal) Alíquota da UF para IBS da localidade de incidência.
* **ibs_mun_aliquota** : (Decimal) Alíquota do Município para IBS da localidade de incidência.
* **cbs_aliquota** : (Decimal) Alíquota da União para CBS.
* **ibs_uf_valor** : (Decimal) Valor do IBS da UF calculado.
* **ibs_mun_valor** : (Decimal) Valor do IBS do Município calculado.
* **cbs_valor** : (Decimal) Valor do CBS da União calculado.

### Intermediário

*(Esta seção é ignorada se não suportada pelo município)*

* **razao_social** : (String) Razão social do intermediário do serviço. Tamanho: 115 caracteres.
* **cpf** : (String) CPF do intermediário do serviço.
* **cnpj** : (String) CNPJ do intermediário do serviço.
* **nif** : (String) NIF (Número de Identificação Fiscal) do intermediário estrangeiro.
* **motivo_ausencia_nif** : (String) Motivo para não informação do NIF. Valores: 0 (Não informado), 1 (Dispensado), 2 (Não exigência).
* **inscricao_municipal** : (String) Inscrição municipal do intermediário do serviço.

---

## Status API

Aqui você encontra os status possíveis para NFSe.

| **HTTP CODE/STATUS**           | **Status API Focus**                                                                                           | **Descrição**                               | **Correção**                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| 404 - not found                      | `nao_encontrado`                                                                                                   | Nota fiscal não encontrada                         | Verifique o método utilizado (deve-se usar POST) ou a nota fiscal não foi encontrada.                               |
| 400 - bad request                    | `nfe_cancelada`                                                                                                    | Nota fiscal já cancelada                           | Não é possível realizar a operação solicitada, pois a nota fiscal já foi cancelada.                             |
| 400 - bad request                    | `nfe_nao_autorizada`                                                                                               | Nota fiscal não autorizada não pode ser cancelada | O cancelamento só é possível para NFSe's autorizadas.                                                              |
| 400 - bad request                    | `requisicao_invalida`                                                                                              |                                                     | Sua requisição é inválida porque alguns dos paramêtros básicos não foram cumpridos. Consulte a documentação. |
| 400 - bad request                    | `empresa_nao_habilitada`                                                                                           | Emitente ainda não habilitado para emissão        | Configure a emissão de NFSe através do Painel API e tente novamente.                                                |
| 400 - bad request                    | `certificado_vencido`                                                                                              | O certificado do emitente está vencido             | É necessário renovar ou adquirir um novo cert**ificado digital modelo A1.**                                   |
| **422 - unprocessable entity** | `<span class="citation-13901 citation-13902 citation-13903 citation-13904 citation-13905">nfe_autorizada</span>`   | **Nota fiscal já autorizada**                | **A operação solicitada não pode ser realizada, pois a NFSe já foi autorizada.**                            |
| **422 - unprocessable entity** | `<span class="citation-13881 citation-13882 citation-13883 citation-13884 citation-13885">em_processamento</span>` | **Nota fisca**l em processamento              | **Sua nota está sendo processada pela prefeitura, aguarde alguns minutos antes de consultá-la novamente.**    |

---

## Envio^^^^^^

**Para enviar uma NFSe utilize a URL abaixo (altere para homologação em notas de teste)**^^:^^^^

`<span class="citation-13864 citation-13865">POST https://api.focusnfe.com.br/v2/nfse?ref=REFERENCIA</span>`^^^^

### Exemplos de Integração^^^^

**Python^^^^**

**Python**

```
import json
import requests

url = "https://homologacao.focusnfe.com.br/v2/nfse"
ref = {"ref":"12345"}
token="token obtido no cadastro da empresa"

nfse = {}
nfse["prestador"] = {}
nfse["servico"] = {}
nfse["tomador"] = {}
nfse["tomador"]["endereco"] = {}

nfse["razao_social"] = "ACME INK"
nfse["data_emissao"] = "2018-02-26T12:00:00-03:00"
nfse["incentivador_cultural"] =  "false"
nfse["natureza_operacao"] = "1"
nfse["optante_simples_nacional"] = "true"
nfse["status"] = "1"
nfse["prestador"]["cnpj"] = "99999999999999"
nfse["prestador"]["inscricao_municipal"] = "99999999"
nfse["prestador"]["codigo_municipio"] = "9999999"
nfse["servico"]["aliquota"] = "2.92"
nfse["servico"]["base_calculo"] = "1.00"
nfse["servico"]["discriminacao"] = "SERVICOS E MAO DE OBRA"
nfse["servico"]["iss_retido"] = "0"
nfse["servico"]["item_lista_servico"] = "1412"
nfse["servico"]["valor_iss"] = "11.68"
nfse["servico"]["valor_liquido"] = "1.00"
nfse["servico"]["valor_servicos"] = "1.00"
nfse["tomador"]["cnpj"] = "99999999999999"
nfse["tomador"]["razao_social"] = "Parkinson da silva coelho JR"
nfse["tomador"]["endereco"]["bairro"] = "São Miriti"
nfse["tomador"]["endereco"]["cep"] = "31999-000"
nfse["tomador"]["endereco"]["codigo_municipio"] = "9999999"
nfse["tomador"]["endereco"]["logradouro"] = "João Batista Netos"
nfse["tomador"]["endereco"]["numero"] = "34"
nfse["tomador"]["endereco"]["uf"] = "MG"

r = requests.post(url, params=ref, data=json.dumps(nfse), auth=(token,""))
print(r.status_code, r.text)
```

**Shell / cURL^^^^^^^^^^^^^^^^**

**Bash**

```
curl -u "token obtido no cadastro da empresa:" \
  -X POST -T arquivo.json https://homologacao.focusnfe.com.br/v2/nfse?ref=12345
```

**PHP^^^^^^^^^^^^**

**PHP**

```
<?php
$server = "https://homologacao.focusnfe.com.br";
$ref = "12345";
$login = "token obtido no cadastro da empresa";
$password = "";
$nfse = array (
    "data_emissao" => "2017-12-27T17:43:14-3:00",
    "incentivador_cultural" => "false",
    "natureza_operacao" => "1",
    "optante_simples_nacional" => "false",
    "prestador" => array(
        "cnpj" => "51916585000125",
        "inscricao_municipal" => "12345",
        "codigo_municipio" => "4119905"
        ),
    "tomador" => array(
      "cnpj" => "07504505000132",
        "razao_social" => "Acras Tecnologia da Informação LTDA",
        "email" => "contato@focusnfe.com.br",
        "endereco" => array(
          "bairro" => "Jardim America",
          "cep" => "81530900",
          "codigo_municipio" => "4119905",
          "logradouro" => "Rua ABC",
          "numero" => "16",
          "uf" => "PR"
         )
    ),
    "servico" => array(
           "discriminacao" => "Exemplo Serviço",
           "iss_retido" => "false",
           "item_lista_servico" => "106",
           "codigo_cnae" => "6319400",
           "valor_servicos" => "1.00"
    ),
);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $server."/v2/nfse?ref=" . $ref);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($nfse));
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$login:$password");
$body = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
print($http_code."\n");
print($body."\n\n");
curl_close($ch);
?>
```

### Exempl^^os de Respostas (Envio)

**Sucesso (processando_autorizacao)**

**JSON**

```
{
  "cnpj_prestador": "CNPJ_PRESTADOR",
  "ref": "REFERENCIA",
  "status": "processando_autorizacao"
}
```

**Erro (requisicao_invalida)**

**JSON**

```
{
  "codigo": "requisicao_invalida",
  "mensagem": "Parâmetro \"prestador.codigo_municipio\" não informado"
}
```

---

## Consulta

Para consultar uma NFSe utilize a URL abaixo (alterando para homologação em testes):

`GET https://api.focusnfe.com.br/v2/nfse/REFERENCIA`

### Status de Retorno

* **autorizado** : A NFSe foi autorizada com sucesso. São fornecidos o**s caminhos para a DANFSe e XML.**^^
* **cancelado** **: A operação de cancelamento foi realizada com sucesso.**^^
* **erro_autorizacao** **: Erro durante a emissão. A mensagem estará no campo "erros". Possível reenviar a nota com a mesma referência após correções.**^^
* **processando_^^autorizacao** : Sendo processada internamente. Consulte após alguns minutos.
* **substituido** : Documento substituído por outra NFSe.

### Download do XML e Consulta

Após autorização, a API retornará os campos:

* `caminho_xml_nota_fiscal`: Caminho para montar a URL de download do XML.
* `url`: URL para consultar a NFSe direto no portal da prefeitura.

### Exemplos de Respostas (Consulta)

**Autorizado**

**JSON**

```
{
  "cnpj_prestador": "07504505000132",
  "ref": "nfs-2",
  "numero_rps": "224",
  "serie_rps": "1",
  "status": "autorizado",
  "numero": "233",
  "codigo_verificacao": "DU1M-M2Y",
  "data_emissao": "2019-05-27T00:00:00-03:00",
  "url": "https://200.189.192.82/PilotoNota_Portal/Default.aspx?doc=...",
  "caminho_xml_nota_fiscal": "/arquivos/07504505000132_12345/202401/XMLsNFSe/..."
}
```

**Erro de Autorização**

**JSON**

```
{
  "cnpj_prestador": "07504505000132",
  "ref": "nfs-2",
  "numero_rps": "224",
  "serie_rps": "1",
  "status": "erro_autorizacao",
  "erros": [
    {
      "codigo": "E145",
      "mensagem": "Regime Especial de Tributação ausente/inválido.",
      "correcao": null
    }
  ]
}
```

---

## Cancelamento

Para cancelar uma NFSe, faça uma requisição **HTTP DELETE** para:

`DELETE https://api.focusnfe.com.br/v2/nfse/REFERENCIA`

Este método é  **síncrono** , devolvendo a resposta imediatamente. O parâmetro obrigatório no corpo é:

* **justificativa** : Justificativa do cancelamento (15 a 255 caracteres).

### Exemplos de Integração

**Shell / cURL**

**Bash**

```
curl -u "token obtido no cadastro da empresa:" \
  -X DELETE -d '{"justificativa":"Teste de cancelamento de nota"}' \
  https://homologacao.focusnfe.com.br/v2/nfse/12345
```

**PHP**

**PHP**

```
<?php
$ch = curl_init();
$ref = "12345";
$server = "https://homologacao.focusnfe.com.br";
$justificativa = array ("justificativa" => "Teste de cancelamento de nota");
$login = "token obtido no cadastro da empresa";
$password = "";

curl_setopt($ch, CURLOPT_URL, $server . "/v2/nfse/" . $ref);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($justificativa));
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_USERPWD, "$login:$password");
$body = curl_exec($ch);
$result = curl_getinfo($ch, CURLINFO_HTTP_CODE);

print($result."\n");
print($body."\n\n");
curl_close($ch);
?>
```

### Exemplos de Respostas (Cancelamento)

**Sucesso (cancelado)**

**JSON**

```
{
  "status": "cancelado"
}
```

**Erro (erro_cancelamento)**

**JSON**

```
{
  "status": "erro_cancelamento",
  "erros": [
    {
      "codigo": "E523",
      "mensagem": "A nota que você está tentando cancelar está fora do prazo permitido para cancelamento",
      "correcao": null
    }
  ]
}
```


#### Sobre

A API Placas fornece dados e informações sobre veículos emplacados no Brasil através da placa do mesmo.

#### Token

Os tokens para uso da API são fornecidos após a criação de seu [Cadastro](https://apiplacas.com.br/cadastro.php) conosco. Você receberá um token para as consultas normais e outro para as consultas premium.

Para visualizar seus tokens, basta efetuar o login de sua conta e ir até o menu [Painel do Usuário](https://apiplacas.com.br/painel.php).

#### Informações

A API fornece os dados através de uma URL utilizando o método (GET).
Segue abaixo a url de exemplo:

https://wdapi2.com.br/consulta/ **placa** /token

O parâmetro **(placa)** deve ser informado no formato: **AAA0X00** ou  **AAA9999** .

**📌 Informação Importante: **Os dados do campo **"extra"** são exibidos sempre que disponíveis, mas podem estar incompletos ou ausentes em algumas consultas. A disponibilidade dessas informações depende da base de dados no momento da busca.
Sempre confira se o campo **"extra"** foi retornado e revise as informações antes de utilizá-las.

📌 Os valores da **Tabela FIPE** podem não ser retornados em algumas consultas. Não garantimos a disponibilidade desses dados. Além disso, pode haver múltiplos valores da **Tabela FIPE** em uma mesma consulta. Recomendamos escolher o valor com o maior  **score** , pois ele indica a melhor correspondência entre nome e marca do veículo. O **score** reflete o nível de precisão da informação.

---

#### Utilização da API

##### Placa

Para obter os dados do veículo basta informar a placa do mesmo e o seu token na (URL).
Neste exemplo vamos utilizar a placa  **INT8C36** , veja como fica abaixo.

https://wdapi2.com.br/consulta/ **INT8C36** /token

O campo **"extra"** e suas informações podem não estar disponíveis em todas as consultas. Verifique sempre a presença deste campo antes de usá-lo.

Você receberá os dados no formato JSON:

```

{
  "MARCA": "VW", 
  "MODELO": "CROSSFOX", 
  "SUBMODELO": "CROSSFOX", 
  "VERSAO": "CROSSFOX", 
  "ano": "2007", 
  "anoModelo": "2007", 
  "chassi": "*****10137", 
  "codigoSituacao": "0", 
  "cor": "Prata", 
  "data": "20/07/2022 15:10:09", 
  "extra": {
    "ano_fabricacao": "2007", 
    "ano_modelo": "2007", 
    "caixa_cambio": "", 
    "cap_maxima_tracao": "198", 
    "carroceria": "", 
    "cilindradas": "1599", 
    "combustivel": "Alcool / Gasolina", 
    "di": "0", 
    "eixo_traseiro_dif": "", 
    "eixos": "2", 
    "especie": "Passageiro", 
    "grupo": "CROSS FOX", 
    "modelo": "VW/CROSSFOX", 
    "municipio": "SAO LEOPOLDO", 
    "nacionalidade": "Nacional", 
    "peso_bruto_total": "158", 
    "placa": "INT8236", 
    "placa_modelo_antigo": "INT8236", 
    "placa_modelo_novo": "INT8C36", 
    "quantidade_passageiro": "5", 
    "s.especie": "Passageiro", 
    "segmento": "Auto", 
    "situacao_chassi": "N", 
    "situacao_veiculo": "S", 
    "sub_segmento": "AU - HATCH PEQUENO", 
    "terceiro_eixo": "", 
    "tipo_carroceria": "NAO APLICAVEL", 
    "tipo_doc_faturado": "Juridica", 
    "tipo_doc_importadora": "Outros", 
    "tipo_doc_prop": "Fisica", 
    "tipo_montagem": "1", 
    "tipo_veiculo": "Automovel", 
    "uf": "RS", 
    "uf_faturado": "RS", 
    "uf_placa": "RS", 
  }, 
  "fipe": {
    "dados": [
      {
        "ano_modelo": "2007", 
        "codigo_fipe": "005225-6", 
        "codigo_marca": 59, 
        "codigo_modelo": "2368", 
        "combustivel": "Gasolina", 
        "id_valor": 77250, 
        "mes_referencia": "maio de 2022 ", 
        "referencia_fipe": 285, 
        "score": 101, 
        "sigla_combustivel": "G", 
        "texto_marca": "VW - VolksWagen", 
        "texto_modelo": "CROSSFOX 1.6 Mi Total Flex 8V 5p", 
        "texto_valor": "R$ 28.799,00", 
        "tipo_modelo": 1
      }
    ]
  }, 
  "listamodelo": [
    "CROSSFOX"
  ], 
  "logo": "https://apiplacas.com.br/logos/logosMarcas/vw.png", 
  "marca": "VW", 
  "marcaModelo": "VW/CROSSFOX", 
  "mensagemRetorno": "Sem erros.", 
  "modelo": "CROSSFOX", 
  "municipio": "S\u00e3o Leopoldo", 
  "origem": "NACIONAL", 
  "placa": "INT8C36", 
  "placa_alternativa": "INT8236", 
  "situacao": "Sem restri\u00e7\u00e3o", 
  "token": "", 
  "uf": "RS"
}
											
```

---

##### Limite

Você pode consultar o uso e o limite de consultas diárias do seu plano através do menu [(Painel do Usuário)](https://apiplacas.com.br/painel.php), ou também via API, para isto, basta informar seu token na seguinte (URL). Veja como fica abaixo.

https://wdapi2.com.br/saldo/**token**

```

{
  "qtdConsultas": 3500
}
											
```

---

##### Códigos de retorno

| 200 | Retorno com sucesso.          |
| --- | ----------------------------- |
| 400 | URL incorreta!                |
| 401 | Placa Inválida!              |
| 402 | Token inválido!              |
| 406 | Sem resultados!               |
| 429 | Limite de consultas atingido! |

Todos os códigos de erro retornam com uma mensagem detalhando o erro.
Exemplo:

```

{
    "message": "Placa Invalida favor usar o formato AAA0X00 ou AAA9999 "
}
								
```

* [ ]

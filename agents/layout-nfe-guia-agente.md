# Layout de construção de NF-e (Guia para Agente de IA)

## Contexto e escopo

Documento fonte: *MOC 7.0 – Anexo I – Leiaute e Regras de Validação da NF-e e da NFC-e* (extração direta do PDF). fileciteturn1file3L7-L20

Versão do layout: Não informado no PDF (há controle de versões do documento; ver fonte).

Objetivo deste guia: instruir um agente de IA a **montar** e **validar** uma NF-e conforme o leiaute e as regras descritas no PDF (inclui estrutura/hierarquia, obrigatoriedade, tipos/tamanhos e regras de validação).

## Visão geral do layout

Fluxo principal (grupos filhos de `infNFe`, em ordem conforme o PDF):

- ide (1..1) — Informações de identificação da NF-e
- emit (1..1) — Identificação do emitente da NF-e
- avulsa (0..1) — Não informado no PDF
- dest (0..1) — Identificação do Destinatário da NF-e
- retirada (0..1) — Identificação do Local de retirada
- entrega (0..1) — Identificação do Local de entrega
- det (1..990) — Detalhamento de Produtos e Serviços
- autXML (0..10) — Pessoas autorizadas a acessar o XML da NF-e
- total (1..1) — Grupo Totais da NF-e
- transp (1..1) — Grupo Informações do Transporte
- cobr (0..1) — Grupo Cobrança
- pag (1..1) — Grupo de Informações de Pagamento
- infIntermed (0..1) — Grupo de Informações do Intermediador da Transação
- infAdic (0..1) — Grupo de Informações Adicionais
- exporta (0..1) — Grupo Exportação
- compra (0..1) — Grupo Compra
- cana (0..1) — Grupo Cana
- infRespTec (0..1) — Informações do Responsável Técnico pela emissão do DF-
e
- Signature (1..1) — Assinatura XML da NF-e Segundo o Padrão XML Digital

Observação: `infNFeSupl` é um grupo separado (filho de `NFe`/`Raiz`) conforme o PDF.

## Hierarquia do documento (árvore)

Árvore de grupos (apenas nós `G`/`CG`, com cardinalidade):

```text
NFe
infNFe
│  ├─ ide (1..1)
│  │  └─ NFref (0..500)
│  │     ├─ refNF (1..1)
│  │     ├─ refNFP (1..1)
│  │     └─ refECF (1..1)
│  ├─ emit (1..1)
│  │  └─ enderEmit (1..1)
│  ├─ avulsa (0..1)
│  ├─ dest (0..1)
│  │  └─ enderDest (0..1)
│  ├─ retirada (0..1)
│  ├─ entrega (0..1)
│  ├─ det (1..990)
│  │  ├─ prod (1..1)
│  │  │  ├─ DI (0..100)
│  │  │  │  └─ adi (1..100)
│  │  │  ├─ detExport (0..500)
│  │  │  │  └─ exportInd (0..1)
│  │  │  └─ rastro (0..500)
│  │  ├─ imposto (1..1)
│  │  │  ├─ ICMS (1..1)
│  │  │  │  ├─ ICMS00 (1..1)
│  │  │  │  ├─ ICMS10 (1..1)
│  │  │  │  ├─ ICMS20 (1..1)
│  │  │  │  ├─ ICMS30 (1..1)
│  │  │  │  ├─ ICMS40 (1..1)
│  │  │  │  ├─ ICMS51 (1..1)
│  │  │  │  ├─ ICMS60 (1..1)
│  │  │  │  ├─ ICMS70 (1..1)
│  │  │  │  ├─ ICMS90 (1..1)
│  │  │  │  ├─ ICMSPart (1..1)
│  │  │  │  ├─ ICMSST (1..1)
│  │  │  │  ├─ ICMSSN101 (1..1)
│  │  │  │  ├─ ICMSSN102 (1..1)
│  │  │  │  ├─ ICMSSN201 (1..1)
│  │  │  │  ├─ ICMSSN202 (1..1)
│  │  │  │  ├─ ICMSSN500 (1..1)
│  │  │  │  └─ ICMSSN900 (1..1)
│  │  │  ├─ ICMSUFDest (0..1)
│  │  │  ├─ IPI (0..1)
│  │  │  │  ├─ IPITrib (1..1)
│  │  │  │  └─ IPINT (1..1)
│  │  │  ├─ II (0..1)
│  │  │  ├─ PIS (0..1)
│  │  │  │  ├─ PISAliq (1..1)
│  │  │  │  ├─ PISQtde (1..1)
│  │  │  │  ├─ PISNT (1..1)
│  │  │  │  └─ PISOutr (1..1)
│  │  │  ├─ PISST (0..1)
│  │  │  ├─ COFINS (0..1)
│  │  │  │  ├─ COFINSAliq (1..1)
│  │  │  │  ├─ COFINSQtde (1..1)
│  │  │  │  ├─ COFINSNT (1..1)
│  │  │  │  └─ COFINSOutr (1..1)
│  │  │  ├─ COFINSST (0..1)
│  │  │  └─ ISSQN (0..1)
│  │  └─ impostoDevol (0..1)
│  │     └─ IPI (1..1)
│  ├─ autXML (0..10)
│  ├─ total (1..1)
│  │  ├─ ICMSTot (1..1)
│  │  ├─ ISSQNtot (0..1)
│  │  └─ retTrib (0..1)
│  ├─ transp (1..1)
│  │  ├─ transporta (0..1)
│  │  ├─ retTransp (0..1)
│  │  └─ vol (0..5000)
│  │     └─ lacres (0..5000)
│  ├─ cobr (0..1)
│  │  ├─ fat (0..1)
│  │  └─ dup (0..120)
│  ├─ pag (1..1)
│  │  └─ detPag (1..100)
│  │     └─ card (0..1)
│  ├─ infIntermed (0..1)
│  ├─ infAdic (0..1)
│  │  ├─ obsCont (0..10)
│  │  ├─ obsFisco (0..10)
│  │  └─ procRef (0..100)
│  ├─ exporta (0..1)
│  ├─ compra (0..1)
│  ├─ cana (0..1)
│  │  ├─ forDia (1..31)
│  │  └─ deduc (0..10)
│  ├─ infRespTec (0..1)
│  └─ Signature (1..1)
veicProd (1..1)
med (1..1)
arma (1..500)
comb (1..1)
│  ├─ CIDE (0..1)
│  └─ encerrante (0..1)
veicTransp (0..1)
reboque (0..5)
infNFeSupl (0..1)
```

## Dicionário de campos (por grupo)

### NFe

Campo: NFe
Descrição: TAG raiz da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: TAG raiz da NF-e
Onde aparece (caminho): NFe
Cardinalidade: 1..1

Campo: infNFe
Descrição: Informações da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=-
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo que contém as informações da NF-e
Onde aparece (caminho): NFe/infNFe
Cardinalidade: 1..1

Campo: pk_nItem
Descrição: Regra para que a numeração do item de detalhe da NF-e
seja única.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=RC; Tipo=-
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Regra de validação do item de detalhe da NF-e, campo de
controle do Schema XML, o contribuinte não deve se
preocupar com o preenchimento deste campo.
Onde aparece (caminho): NFe/pk_nItem
Cardinalidade: 1..1

Campo: infNFeSupl
Descrição: Informações suplementares da Nota Fiscal
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=-
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações suplementares da Nota Fiscal, não afetando
a assinatura digital. (NT 2015.002)
Onde aparece (caminho): NFe/infNFeSupl
Cardinalidade: 0..1


### infNFe

Campo: infNFe
Descrição: Informações da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=-
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo que contém as informações da NF-e
Onde aparece (caminho): NFe/infNFe
Cardinalidade: 1..1

Campo: versao
Descrição: Versão do leiaute
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=A; Tipo=C
Tamanho: 1 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Versão do leiaute (4.00)
Onde aparece (caminho): NFe/infNFe/@versao
Cardinalidade: 1..1

Campo: Id
Descrição: Identificador da TAG a ser assinada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=ID; Tipo=C
Tamanho: 47
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a Chave de Acesso precedida do literal ‘NFe’,
Onde aparece (caminho): NFe/infNFe/@Id
Cardinalidade: 1..1

Campo: ide
Descrição: Informações de identificação da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/ide
Cardinalidade: 1..1

Campo: emit
Descrição: Identificação do emitente da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit
Cardinalidade: 1..1

Campo: avulsa
Descrição: Não informado no PDF
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações do fisco emitente (uso exclusivo do fisco)
Onde aparece (caminho): NFe/infNFe/avulsa
Cardinalidade: 0..1

Campo: dest
Descrição: Identificação do Destinatário da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo Obrig.atório para a NF-e (modelo 55).
Onde aparece (caminho): NFe/infNFe/dest
Cardinalidade: 0..1

Campo: retirada
Descrição: Identificação do Local de retirada
Obrigatoriedade: Condicional (Informar somente se diferente do endereço do
remetente.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente se diferente do endereço do
remetente.
Onde aparece (caminho): NFe/infNFe/retirada
Cardinalidade: 0..1

Campo: entrega
Descrição: Identificação do Local de entrega
Obrigatoriedade: Condicional (Informar somente se diferente do endereço destinatário.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente se diferente do endereço destinatário.
Onde aparece (caminho): NFe/infNFe/entrega
Cardinalidade: 0..1

Campo: det
Descrição: Detalhamento de Produtos e Serviços
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Múltiplas ocorrências (máximo = 990)
Onde aparece (caminho): NFe/infNFe/det
Cardinalidade: 1..990

Campo: autXML
Descrição: Pessoas autorizadas a acessar o XML da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/autXML
Cardinalidade: 0..10

Campo: total
Descrição: Grupo Totais da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: O grupo de valores totais da NF-e deve ser informado com
o somatório do campo correspondente dos itens.
Onde aparece (caminho): NFe/infNFe/total
Cardinalidade: 1..1

Campo: transp
Descrição: Grupo Informações do Transporte
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp
Cardinalidade: 1..1

Campo: cobr
Descrição: Grupo Cobrança
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr
Cardinalidade: 0..1

Campo: pag
Descrição: Grupo de Informações de Pagamento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: - 90=Sem Pagamento.
Regras/observações: Obrig.atório o preenchimento do Grupo Informações de
Pagamento para NF-e e NFC-e. Para as notas com
finalidade de Ajuste ou Devolução o
campo Meio de Pagamento deve ser preenchido com
90=Sem Pagamento.
Onde aparece (caminho): NFe/infNFe/pag
Cardinalidade: 1..1

Campo: infIntermed
Descrição: Grupo de Informações do Intermediador da Transação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatório o preenchimento do Grupo de Informações
Onde aparece (caminho): NFe/infNFe/infIntermed
Cardinalidade: 0..1

Campo: infAdic
Descrição: Grupo de Informações Adicionais
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/infAdic
Cardinalidade: 0..1

Campo: exporta
Descrição: Grupo Exportação
Obrigatoriedade: Condicional (Informar apenas na exportação.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas na exportação.
Onde aparece (caminho): NFe/infNFe/exporta
Cardinalidade: 0..1

Campo: compra
Descrição: Grupo Compra
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação adicional de compra
Onde aparece (caminho): NFe/infNFe/compra
Cardinalidade: 0..1

Campo: cana
Descrição: Grupo Cana
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações de registro aquisições de cana v2.0
Onde aparece (caminho): NFe/infNFe/cana
Cardinalidade: 0..1

Campo: infRespTec
Descrição: Informações do Responsável Técnico pela emissão do DF-
e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo para informações do responsável técnico pelo
sistema de emissão do DF-e
Onde aparece (caminho): NFe/infNFe/infRespTec
Cardinalidade: 0..1

Campo: Signature
Descrição: Assinatura XML da NF-e Segundo o Padrão XML Digital
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Signature
Onde aparece (caminho): NFe/infNFe/Signature
Cardinalidade: 1..1


### ide

Campo: ide
Descrição: Informações de identificação da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/ide
Cardinalidade: 1..1

Campo: cUF
Descrição: Código da UF do emitente do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código da UF do emitente do Documento Fiscal. Utilizar a
Tabela do IBGE de código de unidades da federação (Seção
8.1 do MOC – Visão Geral, Tabela de UF, Município e País).
Onde aparece (caminho): NFe/infNFe/ide/cUF
Cardinalidade: 1..1

Campo: cNF
Descrição: Código Numérico que compõe a Chave de Acesso
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código numérico que compõe a Chave de Acesso. Número
aleatório gerado pelo emitente para cada NF-e para evitar
acessos indevidos da NF-e. (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/cNF
Cardinalidade: 1..1

Campo: natOp
Descrição: Descrição da Natureza da Operação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a natureza da operação de que decorrer a saída
ou a entrada, tais como: venda, compra, transferência,
devolução, importação, consignação, remessa (para fins de
demonstração, de industrialização ou outra), conforme
previsto na alínea 'i', inciso I, art. 19 do CONVÊNIO S/Nº, de
15 de dezembro de 1970.
Onde aparece (caminho): NFe/infNFe/ide/natOp
Cardinalidade: 1..1

Campo: indPag
Descrição: Indicador da forma de pagamento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Pagamento à vista
- 1=Pagamento a prazo
- 2=Outros.
Regras/observações: 0=Pagamento à vista; 1=Pagamento a prazo; 2=Outros.
(Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/ide/indPag
Cardinalidade: 1..1

Campo: mod
Descrição: Código do Modelo do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 55=NF-e emitida em substituição ao modelo 1 ou 1A
- 65=NFC-e, utilizada nas operações de venda no varejo (a
Regras/observações: 55=NF-e emitida em substituição ao modelo 1 ou 1A;
65=NFC-e, utilizada nas operações de venda no varejo (a
critério da UF aceitar este modelo de documento).
Onde aparece (caminho): NFe/infNFe/ide/mod
Cardinalidade: 1..1

Campo: serie
Descrição: Série do Documento Fiscal
Obrigatoriedade: Condicional (Série do Documento Fiscal, preencher com zeros na
hipótese de a NF-e não possuir série. Série na faixa:
- [000-889]: Aplicativo do Contribuinte; Emitente=CNPJ;
Assinatura pelo e-CNPJ do contribuinte (procEmi<>1,2);
- [890-899]: Emissão no site do Fisco (NFA-e - Avulsa);
Emitente= CNPJ / CPF; Assinatura pelo e-CNPJ da SEFAZ
(procEmi=1);
- [900-909]: Emissão no site do Fisco (NFA-e); Emitente=
CNPJ; Assinatura pelo e-CNPJ da SEFAZ (procEmi=1), ou
Assinatura pelo e-CNPJ do contribuinte (procEmi=2);
- [910-919]: Emissão no site do Fisco (NFA-e); Emitente=
CPF; Assinatura pelo e-CNPJ da SEFAZ (procEmi=1), ou
Assinatura pelo e-CPF do contribuinte (procEmi=2);
- [920-969]: Aplicativo do Contribuinte; Emitente=CPF;
Assinatura pelo e-CPF do contribuinte (procEmi<>1,2);
(Atualizado NT 2018/001))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Série do Documento Fiscal, preencher com zeros na
hipótese de a NF-e não possuir série. Série na faixa:
- [000-889]: Aplicativo do Contribuinte; Emitente=CNPJ;
Assinatura pelo e-CNPJ do contribuinte (procEmi<>1,2);
- [890-899]: Emissão no site do Fisco (NFA-e - Avulsa);
Emitente= CNPJ / CPF; Assinatura pelo e-CNPJ da SEFAZ
(procEmi=1);
- [900-909]: Emissão no site do Fisco (NFA-e); Emitente=
CNPJ; Assinatura pelo e-CNPJ da SEFAZ (procEmi=1), ou
Assinatura pelo e-CNPJ do contribuinte (procEmi=2);
- [910-919]: Emissão no site do Fisco (NFA-e); Emitente=
CPF; Assinatura pelo e-CNPJ da SEFAZ (procEmi=1), ou
Assinatura pelo e-CPF do contribuinte (procEmi=2);
- [920-969]: Aplicativo do Contribuinte; Emitente=CPF;
Assinatura pelo e-CPF do contribuinte (procEmi<>1,2);
(Atualizado NT 2018/001)
Onde aparece (caminho): NFe/infNFe/ide/serie
Cardinalidade: 1..1

Campo: nNF
Descrição: Número do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Número do Documento Fiscal.
Onde aparece (caminho): NFe/infNFe/ide/nNF
Cardinalidade: 1..1

Campo: dhEmi
Descrição: Data e hora de emissão do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Data e hora no formato UTC (Universal Coordinated Time):
AAAA-MM-DDThh:mm:ssTZD
Onde aparece (caminho): NFe/infNFe/ide/dhEmi
Cardinalidade: 1..1

Campo: dhSaiEnt
Descrição: Data e hora de Saída ou da Entrada da Mercadoria/Produto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=D
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Data e hora no formato UTC (Universal Coordinated Time):
AAAA-MM-DDThh:mm:ssTZD.
Observação: Não informar este campo para a NFC-e.
Onde aparece (caminho): NFe/infNFe/ide/dhSaiEnt
Cardinalidade: 0..1

Campo: tpNF
Descrição: Tipo de Operação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Entrada
- 1=Saída
Regras/observações: 0=Entrada;
1=Saída
Onde aparece (caminho): NFe/infNFe/ide/tpNF
Cardinalidade: 1..1

Campo: cMunFG
Descrição: Código do Município de Ocorrência do Fato Gerador
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o município de ocorrência do fato gerador do
ICMS. Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão
Geral, Tabela de UF, Município e País)
Onde aparece (caminho): NFe/infNFe/ide/cMunFG
Cardinalidade: 1..1

Campo: tpImp
Descrição: Formato de Impressão do DANFE
Obrigatoriedade: Condicional (0=Sem geração de DANFE;
1=DANFE normal, Retrato;
2=DANFE normal, Paisagem;
3=DANFE Simplificado; 4=DANFE NFC-e;
5=DANFE NFC-e em mensagem eletrônica (o envio de
mensagem eletrônica pode ser feita de forma simultânea
com a impressão do DANFE; usar o tpImp=5 quando esta
for a única forma de disponibilização do DANFE).)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Sem geração de DANFE
- 1=DANFE normal, Retrato
- 2=DANFE normal, Paisagem
- 3=DANFE Simplificado
- 4=DANFE NFC-e
- 5=DANFE NFC-e em mensagem eletrônica (o envio de
Regras/observações: 0=Sem geração de DANFE;
1=DANFE normal, Retrato;
2=DANFE normal, Paisagem;
3=DANFE Simplificado; 4=DANFE NFC-e;
5=DANFE NFC-e em mensagem eletrônica (o envio de
mensagem eletrônica pode ser feita de forma simultânea
com a impressão do DANFE; usar o tpImp=5 quando esta
for a única forma de disponibilização do DANFE).
Onde aparece (caminho): NFe/infNFe/ide/tpImp
Cardinalidade: 1..1

Campo: idDest
Descrição: Identificador de local de destino da operação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Operação interna
- 2=Operação interestadual
- 3=Operação com exterior.
Regras/observações: 1=Operação interna;
2=Operação interestadual;
3=Operação com exterior.
Onde aparece (caminho): NFe/infNFe/ide/idDest
Cardinalidade: 1..1

Campo: tpEmis
Descrição: Tipo de Emissão da NF-e
Obrigatoriedade: Condicional (1=Emissão normal (não em contingência);
2=Contingência FS-IA, com impressão do DANFE em
Formulário de Segurança - Impressor Autônomo;
3=Contingência SCAN (Sistema de Contingência do
Ambiente Nacional); *Desativado * NT 2015/002
4=Contingência EPEC (Evento Prévio da Emissão em
Contingência);
5=Contingência FS-DA, com impressão do DANFE em
Formulário de Segurança - Documento Auxiliar;
6=Contingência SVC-AN (SEFAZ Virtual de Contingência do
AN);
7=Contingência SVC-RS (SEFAZ Virtual de Contingência do
RS);
9=Contingência off-line da NFC-e;
Observação: Para a NFC-e somente é válida a opção de
contingência: 9-Contingência Off-Line e, a critério da UF,
opção 4-Contingência EPEC. (NT 2015/002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Emissão normal (não em contingência)
- 2=Contingência FS-IA, com impressão do DANFE em
- 3=Contingência SCAN (Sistema de Contingência do
- 4=Contingência EPEC (Evento Prévio da Emissão em
- 5=Contingência FS-DA, com impressão do DANFE em
- 6=Contingência SVC-AN (SEFAZ Virtual de Contingência do
- 7=Contingência SVC-RS (SEFAZ Virtual de Contingência do
- 9=Contingência off-line da NFC-e
Regras/observações: 1=Emissão normal (não em contingência);
2=Contingência FS-IA, com impressão do DANFE em
Formulário de Segurança - Impressor Autônomo;
3=Contingência SCAN (Sistema de Contingência do
Ambiente Nacional); *Desativado * NT 2015/002
4=Contingência EPEC (Evento Prévio da Emissão em
Contingência);
5=Contingência FS-DA, com impressão do DANFE em
Formulário de Segurança - Documento Auxiliar;
6=Contingência SVC-AN (SEFAZ Virtual de Contingência do
AN);
7=Contingência SVC-RS (SEFAZ Virtual de Contingência do
RS);
9=Contingência off-line da NFC-e;
Observação: Para a NFC-e somente é válida a opção de
contingência: 9-Contingência Off-Line e, a critério da UF,
opção 4-Contingência EPEC. (NT 2015/002)
Onde aparece (caminho): NFe/infNFe/ide/tpEmis
Cardinalidade: 1..1

Campo: cDV
Descrição: Dígito Verificador da Chave de Acesso da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o DV da Chave de Acesso da NF-e, o DV será
calculado com a aplicação do algoritmo módulo 11 (base
2,9) da Chave de Acesso. (vide item 5.4 do MOC – Visão
Geral)
Onde aparece (caminho): NFe/infNFe/ide/cDV
Cardinalidade: 1..1

Campo: tpAmb
Descrição: Identificação do Ambiente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Produção
- 2=Homologação
Regras/observações: 1=Produção; 2=Homologação
Onde aparece (caminho): NFe/infNFe/ide/tpAmb
Cardinalidade: 1..1

Campo: finNFe
Descrição: Finalidade de emissão da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=NF-e normal
- 2=NF-e complementar
- 3=NF-e de ajuste
- 4=Devolução de mercadoria.
Regras/observações: 1=NF-e normal;
2=NF-e complementar;
3=NF-e de ajuste;
4=Devolução de mercadoria.
Onde aparece (caminho): NFe/infNFe/ide/finNFe
Cardinalidade: 1..1

Campo: indFinal
Descrição: Indica operação com Consumidor final
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Normal
- 1=Consumidor final
Regras/observações: 0=Normal;
1=Consumidor final;
Onde aparece (caminho): NFe/infNFe/ide/indFinal
Cardinalidade: 1..1

Campo: indPres
Descrição: Indicador de presença do comprador no estabelecimento
comercial no momento da operação
Obrigatoriedade: Condicional (0=Não se aplica (por exemplo, Nota Fiscal complementar
ou de ajuste);
1=Operação presencial;
2=Operação não presencial, pela Internet;
3=Operação não presencial, Teleatendimento;
4=NFC-e em operação com entrega a domicílio;
5=Operação presencial, fora do estabelecimento; (incluído
NT2016.002)
9=Operação não presencial, outros.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Não se aplica (por exemplo, Nota Fiscal complementar
- 1=Operação presencial
- 2=Operação não presencial, pela Internet
- 3=Operação não presencial, Teleatendimento
- 4=NFC-e em operação com entrega a domicílio
- 5=Operação presencial, fora do estabelecimento
- 9=Operação não presencial, outros.
Regras/observações: 0=Não se aplica (por exemplo, Nota Fiscal complementar
ou de ajuste);
1=Operação presencial;
2=Operação não presencial, pela Internet;
3=Operação não presencial, Teleatendimento;
4=NFC-e em operação com entrega a domicílio;
5=Operação presencial, fora do estabelecimento; (incluído
NT2016.002)
9=Operação não presencial, outros.
Onde aparece (caminho): NFe/infNFe/ide/indPres
Cardinalidade: 1..1

Campo: indIntermed
Descrição: Indicador de intermediador/marketplace
Obrigatoriedade: Condicional (0=Operação sem intermediador (em site ou plataforma
própria)
1=Operação em site ou plataforma de terceiros
(intermediadores/marketplace)
* Considera-se intermediador/marketplace os prestadores
de serviços e de negócios referentes às transações
comerciais ou de prestação de serviços intermediadas,
realizadas por pessoas jurídicas inscritas no Cadastro
Nacional de Pessoa Jurídica - CNPJ ou pessoas físicas
inscritas no Cadastro de Pessoa Física - CPF, ainda que não
inscritas no cadastro de contribuintes do ICMS.
* Considera-se site/plataforma própria as vendas que não
foram intermediadas (por marketplace), como venda em
site próprio, teleatendimento.
(Criado na NT 2020.006))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Operação sem intermediador (em site ou plataforma
- 1=Operação em site ou plataforma de terceiros
Regras/observações: 0=Operação sem intermediador (em site ou plataforma
própria)
1=Operação em site ou plataforma de terceiros
(intermediadores/marketplace)
* Considera-se intermediador/marketplace os prestadores
de serviços e de negócios referentes às transações
comerciais ou de prestação de serviços intermediadas,
realizadas por pessoas jurídicas inscritas no Cadastro
Nacional de Pessoa Jurídica - CNPJ ou pessoas físicas
inscritas no Cadastro de Pessoa Física - CPF, ainda que não
inscritas no cadastro de contribuintes do ICMS.
* Considera-se site/plataforma própria as vendas que não
foram intermediadas (por marketplace), como venda em
site próprio, teleatendimento.
(Criado na NT 2020.006)
Onde aparece (caminho): NFe/infNFe/ide/indIntermed
Cardinalidade: 0..1

Campo: procEmi
Descrição: Processo de emissão da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Emissão de NF-e com aplicativo do contribuinte
- 1=Emissão de NF-e avulsa pelo Fisco
- 2=Emissão de NF-e avulsa, pelo contribuinte com seu
- 3=Emissão NF-e pelo contribuinte com aplicativo fornecido
Regras/observações: 0=Emissão de NF-e com aplicativo do contribuinte;
1=Emissão de NF-e avulsa pelo Fisco;
2=Emissão de NF-e avulsa, pelo contribuinte com seu
certificado digital, através do site do Fisco;
3=Emissão NF-e pelo contribuinte com aplicativo fornecido
pelo Fisco.
Onde aparece (caminho): NFe/infNFe/ide/procEmi
Cardinalidade: 1..1

Campo: verProc
Descrição: Versão do Processo de emissão da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1- 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a versão do aplicativo emissor de NF-e.
Onde aparece (caminho): NFe/infNFe/ide/verProc
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/ide
Cardinalidade: 0..1

Campo: NFref
Descrição: Informação de Documentos Fiscais referenciados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo com informações de Documentos Fiscais
referenciados. Informação utilizada nas hipóteses
previstas na legislação. (Ex.: Devolução de mercadorias,
Substituição de NF cancelada, Complementação de NF,
etc.).
Onde aparece (caminho): NFe/infNFe/ide/NFref
Cardinalidade: 0..500


### NFref

Campo: NFref
Descrição: Informação de Documentos Fiscais referenciados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo com informações de Documentos Fiscais
referenciados. Informação utilizada nas hipóteses
previstas na legislação. (Ex.: Devolução de mercadorias,
Substituição de NF cancelada, Complementação de NF,
etc.).
Onde aparece (caminho): NFe/infNFe/ide/NFref
Cardinalidade: 0..500

Campo: refNFe
Descrição: Chave de acesso da NF-e referenciada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 44
Valores válidos/domínio: Não informado no PDF
Regras/observações: Referencia uma NF-e (modelo 55) emitida anteriormente,
vinculada a NF-e atual, ou uma NFC-e (modelo 65)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFe
Cardinalidade: 1..1

Campo: refNF
Descrição: Informação da NF modelo 1/1A ou NF modelo 2
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: referenciada (alterado pela NT2016.002)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF
Cardinalidade: 1..1

Campo: refNFP
Descrição: Informações da NF de produtor rural referenciada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP
Cardinalidade: 1..1

Campo: refCTe
Descrição: Chave de acesso do CT-e referenciada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 44
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar esta TAG para referenciar um CT-e emitido
anteriormente, vinculada a NF-e atual - (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refCTe
Cardinalidade: 1..1

Campo: refECF
Descrição: Informações do Cupom Fiscal referenciado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo do Cupom Fiscal vinculado à NF-e (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refECF
Cardinalidade: 1..1


### refNF

Campo: refNF
Descrição: Informação da NF modelo 1/1A ou NF modelo 2
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: referenciada (alterado pela NT2016.002)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF
Cardinalidade: 1..1

Campo: cUF
Descrição: Código da UF do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.1 do MOC Visão Geral-
Tabela de UF, Município e País)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/cUF
Cardinalidade: 1..1

Campo: AAMM
Descrição: Ano e Mês de emissão da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: AAMM da emissão da NF
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/AAMM
Cardinalidade: 1..1

Campo: CNPJ
Descrição: CNPJ do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ do emitente da NF
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/CNPJ
Cardinalidade: 1..1

Campo: mod
Descrição: Modelo do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 01=modelo 01
- 02=modelo 02 (incluído na NT2016.002)
Regras/observações: 01=modelo 01
02=modelo 02 (incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/mod
Cardinalidade: 1..1

Campo: serie
Descrição: Série do Documento Fiscal
Obrigatoriedade: Condicional (Informar zero se não utilizada Série do documento fiscal.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar zero se não utilizada Série do documento fiscal.
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/serie
Cardinalidade: 1..1

Campo: nNF
Descrição: Número do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Faixa: 1–999999999
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNF/nNF
Cardinalidade: 1..1


### emit

Campo: emit
Descrição: Identificação do emitente da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit
Cardinalidade: 1..1

Campo: CNPJ
Descrição: CNPJ do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ do emitente.
Na emissão de NF-e avulsa pelo Fisco, as informações do
remetente serão informadas neste grupo. O CNPJ ou CPF
deverão ser informados com os zeros não significativos.
Onde aparece (caminho): NFe/infNFe/emit/CNPJ
Cardinalidade: 1..1

Campo: xNome
Descrição: Razão Social ou Nome do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/xNome
Cardinalidade: 1..1

Campo: xFant
Descrição: Nome fantasia
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/xFant
Cardinalidade: 0..1

Campo: enderEmit
Descrição: Endereço do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF do remetente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/CPF
Cardinalidade: 1..1

Campo: IE
Descrição: Inscrição Estadual do Emitente
Obrigatoriedade: Condicional (Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.).)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.).
Onde aparece (caminho): NFe/infNFe/emit/IE
Cardinalidade: 1..1

Campo: IEST
Descrição: IE do Substituto Tributário
Obrigatoriedade: Condicional (IE do Substituto Tributário da UF de destino da mercadoria,
quando houver a retenção do ICMS ST para a UF de
destino.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: IE do Substituto Tributário da UF de destino da mercadoria,
quando houver a retenção do ICMS ST para a UF de
destino.
Onde aparece (caminho): NFe/infNFe/emit/IEST
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/emit
Cardinalidade: 0..1

Campo: CRT
Descrição: Código de Regime Tributário
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Simples Nacional
- 2=Simples Nacional, excesso sublimite de receita bruta
- 3=Regime Normal. (v2.0).
Regras/observações: 1=Simples Nacional;
2=Simples Nacional, excesso sublimite de receita bruta;
3=Regime Normal. (v2.0).
Onde aparece (caminho): NFe/infNFe/emit/CRT
Cardinalidade: 1..1


### enderEmit

Campo: enderEmit
Descrição: Endereço do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit
Cardinalidade: 1..1

Campo: xLgr
Descrição: Logradouro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/xLgr
Cardinalidade: 1..1

Campo: nro
Descrição: Número
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/nro
Cardinalidade: 1..1

Campo: xCpl
Descrição: Complemento
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/xCpl
Cardinalidade: 0..1

Campo: xBairro
Descrição: Bairro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/xBairro
Cardinalidade: 1..1

Campo: cMun
Descrição: Código do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão Geral,
Tabela de UF, Município e País).
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/cMun
Cardinalidade: 1..1

Campo: xMun
Descrição: Nome do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/xMun
Cardinalidade: 1..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/UF
Cardinalidade: 1..1

Campo: CEP
Descrição: Código do CEP
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos. (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/CEP
Cardinalidade: 1..1

Campo: cPais
Descrição: Código do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: 1058=Brasil
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/cPais
Cardinalidade: 0..1

Campo: xPais
Descrição: Nome do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Brasil ou BRASIL
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/xPais
Cardinalidade: 0..1

Campo: fone
Descrição: Telefone
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o Código DDD + número do telefone. Nas
operações com exterior é permitido informar o código do
país + código da localidade + número do telefone (v2.0)
Onde aparece (caminho): NFe/infNFe/emit/enderEmit/fone
Cardinalidade: 0..1


### refNFP

Campo: refNFP
Descrição: Informações da NF de produtor rural referenciada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP
Cardinalidade: 1..1

Campo: cUF
Descrição: Código da UF do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.1 do MOC – Visão Geral,
Tabela de UF, Município e País) (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/cUF
Cardinalidade: 1..1

Campo: AAMM
Descrição: Ano e Mês de emissão da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: AAMM da emissão da NF de produtor (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/AAMM
Cardinalidade: 1..1

Campo: CNPJ
Descrição: CNPJ do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ do emitente da NF de produtor (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/CNPJ
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CPF do emitente da NF de produtor (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/CPF
Cardinalidade: 1..1

Campo: IE
Descrição: IE do emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a IE do emitente da NF de Produtor ou o literal
“ISENTO” (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/IE
Cardinalidade: 1..1

Campo: mod
Descrição: Modelo do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 04=NF de Produtor
- 01=NF (v2.0)
Regras/observações: 04=NF de Produtor; 01=NF (v2.0)
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/mod
Cardinalidade: 1..1

Campo: serie
Descrição: Série do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a série do documento fiscal (informar zero se
inexistente) (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/serie
Cardinalidade: 1..1

Campo: nNF
Descrição: Número do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Faixa: 1–999999999
Onde aparece (caminho): NFe/infNFe/ide/NFref/refNFP/nNF
Cardinalidade: 1..1


### refECF

Campo: refECF
Descrição: Informações do Cupom Fiscal referenciado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo do Cupom Fiscal vinculado à NF-e (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refECF
Cardinalidade: 1..1

Campo: mod
Descrição: Modelo do Documento Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: "2B"=Cupom Fiscal emitido por máquina registradora (não
ECF);
"2C"=Cupom Fiscal PDV;
"2D"=Cupom Fiscal (emitido por ECF) (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refECF/mod
Cardinalidade: 1..1

Campo: nECF
Descrição: Número de ordem sequencial do ECF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o número de ordem sequencial do ECF que emitiu
o Cupom Fiscal vinculado à NF-e (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refECF/nECF
Cardinalidade: 1..1

Campo: nCOO
Descrição: Número do Contador de Ordem de Operação - COO
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o Número do Contador de Ordem de Operação -
COO vinculado à NF-e (v2.0).
Onde aparece (caminho): NFe/infNFe/ide/NFref/refECF/nCOO
Cardinalidade: 1..1


### avulsa

Campo: avulsa
Descrição: Não informado no PDF
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações do fisco emitente (uso exclusivo do fisco)
Onde aparece (caminho): NFe/infNFe/avulsa
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ do órgão emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos.
Onde aparece (caminho): NFe/infNFe/avulsa/CNPJ
Cardinalidade: 1..1

Campo: xOrgao
Descrição: Órgão emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/avulsa/xOrgao
Cardinalidade: 1..1

Campo: matr
Descrição: Matrícula do agente do Fisco
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/avulsa/matr
Cardinalidade: 1..1

Campo: xAgente
Descrição: Nome do agente do Fisco
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/avulsa/xAgente
Cardinalidade: 1..1

Campo: fone
Descrição: Telefone
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com Código DDD + número do telefone (v2.0)
(NT 2011/004)
Onde aparece (caminho): NFe/infNFe/avulsa/fone
Cardinalidade: 0..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/avulsa/UF
Cardinalidade: 1..1

Campo: nDAR
Descrição: Número do Documento de Arrecadação de Receita
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1- 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/avulsa/nDAR
Cardinalidade: 0..1

Campo: dEmi
Descrição: Data de emissão do Documento de Arrecadação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD” (NT 2011/004)
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD” (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/avulsa/dEmi
Cardinalidade: 0..1

Campo: vDAR
Descrição: Valor Total constante no Documento de arrecadação de
Receita
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/avulsa/vDAR
Cardinalidade: 0..1

Campo: repEmi
Descrição: Repartição Fiscal emitente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/avulsa/repEmi
Cardinalidade: 1..1

Campo: dPag
Descrição: Data de pagamento do Documento de Arrecadação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
Onde aparece (caminho): NFe/infNFe/avulsa/dPag
Cardinalidade: 0..1


### dest

Campo: dest
Descrição: Identificação do Destinatário da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo Obrig.atório para a NF-e (modelo 55).
Onde aparece (caminho): NFe/infNFe/dest
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ do destinatário
Obrigatoriedade: Condicional (Informar o CNPJ ou o CPF do destinatário, preenchendo os
zeros não significativos. No caso de operação com o
exterior, ou para comprador estrangeiro informar a tag
"idEstrangeiro”.)
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ ou o CPF do destinatário, preenchendo os
zeros não significativos. No caso de operação com o
exterior, ou para comprador estrangeiro informar a tag
"idEstrangeiro”.
Onde aparece (caminho): NFe/infNFe/dest/CNPJ
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF do destinatário
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/CPF
Cardinalidade: 1..1

Campo: xNome
Descrição: Razão Social ou nome do destinatário
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tag Obrigatória para a NF-e (modelo 55) e opcional para a
NFC-e.
Onde aparece (caminho): NFe/infNFe/dest/xNome
Cardinalidade: 0..1

Campo: enderDest
Descrição: Endereço do Destinatário da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo Obrig.atório para a NF-e (modelo 55).
Onde aparece (caminho): NFe/infNFe/dest/enderDest
Cardinalidade: 0..1

Campo: idEstrangeiro
Descrição: Identificação do destinatário no caso de comprador
estrangeiro
Obrigatoriedade: Condicional (Informar esta tag no caso de operação com o exterior, ou
para comprador estrangeiro. Informar o número do
passaporte ou outro documento legal para identificar
pessoa estrangeira (campo aceita valor nulo). Observação:
Campo aceita algarismos, letras (maiúsculas e minúsculas)
e os caracteres do conjunto que segue: [:.+-/()])
Tipo/Formato: Ele=CE; Tipo=C
Tamanho: 0,5,20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar esta tag no caso de operação com o exterior, ou
para comprador estrangeiro. Informar o número do
passaporte ou outro documento legal para identificar
pessoa estrangeira (campo aceita valor nulo). Observação:
Campo aceita algarismos, letras (maiúsculas e minúsculas)
e os caracteres do conjunto que segue: [:.+-/()]
Onde aparece (caminho): NFe/infNFe/dest/idEstrangeiro
Cardinalidade: 1..1

Campo: IE
Descrição: Inscrição Estadual do Destinatário
Obrigatoriedade: Condicional (Campo opcional. Informar somente os algarismos, sem os
caracteres de formatação (ponto, barra, hífen, etc.).)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo opcional. Informar somente os algarismos, sem os
caracteres de formatação (ponto, barra, hífen, etc.).
Onde aparece (caminho): NFe/infNFe/dest/IE
Cardinalidade: 0..1

Campo: ISUF
Descrição: Inscrição na SUFRAMA
Obrigatoriedade: Condicional (Obrig.atório, nas operações que se beneficiam de
incentivos fiscais existentes nas áreas sob controle da
SUFRAMA. A omissão desta informação impede o
processamento da operação pelo Sistema de Mercadoria
Nacional da SUFRAMA e a liberação da Declaração de
Ingresso, prejudicando a comprovação do ingresso /
internamento da mercadoria nestas áreas. (v2.0))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrig.atório, nas operações que se beneficiam de
incentivos fiscais existentes nas áreas sob controle da
SUFRAMA. A omissão desta informação impede o
processamento da operação pelo Sistema de Mercadoria
Nacional da SUFRAMA e a liberação da Declaração de
Ingresso, prejudicando a comprovação do ingresso /
internamento da mercadoria nestas áreas. (v2.0)
Onde aparece (caminho): NFe/infNFe/dest/ISUF
Cardinalidade: 0..1

Campo: IM
Descrição: Inscrição Municipal do Tomador do Serviço
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 15
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo opcional, pode ser informado na NF-e conjugada,
com itens de produtos sujeitos ao ICMS e itens de serviços
sujeitos ao ISSQN.
Onde aparece (caminho): NFe/infNFe/dest/IM
Cardinalidade: 0..1

Campo: indIEDest
Descrição: Indicador da IE do Destinatário
Obrigatoriedade: Condicional (1=Contribuinte ICMS (informar a IE do destinatário);
2=Contribuinte isento de Inscrição no cadastro de
Contribuintes
9=Não Contribuinte, que pode ou não possuir Inscrição
Estadual no Cadastro de Contribuintes do ICMS.
Nota 1: No caso de NFC-e informar indIEDest=9 e não
informar a tag IE do destinatário;
Nota 2: No caso de operação com o Exterior informar
indIEDest=9 e não informar a tag IE do destinatário;
Nota 3: No caso de Contribuinte Isento de Inscrição
(indIEDest=2), não informar a tag IE do destinatário.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Contribuinte ICMS (informar a IE do destinatário)
- 2=Contribuinte isento de Inscrição no cadastro de
- 9=Não Contribuinte, que pode ou não possuir Inscrição
Regras/observações: 1=Contribuinte ICMS (informar a IE do destinatário);
2=Contribuinte isento de Inscrição no cadastro de
Contribuintes
9=Não Contribuinte, que pode ou não possuir Inscrição
Estadual no Cadastro de Contribuintes do ICMS.
Nota 1: No caso de NFC-e informar indIEDest=9 e não
informar a tag IE do destinatário;
Nota 2: No caso de operação com o Exterior informar
indIEDest=9 e não informar a tag IE do destinatário;
Nota 3: No caso de Contribuinte Isento de Inscrição
(indIEDest=2), não informar a tag IE do destinatário.
Onde aparece (caminho): NFe/infNFe/dest/indIEDest
Cardinalidade: 1..1

Campo: email
Descrição: email
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo pode ser utilizado para informar o e-mail de
recepção da NF-e indicada pelo destinatário (v2.0)
Onde aparece (caminho): NFe/infNFe/dest/email
Cardinalidade: 0..1


### enderDest

Campo: enderDest
Descrição: Endereço do Destinatário da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo Obrig.atório para a NF-e (modelo 55).
Onde aparece (caminho): NFe/infNFe/dest/enderDest
Cardinalidade: 0..1

Campo: xLgr
Descrição: Logradouro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/enderDest/xLgr
Cardinalidade: 1..1

Campo: nro
Descrição: Número
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/enderDest/nro
Cardinalidade: 1..1

Campo: xCpl
Descrição: Complemento
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/enderDest/xCpl
Cardinalidade: 0..1

Campo: xBairro
Descrição: Bairro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/enderDest/xBairro
Cardinalidade: 1..1

Campo: cMun
Descrição: Código do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão Geral,
- Tabela de UF, Município e País).
Onde aparece (caminho): NFe/infNFe/dest/enderDest/cMun
Cardinalidade: 1..1

Campo: xMun
Descrição: Nome do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EXTERIOR ‘para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/dest/enderDest/xMun
Cardinalidade: 1..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EX’ para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/dest/enderDest/UF
Cardinalidade: 1..1

Campo: CEP
Descrição: Código do CEP
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos.
Onde aparece (caminho): NFe/infNFe/dest/enderDest/CEP
Cardinalidade: 0..1

Campo: cPais
Descrição: Código do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do BACEN (Seção 8.3 do MOC – Visão
Geral, Tabela de UF, Município e País).
Onde aparece (caminho): NFe/infNFe/dest/enderDest/cPais
Cardinalidade: 0..1

Campo: xPais
Descrição: Nome do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/dest/enderDest/xPais
Cardinalidade: 0..1

Campo: fone
Descrição: Telefone
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o Código DDD + número do telefone. Nas
operações com exterior é permitido informar o código do
país + código da localidade + número do telefone (v2.0)
Onde aparece (caminho): NFe/infNFe/dest/enderDest/fone
Cardinalidade: 0..1


### retirada

Campo: retirada
Descrição: Identificação do Local de retirada
Obrigatoriedade: Condicional (Informar somente se diferente do endereço do
remetente.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente se diferente do endereço do
remetente.
Onde aparece (caminho): NFe/infNFe/retirada
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 0 ou 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar CNPJ ou CPF. Preencher os zeros não
significativos.
Onde aparece (caminho): NFe/infNFe/retirada/CNPJ
Cardinalidade: 1..1

Campo: xLgr
Descrição: Logradouro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/retirada/xLgr
Cardinalidade: 1..1

Campo: nro
Descrição: Número
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/retirada/nro
Cardinalidade: 1..1

Campo: xCpl
Descrição: Complemento
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/retirada/xCpl
Cardinalidade: 0..1

Campo: xBairro
Descrição: Bairro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/retirada/xBairro
Cardinalidade: 1..1

Campo: cMun
Descrição: Código do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão Geral,
Tabela de UF, Município e País).
Informar ‘9999999 ‘para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/retirada/cMun
Cardinalidade: 1..1

Campo: xMun
Descrição: Nome do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EXTERIOR ‘para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/retirada/xMun
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/retirada/CPF
Cardinalidade: 1..1

Campo: xNome
Descrição: Razão Social ou Nome do Expedidor
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2-60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/xNome
Cardinalidade: 0..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EX’ para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/retirada/UF
Cardinalidade: 1..1

Campo: CEP
Descrição: Código do CEP
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos.
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/CEP
Cardinalidade: 0..1

Campo: cPais
Descrição: Código do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do BACEN (Seção 8.3 do MOC – Visão
Geral,Tabela de UF, Município e País).
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/cPais
Cardinalidade: 0..1

Campo: xPais
Descrição: Nome do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/xPais
Cardinalidade: 0..1

Campo: fone
Descrição: Telefone
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o Código DDD + número do telefone. Nas
operações com exterior é permitido informar o código do
país + código da localidade + número do telefone (v2.0)
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/fone
Cardinalidade: 0..1

Campo: email
Descrição: Endereço de e-mail do Expedidor
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/email
Cardinalidade: 0..1

Campo: IE
Descrição: Inscrição Estadual do Estabelecimento Expedidor
Obrigatoriedade: Condicional (Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.). (Criado na NT
2018.005))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.). (Criado na NT
2018.005)
Onde aparece (caminho): NFe/infNFe/retirada/IE
Cardinalidade: 0..1


### entrega

Campo: entrega
Descrição: Identificação do Local de entrega
Obrigatoriedade: Condicional (Informar somente se diferente do endereço destinatário.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente se diferente do endereço destinatário.
Onde aparece (caminho): NFe/infNFe/entrega
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 0 ou 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar CNPJ ou CPF. Preencher os zeros não
significativos. (v2.0)
Onde aparece (caminho): NFe/infNFe/entrega/CNPJ
Cardinalidade: 1..1

Campo: xLgr
Descrição: Logradouro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/entrega/xLgr
Cardinalidade: 1..1

Campo: nro
Descrição: Número
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/entrega/nro
Cardinalidade: 1..1

Campo: xCpl
Descrição: Complemento
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/entrega/xCpl
Cardinalidade: 0..1

Campo: xBairro
Descrição: Bairro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/entrega/xBairro
Cardinalidade: 1..1

Campo: cMun
Descrição: Código do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão
Geral,Tabela de UF, Município e País).
Informar ‘9999999 ‘para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/entrega/cMun
Cardinalidade: 1..1

Campo: xMun
Descrição: Nome do município
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EXTERIOR ‘para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/entrega/xMun
Cardinalidade: 1..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar ‘EX’ para operações com o exterior.
Onde aparece (caminho): NFe/infNFe/entrega/UF
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/entrega/CPF
Cardinalidade: 1..1

Campo: xNome
Descrição: Razão Social ou Nome do Recebedor
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2-60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/xNome
Cardinalidade: 0..1

Campo: CEP
Descrição: Código do CEP
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos. (Criado na NT
2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/CEP
Cardinalidade: 0..1

Campo: cPais
Descrição: Código do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do BACEN (Seção 8.3 do MOC – Visão
Geral, Município e País). (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/cPais
Cardinalidade: 0..1

Campo: xPais
Descrição: Nome do País
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/xPais
Cardinalidade: 0..1

Campo: fone
Descrição: Telefone
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o Código DDD + número do telefone. Nas
operações com exterior é permitido informar o código do
país + código da localidade + número do telefone (v2.0)
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/fone
Cardinalidade: 0..1

Campo: email
Descrição: Endereço de e-mail do Recebedor
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/email
Cardinalidade: 0..1

Campo: IE
Descrição: Inscrição Estadual do Estabelecimento Recebedor
Obrigatoriedade: Condicional (Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.). (Criado na NT
2018.005))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente os algarismos, sem os caracteres de
formatação (ponto, barra, hífen, etc.). (Criado na NT
2018.005)
Onde aparece (caminho): NFe/infNFe/entrega/IE
Cardinalidade: 0..1


### det

Campo: det
Descrição: Detalhamento de Produtos e Serviços
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Múltiplas ocorrências (máximo = 990)
Onde aparece (caminho): NFe/infNFe/det
Cardinalidade: 1..990

Campo: nItem
Descrição: Número do item
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=A; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Número do item (1-990)
Onde aparece (caminho): NFe/infNFe/det/@nItem
Cardinalidade: 1..1

Campo: prod
Descrição: Detalhamento de Produtos e Serviços
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod
Cardinalidade: 1..1

Campo: imposto
Descrição: Tributos incidentes no Produto ou Serviço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo ISSQN mutuamente exclusivo com os grupos ICMS
Onde aparece (caminho): NFe/infNFe/det/imposto
Cardinalidade: 1..1

Campo: impostoDevol
Descrição: Informação do Imposto devolvido
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Observação: O motivo da devolução deverá ser informado
pela empresa no campo de Informações Adicionais do
Produto (tag:infAdProd).
Onde aparece (caminho): NFe/infNFe/det/impostoDevol
Cardinalidade: 0..1

Campo: infAdProd I
Descrição: nformações Adicionais do Produto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1-500
Valores válidos/domínio: Não informado no PDF
Regras/observações: Norma referenciada, informações complementares, etc.
Onde aparece (caminho): NFe/infNFe/det/infAdProd I
Cardinalidade: 0..1


### prod

Campo: prod
Descrição: Detalhamento de Produtos e Serviços
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod
Cardinalidade: 1..1

Campo: cProd
Descrição: Código do produto ou serviço
Obrigatoriedade: Condicional (Preencher com CFOP, caso se trate de itens não
relacionados com mercadorias/produtos e que o
contribuinte não possua codificação própria.
Formato: ”CFOP9999”)
Tipo/Formato: Ele=E; Tipo=C; Formato=”CFOP9999”
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com CFOP, caso se trate de itens não
relacionados com mercadorias/produtos e que o
contribuinte não possua codificação própria.
Formato: ”CFOP9999”
Onde aparece (caminho): NFe/infNFe/det/prod/cProd
Cardinalidade: 1..1

Campo: cEAN
Descrição: GTIN (Global Trade Item Number) do produto, antigo
código EAN ou código de barras
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 0,8,12,
13, 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o código GTIN-8, GTIN-12, GTIN-13 ou
GTIN-14 (antigos códigos EAN, UPC e DUN-14)
Para produtos que não possuem código de barras com
GTIN, deve ser informado o literal “SEM GTIN”;
(atualizado NT 2017/001)
Onde aparece (caminho): NFe/infNFe/det/prod/cEAN
Cardinalidade: 1..1

Campo: xProd
Descrição: Descrição do produto ou serviço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 120
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/xProd
Cardinalidade: 1..1

Campo: NCM
Descrição: Código NCM com 8 dígitos
Obrigatoriedade: Condicional (Obrigatória informação do NCM completo (8 dígitos).
Nota: Em caso de item de serviço ou item que não tenham
produto (ex. transferência de crédito, crédito do
ativo imobilizado, etc.), informar o valor 00 (dois
zeros). (NT 2014/004))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2, 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatória informação do NCM completo (8 dígitos).
Nota: Em caso de item de serviço ou item que não tenham
produto (ex. transferência de crédito, crédito do
ativo imobilizado, etc.), informar o valor 00 (dois
zeros). (NT 2014/004)
Onde aparece (caminho): NFe/infNFe/det/prod/NCM
Cardinalidade: 1..1

Campo: EXTIPI
Descrição: EX_TIPI
Obrigatoriedade: Condicional (Preencher de acordo com o código EX da TIPI. Em caso de
serviço, não incluir a TAG.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher de acordo com o código EX da TIPI. Em caso de
serviço, não incluir a TAG.
Onde aparece (caminho): NFe/infNFe/det/prod/EXTIPI
Cardinalidade: 0..1

Campo: CFOP
Descrição: Código Fiscal de Operações e Prestações
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar Tabela de CFOP.
Onde aparece (caminho): NFe/infNFe/det/prod/CFOP
Cardinalidade: 1..1

Campo: uCom
Descrição: Unidade Comercial
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a unidade de comercialização do produto.
Onde aparece (caminho): NFe/infNFe/det/prod/uCom
Cardinalidade: 1..1

Campo: qCom
Descrição: Quantidade Comercial
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a quantidade de comercialização do produto
(v2.0).
Onde aparece (caminho): NFe/infNFe/det/prod/qCom
Cardinalidade: 1..1

Campo: vProd
Descrição: Valor Total Bruto dos Produtos ou Serviços.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: O valor do ICMS faz parte do Valor Total Bruto
Onde aparece (caminho): NFe/infNFe/det/prod/vProd
Cardinalidade: 1..1

Campo: NVE
Descrição: Codificação NVE - Nomenclatura de Valor Aduaneiro e
Estatística.
Obrigatoriedade: Condicional (Codificação opcional que detalha alguns NCM. Formato:
duas letras maiúsculas e 4 algarismos. Se a
mercadoria se enquadrar em mais de uma
codificação, informar até 8 codificações principais.
Vide: (Seção 8.6 do MOC – Visão Geral, Identificador
NVE.)
Tipo/Formato: Ele=E; Tipo=C; Formato=duas letras maiúsculas e 4 algarismos. Se a
Tamanho: 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Codificação opcional que detalha alguns NCM. Formato:
duas letras maiúsculas e 4 algarismos. Se a
mercadoria se enquadrar em mais de uma
codificação, informar até 8 codificações principais.
Vide: (Seção 8.6 do MOC – Visão Geral, Identificador
NVE.
Onde aparece (caminho): NFe/infNFe/det/prod/NVE
Cardinalidade: 0..8

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod
Cardinalidade: 0..1

Campo: cBenef
Descrição: Código de Benefício Fiscal na UF aplicado ao item
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 8,10
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código de Benefício Fiscal utilizado pela UF, aplicado ao
item.
Obs.: Deve ser utilizado o mesmo código adotado na EFD e
outras declarações, nas UF que o exigem.
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/cBenef
Cardinalidade: 0..1

Campo: vUnCom
Descrição: Valor Unitário de Comercialização
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-10
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor unitário de comercialização do produto,
campo meramente informativo, o contribuinte pode
utilizar a precisão desejada (0-10 decimais). Para
efeitos de cálculo, o valor unitário será obtido pela
divisão do valor do produto pela quantidade
comercial. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/vUnCom
Cardinalidade: 1..1

Campo: cEANTrib
Descrição: GTIN (Global Trade Item Number) da unidade tributável,
antigo código EAN ou código de barras
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 0,8,12,
13, 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher com o código GTIN-8, GTIN-12, GTIN-13 ou
GTIN-14 (antigos códigos EAN, UPC e DUN-14) da
unidade tributável do produto.
O GTIN da unidade tributável deve corresponder àquele da
menor unidade comercializável identificada por
código GTIN.
Para produtos que não possuem código de barras com
GTIN, deve ser informado o literal "SEM GTIN”;
(Atualizado NT 2017.001)
Onde aparece (caminho): NFe/infNFe/det/prod/cEANTrib
Cardinalidade: 1..1

Campo: uTrib
Descrição: Unidade Tributável
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/uTrib
Cardinalidade: 1..1

Campo: qTrib
Descrição: Quantidade Tributável
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: O GTIN da unidade tributável deve corresponder àquele da
menor unidade comercializável identificada por
código GTIN.
Onde aparece (caminho): NFe/infNFe/det/prod/qTrib
Cardinalidade: 1..1

Campo: vFrete
Descrição: Valor Total do Frete
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Para produtos que não possuem código de barras com
GTIN, deve ser informado o literal "SEM GTIN”;
Onde aparece (caminho): NFe/infNFe/det/prod/vFrete
Cardinalidade: 0..1

Campo: vSeg
Descrição: Valor Total do Seguro
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/vSeg
Cardinalidade: 0..1

Campo: vDesc
Descrição: Valor do Desconto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/vDesc
Cardinalidade: 0..1

Campo: DI
Descrição: Declaração de Importação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar dados da importação
Onde aparece (caminho): NFe/infNFe/det/prod/DI
Cardinalidade: 0..100

Campo: vUnTrib
Descrição: Valor Unitário de tributação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-10
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/vUnTrib
Cardinalidade: 1..1

Campo: vOutro
Descrição: Outras despesas acessórias
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/vOutro
Cardinalidade: 0..1

Campo: indTot
Descrição: Indica se valor do Item (vProd) entra no valor total da NF-e
(vProd)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Valor do item (vProd) não compõe o valor total da NF-e
- 1=Valor do item (vProd) compõe o valor total da NF-
Regras/observações: 0=Valor do item (vProd) não compõe o valor total da NF-e
1=Valor do item (vProd) compõe o valor total da NF-
e (vProd) (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/indTot
Cardinalidade: 1..1

Campo: detExport
Descrição: Grupo de informações de exportação para o item
Obrigatoriedade: Condicional (Informar apenas no Drawback e nas exportações)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas no Drawback e nas exportações
Onde aparece (caminho): NFe/infNFe/det/prod/detExport
Cardinalidade: 0..500

Campo: xPed
Descrição: Número do Pedido de Compra
Obrigatoriedade: Condicional (Informação de interesse do emissor para controle do B2B.
(v2.0))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 15
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação de interesse do emissor para controle do B2B.
(v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/xPed
Cardinalidade: 0..1

Campo: nItemPed
Descrição: Item do Pedido de Compra
Obrigatoriedade: Condicional (Informação de interesse do emissor para controle do B2B.
(v2.0))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação de interesse do emissor para controle do B2B.
(v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/nItemPed
Cardinalidade: 0..1

Campo: nFCI
Descrição: Número de controle da FCI - Ficha de Conteúdo de
Importação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C; Formato=Algarismos, letras maiúsculas de
Tamanho: 36
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação relacionada com a Resolução 13/2012 do
Senado Federal. Formato: Algarismos, letras maiúsculas de
"A" a "F" e o caractere hífen. Exemplo: B01F70AF-10BF-
4B1F-848C-65FF57F616FE
Onde aparece (caminho): NFe/infNFe/det/prod/nFCI
Cardinalidade: 0..1

Campo: rastro
Descrição: Detalhamento de produto sujeito a rastreabilidade
Obrigatoriedade: Condicional (Informar apenas quando se tratar de produto a ser)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando se tratar de produto a ser
Onde aparece (caminho): NFe/infNFe/det/prod/rastro
Cardinalidade: 0..500

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Condicional (Grupo opcional, somente um deles poderá ser informado:
Veículo, Medicamentos, Armas, Combustível.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional, somente um deles poderá ser informado:
Veículo, Medicamentos, Armas, Combustível.
Onde aparece (caminho): NFe/infNFe/det/prod
Cardinalidade: 0..1


### autXML

Campo: autXML
Descrição: Pessoas autorizadas a acessar o XML da NF-e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/autXML
Cardinalidade: 0..10

Campo: CNPJ
Descrição: CNPJ Autorizado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar CNPJ ou CPF. Preencher os zeros não
significativos.
Onde aparece (caminho): NFe/infNFe/autXML/CNPJ
Cardinalidade: 1..1

Campo: CPF
Descrição: CPF Autorizado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/autXML/CPF
Cardinalidade: 1..1


### DI

Campo: DI
Descrição: Declaração de Importação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar dados da importação
Onde aparece (caminho): NFe/infNFe/det/prod/DI
Cardinalidade: 0..100

Campo: nDI
Descrição: Número do Documento de Importação (DI, DSI, DIRE, ...)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 12
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/det/prod/DI/nDI
Cardinalidade: 1..1

Campo: dDI
Descrição: Data de Registro do documento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
Onde aparece (caminho): NFe/infNFe/det/prod/DI/dDI
Cardinalidade: 1..1

Campo: xLocDesemb
Descrição: Local de desembaraço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/DI/xLocDesemb
Cardinalidade: 1..1

Campo: UFDesemb
Descrição: Sigla da UF onde ocorreu o Desembaraço Aduaneiro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/DI/UFDesemb
Cardinalidade: 1..1

Campo: dDesemb
Descrição: Data do Desembaraço Aduaneiro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
Onde aparece (caminho): NFe/infNFe/det/prod/DI/dDesemb
Cardinalidade: 1..1

Campo: tpViaTransp
Descrição: Via de transporte internacional informada na Declaração
de Importação (DI)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 1=Marítima
- 2=Fluvial
- 3=Lacustre
- 4=Aérea
- 5=Postal
- 6=Ferroviária
- 7=Rodoviária
Regras/observações: 1=Marítima;
2=Fluvial;
3=Lacustre;
4=Aérea;
5=Postal;
6=Ferroviária;
7=Rodoviária;
Onde aparece (caminho): NFe/infNFe/det/prod/DI/tpViaTransp
Cardinalidade: 1..1

Campo: vAFRMM
Descrição: Valor da AFRMM - Adicional ao Frete para Renovação da
Marinha Mercante
Obrigatoriedade: Condicional (A tag deve ser informada no caso da via de transporte
marítima.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: A tag deve ser informada no caso da via de transporte
marítima.
Onde aparece (caminho): NFe/infNFe/det/prod/DI/vAFRMM
Cardinalidade: 0..1

Campo: cExportador
Descrição: Código do Exportador
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código do Exportador, usado nos sistemas internos de
informação do emitente da NF-e
Onde aparece (caminho): NFe/infNFe/det/prod/DI/cExportador
Cardinalidade: 1..1

Campo: adi
Descrição: Adições
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi
Cardinalidade: 1..100

Campo: tpIntermedio
Descrição: Forma de importação quanto a intermediação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Importação por conta própria
- 2=Importação por conta e ordem
- 3=Importação por encomenda
Regras/observações: 1=Importação por conta própria;
2=Importação por conta e ordem;
3=Importação por encomenda;
Onde aparece (caminho): NFe/infNFe/det/prod/DI/tpIntermedio
Cardinalidade: 1..1

Campo: CNPJ
Descrição: CNPJ do adquirente ou do encomendante
Obrigatoriedade: Condicional (Obrigatória a informação no caso de importação por conta
e ordem ou por encomenda. Informar os zeros não
significativos)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatória a informação no caso de importação por conta
e ordem ou por encomenda. Informar os zeros não
significativos
Onde aparece (caminho): NFe/infNFe/det/prod/DI/CNPJ
Cardinalidade: 0..1

Campo: UFTerceiro
Descrição: Sigla da UF do adquirente ou do encomendante
Obrigatoriedade: Condicional (Obrigatória a informação no caso de importação por conta
e ordem ou por encomenda. Não aceita o valor "EX".)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatória a informação no caso de importação por conta
e ordem ou por encomenda. Não aceita o valor "EX".
Onde aparece (caminho): NFe/infNFe/det/prod/DI/UFTerceiro
Cardinalidade: 0..1


### adi

Campo: adi
Descrição: Adições
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi
Cardinalidade: 1..100

Campo: nAdicao
Descrição: Numero da Adição
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi/nAdicao
Cardinalidade: 1..1

Campo: nSeqAdic
Descrição: Numero sequencial do item dentro da Adição
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi/nSeqAdic
Cardinalidade: 1..1

Campo: cFabricante
Descrição: Código do fabricante estrangeiro
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código do fabricante estrangeiro, usado nos sistemas
internos de informação do emitente da NF-e
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi/cFabricante
Cardinalidade: 1..1

Campo: vDescDI
Descrição: Valor do desconto do item da DI – Adição
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi/vDescDI
Cardinalidade: 0..1

Campo: nDraw
Descrição: Número do ato concessório de Drawback
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 0, 9 ou
11
Valores válidos/domínio: Não informado no PDF
Regras/observações: O número do Ato Concessório de Suspensão deve ser
preenchido com 11 dígitos (AAAANNNNNND) e o número
do Ato Concessório de Drawback Isenção deve ser
preenchido com 9 dígitos (AANNNNNND). (Observação
incluída na NT 2013/005 v. 1.10)
Onde aparece (caminho): NFe/infNFe/det/prod/DI/adi/nDraw
Cardinalidade: 0..1


### detExport

Campo: detExport
Descrição: Grupo de informações de exportação para o item
Obrigatoriedade: Condicional (Informar apenas no Drawback e nas exportações)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas no Drawback e nas exportações
Onde aparece (caminho): NFe/infNFe/det/prod/detExport
Cardinalidade: 0..500

Campo: nDraw
Descrição: Número do ato concessório de Drawback
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 0, 9 ou
11
Valores válidos/domínio: Não informado no PDF
Regras/observações: O número do Ato Concessório de Suspensão deve ser
preenchido com 11 dígitos (AAAANNNNNND) e o número
do Ato Concessório de Drawback Isenção deve ser
preenchido com 9 dígitos (AANNNNNND). (Observação
incluída na NT 2013/005 v. 1.10)
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/nDraw
Cardinalidade: 0..1

Campo: exportInd
Descrição: Grupo sobre exportação indireta
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/exportInd
Cardinalidade: 0..1


### exportInd

Campo: exportInd
Descrição: Grupo sobre exportação indireta
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/exportInd
Cardinalidade: 0..1

Campo: nRE
Descrição: Número do Registro de Exportação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/exportInd/nRE
Cardinalidade: 1..1

Campo: chNFe
Descrição: Chave de Acesso da NF-e recebida para exportação
Obrigatoriedade: Condicional (NF-e recebida com fim específico de exportação
Observação: No caso de operação com CFOP 3.503,
informar a chave de acesso da NF-e que efetivou a
exportação)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 44
Valores válidos/domínio: Não informado no PDF
Regras/observações: NF-e recebida com fim específico de exportação
Observação: No caso de operação com CFOP 3.503,
informar a chave de acesso da NF-e que efetivou a
exportação
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/exportInd/chNFe
Cardinalidade: 1..1

Campo: qExport
Descrição: Quantidade do item realmente exportado
Obrigatoriedade: Condicional (A unidade de medida desta quantidade é a unidade de
comercialização deste item. No caso de operação com
CFOP 3.503, informar a quantidade de mercadoria
devolvida)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: A unidade de medida desta quantidade é a unidade de
comercialização deste item. No caso de operação com
CFOP 3.503, informar a quantidade de mercadoria
devolvida
Onde aparece (caminho): NFe/infNFe/det/prod/detExport/exportInd/qExport
Cardinalidade: 1..1


### rastro

Campo: rastro
Descrição: Detalhamento de produto sujeito a rastreabilidade
Obrigatoriedade: Condicional (Informar apenas quando se tratar de produto a ser)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando se tratar de produto a ser
Onde aparece (caminho): NFe/infNFe/det/prod/rastro
Cardinalidade: 0..500

Campo: nLote
Descrição: Número do Lote do produto
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1- 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/rastro/nLote
Cardinalidade: 1..1

Campo: qLote
Descrição: Quantidade de produto no Lote
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/rastro/qLote
Cardinalidade: 1..1

Campo: dFab
Descrição: Data de fabricação/ Produção
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
Onde aparece (caminho): NFe/infNFe/det/prod/rastro/dFab
Cardinalidade: 1..1

Campo: dVal
Descrição: Data de validade
Obrigatoriedade: Condicional (Formato: “AAAA-MM-DD” Informar o último dia do mês
caso a validade não especifique o dia.)
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD” Informar o último dia do mês
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD” Informar o último dia do mês
caso a validade não especifique o dia.
Onde aparece (caminho): NFe/infNFe/det/prod/rastro/dVal
Cardinalidade: 1..1

Campo: cAgreg
Descrição: Código de Agregação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1-20
Valores válidos/domínio: Não informado no PDF
Regras/observações: rastreado posteriormente
(Grupo criado na NT/2016/002)
Onde aparece (caminho): NFe/infNFe/det/prod/rastro/cAgreg
Cardinalidade: 0..1


### veicProd

Campo: veicProd
Descrição: Detalhamento de Veículos novos
Obrigatoriedade: Condicional (Informar apenas quando se tratar de veículos novos)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando se tratar de veículos novos
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd
Cardinalidade: 1..1

Campo: tpOp
Descrição: Tipo da operação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Venda concessionária,
- 2=Faturamento direto para consumidor final 3=Venda
- 0=Outros
Regras/observações: 1=Venda concessionária,
2=Faturamento direto para consumidor final 3=Venda
direta para grandes consumidores (frotista,
governo, ...)
0=Outros
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/tpOp
Cardinalidade: 1..1

Campo: chassi
Descrição: Chassi do veículo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 17
Valores válidos/domínio: Não informado no PDF
Regras/observações: VIN (código-identificação-veículo)
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/chassi
Cardinalidade: 1..1

Campo: cCor
Descrição: Cor
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Código de cada montadora
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/cCor
Cardinalidade: 1..1

Campo: xCor
Descrição: Descrição da Cor
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 40
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/xCor
Cardinalidade: 1..1

Campo: pot
Descrição: Potência Motor (CV)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/pot
Cardinalidade: 1..1

Campo: cilin
Descrição: Cilindradas
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Potência máxima do motor do veículo em cavalo vapor
(CV). (potência-veículo)
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/cilin
Cardinalidade: 1..1

Campo: pesoL
Descrição: Peso Líquido
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 9v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Em toneladas - 4 casas decimais
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/pesoL
Cardinalidade: 1..1

Campo: pesoB
Descrição: Peso Bruto
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 9v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Peso Bruto Total - em tonelada - 4 casas decimais
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/pesoB
Cardinalidade: 1..1

Campo: nSerie
Descrição: Serial (série)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/nSerie
Cardinalidade: 1..1

Campo: tpComb
Descrição: Tipo de combustível
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 2
Valores válidos/domínio: - 03=Diesel, (...)
- 16=Álcool/Gasolina
- 17=Gasolina/Álcool/GNV
- 18=Gasolina/Elétrico
Regras/observações: Utilizar Tabela RENAVAM (v2.0) 01=Álcool, 02=Gasolina,
03=Diesel, (...);16=Álcool/Gasolina;
17=Gasolina/Álcool/GNV; 18=Gasolina/Elétrico
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/tpComb
Cardinalidade: 1..1

Campo: nMotor
Descrição: Número de Motor
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 21
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/nMotor
Cardinalidade: 1..1

Campo: CMT
Descrição: Capacidade Máxima de Tração
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 9v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: CMT-Capacidade Máxima de Tração - em Toneladas 4 casas
decimais (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/CMT
Cardinalidade: 1..1

Campo: dist
Descrição: Distância entre eixos
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/dist
Cardinalidade: 1..1

Campo: anoMod
Descrição: Ano Modelo de Fabricação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/anoMod
Cardinalidade: 1..1

Campo: anoFab
Descrição: Ano de Fabricação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/anoFab
Cardinalidade: 1..1

Campo: tpPint
Descrição: Tipo de Pintura
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/tpPint
Cardinalidade: 1..1

Campo: tpVeic
Descrição: Tipo de Veículo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 2
Valores válidos/domínio: - 02=CICLOMOTO
- 03=MOTONETA
- 04=MOTOCICLO
- 05=TRICICLO
- 06=AUTOMÓVEL
- 07=MICROÔNIBUS
- 08=ÔNIBUS
- 10=REBOQUE
- 11=SEMIRREBOQUE
- 13=CAMINHONETA
- 14=CAMINHÃO
- 17=C. TRATOR
- 22=ESP / ÔNIBUS
- 23=MISTO / CAM
- 24=CARGA/CAM
Regras/observações: Utilizar Tabela RENAVAM, conforme exemplos abaixo:
02=CICLOMOTO; 03=MOTONETA;
04=MOTOCICLO; 05=TRICICLO;
06=AUTOMÓVEL; 07=MICROÔNIBUS;
08=ÔNIBUS;10=REBOQUE;
11=SEMIRREBOQUE;13=CAMINHONETA;
14=CAMINHÃO;17=C. TRATOR; 22=ESP / ÔNIBUS;
23=MISTO / CAM;24=CARGA/CAM; ...
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/tpVeic
Cardinalidade: 1..1

Campo: espVeic
Descrição: Espécie de Veículo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 2=CARGA
- 3=MISTO
- 4=CORRIDA
- 5=TRAÇÃO
- 6=ESPECIAL
Regras/observações: Utilizar Tabela RENAVAM 1=PASSAGEIRO; 2=CARGA;
3=MISTO;4=CORRIDA; 5=TRAÇÃO; 6=ESPECIAL;
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/espVeic
Cardinalidade: 1..1

Campo: VIN
Descrição: Condição do VIN
Obrigatoriedade: Condicional (Informa-se o veículo tem VIN (chassi) remarcado.
R=Remarcado; N=Normal)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informa-se o veículo tem VIN (chassi) remarcado.
R=Remarcado; N=Normal
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/VIN
Cardinalidade: 1..1

Campo: condVeic
Descrição: Condição do Veículo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Acabado
- 2=Inacabado
- 3=Semiacabado
Regras/observações: 1=Acabado; 2=Inacabado; 3=Semiacabado
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/condVeic
Cardinalidade: 1..1

Campo: cMod
Descrição: Código Marca Modelo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 6
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar Tabela RENAVAM
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/cMod
Cardinalidade: 1..1

Campo: cCorDENATRAN
Descrição: Código da Cor
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 2
Valores válidos/domínio: - 01=AMARELO, 02=AZUL, 03=BEGE,04=BRANCA, 05=CINZA,
- 06=-DOURADA,07=GRENÁ, 08=LARANJA,
- 09=MARROM,10=PRATA, 11=PRETA, 12=ROSA,
- 13=ROXA,14=VERDE, 15=VERMELHA, 16=FANTASIA
Regras/observações: Segundo as regras de pré-cadastro do DENATRAN (v2.0)
01=AMARELO, 02=AZUL, 03=BEGE,04=BRANCA, 05=CINZA,
06=-DOURADA,07=GRENÁ, 08=LARANJA,
09=MARROM,10=PRATA, 11=PRETA, 12=ROSA,
13=ROXA,14=VERDE, 15=VERMELHA, 16=FANTASIA
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/cCorDENATRAN
Cardinalidade: 1..1

Campo: lota
Descrição: Capacidade máxima de lotação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Quantidade máxima permitida de passageiros sentados,
inclusive o motorista. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/lota
Cardinalidade: 1..1

Campo: tpRest
Descrição: Restrição
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Não há
- 1=Alienação Fiduciária
- 2=Arrendamento
- 3=Reserva de Domínio
- 4=Penhor de Veículos
- 9=Outras. (v2.0)
Regras/observações: 0=Não há; 1=Alienação Fiduciária; 2=Arrendamento
Mercantil; 3=Reserva de Domínio; 4=Penhor de Veículos;
9=Outras. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/prod/veicProd/tpRest
Cardinalidade: 1..1


### med

Campo: med
Descrição: Detalhamento de Medicamentos e de matérias-primas
farmacêuticas
Obrigatoriedade: Condicional (Informar apenas quando se tratar de medicamentos ou de
matérias-primas farmacêuticas, permite ocorrências.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando se tratar de medicamentos ou de
matérias-primas farmacêuticas, permite ocorrências.
Onde aparece (caminho): NFe/infNFe/det/prod/med
Cardinalidade: 1..1

Campo: nLote
Descrição: Número do Lote de medicamentos ou de matérias-primas
farmacêuticas
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1-20
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/med/nLote
Cardinalidade: 1..1

Campo: qLote
Descrição: Quantidade de produto no Lote de medicamentos ou de
matérias-primas farmacêuticas
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 8v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/med/qLote
Cardinalidade: 1..1

Campo: dFab
Descrição: Data de fabricação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
(Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/med/dFab
Cardinalidade: 1..1

Campo: dVal
Descrição: Data de validade
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
(Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/med/dVal
Cardinalidade: 1..1

Campo: vPMC
Descrição: Preço máximo consumidor
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/med/vPMC
Cardinalidade: 1..1

Campo: cProdANVISA
Descrição: Código de Produto da ANVISA
Obrigatoriedade: Condicional (Utilizar o número do registro ANVISA
ou preencher com o literal “ISENTO”, no caso de
medicamento isento de registro na ANVISA.
(Incluído na NT2016.002. Atualizado na NT 2018.005))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 6,13
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar o número do registro ANVISA
ou preencher com o literal “ISENTO”, no caso de
medicamento isento de registro na ANVISA.
(Incluído na NT2016.002. Atualizado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/det/prod/med/cProdANVISA
Cardinalidade: 1..1

Campo: xMotivoIsencao
Descrição: Motivo da isenção da ANVISA
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1-255
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obs.: Para medicamento isento de registro na ANVISA,
informar o número da decisão que o isenta, como por
exemplo o número da Resolução da Diretoria Colegiada da
ANVISA (RDC).
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/det/prod/med/xMotivoIsencao
Cardinalidade: 0..1


### arma

Campo: arma
Descrição: Detalhamento de Armamento
Obrigatoriedade: Condicional (Informar apenas quando se tratar de armamento, permite
ocorrências.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando se tratar de armamento, permite
ocorrências.
Onde aparece (caminho): NFe/infNFe/det/prod/arma
Cardinalidade: 1..500

Campo: tpArma
Descrição: Indicador do tipo de arma de fogo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Uso permitido
- 1=Uso restrito
Regras/observações: 0=Uso permitido; 1=Uso restrito;
Onde aparece (caminho): NFe/infNFe/det/prod/arma/tpArma
Cardinalidade: 1..1

Campo: nSerie
Descrição: Número de série da arma
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 15
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/arma/nSerie
Cardinalidade: 1..1

Campo: nCano
Descrição: Número de série do cano
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 15
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/arma/nCano
Cardinalidade: 1..1

Campo: descr
Descrição: Descrição completa da arma, compreendendo: calibre,
marca, capacidade, tipo de funcionamento, comprimento e
demais elementos que permitam a sua perfeita
identificação.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 256
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/prod/arma/descr
Cardinalidade: 1..1


### comb

Campo: comb
Descrição: Informações específicas para combustíveis líquidos e
lubrificantes
Obrigatoriedade: Condicional (Informar apenas para operações com combustíveis
líquidos e lubrificantes.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas para operações com combustíveis
líquidos e lubrificantes.
Onde aparece (caminho): NFe/infNFe/det/prod/comb
Cardinalidade: 1..1

Campo: cProdANP
Descrição: Código de produto da ANP
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a codificação de produtos do Sistema de
Informações de Movimentação de Produtos - SIMP
(http://www.anp.gov.br/simp/). (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/cProdANP
Cardinalidade: 1..1

Campo: pMixGN
Descrição: Percentual de Gás Natural para o produto GLP
(cProdANP=210203001)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/pMixGN
Cardinalidade: 0..1

Campo: descANP
Descrição: Descrição do produto conforme ANP
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2-95
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a descrição de produtos do Sistema de Informações
de Movimentação de Produtos - SIMP
(http://www.anp.gov.br/simp/). Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/descANP
Cardinalidade: 1..1

Campo: pGLP
Descrição: Percentual do GLP derivado do petróleo no produto GLP
(cProdANP=210203001)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar em número decimal o percentual do GLP derivado
de petróleo no produto GLP. Valores de 0 a 100. (Incluído
na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/pGLP
Cardinalidade: 0..1

Campo: pGNn
Descrição: Percentual de Gás Natural Nacional – GLGNn para o
produto GLP (cProdANP=210203001)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar em número decimal o percentual do Gás Natural
Nacional – GLGNn para o produto GLP. Valores de 0 a 100.
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/pGNn
Cardinalidade: 0..1

Campo: pGNi
Descrição: Percentual de Gás Natural Importado – GLGNi para o
produto GLP (cProdANP=210203001)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar em número decimal o percentual do Gás Natural
Importado – GLGNi para o produto GLP. Valores de 0 a 100.
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/pGNi
Cardinalidade: 0..1

Campo: vPart
Descrição: Valor de partida (cProdANP=210203001)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Deve ser informado neste campo o valor por quilograma
sem ICMS. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/vPart
Cardinalidade: 0..1

Campo: CODIF
Descrição: Código de autorização / registro do CODIF
Obrigatoriedade: Condicional (Informar apenas quando a UF utilizar o CODIF (Sistema de
Controle do Diferimento do Imposto nas Operações com
AEAC - Álcool Etílico Anidro Combustível).)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1- 21
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando a UF utilizar o CODIF (Sistema de
Controle do Diferimento do Imposto nas Operações com
AEAC - Álcool Etílico Anidro Combustível).
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CODIF
Cardinalidade: 0..1

Campo: qTemp
Descrição: Quantidade de combustível faturada à temperatura
ambiente.
Obrigatoriedade: Condicional (Informar quando a quantidade faturada informada no
campo "prod/qCom" (id:I10) tiver sido ajustada para uma
temperatura diferente da ambiente.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar quando a quantidade faturada informada no
campo "prod/qCom" (id:I10) tiver sido ajustada para uma
temperatura diferente da ambiente.
Onde aparece (caminho): NFe/infNFe/det/prod/comb/qTemp
Cardinalidade: 0..1

Campo: UFCons
Descrição: Sigla da UF de consumo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a UF de consumo. Informar "EX" para Exterior.
Onde aparece (caminho): NFe/infNFe/det/prod/comb/UFCons
Cardinalidade: 1..1

Campo: CIDE
Descrição: Informações da CIDE
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo de informações da CIDE
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CIDE
Cardinalidade: 0..1

Campo: encerrante
Descrição: Informações do grupo de “encerrante”
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações do grupo de “encerrante” disponibilizado por
hardware específico acoplado à bomba de Combustível,
definido no controle da venda do Posto Revendedor de
Combustível.
(Grupo incluído na NT 2015/002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante
Cardinalidade: 0..1


### CIDE

Campo: CIDE
Descrição: Informações da CIDE
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo de informações da CIDE
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CIDE
Cardinalidade: 0..1

Campo: qBCProd
Descrição: BC da CIDE
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a BC da CIDE em quantidade
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CIDE/qBCProd
Cardinalidade: 1..1

Campo: vAliqProd
Descrição: Valor da alíquota da CIDE
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da alíquota em reais da CIDE
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CIDE/vAliqProd
Cardinalidade: 1..1

Campo: vCIDE
Descrição: Valor da CIDE
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da CIDE
Onde aparece (caminho): NFe/infNFe/det/prod/comb/CIDE/vCIDE
Cardinalidade: 1..1


### imposto

Campo: imposto
Descrição: Tributos incidentes no Produto ou Serviço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo ISSQN mutuamente exclusivo com os grupos ICMS
Onde aparece (caminho): NFe/infNFe/det/imposto
Cardinalidade: 1..1

Campo: ICMS
Descrição: Informações do ICMS da Operação própria e ST
Obrigatoriedade: Condicional (Informar apenas um dos grupos de tributação do ICMS)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos de tributação do ICMS
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS
Cardinalidade: 1..1

Campo: vTotTrib
Descrição: Valor aproximado total de tributos federais, estaduais e
municipais.
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2013/003)
(ICMS00, ICMS10, ...) (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/vTotTrib
Cardinalidade: 0..1

Campo: ICMSUFDest
Descrição: Informação do ICMS Interestadual
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo a ser informado nas vendas interestaduais para
consumidor final, não contribuinte do ICMS.
Observação: Este grupo não deve ser utilizado nas
operações com veículos automotores novos efetuadas por
meio de faturamento direto para o consumidor (Convênio
ICMS 51/00), as quais possuem grupo de campos próprio
(ICMSPart)
(Grupo criado na NT 2015/003)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest
Cardinalidade: 0..1

Campo: IPI
Descrição: Grupo IPI
Obrigatoriedade: Condicional (Informar apenas quando o item for sujeito ao IPI)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando o item for sujeito ao IPI
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI
Cardinalidade: 0..1

Campo: II
Descrição: Grupo Imposto de Importação
Obrigatoriedade: Condicional (Informar apenas quando o item for sujeito ao II)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando o item for sujeito ao II
Onde aparece (caminho): NFe/infNFe/det/imposto/II
Cardinalidade: 0..1

Campo: PIS
Descrição: Grupo PIS
Obrigatoriedade: Condicional (Informar apenas um dos grupos Q02, Q03, Q04 ou Q05
com base valor atribuído ao campo Q06 – CST do PIS)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos Q02, Q03, Q04 ou Q05
com base valor atribuído ao campo Q06 – CST do PIS
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS
Cardinalidade: 0..1

Campo: PISST
Descrição: Grupo PIS Substituição Tributária
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PISST
Cardinalidade: 0..1

Campo: COFINS
Descrição: Grupo COFINS
Obrigatoriedade: Condicional (Informar apenas um dos grupos S02, S03, S04 ou S04 com
base valor atribuído ao campo de CST da COFINS)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos S02, S03, S04 ou S04 com
base valor atribuído ao campo de CST da COFINS
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS
Cardinalidade: 0..1

Campo: COFINSST
Descrição: Grupo COFINS Substituição Tributária
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINSST
Cardinalidade: 0..1

Campo: ISSQN
Descrição: Grupo ISSQN
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campos para cálculo do ISSQN na NF-e conjugada, onde
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN
Cardinalidade: 0..1


### ICMS

Campo: ICMS
Descrição: Informações do ICMS da Operação própria e ST
Obrigatoriedade: Condicional (Informar apenas um dos grupos de tributação do ICMS)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos de tributação do ICMS
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS
Cardinalidade: 1..1

Campo: ICMS00
Descrição: Grupo Tributação do ICMS= 00
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributada integralmente
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00
Cardinalidade: 1..1

Campo: ICMS10
Descrição: Grupo Tributação do ICMS = 10
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributada e com cobrança do ICMS por substituição
tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10
Cardinalidade: 1..1

Campo: ICMS20
Descrição: Grupo Tributação do ICMS = 20
Obrigatoriedade: Condicional (Tributação com redução de base de cálculo)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação com redução de base de cálculo
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20
Cardinalidade: 1..1

Campo: ICMS30
Descrição: Grupo Tributação do ICMS = 30
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação Isenta ou não tributada e com cobrança do
ICMS por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30
Cardinalidade: 1..1

Campo: ICMS40
Descrição: Grupo Tributação ICMS = 40, 41, 50
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação Isenta, Não tributada ou Suspensão.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS40
Cardinalidade: 1..1

Campo: ICMS51
Descrição: Grupo Tributação do ICMS = 51
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação com Diferimento (a exigência do
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51
Cardinalidade: 1..1

Campo: ICMS60
Descrição: Grupo Tributação do ICMS = 60
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS cobrado anteriormente por substituição
tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60
Cardinalidade: 1..1

Campo: ICMS70
Descrição: Grupo Tributação do ICMS = 70
Obrigatoriedade: Condicional (Tributação ICMS com redução de base de cálculo e
cobrança do ICMS por substituição tributária)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS com redução de base de cálculo e
cobrança do ICMS por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70
Cardinalidade: 1..1

Campo: ICMS90
Descrição: Grupo Tributação do ICMS = 90
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS: Outros
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90
Cardinalidade: 1..1

Campo: ICMSPart
Descrição: Grupo de Partilha do ICMS entre a UF de origem e UF de
destino ou a UF definida na legislação.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Operação interestadual para consumidor final com
partilha do ICMS devido na operação entre a UF de
origem e a do destinatário, ou a UF definida na legislação.
(Ex. UF da concessionária de entrega do veículo) (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart
Cardinalidade: 1..1

Campo: ICMSST
Descrição: Grupo de Repasse de ICMS ST retido anteriormente em
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo de informação do ICMS ST devido para a UF de
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST
Cardinalidade: 1..1

Campo: ICMSSN101
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=101
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=101 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101
Cardinalidade: 1..1

Campo: ICMSSN102
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=102, 103, 300
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=102, 103,
300 ou 400 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN102
Cardinalidade: 1..1

Campo: ICMSSN201
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=201
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=201 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201
Cardinalidade: 1..1

Campo: ICMSSN202
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=202 ou 203
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=202 ou
203 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202
Cardinalidade: 1..1

Campo: ICMSSN500
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN = 500
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=500 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500
Cardinalidade: 1..1

Campo: ICMSSN900
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=900
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=900 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 1..1


### ICMS00

Campo: ICMS00
Descrição: Grupo Tributação do ICMS= 00
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributada integralmente
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 00
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 00=Tributada integralmente.
Regras/observações: 00=Tributada integralmente.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço
- 3=Valor da operação.
Regras/observações: 0=Margem Valor Agregado (%); 1=Pauta (Valor);2=Preço
Tabelado Máx. (valor); 3=Valor da operação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/modBC
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/vBC
Cardinalidade: 1..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Condicional (Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/pICMS
Cardinalidade: 1..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00/vICMS
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (Criada na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS00
Cardinalidade: 0..1


### encerrante

Campo: encerrante
Descrição: Informações do grupo de “encerrante”
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações do grupo de “encerrante” disponibilizado por
hardware específico acoplado à bomba de Combustível,
definido no controle da venda do Posto Revendedor de
Combustível.
(Grupo incluído na NT 2015/002)
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante
Cardinalidade: 0..1

Campo: nBico
Descrição: Número de identificação do bico utilizado no
abastecimento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o número do bico utilizado no abastecimento.
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante/nBico
Cardinalidade: 1..1

Campo: nBomba
Descrição: Número de identificação da bomba ao qual o bico está
interligado
Obrigatoriedade: Condicional (Caso exista, informar o número da bomba utilizada.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Caso exista, informar o número da bomba utilizada.
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante/nBomba
Cardinalidade: 0..1

Campo: nTanque
Descrição: Número de identificação do tanque ao qual o bico está
interligado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o número do tanque utilizado.
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante/nTanque
Cardinalidade: 1..1

Campo: vEncIni
Descrição: Valor do Encerrante no início do abastecimento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da leitura do contador (Encerrante) no
início do abastecimento
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante/vEncIni
Cardinalidade: 1..1

Campo: vEncFin
Descrição: Valor do Encerrante no final do abastecimento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da leitura do contador (Encerrante) no
término do abastecimento
Onde aparece (caminho): NFe/infNFe/det/prod/comb/encerrante/vEncFin
Cardinalidade: 1..1


### ICMS10

Campo: ICMS10
Descrição: Grupo Tributação do ICMS = 10
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributada e com cobrança do ICMS por substituição
tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 10
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 10=Tributada e com cobrança do ICMS por substituição
Regras/observações: 10=Tributada e com cobrança do ICMS por substituição
tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço Tabelado Máx. (valor)
- 3=Valor da operação.
Regras/observações: 0=Margem Valor Agregado (%);
1=Pauta (Valor);
2=Preço Tabelado Máx. (valor);
3=Valor da operação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/modBC
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/vBC
Cardinalidade: 1..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Condicional (Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/pICMS
Cardinalidade: 1..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/vICMS
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10
Cardinalidade: 0..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
- 6 = Valor da Operação (NT 2019.001)
Regras/observações: 0=Preço tabelado ou máximo sugerido
1=Lista Negativa (valor)
2=Lista Positiva (valor);
3=Lista Neutra (valor)
4=Margem Valor Agregado (%)
5=Pauta (valor)
6 = Valor da Operação (NT 2019.001)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/pMVAST
Cardinalidade: 0..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/pRedBCST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Condicional (Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST retido
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10/vICMSST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS10
Cardinalidade: 0..1


### ICMS20

Campo: ICMS20
Descrição: Grupo Tributação do ICMS = 20
Obrigatoriedade: Condicional (Tributação com redução de base de cálculo)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação com redução de base de cálculo
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 20
Obrigatoriedade: Condicional (20=Com redução de base de cálculo)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 20=Com redução de base de cálculo
Regras/observações: 20=Com redução de base de cálculo
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço Tabelado Máx. (valor)
- 3=Valor da operação.
Regras/observações: 0=Margem Valor Agregado (%);
1=Pauta (Valor);
2=Preço Tabelado Máx. (valor);
3=Valor da operação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/modBC
Cardinalidade: 1..1

Campo: pRedBC
Descrição: Percentual da Redução de BC
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/pRedBC
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/vBC
Cardinalidade: 1..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Condicional (Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/pICMS
Cardinalidade: 1..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20/vICMS
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS20
Cardinalidade: 0..1


### ICMS30

Campo: ICMS30
Descrição: Grupo Tributação do ICMS = 30
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação Isenta ou não tributada e com cobrança do
ICMS por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 30
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 30=Isenta ou não tributada e com cobrança do ICMS por
Regras/observações: 30=Isenta ou não tributada e com cobrança do ICMS por
substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/CST
Cardinalidade: 1..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
- 6 = Valor da Operação (NT 2019.001)
Regras/observações: 0=Preço tabelado ou máximo sugerido;
1=Lista Negativa (valor)
2=Lista Positiva (valor)
3=Lista Neutra (valor)
4=Margem Valor Agregado (%)
5=Pauta (valor)
6 = Valor da Operação (NT 2019.001)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/pMVAST
Cardinalidade: 0..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/pRedBCST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Condicional (Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST retido
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30/vICMSST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS30
Cardinalidade: 0..1


### ICMS40

Campo: ICMS40
Descrição: Grupo Tributação ICMS = 40, 41, 50
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação Isenta, Não tributada ou Suspensão.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS40
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS40/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 40, 41 ou 50
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 40=Isenta
- 41=Não tributada
- 50=Suspensão.
Regras/observações: 40=Isenta; 41=Não tributada; 50=Suspensão.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS40/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS40
Cardinalidade: 0..1


### ICMS51

Campo: ICMS51
Descrição: Grupo Tributação do ICMS = 51
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação com Diferimento (a exigência do
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8;
1 - Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
preenchimento das informações do ICMS diferido fica a
critério de cada UF).)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 - Estrangeira - Importação direta, exceto a indicada no
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8;
1 - Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
preenchimento das informações do ICMS diferido fica a
critério de cada UF).
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 51
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 51=Diferimento
Regras/observações: 51=Diferimento
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço Tabelado Máx. (valor)
- 3=Valor da operação.
Regras/observações: 0=Margem Valor Agregado (%);
1=Pauta (Valor);
2=Preço Tabelado Máx. (valor);
3=Valor da operação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/modBC
Cardinalidade: 0..1

Campo: pRedBC
Descrição: Percentual da Redução de BC
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/pRedBC
Cardinalidade: 0..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/vBC
Cardinalidade: 0..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Condicional (Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP (Atualizado NT2016.002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP (Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/pICMS
Cardinalidade: 0..1

Campo: vICMSOp
Descrição: Valor do ICMS da Operação
Obrigatoriedade: Condicional (Valor como se não tivesse o diferimento)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor como se não tivesse o diferimento
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/vICMSOp
Cardinalidade: 0..1

Campo: pDif
Descrição: Percentual do diferimento
Obrigatoriedade: Condicional (No caso de diferimento total, informar o percentual de
diferimento "100".)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: No caso de diferimento total, informar o percentual de
diferimento "100".
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/pDif
Cardinalidade: 0..1

Campo: vICMSDif
Descrição: Valor do ICMS diferido
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/vICMSDif
Cardinalidade: 0..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor realmente devido.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51/vICMS
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS51
Cardinalidade: 0..1


### ICMS60

Campo: ICMS60
Descrição: Grupo Tributação do ICMS = 60
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS cobrado anteriormente por substituição
tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 60
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 60=ICMS cobrado anteriormente por substituição tributária
Regras/observações: 60=ICMS cobrado anteriormente por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional para informações do ICMS Efetivo
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS60
Cardinalidade: 0..1


### ICMS70

Campo: ICMS70
Descrição: Grupo Tributação do ICMS = 70
Obrigatoriedade: Condicional (Tributação ICMS com redução de base de cálculo e
cobrança do ICMS por substituição tributária)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS com redução de base de cálculo e
cobrança do ICMS por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 70
Obrigatoriedade: Condicional (70=Com redução de base de cálculo e cobrança do ICMS
por substituição tributária)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 70=Com redução de base de cálculo e cobrança do ICMS
Regras/observações: 70=Com redução de base de cálculo e cobrança do ICMS
por substituição tributária
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço
- 3=Valor da operação.
Regras/observações: 0=Margem Valor Agregado (%); 1=Pauta (Valor);2=Preço
Tabelado Máx. (valor); 3=Valor da operação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/modBC
Cardinalidade: 1..1

Campo: pRedBC
Descrição: Percentual da Redução de BC
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/pRedBC
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/vBC
Cardinalidade: 1..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Condicional (Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
alíquota do FCP no campo pFCP.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/pICMS
Cardinalidade: 1..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/vICMS
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70
Cardinalidade: 0..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
Regras/observações: 0=Preço tabelado ou máximo sugerido
1=Lista Negativa (valor)
2=Lista Positiva (valor)
3=Lista Neutra (valor)
4=Margem Valor Agregado (%)
5=Pauta (valor)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/pMVAST
Cardinalidade: 0..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/pRedBCST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Condicional (Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP (Atualizado
NT2016.002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP (Atualizado
NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST retido
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70/vICMSST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS70
Cardinalidade: 0..1


### ICMS90

Campo: ICMS90
Descrição: Grupo Tributação do ICMS = 90
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS: Outros
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS = 90
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 90=Outros
Regras/observações: 90=Outros
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMS90
Cardinalidade: 0..1


### ICMSPart

Campo: ICMSPart
Descrição: Grupo de Partilha do ICMS entre a UF de origem e UF de
destino ou a UF definida na legislação.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Operação interestadual para consumidor final com
partilha do ICMS devido na operação entre a UF de
origem e a do destinatário, ou a UF definida na legislação.
(Ex. UF da concessionária de entrega do veículo) (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 10=Tributada e com cobrança do ICMS por substituição
- 90=Outros.
Regras/observações: 10=Tributada e com cobrança do ICMS por substituição
tributária;
90=Outros.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/CST
Cardinalidade: 1..1

Campo: modBC
Descrição: Modalidade de determinação da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Margem Valor Agregado (%)
- 1=Pauta (Valor)
- 2=Preço Tabelado Máx. (valor)
- 3=Valor da operação
Regras/observações: 0=Margem Valor Agregado (%)
1=Pauta (Valor)
2=Preço Tabelado Máx. (valor)
3=Valor da operação
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/modBC
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da BC do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/vBC
Cardinalidade: 1..1

Campo: pRedBC
Descrição: Percentual da Redução de BC
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pRedBC
Cardinalidade: 0..1

Campo: pICMS
Descrição: Alíquota do imposto
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pICMS
Cardinalidade: 1..1

Campo: vICMS
Descrição: Valor do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/vICMS
Cardinalidade: 1..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
Regras/observações: 0=Preço tabelado ou máximo sugerido
1=Lista Negativa (valor)
2=Lista Positiva (valor);
3=Lista Neutra (valor)
4=Margem Valor Agregado (%);
5=Pauta (valor)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pMVAST
Cardinalidade: 0..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pRedBCST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST(v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/vICMSST
Cardinalidade: 1..1

Campo: pBCOp
Descrição: Percentual da BC operação própria
Obrigatoriedade: Condicional (Percentual para determinação do valor da Base de Cálculo
da operação própria. (v2.0))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Percentual para determinação do valor da Base de Cálculo
da operação própria. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/pBCOp
Cardinalidade: 1..1

Campo: UFST
Descrição: UF para qual é devido o ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Sigla da UF para qual é devido o ICMS ST da operação.
Informar "EX" para Exterior. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSPart/UFST
Cardinalidade: 1..1


### ICMSST

Campo: ICMSST
Descrição: Grupo de Repasse de ICMS ST retido anteriormente em
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo de informação do ICMS ST devido para a UF de
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/orig
Cardinalidade: 1..1

Campo: CST
Descrição: Tributação do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 41=Não Tributado (v2.0).
- 60= cobrado anteriormente por substituição tributária
Regras/observações: 41=Não Tributado (v2.0).
60= cobrado anteriormente por substituição tributária
(Incluído NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/CST
Cardinalidade: 1..1

Campo: vBCSTRet
Descrição: Valor do BC do ICMS ST retido na UF remetente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da BC do ICMS ST retido na UF remetente
(v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/vBCSTRet
Cardinalidade: 1..1

Campo: vICMSSTRet
Descrição: Valor do ICMS ST retido na UF remetente
Obrigatoriedade: Condicional (Informar o valor do ICMS ST retido na UF remetente (v2.0)
operações interestaduais com repasses através do
destino, nas operações interestaduais de produtos que
Substituto Tributário
tiveram retenção antecipada de ICMS por ST na UF do
remetente. Repasse via Substituto Tributário. (v2.0))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor do ICMS ST retido na UF remetente (v2.0)
operações interestaduais com repasses através do
destino, nas operações interestaduais de produtos que
Substituto Tributário
tiveram retenção antecipada de ICMS por ST na UF do
remetente. Repasse via Substituto Tributário. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/vICMSSTRet
Cardinalidade: 1..1

Campo: pST
Descrição: Alíquota suportada pelo Consumidor Final
Obrigatoriedade: Condicional (Deve ser informada a alíquota do cálculo do ICMS-ST, já
incluso o FCP caso incida sobre a mercadoria. Exemplo:
alíquota da mercadoria na venda ao consumidor final =
18% e 2% de FCP. A alíquota a ser informada no campo pST
deve ser 20%. (Criado na NT 2018.005 v1.10. Atualizado na
2018.005 v1.20))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Deve ser informada a alíquota do cálculo do ICMS-ST, já
incluso o FCP caso incida sobre a mercadoria. Exemplo:
alíquota da mercadoria na venda ao consumidor final =
18% e 2% de FCP. A alíquota a ser informada no campo pST
deve ser 20%. (Criado na NT 2018.005 v1.10. Atualizado na
2018.005 v1.20)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/pST
Cardinalidade: 0..1

Campo: vICMSSubstituto
Descrição: Valor do ICMS próprio do Substituto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS Próprio do Substituto cobrado em operação
anterior (Criado na NT 2018.005 v1.10. Atualizado na
2018.005 v1.20)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/vICMSSubstituto
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional para informações do FCP retido
anteriormente por ST
(Criado na NT 2018.005)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST
Cardinalidade: 0..1

Campo: vBCSTDest
Descrição: Valor da BC do ICMS ST da UF destino
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor da BC do ICMS ST da UF destino (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/vBCSTDest
Cardinalidade: 1..1

Campo: vICMSSTDest
Descrição: Valor do ICMS ST da UF destino
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o valor do ICMS ST da UF destino (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST/vICMSSTDest
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional para informações do ICMS Efetivo
(Criado na NT 2018.005 v1.10)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSST
Cardinalidade: 0..1


### ICMSSN101

Campo: ICMSSN101
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=101
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=101 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – Simples Nacional
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 101=Tributada pelo Simples Nacional com permissão de
crédito. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101/CSOSN
Cardinalidade: 1..1

Campo: pCredSN
Descrição: Alíquota aplicável de cálculo do crédito (Simples Nacional).
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101/pCredSN
Cardinalidade: 1..1

Campo: vCredICMSSN
Descrição: Valor crédito do ICMS que pode ser aproveitado nos
termos do art. 23 da LC 123 (Simples Nacional)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
ou 400
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN101/vCredICMSSN
Cardinalidade: 1..1


### ICMSSN102

Campo: ICMSSN102
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=102, 103, 300
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=102, 103,
300 ou 400 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN102
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN102/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – Simples Nacional
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 102=Tributada pelo Simples Nacional sem permissão de
crédito.
103=Isenção do ICMS no Simples Nacional para faixa de
receita bruta.
300=Imune.
400=Não tributada pelo Simples Nacional (v2.0) (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN102/CSOSN
Cardinalidade: 1..1


### ICMSSN201

Campo: ICMSSN201
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=201
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=201 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – Simples Nacional
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 201=Tributada pelo Simples Nacional com permissão de
crédito e com cobrança do ICMS por Substituição Tributária
(v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/CSOSN
Cardinalidade: 1..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
Regras/observações: 0=Preço tabelado ou máximo sugerido
1=Lista Negativa (valor)
2=Lista Positiva (valor);
3=Lista Neutra (valor)
4=Margem Valor Agregado (%)
5=Pauta (valor)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/pMVAST
Cardinalidade: 0..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/pRedBCST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Condicional (Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST retido (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/vICMSST
Cardinalidade: 1..1

Campo: pCredSN
Descrição: Alíquota aplicável de cálculo do crédito (SIMPLES
NACIONAL).
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
(Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/pCredSN
Cardinalidade: 1..1

Campo: vCredICMSSN
Descrição: Valor crédito do ICMS que pode ser aproveitado nos
termos do art. 23 da LC 123 (SIMPLES NACIONAL)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
(Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201/vCredICMSSN
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência xml
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN201
Cardinalidade: 0..1


### ICMSSN202

Campo: ICMSSN202
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=202 ou 203
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=202 ou
203 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202
Cardinalidade: 1..1

Campo: pRedBCST
Descrição: Percentual da Redução de BC do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/pRedBCST
Cardinalidade: 0..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – Simples Nacional
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 202=Tributada pelo Simples Nacional sem permissão de
crédito e com cobrança do ICMS por Substituição
Tributária;
203- Isenção do ICMS nos Simples Nacional para faixa de
receita bruta e com cobrança do ICMS por Substituição
Tributária (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/CSOSN
Cardinalidade: 1..1

Campo: modBCST
Descrição: Modalidade de determinação da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Preço tabelado ou máximo sugerido
- 1=Lista Negativa (valor)
- 2=Lista Positiva (valor)
- 3=Lista Neutra (valor)
- 4=Margem Valor Agregado (%)
- 5=Pauta (valor)
Regras/observações: 0=Preço tabelado ou máximo sugerido
1=Lista Negativa (valor)
2=Lista Positiva (valor)
3=Lista Neutra (valor)
4=Margem Valor Agregado (%)
5=Pauta (valor)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/modBCST
Cardinalidade: 1..1

Campo: pMVAST
Descrição: Percentual da margem de valor Adicionado do ICMS ST
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/pMVAST
Cardinalidade: 0..1

Campo: vBCST
Descrição: Valor da BC do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/vBCST
Cardinalidade: 1..1

Campo: pICMSST
Descrição: Alíquota do imposto do ICMS ST
Obrigatoriedade: Condicional (Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002))
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota do ICMS ST sem o FCP. Quando for o caso,
informar a alíquota do FCP no campo pFCP
(Atualizado NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/pICMSST
Cardinalidade: 1..1

Campo: vICMSST
Descrição: Valor do ICMS ST
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS ST retido (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN202/vICMSST
Cardinalidade: 1..1


### ICMSSN500

Campo: ICMSSN500
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN = 500
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=500 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – Simples Nacional
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 500=ICMS cobrado anteriormente por substituição
tributária (substituído) ou por antecipação. (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500/CSOSN
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência xml
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500
Cardinalidade: 0..1

Campo: - x -
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional para informações do ICMS Efetivo.
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN500/- x -
Cardinalidade: 0..1


### ICMSSN900

Campo: ICMSSN900
Descrição: Grupo CRT=1 – Simples Nacional e CSOSN=900
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tributação ICMS pelo Simples Nacional, CSOSN=900 (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 1..1

Campo: orig
Descrição: Origem da mercadoria
Obrigatoriedade: Condicional (0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8
- 1 -
- 2 - Estrangeira - Adquirida no mercado interno, exceto a
- 3 - Nacional, mercadoria ou bem com Conteúdo de
- 4 - Nacional, cuja produção tenha sido feita em
- 5 - Nacional, mercadoria ou bem com Conteúdo de
- 6 - Estrangeira - Importação direta, sem similar nacional,
- 7 - Estrangeira - Adquirida no mercado interno, sem similar
- 8 - Nacional, mercadoria ou bem com Conteúdo de
Regras/observações: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
Estrangeira - Importação direta, exceto a indicada no
código 6;
2 - Estrangeira - Adquirida no mercado interno, exceto a
indicada no código 7;
3 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 40% e inferior ou igual a 70%;
4 - Nacional, cuja produção tenha sido feita em
conformidade com os processos produtivos básicos de que
tratam as legislações citadas nos Ajustes;
5 - Nacional, mercadoria ou bem com Conteúdo de
Importação inferior ou igual a 40%;
6 - Estrangeira - Importação direta, sem similar nacional,
constante em lista da CAMEX e gás natural;
7 - Estrangeira - Adquirida no mercado interno, sem similar
nacional, constante lista CAMEX e gás natural.
8 - Nacional, mercadoria ou bem com Conteúdo de
Importação superior a 70%;
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900/orig
Cardinalidade: 1..1

Campo: CSOSN
Descrição: Código de Situação da Operação – SIMPLES NACIONAL
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: 900=Outros (v2.0)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900/CSOSN
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional. (Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo opcional.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMS/ICMSSN900
Cardinalidade: 0..1


### ICMSUFDest

Campo: ICMSUFDest
Descrição: Informação do ICMS Interestadual
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo a ser informado nas vendas interestaduais para
consumidor final, não contribuinte do ICMS.
Observação: Este grupo não deve ser utilizado nas
operações com veículos automotores novos efetuadas por
meio de faturamento direto para o consumidor (Convênio
ICMS 51/00), as quais possuem grupo de campos próprio
(ICMSPart)
(Grupo criado na NT 2015/003)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest
Cardinalidade: 0..1

Campo: vBCUFDest
Descrição: Valor da BC do ICMS na UF de destino
Obrigatoriedade: Condicional (Valor da Base de Cálculo do ICMS na UF de destino.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor da Base de Cálculo do ICMS na UF de destino.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/vBCUFDest
Cardinalidade: 1..1

Campo: vBCFCPUFDest
Descrição: Valor da BC FCP na UF de destino
Obrigatoriedade: Condicional (Valor da Base de Cálculo do FCP na UF de destino. (Incluído
na NT2016.002))
Tipo/Formato: Ele=E; Tipo=Não informado no PDF
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor da Base de Cálculo do FCP na UF de destino. (Incluído
na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/vBCFCPUFDest
Cardinalidade: 1..1

Campo: pFCPUFDest
Descrição: Percentual do ICMS relativo ao Fundo de Combate à
Pobreza (FCP) na UF de destino
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Percentual adicional inserido na alíquota interna da UF de
destino, relativo ao Fundo de Combate à Pobreza (FCP)
naquela UF. Nota: Percentual máximo de 2%, conforme a
legislação.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/pFCPUFDest
Cardinalidade: 0..1

Campo: pICMSUFDest
Descrição: Alíquota interna da UF de destino
Obrigatoriedade: Condicional (Alíquota adotada nas operações internas na UF de destino
para o produto / mercadoria. A alíquota do Fundo de
Combate a Pobreza, se existente para o produto /
mercadoria, deve ser informada no campo próprio
(pFCPUFDest) não devendo ser somada à essa alíquota
interna.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota adotada nas operações internas na UF de destino
para o produto / mercadoria. A alíquota do Fundo de
Combate a Pobreza, se existente para o produto /
mercadoria, deve ser informada no campo próprio
(pFCPUFDest) não devendo ser somada à essa alíquota
interna.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/pICMSUFDest
Cardinalidade: 1..1

Campo: pICMSInter
Descrição: Alíquota interestadual das UF envolvidas
Obrigatoriedade: Condicional (Alíquota interestadual das UF envolvidas:
- 4% alíquota interestadual para produtos importados;
- 7% para os Estados de origem do Sul e Sudeste (exceto
ES), destinado para os Estados do Norte, Nordeste, Centro-
Oeste e Espírito Santo;
- 12% para os demais casos.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Alíquota interestadual das UF envolvidas:
- 4% alíquota interestadual para produtos importados;
- 7% para os Estados de origem do Sul e Sudeste (exceto
ES), destinado para os Estados do Norte, Nordeste, Centro-
Oeste e Espírito Santo;
- 12% para os demais casos.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/pICMSInter
Cardinalidade: 1..1

Campo: pICMSInterPart
Descrição: Percentual provisório de partilha do ICMS Interestadual
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Percentual de ICMS Interestadual para a UF de destino:
- 40% em 2016;
- 60% em 2017;
- 80% em 2018;
- 100% a partir de 2019.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/pICMSInterPart
Cardinalidade: 1..1

Campo: vFCPUFDest
Descrição: Valor do ICMS relativo ao Fundo de Combate à Pobreza
(FCP) da UF de destino
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS relativo ao Fundo de Combate à Pobreza
(FCP) da UF de destino.
(Atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/vFCPUFDest
Cardinalidade: 0..1

Campo: vICMSUFDest
Descrição: Valor do ICMS Interestadual para a UF de destino
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS Interestadual para a UF de destino, já
considerando o valor do ICMS relativo ao Fundo de
Combate à Pobreza naquela UF.
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/vICMSUFDest
Cardinalidade: 1..1

Campo: vICMSUFRemet
Descrição: Valor do ICMS Interestadual para a UF do remetente
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do ICMS Interestadual para a UF do remetente. Nota:
A partir de 2019, este valor será zero.
valor atribuído ao campo O09 – CST do IPI
Onde aparece (caminho): NFe/infNFe/det/imposto/ICMSUFDest/vICMSUFRemet
Cardinalidade: 1..1


### IPI (ID: O01, Pai: M01)

Campo: IPI
Descrição: Grupo IPI
Obrigatoriedade: Condicional (Informar apenas quando o item for sujeito ao IPI)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando o item for sujeito ao IPI
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI
Cardinalidade: 0..1

Campo: clEnq
Descrição: Classe de enquadramento do IPI para Cigarros e Bebidas
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 5
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preenchimento conforme Atos Normativos editados pela
Receita Federal (Observação 2)
(Excluído no leiaute 4.0 - NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/clEnq
Cardinalidade: 0..1

Campo: CNPJProd
Descrição: CNPJ do produtor da mercadoria, quando diferente do
emitente. Somente para os casos de exportação direta ou
indireta.
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os zeros não significativos
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/CNPJProd
Cardinalidade: 0..1

Campo: cSelo
Descrição: Código do selo de controle IPI
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preenchimento conforme Anexo II-A da Instrução
Normativa RFB Nº 770/2007
TIPO DE SELO CÓDIGO COR DO SELO
Produto Nacional 9710-01 Verde combinado
com marrom
Produto Nacional 9710-10 Verde Escuro
para Exportação - combinado com
Tipo "1" marrom
Produto Nacional 9710-11 Verde Escuro
para Exportação - combinado com
Tipo "2" marrom
Produto Nacional 9710-12 Verde Escuro
para Exportação - combinado com
Tipo "3" marrom
Produto Estrangeiro 8 6 1 0 - 0 9 V e r m e l h o
combinado com
azul
(Atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/cSelo
Cardinalidade: 0..1

Campo: qSelo
Descrição: Quantidade de selo de controle
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 12
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/qSelo
Cardinalidade: 0..1

Campo: cEnq
Descrição: Código de Enquadramento Legal do IPI
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preenchimento conforme seção 8.9 do MOC – Visão Geral
(Tabela do Código de Enquadramento do IPI)
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/cEnq
Cardinalidade: 1..1

Campo: IPITrib
Descrição: Grupo do CST 00, 49, 50 e 99
Obrigatoriedade: Condicional (Informar apenas um dos grupos O07 ou O08 com base)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos O07 ou O08 com base
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib
Cardinalidade: 1..1

Campo: IPINT
Descrição: Grupo CST 01, 02, 03, 04, 51, 52, 53
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPINT
Cardinalidade: 1..1


### IPITrib

Campo: IPITrib
Descrição: Grupo do CST 00, 49, 50 e 99
Obrigatoriedade: Condicional (Informar apenas um dos grupos O07 ou O08 com base)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos O07 ou O08 com base
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib
Cardinalidade: 1..1

Campo: CST
Descrição: Código da situação tributária do IPI
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 00=Entrada com recuperação de crédito
- 49=Outras entradas
- 50=Saída tributada
- 99=Outras saídas
Regras/observações: 00=Entrada com recuperação de crédito
49=Outras entradas
50=Saída tributada
99=Outras saídas
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Condicional (Informar os campos O10 e O13 se o cálculo do IPI for por
alíquota.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos O10 e O13 se o cálculo do IPI for por
alíquota.
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Condicional (Informar os campos O11 e O12 se o cálculo do IPI for de
valor por unidade.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos O11 e O12 se o cálculo do IPI for de
valor por unidade.
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib
Cardinalidade: 1..1

Campo: vIPI
Descrição: Valor do IPI
Obrigatoriedade: Condicional (Informar os campos O11 e O12 se o cálculo do IPI for de
valor por unidade.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos O11 e O12 se o cálculo do IPI for de
valor por unidade.
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPITrib/vIPI
Cardinalidade: 1..1


### IPINT

Campo: IPINT
Descrição: Grupo CST 01, 02, 03, 04, 51, 52, 53
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPINT
Cardinalidade: 1..1

Campo: CST
Descrição: Código da situação tributária do IPI
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: - 01=Entrada tributada com alíquota zero
- 02=Entrada isenta
- 03=Entrada não-tributada
- 04=Entrada imune
- 05=Entrada com suspensão
- 51=Saída tributada com alíquota zero
- 52=Saída isenta
- 53=Saída não-tributada
- 54=Saída imune
- 55=Saída com suspensão
Regras/observações: Código da situação tributária do IPI:
01=Entrada tributada com alíquota zero
02=Entrada isenta
03=Entrada não-tributada
04=Entrada imune
05=Entrada com suspensão
51=Saída tributada com alíquota zero
52=Saída isenta
53=Saída não-tributada
54=Saída imune
55=Saída com suspensão
Onde aparece (caminho): NFe/infNFe/det/imposto/IPI/IPINT/CST
Cardinalidade: 1..1


### II

Campo: II
Descrição: Grupo Imposto de Importação
Obrigatoriedade: Condicional (Informar apenas quando o item for sujeito ao II)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas quando o item for sujeito ao II
Onde aparece (caminho): NFe/infNFe/det/imposto/II
Cardinalidade: 0..1

Campo: vBC
Descrição: Valor BC do Imposto de Importação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/II/vBC
Cardinalidade: 1..1

Campo: vDespAdu
Descrição: Valor despesas aduaneiras
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/II/vDespAdu
Cardinalidade: 1..1

Campo: vII
Descrição: Valor Imposto de Importação
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/II/vII
Cardinalidade: 1..1

Campo: vIOF
Descrição: Valor Imposto sobre Operações Financeiras
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/II/vIOF
Cardinalidade: 1..1


### PIS

Campo: PIS
Descrição: Grupo PIS
Obrigatoriedade: Condicional (Informar apenas um dos grupos Q02, Q03, Q04 ou Q05
com base valor atribuído ao campo Q06 – CST do PIS)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos Q02, Q03, Q04 ou Q05
com base valor atribuído ao campo Q06 – CST do PIS
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS
Cardinalidade: 0..1

Campo: PISAliq
Descrição: Grupo PIS tributado pela alíquota
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq
Cardinalidade: 1..1

Campo: PISQtde
Descrição: Grupo PIS tributado por Qtde
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde
Cardinalidade: 1..1

Campo: PISNT
Descrição: Grupo PIS não tributado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISNT
Cardinalidade: 1..1

Campo: PISOutr
Descrição: Grupo PIS Outras Operações
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISOutr
Cardinalidade: 1..1


### PISAliq

Campo: PISAliq
Descrição: Grupo PIS tributado pela alíquota
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária do PIS
Obrigatoriedade: Condicional (01=Operação Tributável (base de cálculo = valor da
operação alíquota normal (cumulativo/não cumulativo));
02=Operação Tributável (base de cálculo = valor da
operação (alíquota diferenciada));)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 01=Operação Tributável (base de cálculo = valor da
- 02=Operação Tributável (base de cálculo = valor da
Regras/observações: 01=Operação Tributável (base de cálculo = valor da
operação alíquota normal (cumulativo/não cumulativo));
02=Operação Tributável (base de cálculo = valor da
operação (alíquota diferenciada));
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq/CST
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da Base de Cálculo do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq/vBC
Cardinalidade: 1..1

Campo: pPIS
Descrição: Alíquota do PIS (em percentual)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq/pPIS
Cardinalidade: 1..1

Campo: vPIS
Descrição: Valor do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISAliq/vPIS
Cardinalidade: 1..1


### PISQtde

Campo: PISQtde
Descrição: Grupo PIS tributado por Qtde
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária do PIS
Obrigatoriedade: Condicional (03=Operação Tributável (base de cálculo = quantidade
vendida x alíquota por unidade de produto);)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 03=Operação Tributável (base de cálculo = quantidade
Regras/observações: 03=Operação Tributável (base de cálculo = quantidade
vendida x alíquota por unidade de produto);
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde/CST
Cardinalidade: 1..1

Campo: qBCProd
Descrição: Quantidade Vendida
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde/qBCProd
Cardinalidade: 1..1

Campo: vAliqProd
Descrição: Alíquota do PIS (em reais)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde/vAliqProd
Cardinalidade: 1..1

Campo: vPIS
Descrição: Valor do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISQtde/vPIS
Cardinalidade: 1..1


### PISNT

Campo: PISNT
Descrição: Grupo PIS não tributado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISNT
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 04=Operação Tributável (tributação monofásica (alíquota
- 05=Operação Tributável (Substituição Tributária)
- 06=Operação Tributável (alíquota zero)
- 07=Operação Isenta da Contribuição
- 08=Operação Sem Incidência da Contribuição
- 09=Operação com Suspensão da Contribuição
Regras/observações: 04=Operação Tributável (tributação monofásica (alíquota
zero));
05=Operação Tributável (Substituição Tributária);
06=Operação Tributável (alíquota zero);
07=Operação Isenta da Contribuição;
08=Operação Sem Incidência da Contribuição;
09=Operação com Suspensão da Contribuição;
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISNT/CST
Cardinalidade: 1..1


### PISOutr

Campo: PISOutr
Descrição: Grupo PIS Outras Operações
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISOutr
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 49=Outras Operações de Saída
- 50=Operação com Direito a Crédito - Vinculada
- 51=Operação com Direito a Crédito - Vinculada
- 52=Operação com Direito a Crédito – Vinculada
- 53=Operação com Direito a Crédito - Vinculada a Receitas
- 54=Operação com Direito a Crédito - Vinculada a Receitas
- 55=Operação com Direito a Crédito - Vinculada a Receitas
- 56=Operação com Direito a Crédito - Vinculada a Receitas
- 60=Crédito Presumido - Operação de Aquisição Vinculada
- 61=Crédito Presumido - Operação de Aquisição Vinculada
- 62=Crédito Presumido - Operação de Aquisição Vinculada
- 63=Crédito Presumido - Operação de Aquisição Vinculada a
- 64=Crédito Presumido - Operação de Aquisição Vinculada a
- 65=Crédito Presumido - Operação de Aquisição Vinculada a
- 66=Crédito Presumido - Operação de Aquisição Vinculada a
- 67=Crédito Presumido - Outras Operações
- 70=Operação de Aquisição sem Direito a Crédito
- 71=Operação de Aquisição com Isenção
- 72=Operação de Aquisição com Suspensão
- 73=Operação de Aquisição a Alíquota Zero
- 74=Operação de Aquisição
- 75=Operação de Aquisição por Substituição Tributária
- 98=Outras Operações de Entrada
- 99=Outras Operações
Regras/observações: 49=Outras Operações de Saída;
50=Operação com Direito a Crédito - Vinculada
Exclusivamente a Receita Tributada no Mercado Interno;
51=Operação com Direito a Crédito - Vinculada
Exclusivamente a Receita Não Tributada no Mercado
Interno;
52=Operação com Direito a Crédito – Vinculada
Exclusivamente a Receita de Exportação;
53=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas e Não-Tributadas no Mercado Interno;
54=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas no Mercado Interno e de Exportação;
55=Operação com Direito a Crédito - Vinculada a Receitas
Não-Tributadas no Mercado Interno e de Exportação;
56=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas e Não-Tributadas no Mercado Interno, e de
Exportação;
60=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita Tributada no Mercado Interno;
61=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita Não-Tributada no Mercado
Interno;
62=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita de Exportação;
63=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas e Não-Tributadas no Mercado Interno;
64=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas no Mercado Interno e de Exportação;
65=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Não-Tributadas no Mercado Interno e de
Exportação;
66=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas e Não-Tributadas no Mercado Interno,
e de Exportação;
67=Crédito Presumido - Outras Operações;
70=Operação de Aquisição sem Direito a Crédito;
71=Operação de Aquisição com Isenção;
72=Operação de Aquisição com Suspensão;
73=Operação de Aquisição a Alíquota Zero;
74=Operação de Aquisição; sem Incidência da
Contribuição;
75=Operação de Aquisição por Substituição Tributária;
98=Outras Operações de Entrada;
99=Outras Operações;
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISOutr/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Condicional (Informar os campos Q07 e Q08 se o cálculo do PIS em
percentual.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos Q07 e Q08 se o cálculo do PIS em
percentual.
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISOutr
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Condicional (Informar os campos Q10 e Q11 se o cálculo do PIS for em
valor.)
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos Q10 e Q11 se o cálculo do PIS for em
valor.
Onde aparece (caminho): NFe/infNFe/det/imposto/PIS/PISOutr
Cardinalidade: 1..1


### PISST

Campo: PISST
Descrição: Grupo PIS Substituição Tributária
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PISST
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos R02 e R03 para cálculo do PIS em
percentual.
Onde aparece (caminho): NFe/infNFe/det/imposto/PISST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos R04 e R05 para cálculo do PIS em
valor.
Onde aparece (caminho): NFe/infNFe/det/imposto/PISST
Cardinalidade: 1..1

Campo: vPIS
Descrição: Valor do PIS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/PISST/vPIS
Cardinalidade: 1..1


### COFINS

Campo: COFINS
Descrição: Grupo COFINS
Obrigatoriedade: Condicional (Informar apenas um dos grupos S02, S03, S04 ou S04 com
base valor atribuído ao campo de CST da COFINS)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas um dos grupos S02, S03, S04 ou S04 com
base valor atribuído ao campo de CST da COFINS
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS
Cardinalidade: 0..1

Campo: COFINSAliq
Descrição: Grupo COFINS tributado pela alíquota
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq
Cardinalidade: 1..1

Campo: COFINSQtde
Descrição: Grupo de COFINS tributado por Qtde
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde
Cardinalidade: 1..1

Campo: COFINSNT
Descrição: Grupo COFINS não tributado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSNT
Cardinalidade: 1..1

Campo: COFINSOutr
Descrição: Grupo COFINS Outras Operações
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr
Cardinalidade: 1..1


### COFINSAliq

Campo: COFINSAliq
Descrição: Grupo COFINS tributado pela alíquota
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária da COFINS
Obrigatoriedade: Condicional (01=Operação Tributável (base de cálculo = valor da
operação alíquota normal (cumulativo/não cumulativo));
02=Operação Tributável (base de cálculo = valor da
operação (alíquota diferenciada));)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 01=Operação Tributável (base de cálculo = valor da
- 02=Operação Tributável (base de cálculo = valor da
Regras/observações: 01=Operação Tributável (base de cálculo = valor da
operação alíquota normal (cumulativo/não cumulativo));
02=Operação Tributável (base de cálculo = valor da
operação (alíquota diferenciada));
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq/CST
Cardinalidade: 1..1

Campo: vBC
Descrição: Valor da Base de Cálculo da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq/vBC
Cardinalidade: 1..1

Campo: pCOFINS
Descrição: Alíquota da COFINS (em percentual)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq/pCOFINS
Cardinalidade: 1..1

Campo: vCOFINS
Descrição: Valor da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSAliq/vCOFINS
Cardinalidade: 1..1


### COFINSQtde

Campo: COFINSQtde
Descrição: Grupo de COFINS tributado por Qtde
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária da COFINS
Obrigatoriedade: Condicional (03=Operação Tributável (base de cálculo = quantidade
vendida x alíquota por unidade de produto);)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 03=Operação Tributável (base de cálculo = quantidade
Regras/observações: 03=Operação Tributável (base de cálculo = quantidade
vendida x alíquota por unidade de produto);
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde/CST
Cardinalidade: 1..1

Campo: qBCProd
Descrição: Quantidade Vendida
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde/qBCProd
Cardinalidade: 1..1

Campo: vAliqProd
Descrição: Alíquota da COFINS (em reais)
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v0-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde/vAliqProd
Cardinalidade: 1..1

Campo: vCOFINS
Descrição: Valor da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSQtde/vCOFINS
Cardinalidade: 1..1


### COFINSNT

Campo: COFINSNT
Descrição: Grupo COFINS não tributado
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSNT
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 04=Operação Tributável (tributação monofásica, alíquota
- 05=Operação Tributável (Substituição Tributária)
- 06=Operação Tributável (alíquota zero)
- 07=Operação Isenta da Contribuição
- 08=Operação Sem Incidência da Contribuição
- 09=Operação com Suspensão da Contribuição
Regras/observações: 04=Operação Tributável (tributação monofásica, alíquota
zero);
05=Operação Tributável (Substituição Tributária);
06=Operação Tributável (alíquota zero);
07=Operação Isenta da Contribuição;
08=Operação Sem Incidência da Contribuição;
09=Operação com Suspensão da Contribuição;
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSNT/CST
Cardinalidade: 1..1


### COFINSOutr

Campo: COFINSOutr
Descrição: Grupo COFINS Outras Operações
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr
Cardinalidade: 1..1

Campo: CST
Descrição: Código de Situação Tributária da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 49=Outras Operações de Saída
- 50=Operação com Direito a Crédito - Vinculada
- 51=Operação com Direito a Crédito - Vinculada
- 52=Operação com Direito a Crédito – Vinculada
- 53=Operação com Direito a Crédito - Vinculada a Receitas
- 54=Operação com Direito a Crédito - Vinculada a Receitas
- 55=Operação com Direito a Crédito - Vinculada a Receitas
- 56=Operação com Direito a Crédito - Vinculada a Receitas
- 60=Crédito Presumido - Operação de Aquisição Vinculada
- 61=Crédito Presumido - Operação de Aquisição Vinculada
- 62=Crédito Presumido - Operação de Aquisição Vinculada
- 63=Crédito Presumido - Operação de Aquisição Vinculada a
- 64=Crédito Presumido - Operação de Aquisição Vinculada a
- 65=Crédito Presumido - Operação de Aquisição Vinculada a
- 66=Crédito Presumido - Operação de Aquisição Vinculada a
- 67=Crédito Presumido - Outras Operações
- 70=Operação de Aquisição sem Direito a Crédito
- 71=Operação de Aquisição com Isenção
Regras/observações: 49=Outras Operações de Saída;
50=Operação com Direito a Crédito - Vinculada
Exclusivamente a Receita Tributada no Mercado Interno;
51=Operação com Direito a Crédito - Vinculada
Exclusivamente a Receita Não Tributada no Mercado
Interno;
52=Operação com Direito a Crédito – Vinculada
Exclusivamente a Receita de Exportação;
53=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas e Não-Tributadas no Mercado Interno;
54=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas no Mercado Interno e de Exportação;
55=Operação com Direito a Crédito - Vinculada a Receitas
Não-Tributadas no Mercado Interno e de Exportação;
56=Operação com Direito a Crédito - Vinculada a Receitas
Tributadas e Não-Tributadas no Mercado Interno, e de
Exportação;
60=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita Tributada no Mercado Interno;
61=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita Não-Tributada no Mercado
Interno;
62=Crédito Presumido - Operação de Aquisição Vinculada
Exclusivamente a Receita de Exportação;
63=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas e Não-Tributadas no Mercado Interno;
64=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas no Mercado Interno e de Exportação;
65=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Não-Tributadas no Mercado Interno e de
Exportação;
66=Crédito Presumido - Operação de Aquisição Vinculada a
Receitas Tributadas e Não-Tributadas no Mercado Interno,
e de Exportação;
67=Crédito Presumido - Outras Operações;
70=Operação de Aquisição sem Direito a Crédito;
71=Operação de Aquisição com Isenção;
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr/CST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos S07 e S08 para cálculo da COFINS em
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos S09 e S10 para cálculo da COFINS em
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr
Cardinalidade: 1..1

Campo: vCOFINS
Descrição: Valor da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINS/COFINSOutr/vCOFINS
Cardinalidade: 1..1


### COFINSST

Campo: COFINSST
Descrição: Grupo COFINS Substituição Tributária
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINSST
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos T02 e T03 para cálculo da COFINS
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINSST
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os campos T04 e T05 para cálculo da COFINS
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINSST
Cardinalidade: 1..1

Campo: vCOFINS
Descrição: Valor da COFINS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/COFINSST/vCOFINS
Cardinalidade: 1..1


### ISSQN

Campo: ISSQN
Descrição: Grupo ISSQN
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campos para cálculo do ISSQN na NF-e conjugada, onde
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN
Cardinalidade: 0..1

Campo: vBC
Descrição: Valor da Base de Cálculo do ISSQN
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vBC
Cardinalidade: 1..1

Campo: vAliq
Descrição: Alíquota do ISSQN
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vAliq
Cardinalidade: 1..1

Campo: vISSQN
Descrição: Valor do ISSQN
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: - 72=Operação de Aquisição com Suspensão
- 73=Operação de Aquisição a Alíquota Zero
- 74=Operação de Aquisição
- 75=Operação de Aquisição por Substituição Tributária
- 98=Outras Operações de Entrada
- 99=Outras Operações
Regras/observações: 72=Operação de Aquisição com Suspensão;
73=Operação de Aquisição a Alíquota Zero;
74=Operação de Aquisição; sem Incidência da
Contribuição;
75=Operação de Aquisição por Substituição Tributária;
98=Outras Operações de Entrada;
99=Outras Operações;
percentual.
valor.
Substituição Tributária em percentual.
Substituição Tributária em valor.
há a prestação de serviços sujeitos ao ISSQN e
fornecimento de peças sujeitas ao ICMS.
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vISSQN
Cardinalidade: 1..1

Campo: cMunFG
Descrição: Código do município de ocorrência do fato gerador do
ISSQN
Obrigatoriedade: Condicional (Informar o município de ocorrência do fato gerador do
ISSQN. Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão
Geral,Tabela de UF, Município e País).
Nota 1: Não vincular com o município do fato gerador de
ICMS (id:B12), ou com o município do emitente (id:C10) ou
do destinatário (id:E10).
Nota 2: Pode ser informado 9999999 se a prestação de
serviço for no Exterior.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o município de ocorrência do fato gerador do
ISSQN. Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão
Geral,Tabela de UF, Município e País).
Nota 1: Não vincular com o município do fato gerador de
ICMS (id:B12), ou com o município do emitente (id:C10) ou
do destinatário (id:E10).
Nota 2: Pode ser informado 9999999 se a prestação de
serviço for no Exterior.
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/cMunFG
Cardinalidade: 1..1

Campo: cListServ
Descrição: Item da Lista de Serviços
Obrigatoriedade: Condicional (Informar o Item da lista de serviços em que se classifica o
serviço no padrão ABRASF (Formato: NN.NN).)
Tipo/Formato: Ele=E; Tipo=C; Formato=NN.NN).
Tamanho: 5
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o Item da lista de serviços em que se classifica o
serviço no padrão ABRASF (Formato: NN.NN).
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/cListServ
Cardinalidade: 1..1

Campo: vDeducao
Descrição: Valor dedução para redução da Base de Cálculo
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vDeducao
Cardinalidade: 0..1

Campo: vOutro
Descrição: Valor outras retenções
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor declaratório
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vOutro
Cardinalidade: 0..1

Campo: vDescIncond
Descrição: Valor desconto incondicionado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vDescIncond
Cardinalidade: 0..1

Campo: vDescCond
Descrição: Valor desconto condicionado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vDescCond
Cardinalidade: 0..1

Campo: vISSRet
Descrição: Valor retenção ISS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor declaratório
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/vISSRet
Cardinalidade: 0..1

Campo: indISS
Descrição: Indicador da exigibilidade do ISS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 1=Exigível, 2=Não incidência
- 3=Isenção
- 4=Exportação
- 5=Imunidade
- 6=Exigibilidade Suspensa por Decisão
- 7=Exigibilidade Suspensa por Processo
Regras/observações: 1=Exigível, 2=Não incidência; 3=Isenção; 4=Exportação;
5=Imunidade; 6=Exigibilidade Suspensa por Decisão
Judicial; 7=Exigibilidade Suspensa por Processo
Administrativo;
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/indISS
Cardinalidade: 1..1

Campo: cServico
Descrição: Código do serviço prestado dentro do município
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/cServico
Cardinalidade: 0..1

Campo: cMun
Descrição: Código do Município de incidência do imposto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tabela do IBGE. Informar "9999999" para serviço fora do
País.
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/cMun
Cardinalidade: 0..1

Campo: cPais
Descrição: Código do País onde o serviço foi prestado
Obrigatoriedade: Condicional (Tabela do BACEN. Infomar somente se o município da
prestação do serviço for "9999999".)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Tabela do BACEN. Infomar somente se o município da
prestação do serviço for "9999999".
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/cPais
Cardinalidade: 0..1

Campo: nProcesso
Descrição: Número do processo judicial ou administrativo de
suspensão da exigibilidade
Obrigatoriedade: Condicional (Informar somente quando declarada a suspensão da
exigibilidade do ISSQN.)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 30
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar somente quando declarada a suspensão da
exigibilidade do ISSQN.
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/nProcesso
Cardinalidade: 0..1

Campo: indIncentivo
Descrição: Indicador de incentivo Fiscal
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 1=Sim
- 2=Não
Regras/observações: 1=Sim; 2=Não;
Onde aparece (caminho): NFe/infNFe/det/imposto/ISSQN/indIncentivo
Cardinalidade: 1..1


### impostoDevol

Campo: impostoDevol
Descrição: Informação do Imposto devolvido
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Observação: O motivo da devolução deverá ser informado
pela empresa no campo de Informações Adicionais do
Produto (tag:infAdProd).
Onde aparece (caminho): NFe/infNFe/det/impostoDevol
Cardinalidade: 0..1

Campo: pDevol
Descrição: Percentual da mercadoria devolvida
Obrigatoriedade: Condicional (Observação: O valor máximo deste percentual é 100%, no
caso de devolução total da mercadoria.)
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Observação: O valor máximo deste percentual é 100%, no
caso de devolução total da mercadoria.
Onde aparece (caminho): NFe/infNFe/det/impostoDevol/pDevol
Cardinalidade: 1..1

Campo: IPI
Descrição: Informação do IPI devolvido
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/impostoDevol/IPI
Cardinalidade: 1..1


### IPI (ID: UA03, Pai: UA01)

Campo: IPI
Descrição: Informação do IPI devolvido
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/impostoDevol/IPI
Cardinalidade: 1..1

Campo: vIPIDevol
Descrição: Valor do IPI devolvido
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/det/impostoDevol/IPI/vIPIDevol
Cardinalidade: 1..1


### total

Campo: total
Descrição: Grupo Totais da NF-e
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: O grupo de valores totais da NF-e deve ser informado com
o somatório do campo correspondente dos itens.
Onde aparece (caminho): NFe/infNFe/total
Cardinalidade: 1..1

Campo: ICMSTot
Descrição: Grupo Totais referentes ao ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ICMSTot
Cardinalidade: 1..1

Campo: ISSQNtot
Descrição: Grupo Totais referentes ao ISSQN
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot
Cardinalidade: 0..1

Campo: retTrib
Descrição: Grupo Retenções de Tributos
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib
Cardinalidade: 0..1


### ICMSTot

Campo: ICMSTot
Descrição: Grupo Totais referentes ao ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ICMSTot
Cardinalidade: 1..1


### ISSQNtot

Campo: ISSQNtot
Descrição: Grupo Totais referentes ao ISSQN
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot
Cardinalidade: 0..1

Campo: vServ
Descrição: Valor total dos Serviços sob não- incidência ou não
tributados pelo ICMS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vServ
Cardinalidade: 0..1

Campo: vBC
Descrição: Valor total Base de Cálculo do ISS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vBC
Cardinalidade: 0..1

Campo: vISS
Descrição: Valor total do ISS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vISS
Cardinalidade: 0..1

Campo: vPIS
Descrição: Valor total do PIS sobre serviços
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vPIS
Cardinalidade: 0..1

Campo: vCOFINS
Descrição: Valor total da COFINS sobre serviços
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vCOFINS
Cardinalidade: 0..1

Campo: dCompet
Descrição: Data da prestação do serviço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N; Formato=“AAAA-MM-DD”
Tamanho: 8
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/dCompet
Cardinalidade: 1..1

Campo: vDeducao
Descrição: Valor total dedução para redução da Base de Cálculo
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vDeducao
Cardinalidade: 0..1

Campo: vOutro
Descrição: Valor total outras retenções
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor declaratório
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vOutro
Cardinalidade: 0..1

Campo: vDescIncond
Descrição: Valor total desconto incondicionado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vDescIncond
Cardinalidade: 0..1

Campo: vDescCond
Descrição: Valor total desconto condicionado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vDescCond
Cardinalidade: 0..1

Campo: vISSRet
Descrição: Valor total retenção ISS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/vISSRet
Cardinalidade: 0..1

Campo: cRegTrib
Descrição: Código do Regime Especial de Tributação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 1=Microempresa Municipal
- 2=Estimativa
- 3=Sociedade de
- 4=Cooperativa
- 5=Microempresário Individual (MEI)
- 6=Microempresário e
Regras/observações: 1=Microempresa Municipal; 2=Estimativa; 3=Sociedade de
Profissionais; 4=Cooperativa;
5=Microempresário Individual (MEI); 6=Microempresário e
Empresa de Pequeno Porte
Onde aparece (caminho): NFe/infNFe/total/ISSQNtot/cRegTrib
Cardinalidade: 0..1


### retTrib

Campo: retTrib
Descrição: Grupo Retenções de Tributos
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib
Cardinalidade: 0..1

Campo: vRetPIS
Descrição: Valor Retido de PIS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vRetPIS
Cardinalidade: 0..1

Campo: vRetCOFINS
Descrição: Valor Retido de COFINS
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vRetCOFINS
Cardinalidade: 0..1

Campo: vRetCSLL
Descrição: Valor Retido de CSLL
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vRetCSLL
Cardinalidade: 0..1

Campo: vBCIRRF
Descrição: Base de Cálculo do IRRF
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vBCIRRF
Cardinalidade: 0..1

Campo: vIRRF
Descrição: Valor Retido do IRRF
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vIRRF
Cardinalidade: 0..1

Campo: vBCRetPrev
Descrição: Base de Cálculo da Retenção da Previdência Social
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vBCRetPrev
Cardinalidade: 0..1

Campo: vRetPrev
Descrição: Valor da Retenção da Previdência Social
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/total/retTrib/vRetPrev
Cardinalidade: 0..1


### transp

Campo: transp
Descrição: Grupo Informações do Transporte
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp
Cardinalidade: 1..1

Campo: modFrete
Descrição: Modalidade do frete
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=Contratação do Frete por conta do Remetente (CIF)
- 1=Contratação do Frete por conta do Destinatário (FOB)
- 2=Contratação do Frete por conta de Terceiros
- 3=Transporte Próprio por conta do Remetente
- 4=Transporte Próprio por conta do Destinatário
- 9=Sem Ocorrência de Transporte.
Regras/observações: 0=Contratação do Frete por conta do Remetente (CIF);
1=Contratação do Frete por conta do Destinatário (FOB);
2=Contratação do Frete por conta de Terceiros;
3=Transporte Próprio por conta do Remetente;
4=Transporte Próprio por conta do Destinatário;
9=Sem Ocorrência de Transporte.
(Atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/transp/modFrete
Cardinalidade: 1..1

Campo: transporta
Descrição: Grupo Transportador
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta
Cardinalidade: 0..1

Campo: retTransp
Descrição: Grupo Retenção ICMS transporte
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp
Cardinalidade: 0..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CG; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Transporte por Veículo, Vagão ou Balsa.
Onde aparece (caminho): NFe/infNFe/transp
Cardinalidade: 0..1

Campo: vol
Descrição: Grupo Volumes
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/transp/vol
Cardinalidade: 0..5000

Campo: vagao
Descrição: Identificação do vagão
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CE; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/transp/vagao
Cardinalidade: 0..1

Campo: balsa
Descrição: Identificação da balsa
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CE; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/transp/balsa
Cardinalidade: 0..1


### transporta

Campo: transporta
Descrição: Grupo Transportador
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ do Transportador
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Preencher os zeros não significativos.
Onde aparece (caminho): NFe/infNFe/transp/transporta/CNPJ
Cardinalidade: 0..1

Campo: CPF
Descrição: CPF do Transportador
Obrigatoriedade: Opcional
Tipo/Formato: Ele=CE; Tipo=N
Tamanho: 11
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta/CPF
Cardinalidade: 0..1

Campo: xNome
Descrição: Razão Social ou nome
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta/xNome
Cardinalidade: 0..1

Campo: IE
Descrição: Inscrição Estadual do Transportador
Obrigatoriedade: Condicional (Informar:
- Inscrição Estadual do transportador contribuinte do ICMS,
sem caracteres de formatação (ponto, barra, hífen, etc.);
- Literal “ISENTO” para transportador isento de inscrição no
cadastro de contribuintes ICMS;
- Não informar a tag para não contribuinte do ICMS,
A UF deve ser informada se informado uma IE. (v2.0))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2 - 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar:
- Inscrição Estadual do transportador contribuinte do ICMS,
sem caracteres de formatação (ponto, barra, hífen, etc.);
- Literal “ISENTO” para transportador isento de inscrição no
cadastro de contribuintes ICMS;
- Não informar a tag para não contribuinte do ICMS,
A UF deve ser informada se informado uma IE. (v2.0)
Onde aparece (caminho): NFe/infNFe/transp/transporta/IE
Cardinalidade: 0..1

Campo: xEnder
Descrição: Endereço Completo
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta/xEnder
Cardinalidade: 0..1

Campo: xMun
Descrição: Nome do município
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/transporta/xMun
Cardinalidade: 0..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Condicional (A UF deve ser informada se informado uma IE. (v2.0).
Informar "EX" para Exterior.)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: A UF deve ser informada se informado uma IE. (v2.0).
Informar "EX" para Exterior.
Onde aparece (caminho): NFe/infNFe/transp/transporta/UF
Cardinalidade: 0..1


### retTransp

Campo: retTransp
Descrição: Grupo Retenção ICMS transporte
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp
Cardinalidade: 0..1

Campo: vServ
Descrição: Valor do Serviço
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp/vServ
Cardinalidade: 1..1

Campo: vBCRet
Descrição: BC da Retenção do ICMS
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp/vBCRet
Cardinalidade: 1..1

Campo: pICMSRet
Descrição: Alíquota da Retenção
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 3v2-4
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp/pICMSRet
Cardinalidade: 1..1

Campo: vICMSRet
Descrição: Valor do ICMS Retido
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/retTransp/vICMSRet
Cardinalidade: 1..1

Campo: CFOP
Descrição: CFOP
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 4
Valores válidos/domínio: Não informado no PDF
Regras/observações: CFOP de Serviço de Transporte (Seção 8.10 do MOC – Visão
Geral,).
Onde aparece (caminho): NFe/infNFe/transp/retTransp/CFOP
Cardinalidade: 1..1

Campo: cMunFG
Descrição: Código do município de ocorrência do fato gerador do
ICMS do transporte
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Utilizar a Tabela do IBGE (Seção 8.2 do MOC – Visão Geral,
Tabela de UF, Município e País)
Onde aparece (caminho): NFe/infNFe/transp/retTransp/cMunFG
Cardinalidade: 1..1


### veicTransp

Campo: veicTransp
Descrição: Grupo Veículo Transporte
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o veículo trator (v2.0)
Onde aparece (caminho): NFe/infNFe/transp/veicTransp
Cardinalidade: 0..1

Campo: placa
Descrição: Placa do Veículo
Obrigatoriedade: Condicional (Informar em um dos seguintes formatos: XXX9999, XXX999,
XX9999 ou XXXX999. Informar a placa em informações
complementares quando a placa do veículo tiver lei de
formação diversa. (NT 2011/005))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar em um dos seguintes formatos: XXX9999, XXX999,
XX9999 ou XXXX999. Informar a placa em informações
complementares quando a placa do veículo tiver lei de
formação diversa. (NT 2011/005)
Onde aparece (caminho): NFe/infNFe/transp/veicTransp/placa
Cardinalidade: 1..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Condicional (Informar "EX" se Exterior.)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar "EX" se Exterior.
Onde aparece (caminho): NFe/infNFe/transp/veicTransp/UF
Cardinalidade: 1..1

Campo: RNTC
Descrição: Registro Nacional de Transportador de Carga (ANTT)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/veicTransp/RNTC
Cardinalidade: 0..1


### reboque

Campo: reboque
Descrição: Grupo Reboque
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os reboques/Dolly (v2.0)
Onde aparece (caminho): NFe/infNFe/transp/reboque
Cardinalidade: 0..5

Campo: placa
Descrição: Placa do Veículo
Obrigatoriedade: Condicional (Informar em um dos seguintes formatos: XXX9999, XXX999,
XX9999 ou XXXX999. Informar a placa em informações
complementares quando a placa do veículo tiver lei de
formação diversa. (NT 2011/005))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar em um dos seguintes formatos: XXX9999, XXX999,
XX9999 ou XXXX999. Informar a placa em informações
complementares quando a placa do veículo tiver lei de
formação diversa. (NT 2011/005)
Onde aparece (caminho): NFe/infNFe/transp/reboque/placa
Cardinalidade: 1..1

Campo: UF
Descrição: Sigla da UF
Obrigatoriedade: Condicional (Informar "EX" se Exterior.)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar "EX" se Exterior.
Onde aparece (caminho): NFe/infNFe/transp/reboque/UF
Cardinalidade: 1..1

Campo: RNTC
Descrição: Registro Nacional de Transportador de Carga (ANTT)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/reboque/RNTC
Cardinalidade: 0..1


### vol

Campo: vol
Descrição: Grupo Volumes
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/transp/vol
Cardinalidade: 0..5000

Campo: qVol
Descrição: Quantidade de volumes transportados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1 - 15
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/qVol
Cardinalidade: 0..1

Campo: esp
Descrição: Espécie dos volumes transportados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/esp
Cardinalidade: 0..1

Campo: marca
Descrição: Marca dos volumes transportados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 -60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/marca
Cardinalidade: 0..1

Campo: nVol
Descrição: Numeração dos volumes transportados
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/nVol
Cardinalidade: 0..1

Campo: pesoL
Descrição: Peso Líquido (em kg)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/pesoL
Cardinalidade: 0..1

Campo: pesoB
Descrição: Peso Bruto (em kg)
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 12v3
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/transp/vol/pesoB
Cardinalidade: 0..1

Campo: lacres
Descrição: Grupo Lacres
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/transp/vol/lacres
Cardinalidade: 0..5000


### cobr

Campo: cobr
Descrição: Grupo Cobrança
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr
Cardinalidade: 0..1

Campo: fat
Descrição: Grupo Fatura
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat
Cardinalidade: 0..1

Campo: dup
Descrição: Grupo Parcelas
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004) (Grupo atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/cobr/dup
Cardinalidade: 0..120


### fat

Campo: fat
Descrição: Grupo Fatura
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat
Cardinalidade: 0..1

Campo: nFat
Descrição: Número da Fatura
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat/nFat
Cardinalidade: 0..1

Campo: vOrig
Descrição: Valor Original da Fatura
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat/vOrig
Cardinalidade: 0..1

Campo: vDesc
Descrição: Valor do desconto
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat/vDesc
Cardinalidade: 0..1

Campo: vLiq
Descrição: Valor Líquido da Fatura
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/cobr/fat/vLiq
Cardinalidade: 0..1


### dup

Campo: dup
Descrição: Grupo Parcelas
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2011/004) (Grupo atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/cobr/dup
Cardinalidade: 0..120

Campo: nDup
Descrição: Número da Parcela
Obrigatoriedade: Condicional (Obrigatória informação do número de parcelas com 3
algarismos, sequenciais e consecutivos.
Ex.: “001”,”002”,”003”,...
Observação: este padrão de preenchimento será
Obrig.atório somente a partir de 03/09/2018)
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatória informação do número de parcelas com 3
algarismos, sequenciais e consecutivos.
Ex.: “001”,”002”,”003”,...
Observação: este padrão de preenchimento será
Obrig.atório somente a partir de 03/09/2018
Onde aparece (caminho): NFe/infNFe/cobr/dup/nDup
Cardinalidade: 0..1

Campo: dVenc
Descrição: Data de vencimento
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=D; Formato=“AAAA-MM-DD”. Obrigatória a informação da
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Formato: “AAAA-MM-DD”. Obrigatória a informação da
Onde aparece (caminho): NFe/infNFe/cobr/dup/dVenc
Cardinalidade: 0..1

Campo: vDup
Descrição: Valor da Parcela
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2 (
Valores válidos/domínio: Não informado no PDF
Regras/observações: NT 2012/003)
Onde aparece (caminho): NFe/infNFe/cobr/dup/vDup
Cardinalidade: 1..1


### lacres

Campo: lacres
Descrição: Grupo Lacres
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/transp/vol/lacres
Cardinalidade: 0..5000

Campo: nLacre
Descrição: Número dos Lacres
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/nLacre
Cardinalidade: 1..1


### pag

Campo: pag
Descrição: Grupo de Informações de Pagamento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: - 90=Sem Pagamento.
Regras/observações: Obrig.atório o preenchimento do Grupo Informações de
Pagamento para NF-e e NFC-e. Para as notas com
finalidade de Ajuste ou Devolução o
campo Meio de Pagamento deve ser preenchido com
90=Sem Pagamento.
Onde aparece (caminho): NFe/infNFe/pag
Cardinalidade: 1..1

Campo: detPag
Descrição: Grupo Detalhamento do Pagamento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/pag/detPag
Cardinalidade: 1..100

Campo: vTroco
Descrição: Valor do troco
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor do troco
(Incluído na NT2016.002)
Onde aparece (caminho): NFe/infNFe/pag/vTroco
Cardinalidade: 0..1


### detPag

Campo: detPag
Descrição: Grupo Detalhamento do Pagamento
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/pag/detPag
Cardinalidade: 1..100

Campo: card
Descrição: Grupo de Cartões
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/pag/detPag/card
Cardinalidade: 0..1


### card

Campo: card
Descrição: Grupo de Cartões
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/pag/detPag/card
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ da instituição de pagamento
Obrigatoriedade: Condicional (Informar o CNPJ da instituição de pagamento, adquirente
ou subadquirente. Caso o pagamento seja processado pelo
intermediador da transação, informar o CNPJ deste
(Atualizado na NT 2020.006))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ da instituição de pagamento, adquirente
ou subadquirente. Caso o pagamento seja processado pelo
intermediador da transação, informar o CNPJ deste
(Atualizado na NT 2020.006)
Onde aparece (caminho): NFe/infNFe/pag/detPag/card/CNPJ
Cardinalidade: 0..1

Campo: tBand
Descrição: Bandeira da operadora de cartão de crédito e/ou débito
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 2
Valores válidos/domínio: - 01=Visa
- 02=Mastercard
- 03=American Express
- 04=Sorocred
- 05=Diners Club
- 06=Elo
- 07=Hipercard
- 08=Aura
- 09=Cabal
- 99=Outros
Regras/observações: 01=Visa
02=Mastercard
03=American Express
04=Sorocred
05=Diners Club
06=Elo
07=Hipercard
08=Aura
09=Cabal
99=Outros
(Atualizado na NT2016.002)
Onde aparece (caminho): NFe/infNFe/pag/detPag/card/tBand
Cardinalidade: 0..1

Campo: cAut
Descrição: Número de autorização da operação cartão de crédito
e/ou débito
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1-20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Identifica o número da autorização da transação da
operação com cartão de crédito e/ou débito
Onde aparece (caminho): NFe/infNFe/pag/detPag/card/cAut
Cardinalidade: 0..1


### infIntermed

Campo: infIntermed
Descrição: Grupo de Informações do Intermediador da Transação
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Obrigatório o preenchimento do Grupo de Informações
Onde aparece (caminho): NFe/infNFe/infIntermed
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ do Intermediador da Transação (agenciador,
plataforma de delivery, marketplace e similar) de serviços e
de negócios.
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ do Intermediador da Transação
(agenciador, plataforma de delivery, marketplace e
similar) de serviços e de negócios.
Onde aparece (caminho): NFe/infNFe/infIntermed/CNPJ
Cardinalidade: 1..1

Campo: idCadIntTran
Descrição: Identificador cadastrado no intermediador
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=R; Tipo=C
Tamanho: 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Nome do usuário ou identificação do perfil do vendedor
no site do intermediador (agenciador, plataforma de
delivery, marketplace e similar) de serviços e de negócios.
Onde aparece (caminho): NFe/infNFe/infIntermed/idCadIntTran
Cardinalidade: 1..1


### infAdic

Campo: infAdic
Descrição: Grupo de Informações Adicionais
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/infAdic
Cardinalidade: 0..1

Campo: infAdFisco I
Descrição: nformações Adicionais de Interesse do Fisco
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 2000
Valores válidos/domínio: Não informado no PDF
Regras/observações: (v2.0)
Onde aparece (caminho): NFe/infNFe/infAdic/infAdFisco I
Cardinalidade: 0..1

Campo: infCpl I
Descrição: nformações Complementares de interesse do Contribuinte
Obrigatoriedade: Condicional (do Intermediador da Transação nos casos de “operação
não presencial pela internet em site de terceiros
(intermediadores) (Incluído na NT2020.006))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 5000
Valores válidos/domínio: Não informado no PDF
Regras/observações: do Intermediador da Transação nos casos de “operação
não presencial pela internet em site de terceiros
(intermediadores) (Incluído na NT2020.006)
Onde aparece (caminho): NFe/infNFe/infAdic/infCpl I
Cardinalidade: 0..1

Campo: obsCont
Descrição: Grupo Campo de uso livre do contribuinte
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo de uso livre do contribuinte, Informar o nome do
campo no atributo xCampo e o conteúdo do campo no
xTexto
Onde aparece (caminho): NFe/infNFe/infAdic/obsCont
Cardinalidade: 0..10

Campo: obsFisco
Descrição: Grupo Campo de uso livre do Fisco
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo de uso livre do Fisco. Informar o nome do campo
no atributo xCampo e o conteúdo do campo no xTexto
Onde aparece (caminho): NFe/infNFe/infAdic/obsFisco
Cardinalidade: 0..10

Campo: procRef
Descrição: Grupo Processo referenciado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/infAdic/procRef
Cardinalidade: 0..100


### exporta

Campo: exporta
Descrição: Grupo Exportação
Obrigatoriedade: Condicional (Informar apenas na exportação.)
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar apenas na exportação.
Onde aparece (caminho): NFe/infNFe/exporta
Cardinalidade: 0..1

Campo: UFSaidaPais
Descrição: Sigla da UF de Embarque ou de transposição de fronteira
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: N ão aceita o valor "EX".
Onde aparece (caminho): NFe/infNFe/exporta/UFSaidaPais
Cardinalidade: 1..1

Campo: xLocExporta
Descrição: Descrição do Local de Embarque ou de transposição de
fronteira
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Não informado no PDF
Onde aparece (caminho): NFe/infNFe/exporta/xLocExporta
Cardinalidade: 1..1

Campo: xLocDespacho
Descrição: Descrição do local de despacho
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação do Recinto Alfandegado
Onde aparece (caminho): NFe/infNFe/exporta/xLocDespacho
Cardinalidade: 0..1


### compra

Campo: compra
Descrição: Grupo Compra
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informação adicional de compra
Onde aparece (caminho): NFe/infNFe/compra
Cardinalidade: 0..1

Campo: xNEmp
Descrição: Nota de Empenho
Obrigatoriedade: Condicional (Identificação da Nota de Empenho, quando se tratar de
compras públicas (NT 2011/004))
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 22
Valores válidos/domínio: Não informado no PDF
Regras/observações: Identificação da Nota de Empenho, quando se tratar de
compras públicas (NT 2011/004)
Onde aparece (caminho): NFe/infNFe/compra/xNEmp
Cardinalidade: 0..1

Campo: xPed
Descrição: Pedido
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o pedido.
Onde aparece (caminho): NFe/infNFe/compra/xPed
Cardinalidade: 0..1

Campo: xCont
Descrição: Contrato
Obrigatoriedade: Opcional
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o contrato de compra
Onde aparece (caminho): NFe/infNFe/compra/xCont
Cardinalidade: 0..1


### cana

Campo: cana
Descrição: Grupo Cana
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações de registro aquisições de cana v2.0
Onde aparece (caminho): NFe/infNFe/cana
Cardinalidade: 0..1

Campo: safra
Descrição: Identificação da safra
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C; Formato="AAAA" ou "AAAA/AAAA".
Tamanho: 4 - 9
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a safra, no formato: "AAAA" ou "AAAA/AAAA".
v2.0
Onde aparece (caminho): NFe/infNFe/cana/safra
Cardinalidade: 1..1

Campo: ref
Descrição: Mês e ano de referência
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C; Formato="MM/AAAA". v2.0
Tamanho: 7
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o mês e ano de referência, no formato:
"MM/AAAA". v2.0
Onde aparece (caminho): NFe/infNFe/cana/ref
Cardinalidade: 1..1

Campo: forDia
Descrição: Grupo Fornecimento diário de cana
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os fornecimentos diários de cana v2.0
Onde aparece (caminho): NFe/infNFe/cana/forDia
Cardinalidade: 1..31

Campo: qTotMes
Descrição: Quantidade Total do Mês
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v10
Valores válidos/domínio: Não informado no PDF
Regras/observações: v2.0
Onde aparece (caminho): NFe/infNFe/cana/qTotMes
Cardinalidade: 1..1

Campo: qTotAnt
Descrição: Quantidade Total Anterior
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v10
Valores válidos/domínio: Não informado no PDF
Regras/observações: v2.0
Onde aparece (caminho): NFe/infNFe/cana/qTotAnt
Cardinalidade: 1..1

Campo: qTotGer
Descrição: Quantidade Total Geral
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v10
Valores válidos/domínio: Não informado no PDF
Regras/observações: v2.0
Onde aparece (caminho): NFe/infNFe/cana/qTotGer
Cardinalidade: 1..1

Campo: deduc
Descrição: Grupo Deduções – Taxas e Contribuições
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar as Deduções – Taxas e Contribuições v2.0
Onde aparece (caminho): NFe/infNFe/cana/deduc
Cardinalidade: 0..10

Campo: vFor
Descrição: Valor dos Fornecimentos
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor dos Fornecimentos v2.0
Onde aparece (caminho): NFe/infNFe/cana/vFor
Cardinalidade: 1..1

Campo: vTotDed
Descrição: Valor Total da Dedução
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor das deduções v2.0
Onde aparece (caminho): NFe/infNFe/cana/vTotDed
Cardinalidade: 1..1

Campo: vLiqFor
Descrição: Valor Líquido dos Fornecimentos
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: Valor Líquido dos Fornecimentos v2.0
Onde aparece (caminho): NFe/infNFe/cana/vLiqFor
Cardinalidade: 1..1


### obsCont

Campo: obsCont
Descrição: Grupo Campo de uso livre do contribuinte
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo de uso livre do contribuinte, Informar o nome do
campo no atributo xCampo e o conteúdo do campo no
xTexto
Onde aparece (caminho): NFe/infNFe/infAdic/obsCont
Cardinalidade: 0..10

Campo: xCampo
Descrição: Identificação do campo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=A; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Identificação do campo
Onde aparece (caminho): NFe/infNFe/infAdic/obsCont/@xCampo
Cardinalidade: 1..1

Campo: xTexto
Descrição: Conteúdo do campo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Conteúdo do campo
Onde aparece (caminho): NFe/infNFe/infAdic/obsCont/xTexto
Cardinalidade: 1..1


### obsFisco

Campo: obsFisco
Descrição: Grupo Campo de uso livre do Fisco
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Campo de uso livre do Fisco. Informar o nome do campo
no atributo xCampo e o conteúdo do campo no xTexto
Onde aparece (caminho): NFe/infNFe/infAdic/obsFisco
Cardinalidade: 0..10

Campo: xCampo
Descrição: Identificação do campo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=A; Tipo=C
Tamanho: 1 - 20
Valores válidos/domínio: Não informado no PDF
Regras/observações: Identificação do campo
Onde aparece (caminho): NFe/infNFe/infAdic/obsFisco/@xCampo
Cardinalidade: 1..1

Campo: xTexto
Descrição: Conteúdo do campo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Conteúdo do campo
Onde aparece (caminho): NFe/infNFe/infAdic/obsFisco/xTexto
Cardinalidade: 1..1


### procRef

Campo: procRef
Descrição: Grupo Processo referenciado
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: (NT 2012/003)
Onde aparece (caminho): NFe/infNFe/infAdic/procRef
Cardinalidade: 0..100

Campo: nProc
Descrição: Identificador do processo ou ato concessório
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Identificador do processo ou ato concessório
Onde aparece (caminho): NFe/infNFe/infAdic/procRef/nProc
Cardinalidade: 1..1

Campo: indProc
Descrição: Indicador da origem do processo
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 1
Valores válidos/domínio: - 0=SEFAZ
- 1=Justiça Federal
- 2=Justiça Estadual
- 3=Secex/RFB
- 9=Outros
Regras/observações: 0=SEFAZ;
1=Justiça Federal;
2=Justiça Estadual;
3=Secex/RFB;
9=Outros
Onde aparece (caminho): NFe/infNFe/infAdic/procRef/indProc
Cardinalidade: 1..1


### forDia

Campo: forDia
Descrição: Grupo Fornecimento diário de cana
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar os fornecimentos diários de cana v2.0
Onde aparece (caminho): NFe/infNFe/cana/forDia
Cardinalidade: 1..31

Campo: qtde
Descrição: Quantidade
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 11v10
Valores válidos/domínio: Não informado no PDF
Regras/observações: Quantidade em KG v2.0
Onde aparece (caminho): NFe/infNFe/cana/forDia/qtde
Cardinalidade: 1..1

Campo: dia
Descrição: Dia
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=A; Tipo=N
Tamanho: 1 - 2
Valores válidos/domínio: Não informado no PDF
Regras/observações: v2.0
Onde aparece (caminho): NFe/infNFe/cana/forDia/@dia
Cardinalidade: 1..1


### deduc

Campo: deduc
Descrição: Grupo Deduções – Taxas e Contribuições
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar as Deduções – Taxas e Contribuições v2.0
Onde aparece (caminho): NFe/infNFe/cana/deduc
Cardinalidade: 0..10

Campo: xDed
Descrição: Descrição da Dedução
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 1 - 60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a Descrição da Dedução v2.0
Onde aparece (caminho): NFe/infNFe/cana/deduc/xDed
Cardinalidade: 1..1

Campo: vDed
Descrição: Valor da Dedução
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 13v2
Valores válidos/domínio: Não informado no PDF
Regras/observações: v2.0
Onde aparece (caminho): NFe/infNFe/cana/deduc/vDed
Cardinalidade: 1..1


### infRespTec

Campo: infRespTec
Descrição: Informações do Responsável Técnico pela emissão do DF-
e
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo para informações do responsável técnico pelo
sistema de emissão do DF-e
Onde aparece (caminho): NFe/infNFe/infRespTec
Cardinalidade: 0..1

Campo: CNPJ
Descrição: CNPJ da pessoa jurídica responsável pelo sistema utilizado
na emissão do documento fiscal eletrônico
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o CNPJ da pessoa jurídica responsável pelo
sistema utilizado na emissão do documento fiscal
eletrônico.
Onde aparece (caminho): NFe/infNFe/infRespTec/CNPJ
Cardinalidade: 1..1

Campo: xContato
Descrição: Nome da pessoa a ser contatada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 2-60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o nome da pessoa a ser contatada na empresa
desenvolvedora do sistema utilizado na emissão do
documento fiscal eletrônico.
Onde aparece (caminho): NFe/infNFe/infRespTec/xContato
Cardinalidade: 1..1

Campo: email
Descrição: E-mail da pessoa jurídica a ser contatada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 6-60
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o e-mail da pessoa a ser contatada na empresa
desenvolvedora do sistema.
Onde aparece (caminho): NFe/infNFe/infRespTec/email
Cardinalidade: 1..1

Campo: fone
Descrição: Telefone da pessoa jurídica/física a ser contatada
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=N
Tamanho: 6-14
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar o telefone da pessoa a ser contatada na empresa
desenvolvedora do sistema. Preencher com o Código DDD
+ número do telefone.
Onde aparece (caminho): NFe/infNFe/infRespTec/fone
Cardinalidade: 1..1

Campo: -x-
Descrição: Sequência XML
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Grupo de informações do Código de Segurança do
Responsável Técnico - CSRT
Onde aparece (caminho): NFe/infNFe/infRespTec
Cardinalidade: 0..1


### infNFeSupl

Campo: infNFeSupl
Descrição: Informações suplementares da Nota Fiscal
Obrigatoriedade: Opcional
Tipo/Formato: Ele=G; Tipo=-
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informações suplementares da Nota Fiscal, não afetando
a assinatura digital. (NT 2015.002)
Onde aparece (caminho): NFe/infNFeSupl
Cardinalidade: 0..1

Campo: qrCode
Descrição: Texto com o QR-Code impresso no
DANFE NFC-e.
Obs.: URLs, por UF, utilizadas para consulta QR Code
acesse: http://nfce.encat.org/desenvolvedor/qrcode/
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 100-600
Valores válidos/domínio: Não informado no PDF
Regras/observações: Ver orientações de preenchimento na seção 3.3 deste
documento.
Onde aparece (caminho): NFe/infNFeSupl/qrCode
Cardinalidade: 1..1

Campo: urlChave
Descrição: Texto com a URL de consulta por chave de acesso a ser
impressa no DANFE NFC-e. Obs.: URLs, por UF, utilizadas
para consulta por chave de acesso acesse:
http://nfce.encat.org/consumidor-nfce/consulte-nota-
nfce/
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=E; Tipo=C
Tamanho: 21-85
Valores válidos/domínio: Não informado no PDF
Regras/observações: Informar a URL da “Consulta por chave de acesso da NFC-
e”. A mesma URL que deve estar informada no DANFE NFC-
e para consulta por chave de acesso.
Onde aparece (caminho): NFe/infNFeSupl/urlChave
Cardinalidade: 1..1


### Signature

Campo: Signature
Descrição: Assinatura XML da NF-e Segundo o Padrão XML Digital
Obrigatoriedade: Obrigatório
Tipo/Formato: Ele=G; Tipo=Não informado no PDF
Tamanho: Não informado no PDF
Valores válidos/domínio: Não informado no PDF
Regras/observações: Signature
Onde aparece (caminho): NFe/infNFe/Signature
Cardinalidade: 1..1



## Regras condicionais e dependências

Regras/condições extraídas principalmente das colunas **Observação** e da seção **3.2. Regras de preenchimento** do PDF.

### Condicionais por campo (extraídos das observações)

- Se/Condição para `serie` em `NFe/infNFe/ide/serie`: Série do Documento Fiscal, preencher com zeros na
- Se/Condição para `tpImp` em `NFe/infNFe/ide/tpImp`: 0=Sem geração de DANFE;
- Se/Condição para `tpEmis` em `NFe/infNFe/ide/tpEmis`: 1=Emissão normal (não em contingência);
- Se/Condição para `indPres` em `NFe/infNFe/ide/indPres`: 0=Não se aplica (por exemplo, Nota Fiscal complementar
- Se/Condição para `indIntermed` em `NFe/infNFe/ide/indIntermed`: 0=Operação sem intermediador (em site ou plataforma
- Se/Condição para `serie` em `NFe/infNFe/ide/NFref/refNF/serie`: Informar zero se não utilizada Série do documento fiscal.
- Se/Condição para `IE` em `NFe/infNFe/emit/IE`: Informar somente os algarismos, sem os caracteres de
- Se/Condição para `IEST` em `NFe/infNFe/emit/IEST`: IE do Substituto Tributário da UF de destino da mercadoria,
- Se/Condição para `CNAE` em `NFe/infNFe/emit/CNAE`: Campo Opcional. Pode ser informado quando a Inscrição
- Se/Condição para `CNPJ` em `NFe/infNFe/dest/CNPJ`: Informar o CNPJ ou o CPF do destinatário, preenchendo os
- Se/Condição para `idEstrangeiro` em `NFe/infNFe/dest/idEstrangeiro`: Informar esta tag no caso de operação com o exterior, ou
- Se/Condição para `IE` em `NFe/infNFe/dest/IE`: Campo opcional. Informar somente os algarismos, sem os
- Se/Condição para `ISUF` em `NFe/infNFe/dest/ISUF`: Obrig.atório, nas operações que se beneficiam de
- Se/Condição para `retirada` em `NFe/infNFe/retirada`: Informar somente se diferente do endereço do
- Se/Condição para `indIEDest` em `NFe/infNFe/dest/indIEDest`: 1=Contribuinte ICMS (informar a IE do destinatário);
- Se/Condição para `entrega` em `NFe/infNFe/entrega`: Informar somente se diferente do endereço destinatário.
- Se/Condição para `IE` em `NFe/infNFe/retirada/IE`: Informar somente os algarismos, sem os caracteres de
- Se/Condição para `cProd` em `NFe/infNFe/det/prod/cProd`: Preencher com CFOP, caso se trate de itens não
- Se/Condição para `NCM` em `NFe/infNFe/det/prod/NCM`: Obrigatória informação do NCM completo (8 dígitos).
- Se/Condição para `IE` em `NFe/infNFe/entrega/IE`: Informar somente os algarismos, sem os caracteres de
- Se/Condição para `EXTIPI` em `NFe/infNFe/det/prod/EXTIPI`: Preencher de acordo com o código EX da TIPI. Em caso de
- Se/Condição para `NVE` em `NFe/infNFe/det/prod/NVE`: Codificação opcional que detalha alguns NCM. Formato:
- Se/Condição para `vAFRMM` em `NFe/infNFe/det/prod/DI/vAFRMM`: A tag deve ser informada no caso da via de transporte
- Se/Condição para `detExport` em `NFe/infNFe/det/prod/detExport`: Informar apenas no Drawback e nas exportações
- Se/Condição para `chNFe` em `NFe/infNFe/det/prod/detExport/exportInd/chNFe`: NF-e recebida com fim específico de exportação
- Se/Condição para `qExport` em `NFe/infNFe/det/prod/detExport/exportInd/qExport`: A unidade de medida desta quantidade é a unidade de
- Se/Condição para `CNPJ` em `NFe/infNFe/det/prod/DI/CNPJ`: Obrigatória a informação no caso de importação por conta
- Se/Condição para `UFTerceiro` em `NFe/infNFe/det/prod/DI/UFTerceiro`: Obrigatória a informação no caso de importação por conta
- Se/Condição para `xPed` em `NFe/infNFe/det/prod/xPed`: Informação de interesse do emissor para controle do B2B.
- Se/Condição para `nItemPed` em `NFe/infNFe/det/prod/nItemPed`: Informação de interesse do emissor para controle do B2B.
- Se/Condição para `rastro` em `NFe/infNFe/det/prod/rastro`: Informar apenas quando se tratar de produto a ser
- Se/Condição para `dVal` em `NFe/infNFe/det/prod/rastro/dVal`: Formato: “AAAA-MM-DD” Informar o último dia do mês
- Se/Condição para `-x-` em `NFe/infNFe/det/prod`: Grupo opcional, somente um deles poderá ser informado:
- Se/Condição para `veicProd` em `NFe/infNFe/det/prod/veicProd`: Informar apenas quando se tratar de veículos novos
- Se/Condição para `VIN` em `NFe/infNFe/det/prod/veicProd/VIN`: Informa-se o veículo tem VIN (chassi) remarcado.
- Se/Condição para `med` em `NFe/infNFe/det/prod/med`: Informar apenas quando se tratar de medicamentos ou de
- Se/Condição para `arma` em `NFe/infNFe/det/prod/arma`: Informar apenas quando se tratar de armamento, permite
- Se/Condição para `cProdANVISA` em `NFe/infNFe/det/prod/med/cProdANVISA`: Utilizar o número do registro ANVISA
- Se/Condição para `comb` em `NFe/infNFe/det/prod/comb`: Informar apenas para operações com combustíveis
- Se/Condição para `CODIF` em `NFe/infNFe/det/prod/comb/CODIF`: Informar apenas quando a UF utilizar o CODIF (Sistema de
- Se/Condição para `qTemp` em `NFe/infNFe/det/prod/comb/qTemp`: Informar quando a quantidade faturada informada no
- Se/Condição para `ICMS` em `NFe/infNFe/det/imposto/ICMS`: Informar apenas um dos grupos de tributação do ICMS
- Se/Condição para `nBomba` em `NFe/infNFe/det/prod/comb/encerrante/nBomba`: Caso exista, informar o número da bomba utilizada.
- Se/Condição para `nRECOPI` em `NFe/infNFe/det/prod/nRECOPI`: Vide: Seção 8.5 do MOC – Visão Geral, Identificador RECOPI
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS00/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS00/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS10/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS10/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `vBCFCP` em `NFe/infNFe/det/imposto/ICMS/ICMS10/vBCFCP`: Informar o valor da Base de Cálculo do FCP
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMS10/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMS10/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `ICMS20` em `NFe/infNFe/det/imposto/ICMS/ICMS20`: Tributação com redução de base de cálculo
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS20/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/ICMS/ICMS20/CST`: 20=Com redução de base de cálculo
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS20/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `vICMSDeson` em `NFe/infNFe/det/imposto/ICMS/ICMS20/vICMSDeson`: Informar apenas nos motivos de desoneração
- Se/Condição para `motDesICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS20/motDesICMS`: Campo será preenchido quando o campo anterior estiver
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS30/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vBCFCP` em `NFe/infNFe/det/imposto/ICMS/ICMS20/vBCFCP`: Informar o valor da Base de Cálculo do FCP
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMS30/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vICMSDeson` em `NFe/infNFe/det/imposto/ICMS/ICMS30/vICMSDeson`: Informar apenas nos motivos de desoneração
- Se/Condição para `motDesICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS30/motDesICMS`: Campo será preenchido quando o campo anterior estiver
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMS30/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS40/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vICMSDeson` em `NFe/infNFe/det/imposto/ICMS/ICMS40/vICMSDeson`: Informar nas operações:
- Se/Condição para `motDesICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS40/motDesICMS`: Campo será preenchido quando o campo anterior estiver
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS51/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8;
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS51/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `vICMSOp` em `NFe/infNFe/det/imposto/ICMS/ICMS51/vICMSOp`: Valor como se não tivesse o diferimento
- Se/Condição para `pDif` em `NFe/infNFe/det/imposto/ICMS/ICMS51/pDif`: No caso de diferimento total, informar o percentual de
- Se/Condição para `vBCFCP` em `NFe/infNFe/det/imposto/ICMS/ICMS51/vBCFCP`: Informar o valor da Base de Cálculo do FCP
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS60/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vBCSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/vBCSTRet`: Valor da BC do ICMS ST cobrado anteriormente por ST
- Se/Condição para `pST` em `NFe/infNFe/det/imposto/ICMS/ICMS60/pST`: Deve ser informada a alíquota do cálculo do ICMS-ST, já
- Se/Condição para `vICMSSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/vICMSSTRet`: Valor do ICMS ST cobrado anteriormente por ST (v2.0). O
- Se/Condição para `vBCFCPSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMS40/vBCFCPSTRet`: Informar o valor da Base de Cálculo do FCP retido
- Se/Condição para `pRedBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/pRedBCEfet`: Percentual de redução, caso estivesse submetida ao regime
- Se/Condição para `vBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/vBCEfet`: Valor da base de cálculo que seria atribuída à operação
- Se/Condição para `pICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/pICMSEfet`: Alíquota do ICMS na operação a consumidor final, caso
- Se/Condição para `vICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMS60/vICMSEfet`: Obtido pelo produto do valor do campo pICMSEfet pelo
- Se/Condição para `ICMS70` em `NFe/infNFe/det/imposto/ICMS/ICMS70`: Tributação ICMS com redução de base de cálculo e
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS70/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/ICMS/ICMS70/CST`: 70=Com redução de base de cálculo e cobrança do ICMS
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS70/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `vBCFCP` em `NFe/infNFe/det/imposto/ICMS/ICMS70/vBCFCP`: Informar o valor da Base de Cálculo do FCP retido
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMS70/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vICMSDeson` em `NFe/infNFe/det/imposto/ICMS/ICMS70/vICMSDeson`: Informar apenas nos motivos de desoneração
- Se/Condição para `motDesICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS70/motDesICMS`: Campo será preenchido quando o campo anterior estiver
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMS70/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMS90/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS90/pICMS`: Alíquota do ICMS sem o FCP. Quando for o caso, informar a
- Se/Condição para `vBCFCP` em `NFe/infNFe/det/imposto/ICMS/ICMS90/vBCFCP`: Informar o valor da Base de Cálculo do FCP
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMS90/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vICMSDeson` em `NFe/infNFe/det/imposto/ICMS/ICMS90/vICMSDeson`: Informar apenas nos motivos de desoneração
- Se/Condição para `motDesICMS` em `NFe/infNFe/det/imposto/ICMS/ICMS90/motDesICMS`: Campo será preenchido quando o campo anterior estiver
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMS90/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSPart/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pBCOp` em `NFe/infNFe/det/imposto/ICMS/ICMSPart/pBCOp`: Percentual para determinação do valor da Base de Cálculo
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSST/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vICMSSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/vICMSSTRet`: Informar o valor do ICMS ST retido na UF remetente (v2.0)
- Se/Condição para `pST` em `NFe/infNFe/det/imposto/ICMS/ICMSST/pST`: Deve ser informada a alíquota do cálculo do ICMS-ST, já
- Se/Condição para `vBCFCPSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/vBCFCPSTRet`: Informar o valor da Base de Cálculo do FCP retido
- Se/Condição para `pRedBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/pRedBCEfet`: Percentual de redução, caso estivesse submetida ao regime
- Se/Condição para `vBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/vBCEfet`: Valor da base de cálculo que seria atribuída à operação
- Se/Condição para `pICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/pICMSEfet`: Alíquota do ICMS na operação a consumidor final, caso
- Se/Condição para `vICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSST/vICMSEfet`: Obtido pelo produto do valor do campo pICMSEfet pelo
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN101/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN102/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN201/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMSSN201/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMSSN201/vBCFCPST`: Informar o valor da Base de Cálculo do FCP
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN202/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `pICMSST` em `NFe/infNFe/det/imposto/ICMS/ICMSSN202/pICMSST`: Alíquota do ICMS ST sem o FCP. Quando for o caso,
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMSSN201/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vBCSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/vBCSTRet`: Valor da BC do ICMS ST cobrado anteriormente por ST
- Se/Condição para `vICMSSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/vICMSSTRet`: Valor do ICMS ST cobrado anteriormente por ST (v2.0). O
- Se/Condição para `vBCFCPSTRet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/vBCFCPSTRet`: Informar o valor da Base de Cálculo do FCP retido
- Se/Condição para `pRedBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/- x -/pRedBCEfet`: Percentual de redução, caso estivesse submetida ao regime
- Se/Condição para `vBCEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/- x -/vBCEfet`: Valor da base de cálculo que seria atribuída à operação
- Se/Condição para `pICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/- x -/pICMSEfet`: Alíquota do ICMS na operação a consumidor final, caso
- Se/Condição para `vICMSEfet` em `NFe/infNFe/det/imposto/ICMS/ICMSSN500/- x -/vICMSEfet`: Obtido pelo produto do valor do campo pICMSEfet pelo
- Se/Condição para `orig` em `NFe/infNFe/det/imposto/ICMS/ICMSSN900/orig`: 0 - Nacional, exceto as indicadas nos códigos 3, 4, 5 e 8; 1 -
- Se/Condição para `vBCFCPST` em `NFe/infNFe/det/imposto/ICMS/ICMSSN900/vBCFCPST`: Informar o valor da Base de Cálculo do FCP retido por
- Se/Condição para `vBCUFDest` em `NFe/infNFe/det/imposto/ICMSUFDest/vBCUFDest`: Valor da Base de Cálculo do ICMS na UF de destino.
- Se/Condição para `vBCFCPUFDest` em `NFe/infNFe/det/imposto/ICMSUFDest/vBCFCPUFDest`: Valor da Base de Cálculo do FCP na UF de destino. (Incluído
- Se/Condição para `pICMSUFDest` em `NFe/infNFe/det/imposto/ICMSUFDest/pICMSUFDest`: Alíquota adotada nas operações internas na UF de destino
- Se/Condição para `pICMSInter` em `NFe/infNFe/det/imposto/ICMSUFDest/pICMSInter`: Alíquota interestadual das UF envolvidas:
- Se/Condição para `IPI` em `NFe/infNFe/det/imposto/IPI`: Informar apenas quando o item for sujeito ao IPI
- Se/Condição para `IPITrib` em `NFe/infNFe/det/imposto/IPI/IPITrib`: Informar apenas um dos grupos O07 ou O08 com base
- Se/Condição para `-x-` em `NFe/infNFe/det/imposto/IPI/IPITrib`: Informar os campos O10 e O13 se o cálculo do IPI for por
- Se/Condição para `qUnid` em `NFe/qUnid`: Informar os campos O11 e O12 se o cálculo do IPI for de
- Se/Condição para `vUnid` em `NFe/vUnid`: Informar os campos O11 e O12 se o cálculo do IPI for de
- Se/Condição para `-x-` em `NFe/infNFe/det/imposto/IPI/IPITrib`: Informar os campos O11 e O12 se o cálculo do IPI for de
- Se/Condição para `vIPI` em `NFe/infNFe/det/imposto/IPI/IPITrib/vIPI`: Informar os campos O11 e O12 se o cálculo do IPI for de
- Se/Condição para `II` em `NFe/infNFe/det/imposto/II`: Informar apenas quando o item for sujeito ao II
- Se/Condição para `PIS` em `NFe/infNFe/det/imposto/PIS`: Informar apenas um dos grupos Q02, Q03, Q04 ou Q05
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/PIS/PISAliq/CST`: 01=Operação Tributável (base de cálculo = valor da
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/PIS/PISQtde/CST`: 03=Operação Tributável (base de cálculo = quantidade
- Se/Condição para `-x-` em `NFe/infNFe/det/imposto/PIS/PISOutr`: Informar os campos Q07 e Q08 se o cálculo do PIS em
- Se/Condição para `-x-` em `NFe/infNFe/det/imposto/PIS/PISOutr`: Informar os campos Q10 e Q11 se o cálculo do PIS for em
- Se/Condição para `COFINS` em `NFe/infNFe/det/imposto/COFINS`: Informar apenas um dos grupos S02, S03, S04 ou S04 com
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/COFINS/COFINSAliq/CST`: 01=Operação Tributável (base de cálculo = valor da
- Se/Condição para `CST` em `NFe/infNFe/det/imposto/COFINS/COFINSQtde/CST`: 03=Operação Tributável (base de cálculo = quantidade
- Se/Condição para `cMunFG` em `NFe/infNFe/det/imposto/ISSQN/cMunFG`: Informar o município de ocorrência do fato gerador do
- Se/Condição para `cListServ` em `NFe/infNFe/det/imposto/ISSQN/cListServ`: Informar o Item da lista de serviços em que se classifica o
- Se/Condição para `cPais` em `NFe/infNFe/det/imposto/ISSQN/cPais`: Tabela do BACEN. Infomar somente se o município da
- Se/Condição para `nProcesso` em `NFe/infNFe/det/imposto/ISSQN/nProcesso`: Informar somente quando declarada a suspensão da
- Se/Condição para `pDevol` em `NFe/infNFe/det/impostoDevol/pDevol`: Observação: O valor máximo deste percentual é 100%, no
- Se/Condição para `vIPIDevol` em `NFe/vIPIDevol`: Deve ser informado quando preenchido o Grupo Tributos
- Se/Condição para `IE` em `NFe/infNFe/transp/transporta/IE`: Informar:
- Se/Condição para `UF` em `NFe/infNFe/transp/transporta/UF`: A UF deve ser informada se informado uma IE. (v2.0).
- Se/Condição para `placa` em `NFe/infNFe/transp/veicTransp/placa`: Informar em um dos seguintes formatos: XXX9999, XXX999,
- Se/Condição para `UF` em `NFe/infNFe/transp/veicTransp/UF`: Informar "EX" se Exterior.
- Se/Condição para `placa` em `NFe/infNFe/transp/reboque/placa`: Informar em um dos seguintes formatos: XXX9999, XXX999,
- Se/Condição para `UF` em `NFe/infNFe/transp/reboque/UF`: Informar "EX" se Exterior.
- Se/Condição para `nDup` em `NFe/infNFe/cobr/dup/nDup`: Obrigatória informação do número de parcelas com 3
- Se/Condição para `CNPJ` em `NFe/infNFe/pag/detPag/card/CNPJ`: Informar o CNPJ da instituição de pagamento, adquirente
- Se/Condição para `infCpl I` em `NFe/infNFe/infAdic/infCpl I`: do Intermediador da Transação nos casos de “operação
- Se/Condição para `exporta` em `NFe/infNFe/exporta`: Informar apenas na exportação.
- Se/Condição para `xNEmp` em `NFe/infNFe/compra/xNEmp`: Identificação da Nota de Empenho, quando se tratar de

### Regras gerais de preenchimento (seção 3.2)

Trechos relevantes: fileciteturn1file0L4-L20

## Regras de validação e formatos

### Abreviações (como interpretar colunas do leiaute)

Trechos relevantes: fileciteturn1file1L14-L32

Resumo operacional (itens listados exatamente como no PDF):

- A - indica que o campo é um atributo do Elemento anterior;
- E - indica que o campo é um Elemento;
- CG - indica que o campo é um Elemento de Grupo que deriva de uma

### Dependência ICMS (exemplo do PDF)

Tabela do PDF indicando o preenchimento de campos do ICMS conforme o conteúdo do código de Tributação do ICMS (campo `N12`).

| ID | Campo | Descrição | 00 | 10 | 20 | 30 | 40 | 41 | 50 | 51 | 60 | 70 | 90 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| N11 | Orig | Origem da mercadoria | S | S | S | S | S | S | S | S | S | S | ? |
| N12 | CST | Tributação do ICMS | S | S | S | S | S | S | S | S | S | S | ? |
| N13 | modBC | Modalidade de determinação da BC do ICMS | S | S | S | N | N | N | N | ? | N | S | ? |
| N14 | pRedBC | Percentual da Redução de BC | N | N | S | N | N | N | N | ? | N | S | ? |
| N15 | vBC | Valor da BC do ICMS | S | S | S | N | N | N | N | ? | N | S | ? |
| N16 | pICMS | Alíquota do imposto | S | S | S | N | N | N | N | ? | N | S | ? |
| N17 | vICMS | Valor do ICMS | S | S | S | N | N | N | N | ? | N | S | ? |
| N18 | modBCST | Modalidade de determinação da BC do ICMS ST | N | S | N | S | N | N | N | N | N | S | ? |
| N19 | pMVAST | Percentual da margem de valor Adicionado do ICMS ST | N | S | N | S | N | N | N | N | N | S | ? |
| N20 | pRedBCST | Percentual da Redução de BC do ICMS ST | N | ? | N | ? | N | N | N | N | N | ? | ? |
| N21 | vBCST | Valor da BC do ICMS ST | N | S | N | S | N | N | N | N | S | S | ? |
| N22 | pICMSST | Alíquota do imposto do ICMS ST | N | S | N | S | N | N | N | N | N | S | ? |
| N23 | vICMSST | Valor do ICMS ST | N | S | N | S | N | N | N | N | S | S | ? |
| N24 | UFST | UF para qual é devido o ICMS ST | N | N | N | N | N | N | N | N | N | N | ? |
| N25 | pBCop | Percentual da BC operação própria | N | N | N | N | N | N | N | N | N | N | ? |
| N26 | vBCSTRet | Valor da BC do ICMS Retido Anteriormente | N | N | N | N | N | S | N | N | S | N | ? |
| N27 | vICMSSTRet | Valor do ICMS Retido Anteriormente | N | N | N | N | N | S | N | N | S | N | ? |
| N28 | motDesICMS | Motivo da desoneração do ICMS | N | N | N | N | N | N | N | N | N | N | ? |
| N31 | vBCSTDest | Valor da BC do ICMS ST da UF destino | N | N | N | N | N | S | N | N | N | N | N |
| N32 | vICMSSTDest | Valor do ICMS ST da UF destino | N | N | N | N | N | S | N | N | N | N | N |

### Lista de regras de validação (webservices) – tabelas extraídas do PDF

As tabelas abaixo foram extraídas do PDF e mantêm os títulos/colunas conforme possível.

### B. Identificação da NF-e
**Tabela (página 75)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| B02-10 | 55/65 | Código da UF do Emitente difere da UF do Web Service | Obrig. | 226 | Rej. | Rejeição: Código da UF do Emitente diverge da UF autorizadora |
| B02-20 | 55/65 | Código da UF do Emitente difere da UF da primeira NF-e do Lote<br>Observação: Esta validação tem sentido unicamente para a SEFAZ Virtual,<br>que deve evitar um Lote, com NF-e de diferentes UF. | Obrig. | 476 | Rej. | Rejeição: Código da UF diverge da UF da primeira NF-e do Lote |
| B03-10 | 55/65 | Verificar formação do cNF:<br>cNF não pode ser igual a 00000000, 11111111, 22222222, 33333333,<br>44444444, 55555555, 66666666, 77777777, 88888888, 99999999, 12345678,<br>23456789, 34567890, 45678901, 56789012, 67890123, 78901234, 89012345,<br>90123456, 01234567.<br>cNF não pode ser igual a nNF (id: B08). (NT 2019.001 v1.00, v1.50) | Obrig. | 897 | Rej. | Rejeição: Código numérico em formato inválido. |
| B06-10 | 65 | NFC-e não é aceita pela UF do Emitente | Obrig. | 702 | Rej. | Rejeição: NFC-e não é aceita pela UF do Emitente |
| B06-20 | 55/65 | Lote de documentos enviados só poderá conter NF-e ou NFC-e | Obrig. | 765 | Rej. | Rejeição: Lote só poderá conter NF-e ou NFC-e |
| B06-30 | 55 | Se a SEFAZ optar por ambientes separados de autorização:<br>– NFC-e enviada para ambiente de autorização da NF-e | Facul. | 450 | Rej. | Rejeição: Modelo da NF-e diferente de 55 |
| B06-40 | 65 | Se a SEFAZ optar por ambientes separados de autorização:<br>– NF-e enviada para ambiente de autorização da NFC-e | Facul. | 775 | Rej. | Rejeição: Modelo da NFC-e diferente de 65 |
| B09-10 | 55/65 | Data-Hora de Emissão posterior ao horário de recepção na SEFAZ.<br>Observação: Aceita uma tolerância de até 5 minutos, devido ao sincronismo<br>de horário do servidor da Empresa e o servidor da SEFAZ. | Obrig. | 703 | Rej. | Rejeição: Data-Hora de Emissão posterior ao horário de recebimento |
| B09-20 | 55 | NF-e com Tipo de Emissão = 1-Normal (ou 6-SVC-AN, 7-SVC-RS)<br>(NT2012.003):<br>– Data de Emissão ocorrida há mais de 30 dias (ou outro limite definido<br>pela SEFAZ)<br>Exceção 1: A critério da UF,a rejeição acima pode ser efetuada para qualquer<br>Tipo de Emissão.<br>Exceção 2: A critério da UF, pode ser aceita a NF-e com Data de Emissão<br>muito atrasada, desde que tenha sido emitida em contingência (tpEmis=2, 4,<br>5). Neste caso, a SEFAZ Autorizadora irá retornar cStat=”150- Autorizado Uso<br>da NF-e, autorização fora de prazo” (NT 2012.003). (NT 2015.002) | Obrig. | 228 | Rej. | Rejeição: Data de Emissão muito atrasada |
| B09-30 | 55 | Data de Emissão anterior ao início da autorização de NF-e na UF.<br>Observação:O início da operação da NF-e ocorreu em diferentes momentos,<br>conforme a UF (a primeira NF-e autorizada no País foi em 14/09/2006). (NT<br>2015.002) | Obrig. | 315 | Rej. | Rejeição: Data de Emissão anterior ao início da autorização de Nota Fiscal na<br>UF |

**Tabela (página 76)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| B09-40 | 65 | NFC-e com Tipo de Emissão=1-Normal (ou 3-SCAN, ou 6-SVC-AN, 7-SVC-RS) e<br>Data-Hora de Emissão com atraso superior a 5 minutos em relação ao<br>horário de recepção na SEFAZ.<br>Exceção 1: A critério da UF, a rejeição acima pode ser efetuada para qualquer<br>Tipo de Emissão.<br>Exceção 2: A critério da UF, pode ser aceita a NFC-e com Data de Emissão<br>muito atrasada, desde que tenham sido emitida em contingência (tpEmis=4,<br>9). A NFC-e transmitida para a SEFAZ Autorizadora após o prazo de 24 horas<br>deveretornar cStat=”150- Autorizado Uso da NF-e, autorização fora de<br>prazo”.<br>Observação 1: A emissão da NFC-e deve ocorrer de forma on-line, real-time,<br>com uma tolerância de até 5 minutos, devido ao sincronismo de horário do<br>servidor da Empresa e o servidor da SEFAZ Autorizadora. (NT 2015.002) | Obrig. | 704 | Rej. | Rejeição: NFC-e com Data-Hora de emissão atrasada |
| B09-50 | 65 | Data de Emissão anterior ao início da autorização de NFC-e na UF.<br>Observação:O início da operação da NFC-e ocorreu em diferentes momentos,<br>conforme a UF (a primeira NFC-e autorizada no País foi em 01/03/2013). (NT<br>2015.002) | Obrig. | 315 | Rej. | Rejeição: Data de Emissão anterior ao início da autorização de Nota Fiscal na<br>UF |
| B10-10 | 65 | NFC-e com data de entrada/saída. | Obrig. | 705 | Rej. | Rejeição: NFC-e com data de entrada/saída |
| B10-20 | 55 | Se informado Data de Entrada / Saída (dhSaiEnt):<br>– Data Entrada / Saída posterior a 30 dias da Data de Autorização | Facul. | 504 | Rej. | Rejeição: Data de Entrada/Saída posterior ao permitido |
| B10-30 | 55 | Se informado Data de Entrada / Saída (dhSaiEnt):<br>– Data Entrada / Saída anterior a 30 dias da Data de Autorização<br>Observação: Para as SEFAZ que aceitam NF-e emitida em contingência a mais<br>de 30 dias, esta rejeição deverá considerar tpEmi=1, 3, 6, 7 | Facul. | 505 | Rej. | Rejeição: Data de Entrada/Saída anterior ao permitido |
| B10-40 | 55 | Se informado Data de Entrada / Saída (tag:dhSaiEnt) para NF-e de Saída<br>(tag:tpNF=1):<br>– Data de Saída (dSaiEnt) menor que a Data de Emissão (dhEmi) | Facul. | 506 | Rej. | Rejeição: Data de Saída menor que a Data de Emissão |
| B11-10 | 65 | NFC-e para operação de entrada (tag:tpNF=0) | Obrig. | 706 | Rej. | Rejeição: NFC-e para operação de entrada |
| B11a-10 | 65 | NFC-e para operação interestadual ou com o exterior (tag:idDest<>1) | Obrig. | 707 | Rej. | Rejeição: NFC-e para operação interestadual ou com o exterior |
| B12-10 | 55/65 | Código do Município do Fato Gerador de ICMS inexistente (Tabela<br>Municípios IBGE) (NT 2015.002) | Obrig. | 270 | Rej. | Rejeição: Código Município do Fato Gerador de ICMS inexistente |
| B12-20 | 55/65 | Código do Município do Fato Gerador (2 primeiras posições) difere do Código<br>da UF do emitente | Obrig. | 271 | Rej. | Rejeição: Código Município do Fato Gerador: difere da UF do emitente |
| B21-10 | 65 | NFC-e com tipo de impressão diferente de 4 e 5 (tag:tpImp<> 4 e 5) | Obrig. | 709 | Rej. | Rejeição: NFC-e com formato de DANFE inválido |
| B21-20 | 55 | NF-e com tipo de impressão 4 ou 5 (tag:tpImp= 4 ou 5) | Obrig. | 710 | Rej. | Rejeição: NF-e com formato de DANFE inválido |
| B22-10 | 55 | NF-e com contingência off-line (tag:tpEmis=9) | Obrig. | 711 | Rej. | Rejeição: NF-e com contingência off-line |
| B22-20 | 65 | NFC-e com contingência off-line para a UF (tag:tpEmis=9 e UF não aceita este<br>tipo de contingência) | Facul. | 712 | Rej. | Rejeição: NFC-e com contingência off-line para a UF |
| B22-30 | 55/65 | Na autorização pela SEFAZ:<br>– não aceitar o conteúdo tpEmis=3-SCAN (NT 2010/004), 6-SVC-AN ou 7-<br>SVC-RS | Obrig. | 570 | Rej. | Rejeição: Tipo de Emissão 3, 6 ou 7 só é válido nas contingências SCAN/SVC |

**Tabela (página 77)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| B22-34 | 65 | Na autorização pela SEFAZ:<br>– rejeitar a NFC-e com opção de contingência inválida (tag:tpEmis=2, 4, 5)<br>Observação: A contingência EPEC (tag:tpEmis=4) poderá ser aceita, a critério<br>da UF. (NT 2015.002) | Facul. | 714 | Rej. | Rejeição: NFC-e com contingência inválida (tpEmis=2, 4 (a critério da UF) ou<br>5) |
| B22-60 | 55/65 | Na autorização pela SVC:<br>– não aceitar o conteúdo da tag tpEmis diferente de 6 para a SVC-AN ou 7<br>para a SVC-RS | Obrig. | 713 | Rej. | Rejeição: Tipo de Emissão diferente de 6 ou 7 para contingência da SVC<br>acessada |
| B22-70 | 65 | Na autorização pela SVC:<br>– não aceitar autorização de NFC-e | Obrig. | 783 | Rej. | Rejeição: NFC-e não é autorizada pela SVC |
| B23-10 | 55/65 | Chave de Acesso obtida pela concatenação dos campos correspondentes<br>com dígito verificador (DV) inválido | Obrig. | 253 | Rej. | Rejeição: Digito Verificador da chave de acesso composta inválida |
| B24-10 | 55/65 | Tipo do ambiente da NF-e difere do ambiente do Web Service | Obrig. | 252 | Rej. | Rejeição: Ambiente informado diverge do Ambiente de recebimento |
| B25-20 | 65 | NFC-e com finalidade diferente de normal (tag:finNFe <> 1) | Obrig. | 715 | Rej. | Rejeição: NFC-e com finalidade inválida |
| B25-30 | 55 | Se NF-e complementar (tag:finNFe=2):<br>– Não informado NF referenciada (NF-e, NFC-e, NF modelo 1) | Obrig. | 254 | Rej. | Rejeição: NF-e complementar não possui NF referenciada |
| B25-40 | 55 | Se NF-e complementar (tag:finNFe=2):<br>– NF referenciada com mais de uma ocorrência (NF-e, NFC-e, NF modelo 1) | Obrig. | 255 | Rej. | Rejeição: NF-e complementar possui mais de uma NF referenciada |
| B25-50 | 55 | Se NF-e complementar (tag:finNFe=2):<br>– CNPJ/CPF emitente da NF Referenciada difere do CNPJ/CPF emitente<br>desta NF-e (NF-e, NFC-e, NF modelo 1) (NT 2018.001) | Obrig. | 269 | Rej. | Rejeição: CNPJ/CPF Emitente da NF Complementar difere do CNPJ/CPF da<br>NF Referenciada |
| B25-60 | 55 | Se NF-e complementar (tag:finNFe=2):<br>– UF da NF-e referenciada diferente da UF do emitente (NF-e, NFC-e, NF<br>modelo 1) (NT 2013/003) | Facul. | 678 | Rej. | Rejeição: NF referenciada com UF diferente da NF-e complementar |
| B25-70 | 55 | Se NF-e de devolução de mercadoria (tag:finNFe=4):<br>– Não informado documento fiscal referenciado (NF-e, NFC-e, NF modelo 1,<br>NF Produtor, ECF)<br>Observação: não aplicar esta regra para os CFOP 1.201, 1.202, 1.410, 1.411,<br>5,921 e 6,921 (NT 2013/005 v 1.20) | Obrig. | 321 | Rej. | Rejeição: NF-e de devolução de mercadoria não possui documento fiscal<br>referenciado |
| B25a-10 | 65 | NFC-e para operação não destinada a Consumidor Final (tag:indFinal=0) | Obrig. | 716 | Rej. | Rejeição: NFC-e em operação não destinada a consumidor final |
| B25b-10 | 55 | NF-e com indicativo de NFC-e com entrega a domicílio (tag:indPres=4) | Obrig. | 794 | Rej. | Rejeição: NF-e com indicativo de NFC-e com entrega a domicílio |
| B25b-20 | 65 | NFC-e em uma operação não presencial (tag:indPres<>1 e 4) | Obrig. | 717 | Rej. | Rejeição: NFC-e em operação não presencial |
| B25b-30 | 65 | NFC-e com operação de entrega a domicílio, não permitida para a UF<br>(parametrizável). | Obrig. | 785 | Rej. | Rejeição: NFC-e com entrega a domicílio não permitida pela UF |
| B25b-40 | 55 | NF-e com indicativo de Operação presencial, fora do estabelecimento<br>(tag:indPres=5) e não informada campos refNFe (id:BA02) ou refNF (id:BA03)<br>(NT 2016.002) | Obrig. | 864 | Rej. | Rejeição: NF-e com indicativo de Operação presencial, fora do<br>estabelecimento e não informada NF referenciada |
| B25c-10 | 55/65 | Se Informado indicativo de presença, tag: indPres, IGUAL a 2, 3, 4 ou 9<br>- Obrigatório o preenchimento do campo Indicativo do Intermediador (tag:<br>indIntermed)<br>Observação: Regra de validação valida a partir de 01/02/2021 para<br>homologação e 01/09/2021 para produção | Obrig. | 434 | Rej. | Rejeição: NF-e sem indicativo do intermediador (Incluída na NT 2020.006) |

### BA. Documento Fiscal Referenciado
**Tabela (página 78)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| B25c-20 | 55/65 | Se Informado indicativo de presença, tag: indPres, DIFERENTE de 2, 3, 4 ou 9<br>- Proibido o preenchimento do campo Indicativo do Intermediador (tag:<br>indIntermed) | Obrig. | 435 | Rej. | Rejeição: NF-e não pode ter o indicativo do intermediador (Incluída na NT<br>2020.006) |
| B26-10 | 55/65 | Se Processo de Emissão pelo Contribuinte (procEmi<>1 e 2):<br>– Série da NF-e difere da faixa de 0-889 ou 920-969 (NT 2018.001) | Obrig. | 244 | Rej. | Rejeição: Processo de Emissão pelo Contribuinte incompatível com a Série<br>da NF |
| B26-20 | 55/65 | Se Processo de Emissão pelo Fisco (procEmi=1 ou 2):<br>- Série difere da faixa 890-919 (NF Avulsa) (NT 2018.001) | Obrig. | 451 | Rej. | Rejeição: Processo de Emissão pelo Fisco incompatível com a Série da NF |
| B26-30 | 55/65 | Se Processo de Emissão pelo Fisco (procEmi=1 ou 2):<br>- Tipo de Emissão difere de 1-Emissão Normal ou Emissão na SVC<br>(tpEmis<>1, 6 e 7) (NT 2018.001/ NT 2015.002) | Obrig. | 370 | Rej. | Rejeição: Processo de emissão pelo Fisco com Tipo de Emissão inválido |
| B26-40 | 55/65 | Se Processo de Emissão pelo Fisco (procEmi=1 ou 2):<br>- Certificado de Transmissão sem o CNPJ da SEFAZ para a UF (NT 2018.001) | Obrig. | 571 | Rej. | Rejeição: Processo de emissão pelo Fisco com Certificado de Transmissão<br>incompatível |
| B28-10 | 55/65 | Se emissão normal (tpEmis = 1-Normal):<br>– dhCont e xJust não devem ser informados | Obrig. | 556 | Rej. | Rejeição: Justificativa de entrada em contingência não deve ser informada<br>para tipo de emissão normal |
| B28-20 | 55/65 | Se emissão em contingência utilizando DPEC, formulário de segurança ou<br>contingência off-line (tpEmis = 2, 4, 5 ou 9):<br>– dhCont e xJust devem ser informados | Obrig. | 557 | Rej. | Rejeição: A Justificativa de entrada em contingência deve ser informada |
| B28-30 | 55/65 | Data de entrada em contingência não deve ser maior que a data de recepção<br>da NF-e (NT 2010/004).<br>Observação 1: Não considerar a Hora no caso da NF-e com versão inferior a<br>versão 3.0.<br>Observação 2: Aceita uma tolerância de até 5 minutos, devido ao<br>sincronismo de horário do servidor da Empresa e o servidor da SEFAZ. | Facul. | 558 | Rej. | Rejeição: Data de entrada em contingência posterior a data de recebimento |
| B28-40 | 55/65 | Data de entrada em contingência deve ser menor ou igual à data de emissão<br>– 30 dias (NT 2010/004)<br>Observação: Não considerar a Hora no caso da NF-e com versão inferior a<br>versão 3.0 | Facul. | 569 | Rej. | Rejeição: Data de entrada em contingência muito atrasada |

**Tabela (página 78)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| BA01-10 | 65 | NFC-e não pode referenciar outros documentos (tag:NFref) | Obrig. | 708 | Rej. | Rejeição: NFC-e não pode referenciar documento fiscal |
| BA02-10 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Dígito Verificador da Chave de Acesso inválido (NT 2015.002) | Facul. | 547 | Rej. | Rejeição: Chave de Acesso referenciada com Dígito Verificador<br>inválido[nOcor:nnn] |
| BA02-14 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Chave de Acesso referenciada com UF inválida (NT 2015.002) | Facul. | 522 | Rej. | R ejeição: Chave de Acesso referenciada com UF inválida[nOcor:nnn] |
| BA02-20 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Chave de Acesso referenciada com Ano Emissão < 06 ou > que o Ano<br>corrente (NT 2015.002) | Facul. | 524 | Rej. | R ejeição: Chave de Acesso referenciada com Ano-Mês inválido[nOcor:nnn] |
| BA02-24 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Chave de Acesso referenciada com Mês Emissão < 01 ou > 12 NT 2015.002) | Facul. | 524 | Rej. | Rejeição: Chave de Acesso referenciada com Ano-Mês inválido[nOcor:nnn] |

**Tabela (página 79)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| BA02-30 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Série = [0-909] e CNPJ zerado ou dígito inválido, ou<br>- Série = [910-969] e CPF zerado ou dígito inválido (NT 2018.001) | Facul. | 552 | Rej. | R ejeição: Chave de Acesso referenciada com CNPJ/CPF inválido[nOcor:nnn] |
| BA02-34 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Modelo da NF-e referenciada diferente de 55/65/59 (NT 2013/003) (NT<br>2015.002) | Facul. | 679 | Rej. | R ejeição: Chave de Acesso referenciada com Modelo inválido[nOcor:nnn] |
| BA02-40 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Chave de Acesso referenciada com Número zerado (NT 2015.002) | Facul. | 683 | Rej. | Rejeição: Chave de Acesso referenciada com Número inválido[nOcor:nnn] |
| BA02-44 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Verificar duplicidade da NF-e referenciada (duplicidade da tag refNFe) (NT<br>2013/003) (NT 2015.002) | Facul. | 680 | Rej. | R ejeição: Chave de Acesso referenciada em duplicidade na NF-e [nOcor:nnn] |
| BA02-50 | 55 | Se informada uma NF-e referenciada (tag:refNFe):<br>- Nota Fiscal referenciada com a mesma Chave de Acesso da Nota Fiscal atual<br>(NT 2015.002) | Obrig. | 316 | Rej. | Rejeição: Chave de Acesso referenciada com a mesma Chave de Acesso da<br>Nota Fiscal atual [nOcor:nnn] |
| BA03-10 | 55 | Se informada NF Modelo 1 ou NF Modelo 2 referenciada (tag:refNF):<br>- Verificar duplicidade de Nota Fiscal Modelo 1 ou 2 referenciada (mesmo<br>CNPJ, Modelo, Série, Número) (NT 2016.002) | Facul. | 681 | Rej. | Rejeição: Duplicidade de NF Modelo 1 referenciada (CNPJ, Modelo, Série e<br>Número) [nOcor: nnn] |
| BA05-10 | 55 | Se informada NF Modelo 1 referenciada (tag:refNF):<br>- NF modelo 1 referenciada emitida há mais de 20 anos da data atual ou com<br>data de emissão superior ao Ano-Mês atual (NT 2015.002) | Facul. | 317 | Rej. | Rejeição: NF modelo 1 referenciada com data de emissão inválida<br>[ nOcor:nnn] |
| BA06-10 | 55 | Se informada NF Modelo 1 referenciada (tag:refNF):<br>- CNPJ com zeros, nulo ou DV inválido | Facul. | 548 | Rej. | Rejeição: NF modelo 1 referenciada com data de emissão inválida<br>[nOcor:nnn] |
| BA10-10 | 55 | Se informada NF de Produtor referenciada (tag:refNFP):<br>- Verificar duplicidade de Nota Fiscal de Produtor referenciada (mesma IE,<br>Modelo, Série, Número) (NT 2013/003) (NT 2015.002) | Facul. | 682 | Rej. | Rejeição: Duplicidade de NF de Produtor referenciada (IE, Modelo, Série e<br>Número) [nOcor: 999] |
| BA10-20 | 55 | Contranota de Produtor sem Nota Fiscal referenciada:<br>- não informada NF de Produtor referenciada (tag:refNFP);<br>- e não informada Nota Fiscal referenciada (tag:refNFe).<br>Observação 1: A Contranota de Produtor é identificada como uma Nota Fiscal<br>de entrada (tag:tpNF=0) e remetente da mesma UF com IE de Produtor<br>Rural.<br>Observação 2: A utilização e controle da Contranota de Produtor é opcional,<br>a critério da UF. | Facul. | 318 | Rej. | Rejeição: Contranota de Produtor sem Nota Fiscal referenciada |
| BA10-30 | 55 | Contranota de Produtor não pode referenciar somente Nota Fiscal de<br>entrada:<br>- não informada NF de Produtor referenciada (tag:refNFP);<br>- e não informada Nota Fiscal referenciada (tag:refNFe) de saída<br>(tag:tpNF=1).<br>Observação 1: Identificação de Contranota de Produtor conforme<br>observação da validação anterior.<br>Observação 2: A utilização e controle da Contranota de Produtor é opcional,<br>a critério da UF. (NT 2015.002) | Facul. | 319 | Rej. | Rejeição: Contranota de Produtor não pode referenciar somente Nota Fiscal<br>de entrada |

**Tabela (página 80)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| BA10-40 | 55 | Contranota de Produtor referencia somente Nota Fiscal de outro emitente.<br>Não existe nenhuma das ocorrências abaixo:<br>- IE da NF de Produtor referenciada (tag: refNFP/IE) idêntica à IE do Emitente<br>(tag: emit/IE) ou do Remetente (tag: dest/IE);<br>- IE do emitente da NF referenciada (tag: emit/IE) idêntica à IE do Emitente<br>(tag: emit/IE) ou do Remetente (tag: dest/IE).<br>Observação 1: Identificação de Contranota de Produtor conforme<br>Observação 1 da regra BA10-20.<br>Observação 2: A utilização e controle da Contranota de Produtor é opcional,<br>a critério da UF.<br>Observação 3: A critério da UF, a validação da IE do emitente da NF<br>referenciada (tag: emit/IE) pode ser substituída por:<br>o CNPJ-8 do emitente da NF referenciada (tag:emit/CNPJ) idêntico ao<br>CNPJ-8 do Emitente (tag: emit/CNPJ) ou do Remetente (tag: dest/CNPJ)<br>(NT 2019.001 v1.00). | Facul. | 320 | Rej. | Rejeição: Contranota de Produtor referencia somente NF de outro emitente |
| BA10-50 | 55 | Contranota de Produtor só pode referenciar NF-e (tag: refNFe) ou NF de<br>Produtor Modelo 4 (tag: refNFP):<br>Observação 1: Identificação de Contranota de Produtor conforme<br>Observação 1 da regra BA10-20.<br>Observação 2: Regra opcional, a critério da UF. (NT 2019.001 v1.00) | Facul. | 922 | Rej. | Rejeição: Contranota de Produtor só pode referenciar NF-e ou NF de<br>Produtor Modelo 4 |
| BA12-10 | 55 | Se informada NF de Produtor referenciada (tag:refNFP):<br>- NF de produtor referenciada emitida a mais de 20 anos da data atual ou<br>com data de emissão superior ao Ano-Mês atual (NT 2015.002) | Facul. | 322 | Rej. | Rejeição: NF de produtor referenciada com data de emissão inválida<br>[ nOcor:nnn] |
| BA13-10 | 55 | Se informada NF de Produtor referenciada (tag:refNFP):<br>- CNPJ com zeros, nulo ou DV inválido | Facul. | 549 | Rej. | Rejeição: CNPJ da NF referenciada de produtor inválido [nOcor: 999] |
| BA14-10 | 55 | Se informada NF de Produtor referenciada (tag:refNFP):<br>- CPF com zeros, nulo, 111..., 222, ..., ou DV inválido (NT 2012/003) | Facul. | 550 | Rej. | Rejeição: CPF da NF referenciada de produtor inválido. |
| BA15-10 | 55 | Se informada NF de Produtor referenciada (tag:refNFP):<br>- IE com zeros, nulo ou DV inválido para a UF. | Facul. | 551 | Rej. | Rejeição: IE da NF referenciada de produtor inválido. |
| BA19-10 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com Dígito Verificador inválido (NT 2015.002) | Facul. | 547 | Rej. | Rejeição: Chave de Acesso referenciada com Dígito Verificador<br>inválido[nOcor:nnn] |
| BA19-14 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com UF inválida (NT 2015.002) | Facul. | 522 | Rej. | R ejeição: Chave de Acesso referenciada com UF inválida[nOcor:nnn] |
| BA19-20 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com Ano Emissão < 06 ou > que o Ano<br>corrente (NT 2015.002) | Facul. | 524 | Rej. | R ejeição: Chave de Acesso referenciada com Ano-Mês inválido[nOcor:nnn] |
| BA19-24 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com Mês Emissão < 01 ou > 12 (NT 2015.002) | Facul. | 524 | Rej. | Rejeição: Chave de Acesso referenciada com Ano-Mês inválido [nOcor: 999] |
| BA19-30 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com CNPJ zerado ou CNPJ com DV inválido<br>(NT 2015.002) | Facul. | 552 | Rej. | R ejeição: Chave de Acesso referenciada com CNPJ inválido[nOcor:nnn] |

### C. Identificação do Emitente
**Tabela (página 81)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| BA19-34 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com Modelo diferente de 57 (NT 2013/003)<br>(NT 2015.002) | Facul. | 679 | Rej. | Rejeição: Chave de Acesso referenciada com Modelo inválido[nOcor:nnn] |
| BA19-40 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada com Número zerado (NT 2015.002) | Facul. | 683 | Rej. | Rejeição: Chave de Acesso referenciada com Número inválido[nOcor:nnn] |
| BA19-44 | 55 | Se informado CT-e Referenciado (tag:refCTe):<br>- Chave de Acesso referenciada em duplicidade na NF-e (duplicidade da tag<br>refCTe) (NT 2013/003) (NT 2015.002) | Facul. | 680 | Rej. | R ejeição: Chave de Acesso referenciada em duplicidade na NF-e [nOcor:nnn] |
| BA20-10 | 55 | Se informado Cupom Fiscal referenciado (tag:refECF):<br>- Verificar duplicidade de Cupom Fiscal referenciado (mesmo Modelo,<br>Número de Ordem e COO) (NT 2013/003) | Facul. | 684 | Rej. | Rejeição: Duplicidade de Cupom Fiscal referenciado (Modelo, Número de<br>Ordem e COO) [nOcor: 999] |
| BA20-20 | 55 | Informado Cupom Fiscal referenciado (tag: refECF) ou informado NF modelo<br>1 ou 2 referenciada (tag: refNF) em NF-e de operação interestadual ou com o<br>exterior (tag: idDest<>1) (NT 2019.001 v1.00) | Facul. | 923 | Rej. | Rejeição: Referenciado documento de operação interna em operação<br>interestadual ou com o exterior |
| BA20-30 | 55/65 | Informado Cupom Fiscal referenciado (tag: refECF) em UF que não permite<br>essa referência.<br>Observação: Regra de validação opcional, a critério da UF. (NT 2019.001<br>v1.00, v.150) | Facul. | 924 | Rej. | Rejeição: Informado Cupom Fiscal referenciado |

**Tabela (página 81)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| C02-10 | 55/65 | Se informado CNPJ do emitente:<br>– CNPJ com zeros, nulo ou DV inválido | Obrig. | 207 | Rej. | Rejeição: CNPJ do emitente inválido |
| C02-20 | 55/65 | Se informado CNPJ do emitente:<br>– CNPJ Base do Emitente difere do CNPJ Base da primeira NF-e do Lote<br>recebido (NT 2018.001) | Facul. | 560 | Rej. | Rejeição: CNPJ base/CPF do emitente difere do CNPJ base/CPF da primeira<br>NF-e do lote recebido |
| C02-30 | 55/65 | Se informado CNPJ do Emitente:<br>- Série difere da faixa para emitente CNPJ: faixa 000-909 (NT 2018.001) | Obrig. | 503 | Rej. | Rejeição: CNPJ do emitente com Série incompatível |
| C02a-04 | 65 | Se informado CPF do emitente:<br>– Se NFC-e (modelo 65) (NT 2015.002) | Obrig. | 337 | Rej. | Rejeição: NFC-e para emitente pessoa física |
| C02a-08 | 55 | Se informado CPF do emitente:<br>– Se NF-e (modelo 55)<br>Observação: Regra de validação opcional a critério da UF. (NT 2018.001) | Obrig. | 652 | Rej. | Rejeição: NF-e para emitente pessoa física |
| C02a-10 | 55 | Se informado CPF do emitente:<br>– Série difere da faixa para emitente CPF: 890-899 e 910-969 (NT 2018.001<br>/ NT 2015.002) | Obrig. | 495 | Rej. | Rejeição: CPF do Emitente com Série incompatível |
| C02a-14 | 55 | Se informado CPF do Emitente:<br>– Série difere da faixa para emitente CPF: 890-899 e 910-919<br>Observação: Regra de validação opcional a critério da UF. Permite a emissão<br>de NF-e por pessoa física, somente no serviço de Nota Fiscal Avulsa no site<br>da UF. (NT 2018.001) | Obrig. | 407 | Rej. | Rejeição: CPF do Emitente somente no serviço de Nota Fiscal Avulsa no site<br>do Fisco |

**Tabela (página 82)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| C02a-20 | 55 | Se informado CPF do emitente:<br>– CPF com zeros, nulo, 111..., 222..., ..., ou DV inválido (NT 2012/003) (NT<br>2015.002) | Obrig. | 401 | Rej. | Rejeição: CPF do emitente inválido |
| C02a-30 | 55 | Se informado CPF do emitente:<br>– CPF do Emitente difere do CPF da primeira NF-e do Lote recebido (NT<br>2018.001) | Facul. | 560 | Rej. | Rejeição: CNPJ Base/CPF do emitente difere do CNPJ Base/CPF da primeira<br>NF-e do lote recebido |
| C10-10 | 55/65 | Código do Município do Emitente inexistente (Tabela Municípios IBGE) (NT<br>2015.002) | Obrig. | 272 | Rej. | Rejeição: Código Município do Emitente inexistente |
| C10-20 | 55/65 | Código do Município do Emitente (2 primeiras posições) difere do Código da<br>UF do emitente | Obrig. | 273 | Rej. | Rejeição: Código Município do Emitente: difere da UF do emitente |
| C12-10 | 55/65 | Sigla da UF do Emitente difere da UF do Web Service | Obrig. | 247 | Rej. | Rejeição: Sigla da UF do Emitente diverge da UF autorizadora |
| C17-10 | 55/65 | IE Emitente com zeros ou nulo | Obrig. | 229 | Rej. | Rejeição: IE do emitente não informada |
| C17-20 | 55/65 | Se IE diferente de “ISENTO”, validar a Inscrição Estadual:<br>- IE Emitente inválida para a UF: erro no tamanho, na composição da IE, ou<br>no dígito verificador (*2) (NT 2018.001) | Obrig. | 209 | Rej. | Rejeição: IE do emitente inválida |
| C17-30 | 55/65 | Se IE informada com “ISENTO”:<br>- Se modelo = 65 ou Série difere da faixa 890-919 (NT 2018.001) | Obrig. | 554 | Rej. | Rejeição: IE do Emitente informada como ISENTO indevidamente |
| C18-10 | 65 | NFC-e não deve informar IE de Substituto Tributário (tag:emit/IEST) | Obrig. | 718 | Rej. | Rejeição: NFC-e não deve informar IE de Substituto Tributário |
| C18-14 | 55 | Se informada a IE do Substituto Tributário para uma operação com Exterior<br>ou Operação Interna (tag:idDest=1 ou 3)<br>Exceção: A critério da UF, poderá ser aceita a informação da IE-ST em<br>operação interna. (NT 2015.002) | Obrig. | 347 | Rej. | Rejeição: Informada IE do substituto tributário em operação que não é<br>interestadual |
| C18-20 | 55 | Se informada operação de Faturamento Direto para veículos novos (id:J02,<br>tag:tpOp = 2):<br>– UF do Local de Entrega (id:G09) não informada<br>Observação: A UF é necessária na validação da IEST nestas operações. Vide<br>Convênio ICMS 51/00. | Obrig. | 478 | Rej. | Rejeição: Local da entrega não informado para faturamento direto de<br>veículos novos |
| C18-30 | 55 | Se informada a IE do Substituto Tributário:<br>– IEST inválida para a UF: erro no tamanho, na composição da IE, ou no<br>dígito verificador (*2)<br>UF a ser utilizada na validação:<br>– UF do Local de Entrega para operação de Faturamento Direto de<br>veículos novos (id:G09, caso tpOP, id:J02 = 2);<br>– UF do destinatário (UF, campo E12) nos demais casos. (NT 2015.002) | Obrig. | 211 | Rej. | Rejeição: IE do substituto inválida |
| C18-40 | 55 | Se informada a IE do Substituto Tributário:<br>- IEST idêntica à IE do emitente ou do destinatário (NT 2015.002) | Obrig. | 363 | Rej. | Rejeição: IE do substituto tributário idêntica à IE do emitente ou do<br>destinatário |
| C21-10 | 55/65 | Regime Tributário SN, com excesso de sublimite não é permitido para<br>Emitentes desta UF (id:CRT=2).<br>Nota: Regra de validação opcional, a critério da UF. (NT 2015.002) | Facul. | 812 | Rej. | Rejeição: Regime Tributário SN, com excesso de sublimite não é permitido<br>para Emitentes desta UF |

### D. Identificação do Fisco Emitente (NF-e Avulsa)
**Tabela (página 83)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| D01-10 | 55/65 | Informado grupo “avulsa” pela empresa (tag:procEmi<>1 e 2). | Obrig. | 403 | Rej. | Rejeição: O grupo de informações da NF-e avulsa é de uso exclusivo do Fisco |
| D01-20 | 55/65 | Não informado grupo "avulsa" na emissão de Nota Fiscal pelo Fisco<br>(tag:procEmi=1 ou 2) | Obrig. | 369 | Rej. | Rejeição: Não informado o grupo avulsa na emissão pelo Fisco |

**Tabela (página 83)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| E01-10 | 55 | NF-e sem a identificação do destinatário (tag:infNFe/dest) | Obrig. | 719 | Rej. | Rejeição: NF-e sem a identificação do destinatário |
| E01-20 | 65 | NFC-e com entrega a domicílio (indPres=4) sem identificação do destinatário<br>(tag:infNFe/dest) | Obrig. | 787 | Rej. | Rejeição: NFC-e de entrega a domicílio sem a identificação do destinatário |
| E02-10 | 55/65 | Se informado CNPJ:<br>– CNPJ com zeros ou dígito de controle inválido | Obrig. | 208 | Rej. | Rejeição: CNPJ do destinatário inválido |
| E02-20 | 65 | Se informado CNPJ:<br>- CNPJ do destinatário = CNPJ do Emitente (NT 2015.002) | Obrig. | 220 | Rej. | Rejeição: Destinatário com identificação igual à identificação do emitente |
| E03-10 | 55/65 | Se informado CPF:<br>– CPF com zeros, nulo, 111..., 222..., ... ou dígito de controle inválido (NT<br>2013/003) | Obrig. | 237 | Rej. | Rejeição: CPF do destinatário inválido |
| E03a-10 | 55 | Se Operação com Exterior (tag:idDest = 3):<br>– Deve ser informada tag idEstrangeiro (conteúdo da tag pode ser nulo) | Obrig. | 720 | Rej. | Rejeição: Na operação com Exterior deve ser informada tag idEstrangeiro |
| E03a-20 | 55 | Se não é operação com Exterior (tag:idDest<>3):<br>– Informado “idEstrangeiro”, e operação não é com consumidor<br>final(tag:indFinal<> 1) (NT 2015.002) | Obrig. | 721 | Rej. | Rejeição: Informado idEstrangeiro e Operação não é com consumidor final. |
| E03a-30 | 55/65 | Se informado “idEstrangeiro” não pode ser informada “IE” do destinatário<br>(tag: dest/IE). (NT 2019.001 v1.00) | Obrig. | 925 | Rej. | Rejeição: NF-e com identificação de estrangeiro e inscrição estadual<br>informada para destinatário |
| E03a-60 | 55/65 | Se informado “idEstrangeiro”, campo deve conter somente algarismos, letras<br>(maiúsculas e minúsculas) e/ou os caracteres do conjunto que segue: [:.+-<br>/()](NT 2015.002) | Obrig. | 372 | Rej. | Rejeição: Destinatário com identificação de estrangeiro com caracteres<br>inválidos |
| E04-10 | 55 | NF-e sem o nome do destinatário (tag:dest/xNome) | Obrig. | 724 | Rej. | Rejeição: NF-e sem o nome do destinatário |
| E04-20 | 55/65 | Se tag:tpAmb (id:B24) = 2:<br>o xNome (E04) deve ser informado com a literal “NF-E EMITIDA EM<br>AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL”<br>(NT 2011/002) | Obrig. | 598 | Rej. | Rejeição: NF-e emitida em ambiente de homologação com Razão Social do<br>destinatário diferente de NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO -<br>SEM VALOR FISCAL |
| E05-10 | 55 | NF-e sem a informação de endereço do destinatário (tag:dest/enderDest) | Obrig. | 726 | Rej. | Rejeição: NF-e sem a informação de endereço do destinatário |
| E05-20 | 65 | NFC-e com entrega a domicílio (indPres=4) sem o endereço do destinatário<br>(tag:dest/enderDest) | Obrig. | 788 | Rej. | Rejeição: NFC-e de entrega a domicílio sem o endereço do destinatário |
| E10-10 | 55/65 | Se endereço destinatário não é no Exterior (dest/UF <> “EX"):<br>– Código Município do destinatário inexistente (Tabela Municípios IBGE)<br>(NT 2015.002) | Obrig. | 274 | Rej. | Rejeição: Código Município do Destinatário inexistente |

**Tabela (página 84)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| E10-20 | 55/65 | Se endereço destinatário não é no Exterior (dest/UF <> “EX"):<br>– Código Município do destinatário (2 primeiras posições) difere do Código<br>da UF do destinatário | Obrig. | 275 | Rej. | Rejeição: Código Município do Destinatário: difere da UF do Destinatário |
| E10-30 | 55 | Se endereço destinatário é no Exterior (dest/UF = “EX"):<br>– Código Município do destinatário difere de “9999999” | Obrig. | 509 | Rej. | Rejeição: Informado código de município diferente de “9999999” para<br>operação com o exterior |
| E12-10 | 55 | Se endereço destinatário é no Exterior (dest/UF = “EX"):<br>– UF de destino diferente de “EX” | Obrig. | 727 | Rej. | Rejeição: Operação com Exterior e UF diferente de EX |
| E12-30 | 55 | Se Nota Fiscal é de Saída (tpNF=1) e operação é Interestadual (tag:idDest =<br>2):<br>– UF do destinatário (tag: enderDest/UF) igual à UF do emitente (tag:<br>enderEmit/UF) e CNPJ emissor diferente do CNPJ destinatário (NT 2013/005).<br>Observação: Não rejeitar se existir algum item com a tag UFCons (id:L120)<br>diversa da UF do emitente.<br>Exceção 1: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) diferente da UF do emitente (tag: enderEmit/UF) e<br>não informada UF do local de retirada (tag: retirada/UF);<br>Exceção 2: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) diferente da UF do destinatário (tag:<br>enderDest/UF) e não informada UF do local de entrega (tag: entrega/UF);<br>Exceção 3: A regra de validação não se aplica se informadas UF do local de<br>entrega (tag: entrega/UF) e UF do local de retirada (tag: retirada/UF)<br>diferentes entre si; (NT 2015.003) | Obrig. | 772 | Rej. | Rejeição: Operação Interestadual e UF de destino igual à UF de origem |
| E12-40 | 55 | Se Nota Fiscal é de Saída (tpNF=1), operação é Interna no Estado<br>(tag:idDest = 1) e operação não é com Consumidor final:<br>– UF do destinatário (tag: enderDest/UF) difere da UF do emitente (tag:<br>enderEmit/UF). (NT 2015.003)<br>Exceção 1: Se a tag UFCons (id:LA06) foi informada com a mesma UF do<br>emitente não se aplica esta regra (NT 2013/005)<br>Exceção 2: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) igual à UF do emitente (tag: enderEmit/UF) e não<br>informada UF do local de retirada (tag: retirada/UF);<br>Exceção 3: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) igual à UF do destinatário (tag: enderDest/UF) e<br>não informada UF do local de entrega (tag: entrega/UF);<br>Exceção 4: A regra de validação não se aplica se informadas UF do local de<br>entrega (tag: entrega/UF) e UF do local de retirada (tag: retirada/UF) iguais<br>entre si; | Obrig. | 773 | Rej. | Rejeição: Operação Interna e UF de destino difere da UF de origem |

**Tabela (página 85)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| E12-50 | 55 | Se Nota Fiscal é de Entrada (tpNF=0) e operação é Interestadual<br>(tag:idDest = 2):<br>– UF do destinatário (tag: enderDest/UF) igual à UF do emitente (tag:<br>enderEmit/UF) e CNPJ emissor diferente do CNPJ destinatário.<br>Observação: Não rejeitar se existir algum item com a tag UFCons (id:L120)<br>diversa da UF do emitente.<br>Exceção 1: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) diferente da UF do destinatário (tag:<br>enderDest/UF) e não informada UF do local de retirada (tag: retirada/UF);<br>Exceção 2: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) diferente da UF do emitente (tag: enderEmit/UF) e<br>não informada UF do local de entrega (tag:<br>entrega/UF);<br>Exceção 3: A regra de validação não se aplica se informadas UF do<br>local de entrega (tag: entrega/UF) e UF do local de retirada (tag: retirada/UF)<br>diferentes entre si; (NT 2015.003) | Obrig. | 772 | Rej. | Rejeição: Operação Interestadual e UF de destino igual<br>à UF de origem |
| E12-60 | 55 | Se Nota Fiscal é de Entrada (tpNF=0), operação é Interna no Estado<br>(tag:idDest = 1) e operação não é com Consumidor final:<br>– UF do destinatário (tag: enderDest/UF) difere da UF do emitente<br>(tag: enderEmit/UF).<br>Exceção 1: Se a tag UFCons (id:LA06) foi informada com a mesma UF do<br>emitente não se aplica esta regra;<br>Exceção 2: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) igual à UF do destinatário (tag: enderDest/UF) e<br>não informada UF do local de retirada (tag: retirada/UF);<br>Exceção 3: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) igual à UF do emitente (tag: enderEmit/UF) e não<br>informada UF do local de entrega (tag: entrega/UF);<br>Exceção 4: A regra de validação não se aplica se informadas UF do local de<br>entrega (tag: entrega/UF) e UF do local de retirada (tag: retirada/UF) iguais<br>entre si; (NT 2015.003) | Obrig. | 773 | Rej. | Rejeição: Operação Interna e UF de destino difere da UF de origem |
| E14-04 | 55/65 | Se informado Código País do destinatário (tag: enderDest/cPais):<br>- Código do País inexistente (Tabela do BACEN, vide tabela de apoio<br>publicada no Portal da NF-e).<br>Observação: O Código do País informado na NF-e pode conter ou não zeros<br>não significativos. (NT 2015.002) | Obrig. | 377 | Rej. | Rejeição: Código de País do destinatário inexistente |
| E14-10 | 55 | Se operação com Exterior (tag:idDest=3):<br>– Código País do destinatário = 1058 (Brasil), ou não informado | Facul. | 510 | Rej. | Rejeição: Operação com Exterior e Código País destinatário é 1058 (Brasil)<br>ou não informado |
| E14-20 | 55/65 | Se não é operação com Exterior (tag:idDest<>3) e informado Código País do<br>destinatário:<br>– Código País do destinatário difere de 1058 (Brasil)<br>Exceção: Se idEstrangeiro <> nulo é permitido cPais <> 1058. (NT 2015.002) | Facul. | 511 | Rej. | Rejeição: Não é de Operação com Exterior e Código País destinatário difere<br>de 1058 (Brasil) |
| E14-30 | 55/65 | Se endereço do destinatário é no Exterior (dest/UF = “EX"): - Código do país<br>“cPais” (id: E14) não pode ser 1058 (Brasil). (NT 2019.001 v1.00) | Obrig. | 926 | Rej | Rejeição: Operação com Exterior e país de destino igual a Brasil. |

**Tabela (página 86)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| E16a-10 | 65 | NFC-e com indicação de IE do destinatário diferente de "Não Contribuinte"<br>(tag:indIEDest <> 9) | Obrig. | 789 | Rej. | Rejeição: NFC-e para destinatário contribuinte de ICMS |
| E16a-20 | 55 | Se operação com Exterior (tag:idDest=3):<br>– Indicação de IE Destinatário diferente "Não Contribuinte" (tag:indIEDest<br><> 9) (NT 2015.003) | Obrig. | 790 | Rej. | Rejeição: Operação com Exterior para destinatário Contribuinte de ICMS |
| E16a-30 | 55 | Informado destinatário como Contribuinte Isento de Inscrição Estadual<br>(indIEDest=2-ISENTO) em UF que não permite esta situação nas operações<br>interestaduais (idDest=2), conforme abaixo:<br>- AM, BA, CE, GO, MG, MS, MT, PA, PE, RN, SE, SP<br>Exceção 1: Esta regra de validação não se aplica quando houver destaque do<br>ICMS-ST (campo vICMSST) em pelo menos um item da NF-e<br>Exceção 2: Esta regra de validação não se aplica quando houver informação<br>do ICMS-ST retido anteriormente (campo vICMSSTRet) em pelo menos um<br>item da NF-e<br>Exceção 3: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016<br>Exceção 4: Esta regra de validação não se aplica nas operações isentas<br>(CST=40-Isenta ou CSOSN=103-Isento), imunes ou não tributadas (CST=41-<br>Não tributada, ou CSOSN=300-Imune, ou CSOSN=400-Não tributada pelo<br>Simples Nacional) | Obrig. | 805 | Rej. | Rejeição: A SEFAZ do destinatário não permite Contribuinte Isento de<br>Inscrição Estadual |
| E16a-35 | 55 | Informado destinatário como Contribuinte Isento de Inscrição Estadual<br>(indIEDest=2-ISENTO) em UF que não permite esta situação nas operações<br>internas (idDest=1)<br>Exceção 1: Esta regra de validação não se aplica quando houver destaque do<br>ICMS-ST (campo vICMSST) em pelo menos um item da NF-e.<br>Exceção 2: Esta regra de validação não se aplica quando houver informação<br>do ICMS-ST retido anteriormente (campo vICMSSTRet) em pelo menos um<br>item da NF-e.<br>Exceção 3: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016.<br>Exceção 4: Esta regra de validação não se aplica nas operações isentas<br>(CST=40-Isenta ou CSOSN=103-Isento), imunes ou não tributadas (CST=41-<br>Não tributada, ou CSOSN=300-Imune, ou CSOSN=400-Não tributada pelo<br>Simples Nacional) (NT 2015.003) | Facul. | 805 | Rej. | Rejeição: A SEFAZ do destinatário não permite Contribuinte Isento de<br>Inscrição Estadual |
| E16a-40 | 55 | Informado indicador de IE do Destinatário não-contribuinte (tag:<br>indIEDest=9) e não é operação com consumidor final (tag: indFinal<>1) em<br>operação de saída (tag: tpNF=1) que não é com exterior (tag:idDest<>3). (NT<br>2019.001 v1.00) | Obrig. | 696 | Rej. | Rejeição: Operação com não contribuinte deve indicar operação com<br>consumidor final |
| E17-10 | 65 | Se operação com Exterior (tag:idDest=3):<br>NFC-e com tag IE do Destinatário (tag:dest/IE) | Obrig. | 729 | Rej. | Rejeição: NFC-e com informação da IE do destinatário |
| E17-20 | 55 | NF-e com indicação de Destinatário Contribuinte do ICMS<br>(tag:dest/indIEDest=1), sem informar a IE (tag:dest/IE) | Obrig. | 728 | Rej. | Rejeição: NF-e sem informação da IE do destinatário |
| E17-30 | 55 | NF-e com indicação de Destinatário Contribuinte Isento de IE<br>(tag:dest/indIEDest=2), mas com informação da IE (tag:dest/IE) | Obrig. | 791 | Rej. | Rejeição: NF-e com indicação de destinatário isento de IE, com a informação<br>da IE do destinatário |

### DA. Autorização – Área de dados do lote de NF-e
**Tabela (página 73)**
| # | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| GAP03a-1 | Solicitada resposta síncrona para Lote com mais de uma NF-e (indSinc=1) | Obrig. | 764 | Rej. | Rejeição: Solicitada resposta síncrona para Lote com mais de uma NF-e (indSinc=1) |
| GAP03a-2 | Solicitada resposta síncrona para UF que não disponibiliza este atendimento<br>(indSinc=1) | Facul. | 776 | Rej. | Rejeição: Solicitada resposta síncrona para UF que não disponibiliza este<br>atendimento (indSinc=1) |

**Tabela (página 73)**
| # | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| D04 | Verifica se o tpEvento é válido | Obrig. | 491 | Rej. | Rejeição: O tpEvento informado inválido |
| D05 | Verifica se o verEvento é válido | Obrig. | 492 | Rej. | Rejeição: O verEvento informado inválido |
| D06 | Verifica se o detEvento atende o respectivo schema XML | Obrig. | 493 | Rej. | Rejeição: Evento não atende o Schema XML específico |

**Tabela (página 73)**
| # | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| E01 | Certificado de Assinatura inválido:<br>- Certificado de Assinatura inexistente na mensagem (*validado também pelo<br>Schema)<br>- Versão difere "3"<br>- Se informado o Basic Constraint deve ser true (não pode ser Certificado de AC)<br>- KeyUsage não define "Assinatura Digital" e “Não Recusa” | Obrig. | 290 | Rej. | Rejeição: Certificado Assinatura inválido |
| E02 | Validade do Certificado (data início e data fim) | Obrig. | 291 | Rej. | Rejeição: Certificado Assinatura Data Validade |
| E03 | Falta a extensão de CNPJ no Certificado (OtherName OID=2.16.76.1.3.3) ou a<br>extensão de CPF (OtherName OID=2.16.76.1.3.1) (NT 2018.001) | Obrig. | 292 | Rej. | Rejeição: Certificado de Assinatura sem CNPJ/CPF |
| E04 | Verifica Cadeia de Certificação:<br>- Certificado da AC emissora não cadastrado na SEFAZ<br>- Certificado de AC revogado<br>- Certificado não assinado pela AC emissora do Certificado | Obrig. | 293 | Rej. | Rejeição: Certificado Assinatura - erro Cadeia de Certificação |

### F. Local da Retirada
**Tabela (página 87)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| E17-40 | 55 | Se informada a IE do Destinatário:<br>– Não informar a IE do Destinatário se endereço do Destinatário no Exterior<br>(tag:dest/enderDest/UF=”EX”) | Obrig. | 792 | Rej. | Rejeição: Informada a IE do destinatário para operação com destinatário no<br>Exterior |
| E17-50 | 55 | Se informada a IE do Destinatário:<br>– IE inválida para a UF: erro no tamanho, na composição da IE, ou no dígito<br>verificador (*2) | Obrig. | 210 | Rej. | Rejeição: IE do destinatário inválida |
| E18-10 | 65 | NFC-e com Inscrição da Suframa (tag:dest/ISUF) | Obrig. | 730 | Rej. | Rejeição: NFC-e com Inscrição Suframa |
| E18-20 | 55 | Se Inscrição SUFRAMA informada:<br>– Inscrição com dígito verificador inválido | Obrig. | 235 | Rej. | Rejeição: Inscrição SUFRAMA inválida |
| E18-30 | 55 | Se Inscrição SUFRAMA informada:<br>– UF destinatário difere de AC-Acre, ou AM-Amazonas, ou RO-Rondônia, ou<br>RR-Roraima, ou AP-Amapá (só para municípios 1600303-Macapá e 1600600-<br>Santana) | Obrig. | 251 | Rej. | Rejeição: UF/Município destinatário não pertence a SUFRAMA |

**Tabela (página 87)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| F02-10 | 55/65 | Se informado Local de Retirada com CNPJ:<br>– CNPJ com zeros ou dígito inválido | Facul. | 512 | Rej. | Rejeição: CNPJ do Local de Retirada inválido |
| F02a-10 | 55/65 | Se informado Local de Retirada com CPF:<br>– CPF com zeros, nulo, 111..., 222..., ..., ou dígito de controle inválido (NT<br>2012/003) | Facul. | 540 | Rej. | Rejeição: CPF do Local de Retirada inválido |
| F07-10 | 55/65 | Se informado Local de Retirada com UF Retirada = “EX”:<br>– Código do Município do Local de Retirada difere de “9999999” | Obrig. | 513 | Rej. | Rejeição: Código Município do Local de Retirada deve ser 9999999 para UF<br>retirada = “EX”. |
| F07-20 | 55/65 | Se informado Local de Retirada com UF Retirada <> “EX”:<br>– Código do Município do Local de Retirada inexistente (Tabela Municípios<br>IBGE) (NT 2015.002) | Obrig. | 276 | Rej. | Rejeição: Código Município do Local de Retirada inexistente |
| F07-30 | 55/65 | Se informado Local de Retirada com UF Retirada <> “EX”:<br>– Código Município do Local de Retirada (2 primeiras posições) difere do<br>Código da UF do Local de Retirada | Obrig. | 277 | Rej. | Rejeição: Código Município do Local de Retirada: difere da UF do Local de<br>Retirada |
| F11-10 | 55 | Se informado Código País do local de retirada (tag: retirada/cPais):<br>- Código do País inexistente (Tabela do BACEN, vide tabela de apoio<br>publicada no Portal da NF-e).<br>Observação: O Código do País pode conter zeros não significativos.<br>(NT2018.005) | Obrig. | 970 | Rej. | Rejeição: Código de País inexistente [local de retirada/entrega] |
| F15-10 | 55 | Se informada a IE do Expedidor:<br>– IE inválida para a UF do Expedidor (id: F09): erro no tamanho, na<br>composição da IE, ou no dígito verificador (NT2018.005) | Obrig. | 971 | Rej. | Rejeição: IE inválida [local de retirada/entrega] |

### G. Local da Entrega
**Tabela (página 88)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| G02-10 | 55/65 | Se informado o Local de Entrega com CNPJ:<br>– CNPJ com zeros ou dígito inválido | Facul. | 514 | Rej. | Rejeição: CNPJ do Local de Entrega inválido |
| G02a-10 | 55/65 | Se informado o Local de Entrega com CPF:<br>– CPF com zeros, nulo, 111..., 222..., ..., ou dígito de controle inválido (NT<br>2012/003) | Facul. | 541 | Rej. | Rejeição: CPF do Local de Entrega inválido |
| G07-10 | 55/65 | Se informado Local de Entrega com UF Entrega = “EX”:<br>– Código do Município do Local de Entrega difere de “9999999” | Obrig. | 515 | Rej, | Rejeição: Código Município do Local de Entrega deve ser 9999999 para UF<br>entrega = “EX”. |
| G07-20 | 55/65 | Se informado Local de Entrega com UF Entrega <> “EX”:<br>– Código Município do Local de Entrega inexistente (Tabela Municípios<br>IBGE) (NT 2015.002) | Obrig. | 278 | Rej. | Rejeição: Código Município do Local de Entrega inexistente |
| G07-30 | 55/65 | Se informado Local de Entrega com UF Entrega <> “EX”:<br>– Código Município do Local de Entrega (2 primeiras posições) difere do<br>Código da UF do Local de Entrega | Obrig. | 279 | Rej. | Rejeição: Código Município do Local de Entrega: difere da UF do Local de<br>Entrega |
| G11-10 | 55 | Se informado Código País do local de retirada (tag: entrega/cPais):<br>- Código do País inexistente (Tabela do BACEN, vide tabela de apoio<br>publicada no Portal da NF-e).<br>Observação: O Código do País pode conter zeros não significativos. (NT<br>2018.005) | Obrig. | 970 | Rej. | Rejeição: Código de País inexistente [local de retirada/entrega] |
| G15-10 | 55 | Se informada a IE do Recebedor:<br>– IE inválida para a UF do Recebedor (id: G09): erro no tamanho, na<br>composição da IE, ou no dígito verificador (NT 2018.005) | Obrig. | 971 | Rej. | Rejeição: IE inválida [local de retirada/entrega] |

**Tabela (página 88)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| GA02-10 | 55/65 | Se informada autorização download XML com CNPJ:<br>– CNPJ com zeros ou dígito inválido | Obrig. | 323 | Rej. | Rejeição: CNPJ autorizado para download inválido |
| GA02-20 | 55/65 | Se informada autorização download XML com CNPJ:<br>– Informado CNPJ do destinatário | Obirg. | 324 | Rej. | Rejeição: CNPJ do destinatário já autorizado para download |
| GA03-10 | 55/65 | Se informada autorização download do XML com CPF:<br>– CPF com zeros, nulo, 111..., 222..., ..., ou dígito de controle inválido | Obrig. | 325 | Rej. | Rejeição: CPF autorizado para download inválido |
| GA03-20 | 55/65 | Se informada autorização download do XML com CPF:<br>– Informado CPF do destinatário | Obrig. | 326 | Rej. | Rejeição: CPF do destinatário já autorizado para download |

### Grupo A: Validação do Certificado de Transmissão (protocolo TLS)
**Tabela (página 71)**
| # | Regra de Validação | Aplic | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| A01 | Certificado de Transmissor Inválido:<br>- Certificado de Transmissor inexistente na mensagem<br>- Versão difere "3"<br>- Se informado, Basic Constraint deve ser true (não pode ser Certificado de AC)<br>- KeyUsage não define "Autenticação Cliente" | Obrig. | 280 | Rej. | Rejeição: Certificado Transmissor inválido |
| A02 | Validade do Certificado (data início e data fim) | Obrig. | 281 | Rej. | Rejeição: Certificado Transmissor Data Validade |
| A03 | Verifica a Cadeia de Certificação:<br>- Certificado da AC emissora não cadastrado na SEFAZ<br>- Certificado de AC revogado<br>- Certificado não assinado pela AC emissora do Certificado | Obrig. | 283 | Rej. | Rejeição: Certificado Transmissor - erro Cadeia de Certificação |
| A04 | LCR do Certificado de Transmissor<br>- Falta o endereço da LCR (CRL DistributionPoint)<br>- LCR indisponível<br>- LCR inválida | Obrig. | 286 | Rej. | Rejeição: Certificado Transmissor erro no acesso a LCR |
| A05 | Certificado do Transmissor revogado | Obrig. | 284 | Rej. | Rejeição: Certificado Transmissor revogado |
| A06 | Certificado Raiz difere da "ICP-Brasil" | Obrig. | 285 | Rej. | Rejeição: Certificado Transmissor difere ICP-Brasil |
| A07 | Falta a extensão de CNPJ no Certificado (OtherName - OID=2.16.76.1.3.3) ou a<br>extensão de CPF (OtherName - OID=2.16.76.1.3.1) (NT 2018.001) | Obrig. | 282 | Rej. | Rejeição: Certificado Transmissor sem CNPJ/CPF |

**Tabela (página 71)**
| # | Regra de Validação | Aplic | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| B01 | Tamanho do XML de Dados superior a 500 KB | Obrig. | 214 | Rej. | Rejeição: Tamanho da mensagem excedeu o limite estabelecido |
| B02 | XML de Dados Malformado | Facul. | 243 | Rej. | Rejeição: XML Mal Formado |
| B03 | Verifica se o Servidor de Processamento está Paralisado Momentaneamente | Obrig. | 108 | Rej. | Rejeição: Serviço Paralisado Momentaneamente (curto prazo) |
| B04 | Verifica se o Servidor de Processamento está Paralisado sem Previsão | Obrig. | 109 | Rej. | Rejeição: Serviço Paralisado sem Previsão |
| B05 | Verifica se UF informada é atendida pelo Webservice (NT 2018.004) | Obrig. | 410 | Rej. | Rejeição: UF informada no campo cUF não é atendida pelo WebService |
| B06 | Verifica se versão do XML é suportada (NT 2018.004) | Obrig. | 239 | Rej. | Rejeição: Versão do arquivo XML não suportada |

### Grupo D: Validação da Área de Dados
**Tabela (página 72)**
| # | Regra de Validação | Aplic | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| D01 | Verifica Schema XML da Área de Dados (WS Autorização) | Obrig. | 225 | Rej. | Rejeição: Falha no Schema XML do lote de NFe |
| D01 | Verifica Schema XML da Área de Dados | Obrig. | 215 | Rej. | Rejeição: Falha no schema XML |
| D01a | Em caso de Falha de Schema, verificar se existe a tag raiz esperada para o lote (WS<br>Autorização) | Facul. | 565 | Rej. | Rejeição: Falha no schema XML – inexiste a tag raiz esperada para o lote de NF-e |
| D01a | Em caso de Falha de Schema, verificar se existe a tag raiz esperada para mensagem | Facul. | 516 | Rej. | Rejeição: Falha no schema XML – inexiste a tag raiz esperada para a mensagem |
| D01b | Em caso de Falha de Schema, verificar se existe o atributo versao para a tag raiz da<br>mensagem | Facul. | 568 | Rej. | Rejeição: Falha no schema XML – inexiste atributo versao na tag raiz do lote de NF-<br>e |
| D01b | Em caso de Falha de Schema, verificar se existe o atributo versao para a tag raiz da<br>mensagem | Facul. | 517 | Rej. | Rejeição: Falha no schema XML – inexiste atributo versao na tag raiz da mensagem |
| D01d | Verifica a existência de qualquer namespace diverso do namespace padrão da NF-e<br>(http://www.portalfiscal.inf.br/nfe) | Facul. | 587 | Rej. | Rejeição: Usar somente o namespace padrão da NF-e |
| D01e | Verifica a existência de caracteres de edição no início ou fim da mensagem ou<br>entre as tags | Facul. | 588 | Rej. | Rejeição: Não é permitida a presença de caracteres de edição no início/fim da<br>mensagem ou entre as tags da mensagem |
| D02 | Verifica o uso de prefixo no namespace | Obrig. | 404 | Rej. | Rejeição: Uso de prefixo de namespace não permitido |
| D03 | XML utiliza codificação diferente de UTF-8 | Obrig. | 402 | Rej. | Rejeição: XML da área de dados com codificação diferente de UTF-8 |

### Grupo F: Validação da Assinatura Digital
**Tabela (página 74)**
| # | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| E05 | LCR do Certificado de Assinatura:<br>- Falta o endereço da LCR (CRLDistributionPoint)<br>- Erro no acesso a LCR ou LCR inexistente | Obrig. | 296 | Rej. | Rejeição: Certificado Assinatura erro no acesso a LCR |
| E06 | Certificado de Assinatura revogado | Obrig. | 294 | Rej. | Rejeição: Certificado Assinatura revogado |
| E07 | Certificado Raiz difere da “ICP-Brasil” | Obrig. | 295 | Rej. | Rejeição: Certificado Assinatura difere ICP-Brasil |

**Tabela (página 74)**
| # | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| F01 | Assinatura difere do padrão do Sistema:<br>- Não assinado o atributo "Id" (falta "Reference URI" na assinatura) (*validado<br>também pelo Schema)<br>- Faltam os "Transform Algorithm" previstos na assinatura ("C14N" e "Enveloped")<br>Estas validações são implementadas pelo Schema XML da Signature | Obrig. | 298 | Rej. | Rejeição: Assinatura difere do padrão do Sistema |
| F02 | Valor da assinatura (SignatureValue) difere do valor calculado | Obrig. | 297 | Rej. | Rejeição: Assinatura difere do calculado |
| F03 | Se Certificado de Assinatura com CNPJ e CNPJ do Certificado difere do CNPJ da<br>SEFAZ para a UF:<br>- CNPJ-Base do Emitente difere do CNPJ-Base do Certificado Digital (NT 2018.001) | Obrig. | 213 | Rej. | Rejeição: CNPJ-Base do Emitente difere do CNPJ-Base do Certificado Digital |
| F03A | Se Certificado de Assinatura com CPF:<br>- CPF do Emitente difere do CPF do Certificado Digital (NT 2018.001) | Obrig. | 227 | Rej. | Rejeição: CPF do Emitente difere do CPF do Certificado Digital |

**Tabela (página 74)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| A03-10 | 55/65 | Campo Id inválido:<br>- Chave de Acesso do campo Id difere da concatenação dos campos<br>correspondentes.<br>Observação: No caso da Nota Fiscal Avulsa da Série 890-899, considerar o<br>CNPJ da SEFAZ para a UF correspondente. Nos demais casos, considerar o<br>CNPJ/CPF do emitente. (NT 2018.001) | Obrig. | 502 | Rej. | Rejeição: Erro na Chave de Acesso - Campo Id não corresponde à<br>concatenação dos campos correspondentes |

### H. Detalhamento Produtos e Serviços
**Tabela (página 89)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| H02-10 | 55/65 | Número sequencial do item no arquivo XML “nItem” fora de ordem<br>incremental, consecutiva, a partir de 1. Observação: Regra de validação<br>opcional, a critério da UF (NT 2019.001) | Obrig. | 927 | Rej. | Rejeição: Número do item fora da ordem sequencial. |

**Tabela (página 89)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| I03-10 | 55/65 | Se informado GTIN (tag: cEAN) <> “SEM GTIN” ou Nulo):<br>- cEAN com dígito de controle inválido<br>Observação: Cálculo do dígito verificador em www.gs1.org/check-digit-<br>calculator. (NT 2017.001) | Obrig. | 611 | Rej. | Rejeição: GTIN (cEAN) inválido [nItem:999] |
| I03-20 | 55/65 | Se informado GTIN (tag: cEAN) <> “SEM GTIN” ou Nulo):<br>- Prefixo GS1 inválido, conforme tabela de prefixos publicada no Portal da NF-<br>e<br>Observação: Validação efetuada conforme prefixos e orientações constantes<br>na “Tabela Prefixo GS1” publicada no Portal Nacional da NF-e. (NT<br>2017.001) | Obrig. | 882 | Rej. | Rejeição: GTIN (cEAN) com prefixo inválido [nItem:999] |
| I03-30 | 55/65 | GTIN (tag: cEAN) em branco, campo sem informação.<br>Observação 1: Para produtos que não possuem GTIN, utilizar a informação de<br>"SEM GTIN" (NT 2017.001) | Obrig. | 883 | Rej. | Rejeição: GTIN (cEAN) sem informação [nItem: 999] |
| I04-10 | 65 | Para a NFC-e, se ambiente de homologação (tag:tpAmb=2, id:B24):<br>- Descrição do primeiro item da Nota Fiscal (tag:xProd) deve ser informada<br>como “NOTA FISCAL EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM<br>VALOR FISCAL” (NT 2015.002) | Obrig. | 373 | Rej. | Rejeição: Descrição do primeiro item diferente de NOTA FISCAL EMITIDA EM<br>AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL [nItem:nnn] |

**Tabela (página 95)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| I19-10 | 55 | Número da DI / DSI inválido | Obrig. | 329 | Rej. | Rejeição: Número da DI /DSI inválido |
| I23-10 | 55 | Data do Desembaraço Aduaneiro inferior a 5 anos da data atual ou superior a<br>data atual (NT 2015.002) | Obrig. | 376 | Rej. | Rejeição: Data do Desembaraço Aduaneiro inválida [nItem: nnn] |
| I23b-10 | 55 | Informar o Valor da AFRMM na importação por via marítima<br>(tag:tpViaTransp=1 e não existe tag:vAFRMM) | Obrig. | 330 | Rej. | Rejeição: Informar o Valor da AFRMM na importação por via marítima |
| I23d-10 | 55 | Informar o CNPJ do adquirente ou do encomendante na importação por conta<br>e ordem ou encomenda (tag:DI/tpIntermedio=2 ou 3) | Obrig. | 331 | Rej. | Rejeição: Informar o CNPJ do adquirente ou do encomendante nesta forma<br>de importação |
| I23d-20 | 55 | CNPJ do adquirente ou do encomendante inválido (zeros, nulo ou DV inválido) | Obrig. | 332 | Rej. | Rejeição: CNPJ do adquirente ou do encomendante da importação inválido |
| I23e-10 | 55 | Informar a UF do adquirente ou do encomendante na importação por conta e<br>ordem ou encomenda (tag:DI/tpIntermedio=2 ou 3) | Obrig. | 333 | Rej. | Rejeição: Informar a UF do adquirente ou do encomendante nesta forma de<br>importação |
| I29a-10 | 55 | Obrigatória a informação do número do processo de drawback na Adição<br>(Declaração de Importação) para os CFOP: 3127, 3211 | Obrig. | 334 | Rej. | Rejeição: Número do processo de drawback não informado na importação |
| I29a-20 | 55 | Número do processo de drawback inválido na Adição (Declaração de<br>Importação) | Obrig. | 335 | Rej. | Rejeição: Número do processo de drawback na importação inválido |

**Tabela (página 95)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| I50-10 | 55/65 | Informado o grupo de Exportação (tag:detExport) no Item em operação que<br>não é com exterior (tag: idDest <> 3). (NT 2015.002) | Obrig. | 336 | Rej. | Rejeição: Informado o grupo de exportação no item em operação que não é<br>com exterior [nItem: nnn] |
| I51-10 | 55 | Obrigatória informação do número do processo de drawback para CFOP:<br>- 7127: Venda de produção do estabelecimento sob o regime de drawback<br>- 7211: Devolução de compras p/ industrialização sob o regime de drawback | Obrig. | 338 | Rej. | Rejeição: Número do processo de drawback não informado na exportação |
| I51-20 | 55 | Número do processo de drawback inválido | Obrig. | 339 | Rej. | Rejeição: Número do processo de drawback na exportação inválido |
| I52-10 | 55 | Grupo de controle para a Exportação Indireta (tag:detExport/exportInd) não<br>informado para os CFOP: 3503, 7501<br>Observação 1: Implementação opcional por UF (NT 2013/005 v 1.10)<br>Observação 2: Esta regra não se aplica para NF-e complementar (NT 2013/005<br>v 1.10) | Facul. | 340 | Rej. | Rejeição: Não informado o grupo de exportação indireta no item |
| I53-10 | 55 | Número do registro de exportação inválido (tag:detExport/exportInd/nRE) | Obrig. | 341 | Rej. | Rejeição: Número do registro de exportação inválido |
| I54-10 | 55 | Chave de Acesso na exportação indireta (tag:exportInd/chNFe):<br>– Dígito Verificador da Chave de Acesso inválido | Facul. | 342 | Rej. | Rejeição: Chave de Acesso informada na Exportação Indireta com DV inválido |
| I54-20 | 55 | Chave de Acesso na exportação indireta (tag:exportInd/chNFe):<br>– Modelo da Chave de Acesso diferente de 55 | Facul. | 343 | Rej. | Rejeição: Modelo da NF-e informada na Exportação Indireta diferente de 55 |
| I54-30 | 55 | Chave de Acesso na exportação indireta (tag:exportInd/chNFe):<br>– Verificar duplicidade da Chave de Acesso informada (duplicidade de<br>informação da tag exportInd/chNFe), para o item da NF-e | Facul. | 344 | Rej. | Rejeição: Duplicidade de NF-e informada na Exportação Indireta (Chave de<br>Acesso informada mais de uma vez) |

### J. Item / Veículos Novos
**Tabela (página 96)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| I70-10 | 55/65 | Se informado o Número de Controle da FCI (tag:nFCI, id:I70):<br>- Acessar Cadastro de FCI (Chave: nFCI)<br>Observação: esta regra possui previsão de implementação futura, não tendo<br>sido posta em produção até a publicação deste Manual. | Facul. | 465 | Rej. | Rejeição: Número de Controle da FCI inexistente |

**Tabela (página 96)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| I83-10 | 55/65 | Data de Fabricação dFab (id:I83) maior que a data de processamento (NT<br>2016.002) | Obrig. | 877 | Rej | Rejeição: Data de fabricação maior que a data de processamento [nItem: 999] |
| I84-10 | 55/65 | Informada data de validade dVal(id: I84) menor que Data de Fabricação dFab<br>(id: I83) (NT 2016.002) | Obrig. | 870 | Rej | Rejeição: Data de validade incompatível com data de fabricação [nItem: 999] |

**Tabela (página 96)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| J01-10 | 65 | NFC-e com grupo de Veículos novos (tag:veicProd) | Obrig. | 736 | Rej. | Rejeição: NFC-e com grupo de Veículos novos |

**Tabela (página 96)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| K01-20 | 55 | Se informado Grupo de Medicamentos (tag :med) Obrig.atório<br>preenchimento do grupo rastro (id: I80) (NT 2016.002) | Obrig. | 873 | Rej | Rejeição: Operação com medicamentos e não informado os campos de<br>rastreabilidade [nItem: 999] |

### L. Item / Armamentos
**Tabela (página 97)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| L01-10 | 65 | NFC-e com grupo de Armamentos (tag:arma) | Obrig. | 738 | Rej. | Rejeição: NFC-e com grupo de Armamentos |

**Tabela (página 97)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| LA01-20 | 55/65 | Obrigatória a informação do grupo de combustível para os CFOP constantes<br>na Tabela CFOP, indComb=1 ou 2.<br>Observação: Para a NFC-e, a regra de validação é opcional, a critério da UF.<br>Exceção: Para a NFC-e, a regra de validação não se aplica, em produção, para<br>Nota Fiscal com Data de Emissão anterior a 01/01/2016. (NT 2016.002/ NT<br>2015.002) | Facul. | 660 | Rej. | Rejeição: CFOP de Combustível e não informado grupo de combustível da NF-<br>e [nItem: nnn] |
| LA02-10 | 55/65 | Código do Produto da ANP (tag: cProdANP) inexistente na tabela de<br>codificação de produtos do Sistema de Informações de Movimentação de<br>Produtos (SIMP), disponibilizada pela ANP, para uso na NF-e. (NT 2015.003) | Obrig. | 761 | Rej. | Rejeição: Código de Produto ANP inexistente [nItem: 999] |
| LA03c-10 | 55/65 | Informado percentual do GLP (id: LA03a) ou percentual de Gás Natural<br>Nacional (id: LA03b) ou percentual de Gás Natural Importado (id: LA03c) para<br>produto diferente de "210203001 – GLP" (tag:cProdANP) (NT 2016.002) | Obrig. | 461 | Rej. | Rejeição: Informado campos de percentual de GLP e/ou GLGNn e/ou GLGNi<br>para produto diferente de GLP [nItem: 999] |
| LA03c-20 | 55/65 | Se informado GLP (cProdANP=210203001) o somatório dos percentuais<br>pGLP(id:LA03a) e pGNn(id:LA03b) e pGNi(id:LA03c) deve ser igual a 100. (NT<br>2016.002) | Obrig. | 855 | Rej. | Rejeição: Somatório percentuais de GLP derivado do petróleo, GLGNn e<br>GLGNi diferente de 100 [nItem: 999]. |
| LA03d-10 | 55 | Obrigatória a informação do campo vPart (id: LA03d) para produto<br>"210203001 – GLP" (tag:cProdANP) (NT 2016.002) | Obrig. | 856 | Rej. | Rejeição: Campo valor de partida não preenchido para produto GLP [nItem:<br>999]. |

### LB. Item / Papel Imune
**Tabela (página 98)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| LA11-10 | 65 | NFC-e sem a informação do grupo de Encerrante na venda de combustível<br>para consumidor final<br>Observação: Regra de validação opcional a critério da UF.<br>Exceção 1: A regra de validação se aplica somente para os códigos de<br>produtos ANP (cProdANP) abaixo:<br>- 810101002 - ETANOL HIDRATADO ADITIVADO<br>- 810101001 - ETANOL HIDRATADO COMUM<br>- 220101005 - GÁS NATURAL VEICULAR<br>- 220101006 - GÁS NATURAL VEICULAR PADRÃO<br>- 320103001 - GASOLINA AUTOMOTIVA PADRÃO<br>- 320102002 - GASOLINA C ADITIVADA<br>- 320102001 - GASOLINA C COMUM<br>- 320102003 - GASOLINA C PREMIUM<br>- 820101033 - ÓLEO DIESEL B S10 - ADITIVADO<br>- 820101034 - ÓLEO DIESEL B S10 - COMUM<br>- 420106001 - ÓLEO DIESEL B S10 AMD 10<br>- 820101011 - ÓLEO DIESEL B S1800 Não Rodoviário- Aditivado<br>- 820101003 - ÓLEO DIESEL B S1800 Não Rodoviário - Comum<br>- 820101013 - ÓLEO DIESEL B S500 - ADITIVADO<br>- 820101012 - ÓLEO DIESEL B S500 - COMUM<br>- 420106002 - ÓLEO DIESEL B S500 AMD 10<br>- 420301004 - OLEO DIESEL DE REFERÊNCIA S300<br>Exceção 2: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/01/2016. (NT 2015.002) | Facul. | 378 | Rej. | Rejeição: Grupo de Combustível sem a informação de Encerrante [nItem: nnn] |
| LA11-20 | 55 | Informado o grupo de “Encerrante” na NF-e (modelo 55) para CFOP diferente<br>de venda de combustível para consumidor final (CFOP= 5.656, 5.667). (NT<br>2015.002) | Obrig. | 379 | Rej. | Rejeição: Grupo de Encerrante na NF-e (modelo 55) para CFOP diferente de<br>venda de combustível para consumidor final [nItem:nnn] |
| LA16-10 | 55/65 | Valor do Encerrante final não é superior ao Encerrante inicial<br>Observação: No caso do valor do encerrante chegar ao final (zerar) o item<br>correspondente deverá ser informado com encerrante final 999... e deverá<br>ser incluído um novo item na NF a partir do encerrante com valor inicial zero.<br>(NT 2015.002) | Obrig. | 380 | Rej. | Rejeição: Valor do Encerrante final não é superior ao Encerrante inicial<br>[nItem: nnn] |

**Tabela (página 98)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| LB01-10 | 65 | NFC-e com grupo RECOPI – Papel Imune (tag:nRECOPI) | Obrig. | 348 | Rej. | Rejeição: NFC-e com grupo RECOPI |
| LB01-20 | 55 | Se não informado o número do RECOPI (tag:nRECOPI, id:LB01)<br>– Se Papel Imune (CST=41 ou CSOSN=300) e<br>– NCM papel (ver relação NCM na seção 8.12 do MOC – Visão Geral)<br>Observação: implementação futura (NT 2013/005 v 1.10) | Facul. | 349 | Rej. | Rejeição: Número RECOPI não informado |

### M. Item / Tributos do Produto e Serviço
**Tabela (página 99)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| LB01-30 | 55 | Informado número do RECOPI:<br>– Número do RECOPI inválido (Ver Seção 8.5 do MOC – Visão Geral,,<br>Identificador RECOPI) | Facul. | 350 | Rej. | Rejeição: Número RECOPI inválido |

**Tabela (página 99)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N07-10 | 55 | Não informados campos de valores do CST 51 (Diferimento):<br>- modBC (id: N13), pRedBC (id: N14), vBC (id: N15), pICMS (id: N16), vICMSOp<br>(id: N16a), pDif (id: N16b), vICMSDif (id: N16c), vICMS (id: N17)<br>Observações: Implementação a critério da UF (NT 2019.001 v1.10, v1.50) | Facul. | 929 | Rej. | Rejeição: Informado CST de diferimento sem as informações de diferimento<br>[nItem: nnn] |
| N08-10 | 55 | Grupo ICMS60 (id:N08) informado indevidamente nas operações com os<br>produtos combustíveis sujeitos a repasse interestadual (tag:cProdANP) igual<br>a 210203001, 320101001, 320101002, 320102002, 320102001, 320102003,<br>320102005, 320201001, 320103001, 220102001, 320301001, 320103002,<br>820101032, 820101026, 820101027, 820101004, 820101005, 820101022,<br>820101031, 820101030, 820101014, 820101006, 820101016, 820101015,<br>820101025, 820101017, 820101018, 820101019, 820101020, 820101021,<br>420105001, 420101005, 420101004, 420102005, 420102004, 420104001,<br>820101033, 820101034, 420106001, 820101011, 820101003, 820101013,<br>820101012, 420106002, 830101001, 420301004, 420202001, 420301001,<br>420301002, 410103001, 410101001, 410102001, 430101004, 510101001,<br>510101002, 510102001, 510102002, 510201001, 510201003, 510301003,<br>510103001, 510301001<br>Obs.: Para CST 60 Obrig.atório o preenchimento do Grupo Repasse de ICMS<br>ST (id:N10b) com o Campo Tributação do ICMS (id:N12) igual a 60 (NT<br>2016.002) | Obrig. | 858 | Rej | Rejeição: Grupo de Tributação informado indevidamente [nItem: 999] |
| N12-10 | 55 | CFOP de Exportação (inicia por 7):<br>– Informado CST de ICMS diferente de 41 ou CSOSN diferente de 300 (NT<br>2010/010)<br>Exceção: A regra acima não se aplica para a NF-e de devolução (finNFe=4). | Facul. | 527 | Rej. | Rejeição: Operação de Exportação com informação de ICMS incompatível |
| N12-20 | 55/65 | Informado CST (id:N12) para CRT (id:C21) igual a 1 (NT 2010/010) | Facul. | 590 | Rej. | Rejeição: Informado CST para emissor do Simples Nacional (CRT=1) |

**Tabela (página 100)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-30 | 65 | NFC-e com CST diferente da relação abaixo:<br>- 00-Tributada integralmente;<br>- 20-Com redução da Base de Cálculo;<br>- 40-Isenta;<br>- 41-Não tributada;<br>- 60-ICMS cobrado anteriormente por substituição tributária;<br>Exceção 1: Aceitar CST=90-Outros, a critério da UF.<br>Exceção 2: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. (NT 2015.002) | Obrig. | 766 | Rej. | Rejeição: Item com CST indevido [nItem:nnn] |
| N12-34 | 65 | NFC-e com CST=90, informando dados do ICMS-ST (tag: ICMS90/modBCST)<br>(NT 2015.002) | Obrig. | 381 | Rej. | Rejeição: Grupo de tributação ICMS90, informando dados do ICMS-ST<br>[nItem:nnn] |
| N12-40 | 65 | NFC-e com CST=00, 20, 40, 41 ou 90 e<br>- CFOP diferente de 5.101, 5.102, 5.103, 5.104, 5.115 (NT 2015.002) | Obrig. | 382 | Rej. | Rejeição: CFOP não permitido para o CST informado [nItem:nnn] |
| N12-44 | 65 | NFC-e com CST=60 (ICMS cobrado anteriormente por ST) e CFOP diferente de<br>5.405, 5.656, 5.667 (NT 2015.002) | Obrig. | 382 | Rej. | Rejeição: CFOP não permitido para o CST informado [nItem:nnn] |
| N12-50 | 65 | NFC-e com Partilha de ICMS entre UF (tag:ICMS/ICMSPart) | Obrig. | 741 | Rej. | Rejeição: NFC-e com Partilha de ICMS entre UF |
| N12-60 | 65 | NFC-e com repasse de ICMS-ST retido anteriormente em operação<br>interestadual com repasse pelo SubstitutoTributário (tag: ICMS/ICMSST) (NT<br>2015.002) | Obrig. | 740 | Rej. | Rejeição: Item com Repasse de ICMS retido por Substituto Tributário [nItem:<br>nnn] |

**Tabela (página 101)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-70 | 55 | Operação com Não Contribuinte (indIEDest=9) e CST difere da relação abaixo:<br>- 00-Tributada integralmente;<br>- 20-Com redução da Base de Cálculo;<br>- 40-Isenta;<br>- 41-Não tributada;<br>- 60-ICMS cobrado anteriormente por substituição tributária;<br>Exceção 1: A regra de validação acima não se aplica para NF-e de entrada<br>(tpNF=0-Entrada).<br>Exceção 2: A regra de validação acima não se aplica, para o CST=50<br>(Suspensão), nas operações com CFOP de Retorno de Mercadorias (Tabela<br>CFOP, indRetor=1), nem nas operações com CFOP de Remessa de<br>Mercadorias (Tabela CFOP, indRemes=1), e nem nas operações com CFOP<br>5.949 ou 6.949.<br>Exceção 3: A regra de validação acima não se aplica quando houver ao menos<br>um item de venda de veículos novos (grupo “veicProd”).<br>Exceção 4: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016.<br>Exceção 5: A regra de validação não se aplica para o CST=30 (Isenta ou não<br>tributada e com cobrança do ICMS por substituição tributária), em operação<br>interestadual (idDest=2) com combustíveis (tag: comb) derivados de petróleo<br>(código ANP diferente de: 820101001, 820101010, 810102001, 810102004,<br>810102002, 810102003, 810101002, 810101001, 810101003, 220101003,<br>220101004, 220101002, 220101001, 220101005, 220101006, 560101001).<br>Exceção 6: A regra de validação acima não se aplica, para os CST=50<br>(Suspensão) e 51 (Diferimento), nas operações de devolução (finNFe=4).<br>Exceção 7: A regra de validação acima não se aplica, para o CST=51<br>(Diferimento), nas operações com CFOP 5.123, 5.922, 6.123 e 6.922, nem nas<br>operações internas (idDest=1).de retorno de Mercadoria depositada em<br>depósito fechado ou armazém geral (CFOP 5.906 ou 5.907).<br>Exceção 8: A critério da UF a regra de validação não se aplica para o CST=10<br>(Tributada e com cobrança do ICMS por substituição tributária) em operação<br>interna (idDest=1).<br>(NT 2017.002 / NT 2015.003) | Obrig. | 508 | Rej. | Rejeição: CST incompatível na operação com Não Contribuinte [nItem: 999] |

**Tabela (página 102)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-80 | 55 | Operação com Contribuinte Isento de Inscrição Estadual<br>(indIEDest=2) e CST constante na relação abaixo:<br>- 50-Suspensão na cobrança do ICMS;<br>- 51-Diferimento na cobrança do ICMS.<br>Exceção 1: A regra de validação acima não se aplica para o CST=50-<br>Suspensão, nas operações com CFOP de conserto ou reparo (CFOP 1915,<br>1916, 2915, 2916, 5915, 5916, 6915 e 6916) ou de remessa para<br>demonstração dentro do Estado (CFOP 1912, 1913, 5912 e 5913).<br>Exceção 2: A regra de validação acima não se aplica, em produção, para Nota<br>Fiscal com data de emissão anterior a 01/07/2016.<br>Exceção 3: A critério da UF, a regra de validação acima não se aplica para<br>CST=51-Diferimento em operações internas (idDest=1) quando o destinatário<br>for Pessoa Jurídica (tag:dest/CNPJ).<br>Exceção 4: Esta regra não se aplica na emissão da NFA-e nas operações<br>internas, a critério da UF. (NT 2017.002 / NT 2015.003) | Obrig. | 529 | Rej. | Rejeição: CST incompatível na operação com Contribuinte Isento de Inscrição<br>Estadual [nItem: 999] |
| N12-81 | 55/65 | Se informado CST 60 em operações que não sejam para consumidor final (tag:<br>indFinal=0, “Normal”):<br>- Não informada Base de Cálculo ICMS Retido na operação anterior (tag:<br>vBCSTRet), Alíquota suportada pelo Consumidor<br>Final (tag: pST) e Valor do ICMS ST Retido na operação anterior (tag:<br>vICMSSTRet).<br>Observação: Implementação opcional a critério da UF. (Atualizado NT<br>2018.005 v1.30) | Facul. | 938 | Rej. | Rejeição: Não informada BCST, pST e ICMSST retido na operação anterior<br>[nItem: 999] |
| N12-82 | 55/65 | Se Informado CST = 60 em operações a consumidor final (tag: indFinal=1,<br>“Consumidor final”), preenchimento Obrig.atório dos campos do grupo<br>opcional para informações do ICMS Efetivo (N33)<br>Observação: Implementação opcional a critério da UF. (NT 2018.005) | Facul. | 906 | Rej. | Rejeição: Não informados os campos para informações do ICMS Efetivo.<br>[nItem: nnn] |
| N12-84 | 55/65 | Se informado CST com benefício fiscal (CST = 20, 30, 40, 41, 50, 51, 60, 70 ou<br>90):<br>- Obrig.atório informar o código de benefício fiscal (tag: cBenef)<br>Observação 1: Implementação a critério da UF, por modelo de DF-e e por CST.<br>Observação 2: Tabela de código de benefício fiscal por UF publicada no Portal<br>Nacional da NF-e<br>Exceção: Não se aplica esta regra de validação no caso de CST=90 e:<br>- Percentual de Redução de Base de Cálculo (tag: pRedBC) igual a zero;<br>- e (Percentual de Redução de Base de Cálculo do ICMS-ST (tag: pRedBCST)<br>igual a zero e operação interna (idDest=1). (NT 2019.001 v1.10, v1.50) | Facul. | 930 | Rej. | Rejeição: CST com benefício fiscal e não informado o código de benefício<br>fiscal [nItem: nnn] |

**Tabela (página 103)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-85 | 55/65 | Se informado CST e não informado código de benefício fiscal:<br>- Verificar se CST exige código de benefício fiscal (tag: cBenef), conforme<br>tabela de código de benefício fiscal por UF publicada no Portal da Secretaria<br>de Fazenda da respectiva UF.<br>Observação 1: Implementação a critério da UF, por modelo de DF-e e por CST.<br>Observação 2: Para o CST informado, o sistema autorizador apenas verifica se<br>existe qualquer cBenef na tabela publicada no Portal da Secretaria de Fazenda<br>da respectiva UF, sem verificar a compatibilidade.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior;<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se se aplica quando Tipo de Operação<br>(tag: tpNF) igual à Entrada. (NT 2019.001 v1.50) | Facul. | 930 | Rej. | Rejeição: CST com benefício fiscal e não informado o código de benefício<br>fiscal [nItem: nnn] |

**Tabela (página 104)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-86 | 55/65 | Se informado CST e informado código de benefício fiscal:<br>- Verificar se CST não possui código de benefício fiscal, conforme tabela de<br>código de benefício fiscal por UF publicada no Portal da Secretaria de Fazenda<br>da respectiva UF.<br>Observação 1: Implementação a critério da UF, por modelo de DF-e e CST.<br>Observação 2: Para o CST informado, o sistema apenas verifica se não existe<br>qualquer cBenef na tabela publicada no Portal da Secretaria de Fazenda da<br>respectiva UF, sem verificar a compatibilidade.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior.<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se aplica quando Tipo de Operação (tag:<br>tpNF) igual à Entrada. (NT 2019.001 v1.50) | Facul. | 928 | Rej. | Rejeição: Informado código de benefício fiscal para CST sem benefício fiscal<br>[nItem: nnn] |
| N12-88 | 55/65 | Se informado código de benefício fiscal (tag: cBenef):<br>- verificar se tipo de código do benefício corresponde ao CST com benefício<br>fiscal.<br>Exemplo: Código de benefício fiscal de isenção deve ser utilizado com CST de<br>isenção.<br>Observação 1: Implementação a critério da UF, por modelo de DF-e e por CST.<br>Observação 2: Tabela de código de benefício fiscal por UF publicada no Portal<br>Nacional da NF-e (NT 2019.001 v1.10, v1.50) | Facul. | 931 | Rej. | Rejeição: CST não corresponde ao tipo de código de benefício fiscal [nItem:<br>nnn] |

**Tabela (página 105)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-90 | 55/65 | Se CST de ICMS = (20, 30, 40, 41, 50, 70 ou 90):<br>- Verificar se informado o valor do ICMS desonerado (tag:vICMSDeson) e o<br>Motivo da Desoneração (tag: motDesICMS).<br>Observação: Implementação a critério da UF, por modelo de DF-e e por CST.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior;<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se aplica quando Tipo de Operação (tag:<br>tpNF) igual à Entrada.<br>Exceção 5: Não se aplica esta regra de validação no caso de CST=90 e: -<br>Percentual de Redução de Base de Cálculo (tag: pRedBC) igual a zero; - e<br>(Percentual de Redução de Base de Cálculo do ICMS-ST (tag: pRedBCST) igual<br>a zero (NT 2019.001 v1.10, v1.50) | Facul. | 934 | Rej. | Rejeição: Não informado valor do ICMS desonerado ou o Motivo de<br>desoneração [nItem: nnn] |

**Tabela (página 106)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-94 | 55/65 | Se informado CST e informado código de benefício fiscal:<br>- Verificar se código de benefício fiscal corresponde ao CST informado,<br>conforme tabela de código de benefício fiscal por UF publicada no Portal da<br>Secretaria de Fazenda da respectiva UF.<br>Observação: Implementação a critério da UF, por modelo de DF-e e por CST.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior.<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se aplica quando Tipo de Operação (tag:<br>tpNF) igual à Entrada. Nota: Para itens sem benefício fiscal, a UF poderá exigir<br>a informação da literal “SEM CBENEF” para alguns CST, vide tabela publicada<br>no Portal da Secretaria de Fazenda da respectiva UF.<br>Nota: Para itens sem benefício fiscal, a UF poderá exigir a informação da<br>literal “SEM CBENEF” para alguns CST, vide tabela publicada no Portal<br>Nacional Fazenda da respectiva UF. | Facul. | 931 | Rej. | Rejeição: Informado código de benefício fiscal incompatível com CST e UF<br>[nItem: nnn] |
| N12-97 | 55 | Não informados campos de valores do CST 51 (Diferimento):<br>- modBC (id: N13), pRedBC (id: N14), vBC (id: N15), pICMS (id: N16), vICMSOp<br>(id: N16a), pDif (id: N16b), vICMSDif (id: N16c), vICMS (id: N17)<br>Observações: Regra de Validação opcional a critério da UF.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior.<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se aplica quando Tipo de Operação (tag:<br>tpNF) igual à Entrada. (NT2019.001) | Facul. | 929 | Rej. | Rejeição: Informado CST de diferimento sem as informações de diferimento<br>[nItem: nnn] |

**Tabela (página 107)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12-98 | 55/65 | Se informado código de benefício fiscal:<br>- Verificar se código de benefício fiscal existe e está vigente, conforme tabela<br>de código de benefício fiscal por UF publicada no Portal da Secretaria de<br>Fazenda da respectiva UF.<br>Observação: Implementação a critério da UF e por modelo de DF-e.<br>Exceção 1: a RV não se aplica quando Finalidade de emissão da NFe (tag:<br>finNFe) igual a Devolução de Mercadoria e Identificador de local de destino da<br>operação (tag: idDest) igual a Operação interestadual ou com o Exterior.<br>Exceção 2: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a Devolução de Mercadoria;<br>Exceção 3: a critério da UF, a RV não se aplica quando Finalidade de emissão<br>da NF-e (tag: finNFe) igual a NF-e de Ajuste;<br>Exceção 4: a critério da UF, a RV não se aplica quando Tipo de Operação (tag:<br>tpNF) igual à Entrada.<br>Exceção 5: essa RV não se aplica quando informado CSOSN (operação<br>realizada por optante pelo Simples Nacional). (NT2019.001 v1.50) | Facul. | 946 | Rej. | Rejeição: Informado código de benefício fiscal incorreto ou inexistente na UF<br>[nItem: nnn] |
| N12a-10 | 55/65 | Informado CSOSN (id:N12a) para CRT (id:C21) diferente de 1<br>(NT 2010/010) | Facul. | 591 | Rej. | Rejeição: Informado CSOSN para emissor que não é do Simples Nacional (CRT<br>diferente de 1) |
| N12a-20 | 65 | NFC-e com CSOSN diferente da relação abaixo:<br>- 102-Tributação SN sem permissão de crédito;<br>- 103-Tributação SN, com isenção para faixa de receita bruta;<br>- 300-Imune;<br>- 400-Não tributada pelo Simples Nacional;<br>- 500-ICMS cobrado anteriormente por substituição tributária ou<br>por antecipação;<br>Exceção 1: Aceitar CSOSN=900-Outros, a critério da UF.<br>Exceção 2: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. (NT 2015.002) | Obrig. | 383 | Rej. | Rejeição: Item com CSOSN indevido [nItem: nnn] |
| N12a-50 | 55/65 | Se informado CSOSN = 500 em operações que não sejam para consumidor<br>final (tag: indFinal=0, “Normal”):<br>- Não informada Base de Cálculo ICMS Retido na operação anterior (tag:<br>vBCSTRet), Alíquota suportada pelo Consumidor<br>Final (tag: pST) e Valor do ICMS ST Retido na operação anterior (tag:<br>vICMSSTRet).<br>Observação: Implementação opcional a critério da UF. (Atualizado na NT<br>2018.005 v1.30) | Facul. | 938 | Rej. | Rejeição: Não informada BCST, pST e ICMSST retido na operação anterior<br>[nItem: 999] |

**Tabela (página 108)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N12a-60 | 55/65 | Se Informado CSOSN=500 em operações a consumidor final (tag: indFinal=1,<br>“Consumidor final”), preenchimento Obrig.atório dos campos do grupo<br>opcional para informações do ICMS Efetivo (N33)<br>Observação: Implementação opcional a critério da UF. (NT 2018.005) | Facul. | 906 | Rej. | Rejeição: Não informados os campos para informações do ICMS Efetivo.<br>[nItem: nnn] |
| N12a-30 | 65 | NFC-e com CSOSN 103 ou 400 não permitidos para a UF.<br>Observação: Regra de validação opcional a critério da UF.<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. (NT 2015.002) | Obrig. | 384 | Rej. | Rejeição: CSOSN não permitido para a UF [nItem: nnn] |
| N12a-34 | 65 | NFC-e com CSOSN=900, informando dados do ICMS-ST (tag:<br>ICMSSN900/modBCST) (NT 2015.002) | Obrig. | 385 | Rej. | Rejeição: Grupo de tributação ICMSSN900, informando dados do ICMS-ST<br>[nItem: nnn] |
| N12a-40 | 65 | NFC-e com CSOSN=102, 103, 300, 400 ou 900 CFOP diferente de 5.101, 5.102,<br>5.103, 5.104, 5.115 (NT 2015.002) | Obrig. | 386 | Rej. | Rejeição: CFOP não permitido para o CSOSN informado [nItem: nnn] |
| N12a-44 | 65 | NFC-e com CSOSN=500 (ICMS cobrado anteriormente) CFOP diferente de<br>5.405, 5.656, 5.667 (NT 2015.002) | Obrig. | 386 | Rej. | Rejeição: CFOP não permitido para o CSOSN informado [nItem: nnn] |
| N12a-70 | 55 | Operação com Não Contribuinte (indIEDest=9) e CSOSN difere da<br>relação abaixo:<br>- 102-Tributação SN sem permissão de crédito;<br>- 103-Tributação SN, com isenção para faixa de receita bruta;<br>- 300-Imune;<br>- 400-Não tributada pelo Simples Nacional;<br>- 500-ICMS cobrado anteriormente por substituição tributária ou por<br>antecipação;<br>Exceção 1: A regra de validação acima não se aplica para NF-e de entrada<br>(tpNF=0-Entrada).<br>Exceção 2: A regra de validação acima não se aplica nas operações com CFOP<br>de conserto ou reparo (CFOP 5915, 5916, 6915 e 6916) ou de remessa para<br>demonstração dentro do Estado (CFOP 5912 e 5913).<br>Exceção 3: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016. (NT 2015.003) | Obrig. | 600 | Rej. | Rejeição: CSOSN incompatível na operação com Não Contribuinte [nItem:<br>999] |

**Tabela (página 109)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N16-04 | 55 | Validação alíquota do ICMS na operação interestadual de produtos<br>importados (NT 2012/005 e NT2013/006):<br>- Operação Interestadual de Saída (idDest=2 e tpNF=1); - Origem da<br>mercadoria = 1, 2, 3 ou 8;<br>- CST de ICMS = 00, 10, 20, 70 ou 90;<br>- Data de Emissão igual ou superior a 01/01/2013;<br>- Valor alíquota do ICMS maior do que “4.00” (4 por cento).<br>Exceção 0: Para as NF-e com Data de Emissão anterior a 01/07/2016, a regra<br>de validação acima não se aplica para destinatário Não Contribuinte<br>(tag:dest/indIEDest=9).<br>Exceção 1: A regra acima não se aplica para as operações de Devolução<br>(finNFe=4).<br>Exceção 2: A regra de validação acima não se aplica para as operações com<br>CFOP de Retorno de Mercadorias (Tabela CFOP, indRetor=1).<br>Exceção 3: A regra de validação acima não se aplica na venda de veículos<br>novos (grupo “veicProd”) se existir ao menos um item de Venda direta para<br>grandes consumidores (tpOp=3), ou de Faturamento direto para consumidor<br>final (tpOp=2).<br>Exceção 4: : Para as NF-e com Data de Emissão anterior a 01/07/2016, mesmo<br>que informada a IE do destinatário, a regra de validação acima não se aplica<br>para as operações com os CFOP 6107, 6108 (Não Contribuinte).Exceção 5: A<br>regra de validação acima não se aplica para a NF<br>Complementar (finNFe=2) quando:<br>- Se referenciada uma NF-e, a NF-e referenciada tem a Data de Emissão<br>anterior a 01/01/13;<br>- Se referenciada uma NF modelo 1, a Data de Emissão é anterior a 1301 (tag<br>refNF/AAMM).<br>Exceção 6: Para as NF-e com Data de Emissão anterior a 01/07/2016, mesmo<br>que informada a IE do destinatário, a regra de validação acima não se aplica<br>para as operações com o CFOP 6.929 - Lançamento relativo a operação<br>registrada em Cupom Fiscal (NT 2013/004)<br>Exceção 7: A regra de validação acima não se aplica para as operações de<br>venda à ordem (CFOP 6.118, 6.119, 6.122 e 6.123). (NT 2017.002 / NT<br>2015.003) | Facul. | 663 | Rej. | Rejeição: Alíquota do ICMS com valor superior a 4 por cento na operação de<br>saída interestadual com produtos importados [nItem: 999] |

**Tabela (página 110)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N16-20 | 55 | Validação alíquota do ICMS na operação interestadual de Saída Normal:<br>- Operação Interestadual de Saída Normal (idDest=2, tpNF=1 e<br>finNFe=1);<br>- Origem da mercadoria difere de 1, 2, 3 ou 8;<br>- Valor alíquota do ICMS (tag:pICMS) maior do que “7.00” (7 por<br>cento) para os Estados de origem (enderEmit/UF) do Sul e Sudeste, exceto ES,<br>destinado (enderDest/UF) para os Estados do Norte, Nordeste, Centro-Oeste<br>e Espírito Santo.<br>- Valor alíquota do ICMS (tag:pICMS) maior do que “12.00” (12 por<br>cento) para os demais casos.<br>Exceção 1: Para as NF-e com Data de Emissão anterior a 01/07/2016, a regra<br>de validação acima não se aplica para destinatário Não Contribuinte<br>(tag:dest/indIEDest=9).<br>Exceção 2: A regra de validação acima não se aplica na venda de veículos<br>novos (grupo “veicProd”) se existir ao menos um item de Venda direta para<br>grandes consumidores (tpOp=3), ou de Faturamento direto para consumidor<br>final (tpOp=2).<br>Exceção 3: A regra de validação acima não se aplica para as operações com<br>CFOP de Retorno de Mercadorias ou Anulação de Valor (Tabela CFOP,<br>indRetor=1 ou indAnula=1).<br>Exceção 4: A regra de validação acima não se aplica para as operações de<br>venda à ordem (CFOP 6.118, 6.119, 6.122 e 6.123)<br>Exceção 5: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) diferente da UF do emitente (tag:<br>enderEmit/UF);<br>Exceção 6: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) diferente da UF do destinatário (tag:<br>enderDest/UF); (NT 2017.002 / NT 2015.003) | Obrig. | 693 | Rej. | Rejeição: Alíquota de ICMS superior à definida para a operação interestadual<br>[nItem: 999] |
| N16a-10 | 55 | Se CST de ICMS = 51 (diferimento):<br>– Valor ICMS da Operação (id:N16a) difere de Base de Cálculo (id:N15) *<br>Alíquota (id:N16) (*4)<br>Observação: Campos opcionais não informados serão considerados como se<br>tiverem sido informados com valor = zero. | Facul. | 351 | Rej. | Rejeição: Valor do ICMS da Operação no CST=51 difere do produto BC e<br>Alíquota [nItem: 999] |
| N16c-10 | 55 | Se CST de ICMS = 51 (diferimento):<br>– Valor do ICMS diferido (id:N16c) difere do produto do Valor do ICMS da<br>Operação (id:N16a) e percentual do diferimento (id:N16b) (*4)<br>Observação: Campos opcionais não informados serão considerados como se<br>tiverem sido informados com valor = zero. | Facul. | 352 | Rej. | Rejeição: Valor do ICMS Diferido no CST=51 difere do produto Valor ICMS<br>Operação e percentual diferimento [nItem: 999] |
| N17-10 | 55 | Se CST de ICMS = 51 (diferimento):<br>– Valor do ICMS (id:N17) não corresponde a diferença do Valor do ICMS da<br>Operação (id:N16a) e Valor do ICMS diferido (id:N16c)<br>Exceção: A regra de validação acima não se aplica caso não forem informados<br>os dois campos: vICMSDif e vICMS.<br>Observação: Campos opcionais não informados serão considerados como se<br>tiverem sido informados com valor = zero. | Facul. | 353 | Rej. | Rejeição: Valor do ICMS no CST=51 não corresponde a diferença do ICMS<br>operação e ICMS diferido [nItem: 999] |

**Tabela (página 111)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N17-20 | 55/65 | Se CST de ICMS = 00, 10, 20, 70 e tag:finNFe = 1 (id:B25)<br>– Valor ICMS (id:N17) difere de Base de Cálculo (id:N15) * Alíquota (id:N16)<br>(*4) (NT 2010/010): | Facul. | 528 | Rej. | Rejeição: Valor do ICMS difere do produto BC e Alíquota [nItem: 999] |
| N17b-10 | 55/65 | Informado percentual de FCP (id:N17b) igual a zero.<br>Nota: Não informar os campos relativos a FCP para os produtos não sujeitos à<br>sua incidência. (NT 2016.002) | Obrig. | 880 | Rej. | Rejeição: Percentual de FCP igual a zero [nItem: 999] |
| N17b-20 | 55/65 | Se informado percentual de FCP (id:N17b), percentual de FCP validado<br>conforme tabela de alíquota definida por UF do emitente (tag:enderEmit/UF,<br>id:C12). (NT 2016.002) | Obrig. | 874 | Rej. | Rejeição: Percentual de FCP inválido [nItem: 999] |
| N17c-10 | 55/65 | Informado a tag vFCP (id:N17c) e finNFe=1 (id:B25), verificar:<br>- Se CST=00 e vFCP (id:N17c) difere da vBC (id:N15)* pFCP (id:N17b) (*4) ou<br>- Se CST=10, 20,70, 90 ou 51 e vFCP (id:N17c) difere da vBCFCP (id:N17a)*<br>pFCP (id:N17b) (*4) (NT 2016.002) | Obrig. | 860 | Rej | Rejeição: Valor do FCP informado difere de base de cálculo*alíquota [nItem:<br>999] |
| N17c-20 | 55 | Se Operação interestadual (tag:idDest=2) para Consumidor Final (tag:<br>indFinal=1), não contribuinte (tag: indIEDest=9) e informado o valor do FCP<br>(tag: vFCP)<br>Observação: Em operações interestaduais para consumidor final não<br>contribuinte, o valor do FCP, quando existir, deve ser informado no<br>campo vFCPUFDest (id:NA13). (NT 2016.002) | Obrig. | 876 | Rej | Rejeição: Operação interestadual para Consumidor Final e valor do FCP<br>informado em campo diferente de vFCPUFDest (id:NA13) [nItem: 999] |
| N18-10 | 55 | Se o campo modBCST = “4” Margem Valor Agregado, Obrigatório o<br>preenchimento do campo pMVAST<br>Nota: Regra de Validação opcional a critério da UF<br>(NT 2019.001 v1.10, v1.50) | Facul. | 932 | Rej. | Rejeição: Informada modalidade de determinação da BC da ST como MVA e<br>não informado o campo pMVAST [nItem: nnn] |
| N18-20 | 55 | Se o campo modBCST <> “4” Margem Valor Agregado, não deverá ser<br>preenchido o campo pMVAST<br>Nota: Regra de Validação opcional a critério da UF<br>(NT 2019.001 v1.10, v1.50) | Facul. | 933 | Rej. | Rejeição: Informada modalidade de determinação da BC da ST diferente de<br>MVA e informado o campo pMVAST [nItem: nnn] |

**Tabela (página 112)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N23-10 | 55 | Operação sem informação do campo CEST, e CST ou CSOSN da relação abaixo:<br>-10-tributada com cobrança de ICMS por substituição tributária<br>-30-isenta ou não tributada com cobrança de ICMS por substituição<br>tributária<br>-60-ICMS cobrado anteriormente por substituição tributária<br>-70-com redução de base de cálculo e cobrança de ICMS por<br>substituição tributária<br>-90-outros, desde que com valor de ICMS retido por substituição<br>tributária (tag: vICMSST diferente de zero)<br>-201-tributada pelo Simples Nacional com permissão de crédito e<br>com cobrança do ICMS por substituição tributária<br>-202-tributada pelo Simples Nacional sem permissão de crédito e<br>com cobrança do ICMS por substituição tributária<br>-203-isenção de ICMS do Simples Nacional para a faixa de receita,<br>com cobrança do ICMS por substituição tributária<br>-500-ICMS cobrado anteriormente por substituição tributária ou por<br>antecipação;<br>-900-outros, desde que com valor de ICMS retido por substituição<br>tributária (tag: vICMSST diferente de zero).<br>Exceção 1: A regra de validação não se aplica se informado o Grupo de<br>Partilha do ICMS (campo ICMSPart).<br>(NT 2015.003) | Obrig. | 806 | Rej. | Rejeição: Operação com ICMS-ST sem informação do CEST [nItem: 999] |
| N23b-10 | 55 | Informado percentual de FCP ST (tag:N23b) igual a zero.<br>Nota: não informar os campos relativos a FCP ST para os produtos não<br>sujeitos à sua incidência. (NT 2016.002) | Obrig. | 881 | Rej. | Rejeição: Percentual de FCPST igual a zero [nItem: 999] |
| N23b-20 | 55 | Se UF do destinatário diferente de “EX” e se informado percentual de FCP ST<br>(tag:N23b), percentual de FCP validado conforme tabela de alíquota definida<br>por UF.<br>Obs.1: Utilizar a UF do destinatário na validação (tag: enderDest/UF, id:E12);<br>Obs.2: Quando informada a UF do local de entrega (tag: entrega/UF)<br>diferente de “EX”, aceitar como válidas tanto a alíquota da UF do destinatário<br>(tag: enderDest/UF; id:E12) quanto a alíquota da UF de entrega (tag:<br>entrega/UF).<br>Obs.: Implementação Futura (NT 2016.002) | Obrig. | 875 | Rej. | Rejeição: Percentual de FCPST inválido [nItem: 999] |
| N23d-10 | 55 | Informado a tag vFCPST (id:N23d) e finNFe=1 (id:B25), verificar:<br>- Se informado CST= 10 ou 30 ou 70 ou 90 ou CSOSN=201 ou 202 ou 203 ou<br>900 e vFCPST (id:N23d) difere da vBCFCPST (id:N23a)* pFCPST (id:N23b) -<br>vFCP (id:N17c) (*4)<br>Obs.1: Campos não informados devem ser considerados como “0"<br>Obs.2: Regra de validação aplicável a critério da UF (NT 2016.002) | Obrig. | 860 | Rej | Rejeição: Valor do FCP informado difere de base de cálculo*alíquota [nItem:<br>999] |
| N27b-10 | 55/65 | Informado percentual de FCP ST retido (id:N27b) igual a zero.<br>Nota: não informar os campos relativos a FCP ST para os produtos não<br>sujeitos à sua incidência. (NT 2016.002) | Obrig. | 881 | Rej. | Rejeição: Percentual de FCPST igual a zero [nItem: 999] |

**Tabela (página 113)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| N27b-20 | 55/65 | Se UF do destinatário diferente de “EX” e se informado percentual de FCP ST<br>retido (id:N27b), percentual de FCP validado conforme tabela de alíquota<br>definida por UF.<br>Obs.1: Utilizar a UF do destinatário na validação (tag: enderDest/UF; id:E12);<br>Obs.2: Quando informada a UF do local de entrega (tag: entrega/UF)<br>diferente de “EX, aceitar como válidas tanto a alíquota da UF de destinatário<br>(tag: enderDest/UF; id:E12) quanto a alíquota da UF de entrega (tag:<br>entrega/UF). (NT 2016.002) | Obrig. | 875 | Rej. | Rejeição: Percentual de FCPST inválido [nItem: 999] |
| N27d-10 | 55/65 | Informado a tag vFCPSTRet (id:N27d) e finNFe=1 (id:B25), verificar:<br>- Se CST=60 ou CSOSN=500 e vFCPSTRet (id:N27d) difere da vBCFCPSTRet<br>(id:N27a)* pFCPSTRet (id:N27b) (*4)<br>Obs.: regra de validação para implementação futura (NT 2016.002) | Obrig. | 860 | Rej | Rejeição: Valor do FCP informado difere de base de cálculo*alíquota [nItem:<br>999] |
| N28-10 | 55/65 | Se informado motDesICMS = 7 (desoneração Suframa):<br>– tag:ISUF (id:E18) deve ser informado (NT 2011/004)<br>Exceção: Não exigir a Inscrição Suframa se informado CFOP de entrada (inicia<br>por 1 ou 2) (NT 2012/003) | Facul. | 625 | Rej. | Rejeição: Inscrição SUFRAMA deve ser informada na venda com isenção para<br>ZFM [nItem: 999] |
| N28-20 | 55 | Se informado tag:motDesICMS = 7 (desoneração Suframa):<br>– deve ser informado um dos CFOP abaixo:<br>1203, 1204, 1208, 1209, 2203, 2204, 2208, 2209, 5109, 5110,<br>5120, 5151, 5152, 5651, 5652, 5654, 5655, 5658, 5659, 5910, 6905, 6109,<br>6110, 6120, 6122, 6123, 6151, 6152, 6651, 6652, 6654, 6655, 6658, 6659,<br>6910, 6923 (NT 2012/003) (NT 2013/005 v1.10) | Facul. | 626 | Rej. | Rejeição: CFOP de operação isenta para ZFM diferente do previsto [nItem:<br>999] |
| N28-30 | 55/65 | Se informado tag:motDesICMS, o vICMSDeson (id:N28a) deve ser maior que<br>zero (NT 2011/004).<br>Observação: O motivo da desoneração pode ocorre nos grupos de tributação<br>do ICMS 20, 30, 40, 70 e 90. (NT 2016.002) | Facul. | 627 | Rej. | Rejeição: O valor do ICMS desonerado deve ser informado [nItem: 999] |
| N33-10 | 55/65 | Se Informado CST = 60 ou CSOSN=500 e indFinal=1 (id:B25a), preenchimento<br>Obrig.atório dos campos do grupo opcional para informações do ICMS Efetivo<br>(N33)<br>Observação: Implementação opcional a critério da UF. (NT 2016.002)<br>(REMOVIDA NA NT 2018.005) | Facul. | 906 | Rej. | Rejeição: Não informados os campos do grupo opcional para informações do<br>ICMS Efetivo, Obrig.atório quando CST = 60 ou CSOSN=500 e operação com<br>c onsumidor final [nItem: nnn] |

### NA. Item / ICMS para a UF de Destino
**Tabela (página 115)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| NA01-10 | 65 | Informado grupo “ICMSUFDest” para a NFC-e (NT 2015.003) | Obrig. | 807 | Rej. | Rejeição: NFC-e com grupo de ICMS para a UF do destinatário |
| NA01-20 | 55 | Não informado grupo de ICMS para a UF de Destino (tag:ICMSUFDest):<br>- Operação Interestadual (idDest=2) e<br>- Operação com Consumidor Final (indFinal=1) e<br>- Operação com Não Contribuinte (indIEDest=9) e<br>- Não é operação de prestação de serviços (não existe tag “ISSQN”).<br>Exceção 1: Esse grupo não deve ser exigido se o Grupo de Partilha do ICMS<br>(campo ICMSPart) estiver preenchido.<br>Exceção 2: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016.<br>Exceção 3: A regra de validação não se aplica para Devolução de Mercadoria<br>(finNFe=4) que referencie Nota Fiscal com chave de acesso anterior a 2016.<br>Exceção 4: A regra de validação acima não se aplica para as operações com<br>CFOP de Retorno de Mercadorias (Tabela CFOP, indRetor=1).<br>Exceção 5: A regra de validação acima não se aplica nas NF-e de entrada<br>(tpNF=0).<br>Exceção 6: A regra de validação acima não se aplica nas operações com<br>combustíveis (tag:comb) derivados de petróleo com código ANP diferente de:<br>820101001, 820101010, 810102001, 810102004, 810102002, 810102003,<br>810101002, 810101001, 810101003, 220101003, 220101004, 220101002,<br>220101001, 220101005, 220101006, 560101001.<br>Exceção 7: A regra de validação acima não se aplica se informada UF do local<br>de entrega (tag: entrega/UF) igual à UF do emitente (tag:<br>emit/enderEmit/UF).<br>Exceção 8: A regra de validação acima não se aplica para as operações com<br>CFOP de Remessa de Mercadoria (Tabela CFOP, indRemes=1).<br>Exceção 9: A regra de validação acima não se aplica para os CFOP:<br>- 6.552 - Transferência de bem do ativo imobilizado;<br>- 6.922 - Lançamento efetuado a título de simples faturamento decorrente de<br>venda p/ entrega futura;<br>- 6.929 - Lançamento relativo a Cupom Fiscal.<br>Exceção 10: Esta regra de validação não se aplica nas operações isentas<br>(CST=40-Isenta ou CSOSN=103-Isento), imunes ou não tributadas (CST=41- | Obrig. | 694 | Rej. | Rejeição: Não informado o grupo de ICMS para a UF de destino [nItem: 999] |

**Tabela (página 116)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
|  |  | Não tributada, ou CSOSN=300-Imune, ou CSOSN=400-Não tributada pelo<br>Simples Nacional).<br>Exceção 11: A regra de validação acima não se aplica nas NF-e<br>complementares (finNFe=2) nem nas de ajuste (finNFe=3).<br>Exceção 12: A regra de validação acima não se aplica para emitentes optantes<br>pelo Simples Nacional (CRT=1).<br>(NT 2017.002 / NT 2015.003) |  |  |  |  |
| NA01-30 | 55 | Informado indevidamente o grupo de ICMS para a UF de Destino<br>(tag:ICMSUFDest):<br>- Não é operação Interestadual (idDest<>2) ou<br>- Não é operação com Consumidor Final (indFinal<>1) ou<br>- Não é operação com Não Contribuinte (indIEDest<>9) ou<br>- Operação de prestação de serviços (existe tag “ISSQN”) ou<br>- Operação com combustível (tag:comb) derivado de petróleo: código ANP<br>diferente de: 820101001, 820101010, 810102001, 810102004, 810102002,<br>810102003, 810101002, 810101001, 810101003, 220101003, 220101004,<br>220101002, 220101001, 220101005, 220101006, 560101001, ou<br>- Data de Emissão anterior a 01/01/2016.<br>Exceção 1: A critério da UF a regra de validação acima não se aplica na<br>devolução (finNFe=4) por NFe Avulsa com IE do Emitente=ISENTO.<br>Exceção 2: A regra de validação acima não se aplica se informada UF do local<br>de entrega (tag: entrega/UF) diferente da UF do emitente (tag:<br>emit/enderEmit/UF).<br>Exceção 3: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016. (NT 2015.003) | Obrig. | 695 | Rej. | Rejeição: Informado indevidamente o grupo de ICMS para a UF de destino<br>[nItem:999] |
| NA09-10 | 55 | Se informada alíquota interestadual (tag:pICMSInter) de 4% e<br>- Origem da mercadoria difere de produto importado (tag:orig<>1,2,3,8)<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016. (NT 2015.003) | Obrig. | 697 | Rej. | Rejeição: Alíquota interestadual do ICMS com origem diferente do previsto<br>[nItem:999] |
| NA09-20 | 55 | Se informada alíquota interestadual (tag:pICMSInter) de 7% ou 12% e<br>- Origem da mercadoria de produto importado (tag:orig=1,2,3,8)<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016. (NT 2015.003) | Obrig. | 697 | Rej. | Rejeição: Alíquota interestadual do ICMS com origem diferente do previsto<br>[nItem:999] |

**Tabela (página 117)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| NA09-30 | 55 | Se informada alíquota interestadual (tag:pICMSInter) de 7% ou 12% em NF de<br>Saída Normal (tpNF=1 e finNFe=1) e alíquota interestadual incompatível com<br>as UF envolvidas:<br>- 7% para os Estados de origem do Sul e Sudeste, exceto ES, destinado para os<br>Estados do Norte, Nordeste, Centro-Oeste e Espírito Santo;<br>- 12% para os demais casos.<br>Exceção 1: A regra de validação acima não se aplica para as operações com<br>CFOP de Retorno de Mercadorias (Tabela CFOP, indRetor=1)<br>Exceção 2: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/07/2016.<br>Exceção 3: A regra de validação não se aplica se informada UF do local de<br>entrega (tag: entrega/UF) diferente da UF do emitente (tag: enderEmit/UF);<br>Exceção 4: A regra de validação não se aplica se informada UF do local de<br>retirada (tag: retirada/UF) diferente da UF do destinatário (tag:<br>enderDest/UF);<br>(NT 2017.002 / NT 2015.003) | Obrig. | 698 | Rej. | Rejeição: Alíquota interestadual do ICMS incompatível com as UF envolvidas<br>na operação [nItem:999] |
| NA11-10 | 55 | Percentual do ICMS Interestadual para a UF de destino (tag:pICMSInterPart)<br>difere do previsto para o ano da Data de Emissão.<br>Observação: Nas operações que não sejam de finalidade de emissão normal<br>(finNFe<>1) ou nas operações com CFOP de Retorno de Mercadorias (Tabela<br>CFOP, indRetor=1) considerar o ano da NF referenciada em substituição ao<br>ano da Data de Emissão.<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/01/2016. (NT 2017.002 / NT 2015.003) | Obrig. | 699 | Rej. | Rejeição: Percentual do ICMS Interestadual para a UF de destino difere do<br>previsto para o ano da Data de Emissão [nItem: 999] |
| NA13-10 | 55 | Valor do ICMS relativo ao Fundo de Combate à Pobreza na UF de destino tag:<br>vFCPUFDest (id:NA11) difere de vBCFCPUFDest (id:NA04) * pFCPUFDest<br>(id:NA05) (*4)<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/01/2016. (NT 2016.002/ NT 2015.003) | Obrig. | 793 | Rej. | Rejeição: Valor do ICMS relativo ao Fundo de Combate à Pobreza na UF de<br>destino difere do calculado [nItem: 999] |
| NA15-10 | 55 | Valor do ICMS Interestadual para UF de Destino (tag: vICMSUFDest) difere de<br>vBCUFDest * (pICMSUFDest - pICMSInter) * pICMSInterPart (*4)1<br>Observação: implementação futura (NT 2015.003) | Obrig. | 815 | Rej. | Rejeição: Valor do ICMS Interestadual para UF de Destino difere do calculado<br>[nItem: 999] (Valor Informado: XXX, Valor Calculado:XXX) |
| NA17-10 | 55 | Valor do ICMS Interestadual para a UF do Remetente (tag: vICMSUFRemet)<br>difere de (vBCUFDest * (pICMSUFDest - pICMSInter)) – vICMSUFDest<br>(*4)2Observação: implementação futura (NT 2015.003) | Obrig. | 816 | Rej. | Rejeição: Valor do ICMS Interestadual para UF do Remetente difere do<br>calculado [nItem: 999] (Valor Informado: XXX, Valor Calculado:XXX) |

### O. Item / Tributo: IPI
**Tabela (página 118)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| O01-10 | 65 | NFC-e com o grupo de tributação pelo IPI (id:O01) | Obrig. | 742 | Rej. | Rejeição: NFC-e com grupo do IPI |
| O06-10 | 55 | Código de Enquadramento Legal do IPI inválido (tag:cEnq, id:O06).<br>Preenchimento conforme seção 8.9 do MOC – Visão Geral (Tabela do Código<br>d e Enquadramento do IPI) | Obrig. | 387 | Rej. | Rejeição: Código de Enquadramento Legal do IPI inválido [nItem: nnn] |
| O09-10 | 55 | Verificar compatibilidade entre o CST do IPI e o Código de Enquadramento<br>Legal (cEnq), conforme as regras abaixo:<br>- CST de Isenção e Código de Enquadramento incompatível<br>(IPINT/CST=02, 52 e cEnq fora da faixa [301, 399])<br>- CST de Imunidade e Código de Enquadramento incompatível<br>(IPINT/CST=04, 54 e cEnq fora da faixa [001, 099])<br>- CST de Suspensão e Código de Enquadramento incompatível<br>(IPINT/CST=05, 55 e cEnq fora da faixa [101, 199])<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com data de emissão anterior a 01/04/2016. (NT 2015.002) | Obrig. | 388 | Rej. | Rejeição: Código de Situação Tributária do IPI incompatível com o Código de<br>Enquadramento Legal do IPI [nItem: nnn] |

**Tabela (página 118)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| P01-10 | 65 | NFC-e com o grupo de tributação pelo II (id:P01) | Obrig. | 743 | Rej. | Rejeição: NFC-e com grupo do II |

**Tabela (página 118)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| Q01-20 | 55 | NF-e sem o grupo de tributação pelo PIS (id:Q01) | Obrig. | 745 | Rej. | Rejeição: NF-e sem grupo do PIS |

**Tabela (página 118)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| R01-10 | 65 | NFC-e com o grupo de tributação pelo PIS-ST (id:R01) | Obrig. | 746 | Rej. | Rejeição: NFC-e com grupo do PIS-ST |

### S. Item / Tributo: COFINS
**Tabela (página 119)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| S01-20 | 55 | NF-e sem o grupo de tributação pela COFINS (id:S01) | Obrig. | 748 | Rej. | Rejeição: NF-e sem grupo da COFINS |

**Tabela (página 119)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| T01-10 | 65 | NFC-e com o grupo de tributação pela COFINS-ST (id:T01) | Obrig. | 749 | Rej. | Rejeição: NFC-e com grupo da COFINS-ST |

**Tabela (página 119)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| U01-10 | 55/65 | Informado grupo de tributação do ISSQN (id:U01) sem informar a Inscrição<br>Municipal (id:C19) | Facul. | 530 | Rej. | Rejeição: Operação com tributação de ISSQN sem informar a Inscrição<br>Municipal |
| U01-20 | 55/65 | Informado grupo de tributação do ISSQN (id:U01) sem informar nenhum<br>grupo de ICMS (id:N01)<br>Exceção: A critério da UF poderá ser autorizada a emissão de NF-e que só<br>tenham itens sujeitos ao ISSQN. (NT 2010/010) | Facul. | 592 | Rej. | Rejeição: A NF-e deve ter pelo menos um item de produto sujeito ao ICMS. |
| U05-10 | 55/65 | Se informado Código Município do FG – ISSQN:<br>– Código Município do FG – ISSQN inexistente (Tabela Municípios IBGE)<br>Exceção: Aceitar ISSQN/cMunFG=”9999999” no caso de prestação de serviço<br>no exterior (dest/cUF=”EX”). (NT 2013/005 v1.20) (NT 2015.002) | Obrig. | 287 | Rej. | Rejeição: Código Município do Fato Gerador de ISSQN inexistente [nItem:nnn] |
| U14-10 | 55/65 | Se informado Código Município de incidência do ISSQN:<br>– Código Município ISSQN inexistente (Tabela Municípios IBGE) (NT<br>2015.002) | Obrig. | 389 | Rej. | Rejeição: Código Município ISSQN inexistente [nItem:nnn] |
| U15-10 | 55/65 | Se informado Código País onde o serviço foi prestado<br>(tag:ISSQN/cPais)<br>- Código País inexistente (Tabela do BACEN, vide tabela de apoio publicada<br>no Portal da NF-e).<br>Observação: O Código do País informado na NF-e pode conter ou não zeros<br>não significativos. (NT 2015.002) | Obrig. | 739 | Rej. | Rejeição: Código de País do ISSQN Inexistente |

**Tabela (página 119)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| UA01-10 | 55 | Informado grupo de devolução de tributos (tag:impostoDevol):<br>– NF-e não é de devolução de tributos (NT 2013/005 v 1.20) | Obrig. | 354 | Rej. | Rejeição: Informado grupo de devolução de tributos para NF-e que não tem<br>finalidade de devolução de mercadoria |

### V. Item / Informação Adicional
**Tabela (página 120)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| UA01-20 | 65 | Informado grupo de devolução de tributos (tag: impostoDevol):<br>- NFC-e com grupo de devolução de tributos (NT 2015.002) | Obrig. | 390 | Rej. | Rejeição: Nota Fiscal com grupo de devolução de Tributos [nItem: nnn] |

**Tabela (página 120)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| W03-10 | 55/65 | Total da BC ICMS (id:W03) difere do somatório do valor dos itens (id:N15). | Facul. | 531 | Rej. | Rejeição: Total da BC ICMS difere do somatório dos itens |
| W03-20 | 55/65 | Valor total da base de cálculo tag “vBC” (id:W03) superior ao valor limite<br>estabelecido pela SEFAZ por modelo de DF-e.<br>Observação: o valor total máximo da base de cálculo é de R$ 200.000,00<br>(Duzentos mil reais). (NT 2019.001 v1.10, v1.50) | Facul. | 935 | Rej. | Rejeição: Valor total da Base de Cálculo superior ao valor limite estabelecido<br>[Valor Limite: R$ XXX.XXX,XX] (valor definido pela UF) |
| W04-10 | 55/65 | Total do ICMS (id:W04) difere do somatório do valor dos itens (id:N17). O<br>Total não deve considerar o valor informado para os CST 40, 41, 50. (NT<br>2010/007) | Facul. | 532 | Rej. | Rejeição: Total do ICMS difere do somatório dos itens |
| W04-20 | 55/65 | Valor total do ICMS superior ao valor limite estabelecido pela SEFAZ (valor<br>parametrizável por UF) | Facul. | 417 | Rej. | Rejeição: Total do ICMS superior ao valor limite estabelecido |
| W04a-10 | 55/65 | Total do ICMS desonerado (id:W04a) difere do somatório do valor dos itens<br>(id:N28a). (NT 2016.002) | Facul. | 795 | Rej. | Rejeição: Total do ICMS desonerado difere do somatório dos itens |
| W04b-10 | 55/65 | Total do FCP (id: W04b) difere do somatório do valor dos itens (id:N17c). (NT<br>2016.002) | Obrig. | 861 | Rej. | Rejeição: Total do FCP difere do somatório dos itens |
| W04c-10 | 55 | Total do ICMS relativo Fundo de Combate à Pobreza (FCP) da UF de destino<br>(tag:vFCPUFDest, id:W04c) difere do somatório do valor dos itens (id:NA13)<br>(NT 2015.003) | Obrig. | 798 | Rej. | Rejeição: Valor total do ICMS relativo Fundo de Combate à Pobreza (FCP) da<br>UF de destino difere do somatório do valor dos itens |
| W04e-10 | 55 | Total do ICMS Interestadual para a UF de destino (tag:vICMSUFDest, id:W04e)<br>difere do somatório do valor dos itens (id:NA15).<br>Nota: Considerar o valor Null como sendo zero. (NT 2015.003) | Obrig. | 799 | Rej. | Rejeição: Valor total do ICMS Interestadual da UF de destino difere do<br>somatório dos itens |
| W04g-10 | 55 | Total do ICMS Interestadual para a UF do remetente (tag:vICMSUFRemet,<br>id:W04g) difere do somatório do valor dos itens (id:NA17).<br>Nota: Considerar o valor Null como sendo zero. (NT 2015.003) | Obrig. | 800 | Rej. | Rejeição: Valor total do ICMS Interestadual da UF do remetente difere do<br>somatório dos itens |
| W05-10 | 55/65 | Total da BC ICMS-ST (id:W05) difere do somatório do valor dos itens (id:N21) | Facul. | 533 | Rej. | Rejeição: Total da BC ICMS-ST difere do somatório dos itens |
| W06-10 | 55/65 | Total do ICMS-ST (id:W06) difere do somatório do valor dos itens (id:N23) | Facul. | 534 | Rej. | Rejeição: Total do ICMS-ST difere do somatório dos itens |
| W06-20 | 55/65 | Valor total do ICMS-ST superior ao valor limite estabelecido pela SEFAZ (valor<br>parametrizável por UF) | Facul. | 418 | Rej. | Rejeição: Total do ICMS ST superior ao valor limite estabelecido |
| W06a-10 | 55 | Total do FCP ST (id: W06a) difere do somatório do valor dos itens (id:N23d)<br>(NT 2016.002) | Obrig. | 862 | Rej. | Rejeição: Total do FCP ST difere do somatório dos itens |
| W06b-10 | 55 | Total do FCP ST retido anteriormente (id: W06b) difere do somatório do valor<br>dos itens (id:N27d) (NT 2016.002) | Obrig. | 859 | Rej. | Rejeição: Total do FCP retido anteriormente por Substituição Tributária difere<br>do somatório dos itens |

**Tabela (página 121)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| W07-10 | 55/65 | Total dos Produtos e Serviços (id:W07) difere do somatório do valor dos itens<br>(id:I11) sujeitos ao ICMS. Considerar somente os valores dos itens com a TAG<br>indTot (id:I17b) = 1 (NT 2011.004) | Facul. | 564 | Rej. | Rejeição: Total do Produto / Serviço difere do somatório dos itens |
| W08-10 | 55/65 | Total do Frete (id:W08) difere do somatório do valor dos itens (id:I15) | Facul. | 535 | Rej. | Rejeição: Total do Frete difere do somatório dos itens |
| W09-10 | 55/65 | Total do Seguro (id:W09) difere do somatório do valor dos itens (id:I16) | Facul. | 536 | Rej. | Rejeição: Total do Seguro difere do somatório dos itens |
| W10-10 | 55/65 | Total do Desconto (id:W10) difere do somatório do valor dos itens (id:I17) | Facul. | 537 | Rej. | Rejeição: Total do Desconto difere do somatório dos itens |
| W11-10 | 55 | Total do vII (id:W11) difere do somatório do valor dos itens (id:P04) (NT<br>2011/004) | Facul. | 601 | Rej. | Rejeição: Total do II difere do somatório dos itens |
| W12-10 | 55 | Total do IPI (id:W12) difere do somatório do valor dos itens (id:O14) | Facul. | 538 | Rej. | Rejeição: Total do IPI difere do somatório dos itens |
| W12a-10 | 55 | Total do IPI devolvido (id: W12a) difere do somatório do valor dos itens<br>(id:UA04) ) (NT 2016.002) | Facul. | 863 | Rej. | Rejeição: Total do IPI devolvido difere do somatório dos itens |
| W13-10 | 55/65 | Total do vPIS (id:W13) difere do somatório do valor dos itens (id:Q09) de item<br>sujeito ao ICMS (existe grupo ICMS). (NT 2011.004) | Facul. | 602 | Rej. | Rejeição: Total do PIS difere do somatório dos itens sujeitos ao ICMS |
| W14-10 | 55/65 | Total do vCOFINS (id:W14) difere do somatório do valor dos itens (id:S11) de<br>item sujeito ao ICMS (existe grupo ICMS). (NT 2011.004) | Facul. | 603 | Rej. | Rejeição: Total da COFINS difere do somatório dos itens sujeitos ao ICMS |
| W15-10 | 55/65 | Total do vOutro (id:W15) difere do somatório do valor dos itens (id:I17a) (NT<br>2011/004) | Facul. | 604 | Rej. | Rejeição: Total do vOutro difere do somatório dos itens |

**Tabela (página 122)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| W16-10 | 55/65 | -Total do vNF (id:W16) difere do somatório de:<br>(+) vProd (id:W07)<br>(-) vDesc (id:W10)<br>(-) vICMSDeson (id:W04a)<br>(+) vST (id:W06)<br>(+) vFCPST (id:W06a)<br>(+) vFrete (id:W08)<br>(+) vSeg (id:W09)<br>(+) vOutro (id:W15)<br>(+) vII (id:W11)<br>(+) vIPI (id:W12)<br>(+) vIPIDevol (id: W12a)<br>(+) vServ (id:W18) (*3) (NT 2011/005)<br>Exceção 1: Faturamento direto de veículos novos:<br>Se informada operação de Faturamento Direto para veículos novos (tpOp = 2,<br>id:J02):<br>– Total do vNF (id:W16) difere do somatório de:<br>(+) vProd (id:W07)<br>(-) vDesc (id:W10)<br>(-) vICMSDeson (id:W04a)<br>(+) vFrete (id:W08)<br>(+) vSeg (id:W09)<br>(+) vOutro (id:W15)<br>(+) vII (id:W11)<br>(+) vIPI (id:W12)<br>(+) vServ (id:W18) (*3) (NT 2011/005)<br>Exceção 2: Esta regra não se aplica nas operações de importação (CFOP inicia<br>com “3”).<br>Exceção 3 (NT 2013/005 v 1.22): Esta regra de validação não deverá causar<br>rejeição caso não tenha sido subtraído o valor do ICMS Desonerado<br>(vICMSDeson) do valor total da NF-e. ) (NT 2016.002) | Facul. | 610 | Rej. | Rejeição: Total da NF difere do somatório dos Valores compõe o valor Total<br>da NF. |
| W16-20 | 55 | Valor total da NF-e superior ao valor limite estabelecido pela SEFAZ (valor<br>limite parametrizável por UF) (NT 2011/004) | Facul. | 628 | Rej. | Rejeição: Total da NF superior ao valor limite estabelecido pela SEFAZ [Limite] |
| W16-30 | 65 | Valor total da NFC-e é superior ao valor limite estabelecido pela SEFAZ (valor<br>parametrizável por UF)<br>Observação: O valor máximo default para a NFC-e é de R$200.000,00 | Obrig. | 780 | Rej. | Rejeição: Total da NFC-e superior ao valor limite estabelecido pela SEFAZ<br>[Limite] |
| W16-40 | 65 | NFC-e com valor total superior a R$ 10.000,00:<br>– Código do Destinatário não informado (tag:dest/CNPJ, dest/CPF ou<br>dest/idEstrang). (NT 2015.002) | Obrig. | 750 | Rej. | Rejeição: NFC-e com valor total superior ao permitido para destinatário não<br>identificado (Código) [Limite] |
| W16-50 | 65 | NFC-e com valor total superior a R$ 10.000,00:<br>– Nome do Destinatário não informado (tag:dest/xNome)<br>Observação: Regra de Validação opcional, a critério da UF. (NT 2015.002) | Facul. | 751 | Rej. | Rejeição: NFC-e com valor total superior ao permitido para destinatário não<br>identificado (Nome) [Limite] |
| W16-60 | 65 | NFC-e com valor total superior a R$ 10.000,00:<br>– Endereço do Destinatário não informado (tag:dest/enderDest)<br>Observação: Regra de Validação opcional, a critério da UF. (NT 2015.002) | Obrig. | 752 | Rej. | Rejeição: NFC-e com valor total superior ao permitido para destinatário não<br>identificado (Endereço) [Limite] |

### X. Transporte da NF-e
**Tabela (página 123)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| W16a-10 | 55/65 | Total do valor aproximado dos tributos (id:W16a) difere do somatório dos<br>itens (id:M02) (NT 2013/003)<br>Observação: O campo “vTotTrib” é opcional para o Item e para o grupo de<br>Totais. Considerar valor=0, se não informado. | Facul. | 685 | Rej. | Rejeição: Total do Valor Aproximado dos Tributos difere do somatório dos<br>itens |

**Tabela (página 123)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| W18-10 | 55/65 | Total vServ (id:W18) difere do somatório do valor dos itens do vProd (id:I11)<br>de item sujeito ao ISSQN (NT 2011/004) | Facul. | 605 | Rej. | Rejeição: Total do vServ difere do somatório do vProd dos itens sujeitos ao<br>ISSQN |
| W19-10 | 55/65 | Total vBC (id:W19) difere do somatório do valor dos itens (id:U02) de item<br>sujeito ao ISSQN (NT 2011/004) | Facul. | 606 | Rej. | Rejeição: Total do vBC do ISS difere do somatório dos itens |
| W20-10 | 55/65 | Total vISS (id:W20) difere do somatório do valor dos itens (id:U04) de item<br>sujeito ao ISSQN (NT 2011/004) | Facul. | 607 | Rej. | Rejeição: Total do ISS difere do somatório dos itens |
| W21-10 | 55/65 | Total vPIS (id:W21) difere do somatório do valor dos itens (id:Q09) de item<br>sujeito ao ISSQN (NT 2011/004) | Facul. | 608 | Rej. | Rejeição: Total do PIS difere do somatório dos itens sujeitos ao ISSQN |
| W22-10 | 55/65 | Total vCOFINS (id:W22) difere do somatório do valor dos itens (id:S11) de<br>item sujeito ao ISSQN (NT 2011/004) | Facul. | 609 | Rej. | Rejeição: Total da COFINS difere do somatório dos itens sujeitos ao ISSQN |
| W22b-10 | 55/65 | Total do valor da dedução (id:W22b) difere do somatório dos itens (id:U07) | Obrig. | 364 | Rej. | Rejeição: Total do valor da dedução do ISS difere do somatório dos itens |
| W22c-10 | 55/65 | Total de outras retenções (id:W22c) difere do somatório dos itens (id:U08) | Obrig. | 365 | Rej. | Rejeição: Total de outras retenções difere do somatório dos itens |
| W22d-10 | 55/65 | Total do desconto incondicionado ISS (id:W22d) difere do somatório dos itens<br>(id:U09) | Obrig. | 366 | Rej. | Rejeição: Total do desconto incondicionado ISS difere do somatório dos itens |
| W22e-10 | 55/65 | Total do desconto condicionado ISS (id:W22e) difere do somatório dos itens<br>(id:U10) | Obrig. | 367 | Rej. | Rejeição: Total do desconto condicionado ISS difere do somatório dos itens |
| W22f-10 | 55/65 | Total de ISS retido (id:W22f) difere do somatório dos itens (id:U11) | Obrig. | 368 | Rej. | Rejeição: Total de ISS retido difere do somatório dos itens |

**Tabela (página 123)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| X02-10 | 65 | NFC-e com Frete e não é entrega a domicílio<br>(tag:modFrete<>9 e indPres<>4) | Obrig. | 753 | Rej. | Rejeição: NFC-e com Frete |

**Tabela (página 124)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| X02-20 | 55 | Se operação interestadual (idDest=2), não informar os Grupos Veiculo<br>Transporte (id:X18; veicTransp) e Grupo Reboque (id: X22).<br>Obs1: a critério de cada UF, a regra de validação acima também pode ser<br>aplicada nas operações internas (idDest=1) se cMun (id:C10) do Emitente <><br>cMun (id: E10) do Destinatário<br>Obs.2: Esta regra nãose aplica a emissão da NFA-e. ) (NT 2016.002) | Obrig. | 868 | Rej. | Rejeição: Grupos Veiculo Transporte e Reboque não devem ser informados |
| X03-10 | 65 | NFC-e com dados do Transportador e não é entrega a domicílio<br>(tag:transporta e indPres<>4) | Obrig. | 754 | Rej. | Rejeição: NFC-e com dados do Transportador |
| X03-20 | 65 | NFC-e sem dados do Transportador (tag:transporta) e é entrega a domicílio<br>(indPres=4) | Obrig. | 786 | Rej. | Rejeição: NFC-e de entrega a domicílio sem dados do Transportador |
| X04-10 | 55 | Obrigatória a informação de identificação do Transportador para os CFOP de<br>venda de combustível (tag: CNPJ/CPF, id:X04/X05) com esta Obrig.atoriedade<br>na Tabela CFOP, indComb=2.<br>Exceção 1: A regra de validação acima se aplica somente para as NF-e com<br>Finalidade de Emissão normal (tag:finNFe=1);<br>Exceção 2: A regra de validação acima se aplica somente para os Códigos de<br>Produto ANP relacionados na seção 8.11 do MOC – Visão Geral,<br>Exceção 3: A regra de validação acima não se aplica se for informada a UF do<br>Transportador no exterior (tag:transporta/UF=”EX”, id:X10);<br>Observação: Nos casos em que não houver circulação física de mercadoria ou<br>em que o transportador seja estrangeiro, os dados do transportador poderão<br>ser preenchidos com o CNPJ do próprio emitente do documento fiscal. (NT<br>2015.002) | Facul. | 362 | Rej. | Rejeição: Venda de combustível sem informação do Transportador |
| X04-20 | 55/65 | Se informado CNPJ do Transportador:<br>- CNPJ com zeros ou dígito de controle inválido | Obrig. | 542 | Rej. | Rejeição: CNPJ do Transportador inválido |
| X05-10 | 55/65 | Se informado CPF do transportador:<br>– CPF com zeros, nulo, 111..., 222..., ..., ou DV inválido (NT 2012/003) | Obrig. | 543 | Rej. | Rejeição: CPF do Transportador inválido |
| X07-10 | 55/65 | Se informada a IE do Transportador:<br>– UF do Transportador (id:X10) não informada | Obrig. | 559 | Rej. | Rejeição: UF do Transportador não informada |
| X07-20 | 55/65 | IE do Transportador informada e diferente de “ISENTO”:<br>– Validar IE, conforme a UF do transportador informada | Obrig. | 544 | Rej. | Rejeição: IE do Transportador inválida |
| X11-10 | 65 | NFC-e com dados de Retenção do ICMS no Transporte (tag:retTransp) | Obrig. | 755 | Rej. | Rejeição: NFC-e com dados de Retenção do ICMS no Transporte |
| X16-10 | 55 | CFOP de Transporte inexistente ou não pode ser usado no grupo de retenção<br>do ICMS de transporte, conforme tabela de apoio publicada no Portal da NF-e<br>(Tabela CFOP, indTransp=0) (NT 2015.002) | Obrig. | 722 | Rej. | Rejeição: CFOP de Transporte Inexistente |
| X17-10 | 55 | Se informado Código Município do FG – Transporte (id:X17):<br>– Código do Município do FG – Transporte inexistente<br>(Tabela Municípios IBGE) (NT 2015.002) | Obrig. | 288 | Rej. | Rejeição: Código Município do Fato Gerador do Transporte inexistente |
| X18-10 | 65 | NFC-e com dados do veículo de Transporte (tag:veicTransp) | Obrig. | 756 | Rej. | Rejeição: NFC-e com dados do veículo de Transporte |
| X22-10 | 65 | NFC-e com dados de Reboque do veículo de Transporte (tag:reboque) | Obrig. | 757 | Rej. | Rejeição: NFC-e com dados de Reboque do veículo de Transporte |
| X25a-10 | 65 | NFC-e com dados do Vagão de Transporte (tag:vagao) | Obrig. | 758 | Rej. | Rejeição: NFC-e com dados do Vagão de Transporte |
| X25b-10 | 65 | NFC-e com dados da Balsa de Transporte (tag:balsa) | Obrig. | 759 | Rej. | Rejeição: NFC-e com dados da Balsa de Transporte |

### Y. Dados de Cobrança
**Tabela (página 125)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| Y01-10 | 65 | NFC-e com dados de cobrança (Fatura, Duplicata) (tag:cobr) | Obrig. | 760 | Rej. | Rejeição: NFC-e com dados de cobrança (Fatura, Duplicata) |
| Y01-20 | 55 | Se informado o Grupo Cobrança (Y01, tag: cobr) os campos nFat, vOrig e vLiq<br>devem ser informados.<br>Observação: Implementação futura em ambiente de produção a partir de<br>03/09/2018 ) (NT 2016.002) | Obrig. | 905 | Rej. | Rejeição: Campos do grupo Fatura não informados |
| Y05-10 | 55 | Valor do Desconto (vDesc, id:Y05) maior que o Valor Original da Fatura (vOrig,<br>id:Y04)<br>Obs.: Considerar como zero os valores opcionais não informados. ) (NT<br>2016.002) | Obrig. | 901 | Rej. | Rejeição: Valor do Desconto da Fatura maior que Valor Original da Fatura |
| Y06-10 | 55 | Se informado Valor Líquido da Fatura (vLiq, id:Y06) e o Valor Original da<br>Fatura (vOrig; id:Y04):<br>- Valor Líquido da Fatura (vLiq, id:Y06) difere do Valor Original da Fatura<br>(vOrig; id:Y04) – Valor do Desconto (vDesc, id:Y05)<br>Obs.: Considerar como zero os valores opcionais não informados ) (NT<br>2016.002) | Obrig. | 902 | Rej. | Rejeição: Valor Liquido da Fatura difere do Valor Original menos o Valor do<br>Desconto |
| Y08-10 | 55 | Se informado o Grupo Parcelas de cobrança (tag:dup, Id:Y07), Número da<br>parcela (nDup, id:Y08) não informado ou inválido.<br>Obs1: O número de parcelas deve ser informado com 3 algarismos,<br>sequenciais e consecutivos. Ex.: “001”,”002”,”003”,...(NT 2016.002) | Obrig. | 852 | Rej. | Rejeição: Número da parcela inválido ou não informado [nOcor: 999] |
| Y09-20 | 55 | Se informado o grupo de Parcelas de cobrança (tag:dup, Id:Y07) e Data de<br>vencimento (dVenc, id:Y09) não informada ou menor que a Data de Emissão<br>(id:B09)<br>(NT 2016.002) | Obrig. | 900 | Rej. | Rejeição: Data de vencimento da parcela não informada ou menor que Data<br>de Emissão [nOcor: 999] |
| Y09-30 | 55 | Se informado o grupo de Parcelas de cobrança (tag:dup, Id:Y07) e Data de<br>vencimento (dVenc, id:Y09) não informada ou menor que a Data de<br>vencimento da parcela anterior (dVenc, id:Y09) ) (NT 2016.002) | Obrig. | 850 | Rej. | Rejeição: Data de vencimento da parcela não informada ou menor que a Data<br>de vencimento da parcela anterior [nOcor: 999] |
| Y10-10 | 55 | Se informado o grupo de Parcelas de cobrança (tag:dup, Id:Y07) e a soma do<br>valor das parcelas (vDup, id: Y10) difere do Valor Líquido da Fatura (vLiq,<br>id:Y06). (NT 2016.002) | Obrig. | 851 | Rej. | Rejeição: Soma do valor das parcelas difere do Valor Líquido da Fatura |

**Tabela (página 125)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| YA02-04 | 55 | Se campo finNFe = 3 ou 4 e campo Meio de Pagamento (tag: tPag, id:YA02) <><br>90 (Sem Pagamento). ) (NT 2016.002) | Obrig. | 871 | Rej. | Rejeição: O campo Meio de Pagamento deve ser preenchido com a opção<br>Sem Pagamento |
| YA02-10 | 65 | Se informado Campo Forma de Pagamento (tag:tPag, id:YA02) =14 ) (NT<br>2016.002) | Obrig. | 857 | Rej. | Rejeição: Informado Duplicata Mercantil como Forma de Pagamento |
| YA02-40 | 65 | Informado tpag (id=YA02)= 90 “Sem Pagamento” ) (NT 2016.002) | Obrig. | 899 | Rej. | Rejeição: Informado incorretamente o campo meio de pagamento |

**Tabela (página 126)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| YA02-50 | 65 | Informado meio de pagamento tPag= 99 “Outros”<br>Observação: Regra de validação valida a partir de 01/02/2021 para<br>homologação e 01/09/2021 para produção (Incluída na NT 2020.006) | Obrig. | 436 | Rej. | Rejeição: Informado 99-Outros como meio de pagamento |
| YA03-10 | 65 | Somatório do valor dos pagamentos (id:YA03, tag:vPag) menor que o total da<br>nota (id:W16, tag: vNF)<br>Exceção 1: Esta regra não se aplica para nota fiscal de Ajuste, campo finNFe=3<br>(id:B25) e para nota fiscal de Devolução finNFe=4 (id:B25)<br>Exceção 2: Esta regra não se aplica quando o campo Meio de Pagamento<br>(id:YA02, tag:tPag) for igual a 90 (sem pagamento). ) (NT 2016.002) | Facul. | 865 | Rej. | Rejeição: Total dos pagamentos menor que o total da nota |
| YA03-20 | 55/65 | Somatório do valor dos pagamentos (id:YA03, tag:vPag) maior que o total da<br>nota (id:W16, tag: vNF) e sem informação no campo vTroco (id:YA09) ) (NT<br>2016.002) | Facul. | 866 | Rej. | Rejeição: Ausência de troco quando o valor dos pagamentos informados for<br>maior que o total da nota |
| YA03-30 | 55/65 | Informado o campo Meio de Pagamento igual a sem pagamentoo<br>(tag:tPag=90, id:YA02) e informado campo Valor do Pagamento diferente de<br>zero (tag:vPag<>0, id:YA03). ) (NT 2016.002) | Facul. | 904 | Rej. | Rejeição: Informado indevidamente campo valor de pagamento |
| YA04-10 | 65 | Se informado o grupo de pagamentos (tag:pag):<br>- Se o Pagamento for por cartão (tag:tPag=03, 04), deve ser<br>informado o grupo de cartões (tag:card)<br>Observação: Implementação por padrão, opcional a critério da UF.<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. (NT 2015.002) | Facul. | 391 | Rej. | Rejeição: Não informados os dados do cartão de crédito / débito nas Formas<br>de Pagamento da Nota Fiscal |
| YA04a-20 | 55/65 | Se informado o tipo de integração como pagamento não integrado com o<br>sistema de automação da empresa (tag: tpIntegra=2) para UF que não aceita<br>esse tipo de integração.<br>Observação 1: Regra de Validação opcional a critério da UF. ) (NT 2016.002 /<br>NT 2015.002) | Facul. | 737 | Rej. | Rejeição: Pagamento com cartão de crédito em sistema de automação não<br>integrado |
| YA05-10 | 55/65 | Se informado o grupo de Cartão de Crédito / Débito (tag:card):<br>- Se o pagamento com cartão for integrado ao sistema de<br>automação da empresa (tag:tpIntegra=1) devem ser informado os campos de<br>CNPJ da Credenciadora e o código de autenticação da operação<br>(tag:card/CNPJ e card/cAut)<br>Observação: Implementação por padrão, opcional a critério da UF.<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. ) (NT 2016.002/ NT 2015.002) | Facul. | 392 | Rej. | Rejeição: Não informados os dados da operação de pagamento por cartão de<br>crédito / débito |
| YA05-20 | 55/65 | Se informado o CNPJ da instituição de pagamento<br>- Verificar CNPJ com zeros, nulo ou DV inválido (Incluída na NT 2020.006 | Obrig. | 437 | Rej. | Rejeição: CNPJ da instituição de pagamento inválido) |
| YA09-10 | 55/65 | Se informado campo Valor do troco (id:YA09, tag:vTroco) com valor difere<br>de:<br>(+) vPag (id:YA03)<br>(-) vNF (id:W16) ) (NT 2016.002) | Obrig. | 869 | Rej. | Rejeição: Valor do troco incorreto |

### YB. Informações do Intermediador da Transação
**Tabela (página 127)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| YB01-10 | 55 | Se informado Indicador do Intermediador IGUAL “1=Operação em site ou<br>plataforma de terceiros (intermediadores/marketplace)” (indIntermed=1)<br>- Obrigatório o preenchimento das Informações do Intermediador da<br>Transação (tag: infIntermed) (Incluída na NT 2020.006 | Obrig. | 438 | Rej. | Rejeição: Obrigatória as informações do intermediador da transação para<br>operação por site de terceiros |
| YB01-20 | 55 | Se informado Indicador de presença do comprador no estabelecimento<br>comercial no momento da operação DIFERENTE de “1=Operação em site ou<br>plataforma de terceiros (intermediadores/marketplace)” (indIntermed<>1)<br>- Não é permitido o preenchimento das Informações do Intermediador da<br>Transação (tag: infIntermed) (Incluída na NT 2020.006 | Obrig. | 439 | Rej. | Rejeição: Informações do intermediador da transação para operação por site<br>de terceiros preenchido indevidamente |
| YB02-10 | 55 | Se informado o CNPJ do intermediador da transação<br>- Verificar CNPJ com zeros, nulo ou DV inválido (Incluída na NT 2020.006 | Obrig. | 440 | Rej. | Rejeição: CNPJ do intermediador da transação inválido |

**Tabela (página 127)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZA01-10 | 55 | Não informado o local embarque ou de transposição de fronteira<br>(tag:exporta) na operação de exportação (tpNF=1 e idDest=3) | Obrig. | 355 | Rej. | Rejeição: Informar o local de saída do Pais no caso da exportação |
| ZA01-20 | 55 | Informado o local embarque ou de transposição de fronteira (tag:exporta) em<br>operação que não é de exportação (tpNF=0 ou idDest<>3) | Obrig. | 356 | Rej. | Rejeição: Informar o local de saída do Pais somente no caso da exportação |
| ZA01-30 | 65 | Informado grupo de comércio exterior (tag: exporta):<br>- NFC-e com grupo de exportação (NT 2015.002) | Obrig. | 814 | Rej. | Rejeição: Nota Fiscal com grupo de comércio exterior |

**Tabela (página 127)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZB01-10 | 65 | NFC-e com dados de compras (Empenho, Pedido, Contrato) (tag:compra) | Obrig. | 762 | Rej. | Rejeição: NFC-e com dados de compras (Empenho, Pedido, Contrato) |
| ZB02-10 | 55 | NF-e com desoneração de ICMS motivada por venda a Órgão Públlico<br>(tag:ICMSxx/motDesICMS=8; id:N28), sem informar Nota de Empenho.<br>Observação: Implementação opcional, a critério da UF. | Facul. | 359 | Rej. | Rejeição: NF-e de venda a Órgão Público sem informar a Nota de Empenho |
| ZB02-20 | 55 | NF-e com Nota de Empenho inválida para a UF.<br>Observação: Implementação opcional, a critério da UF. | Facul. | 360 | Rej. | Rejeição: NF-e com Nota de Empenho inválida para a UF. |
| ZB02-30 | 55 | NF-e com Nota de Empenho inexistente para a UF.<br>Observação: Implementação opcional, a critério da UF. | Facul. | 361 | Rej. | Rejeição: NF-e com Nota de Empenho inexistente na UF. |

### ZC. Informações do Registro de Aquisição de Cana
**Tabela (página 128)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZC01-10 | 65 | NFC-e com dados de aquisição de Cana (tag:cana) | Obrig. | 763 | Rej. | Rejeição: NFC-e com dados de aquisição de Cana |

**Tabela (página 128)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZD01-10 | 55/65 | Não informado o grupo de informações do responsável técnico<br>Observação: Implementação futura, exceto as UF de AM, MS, PE, PR, SC e TO,<br>nas quais estas regras já estão em vigor em ambiente de teste e entrarão em<br>vigor em ambiente de produção no dia 03 de junho de 2019 (NT 2018.005 v<br>1.30) | Facul. | 972 | Rej. | Rejeição: Obrigatória as informações do responsável técnico |
| ZD02-10 | 55/65 | Informado CNPJ do responsável técnico inválido<br>– CNPJ com zeros, nulo ou DV inválido<br>Observação: Implementação futura, exceto as UF de AM, MS, PE, PR, SC e TO,<br>nas quais estas regras já estão em vigor em ambiente de teste e entrarão em<br>vigor em ambiente de produção no dia 03 de junho de 2019 (NT 2018.005 v<br>1.30) | Facul. | 973 | Rej. | Rejeição: CNPJ do responsável técnico inválido |
| ZD07-10 | 55/65 | Obrigatória a informação do identificador do CSRT (tag: idCSRT) e Hash do<br>CSRT (tag: hashCSRT)<br>Observação: Implementação futura, todas as UFs (NT 2018.005 v1.30) | Facul. | 975 | Rej. | Rejeição: Obrigatória a informação do identificador do CSRT e do Hash do<br>CSRT |

**Tabela (página 128)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX01-10 | 55 | Informado o grupo de parâmetros suplementares para a NF-e (Modelo 55)<br>(NT 2015.002) | Obrig. | 393 | Rej. | Rejeição: NF-e com o grupo de Informações Suplementares |
| ZX02-10 | 65 | Não informado o campo de QR-Code para a NFC-e.<br>Exceção: A regra de validação não se aplica, em produção, para Nota Fiscal<br>com Data de Emissão anterior a 01/04/2016. Não sendo informado o QR-<br>Code não se aplicam as demais validações relacionadas com este campo. (NT<br>2015.002) | Obrig. | 394 | Rej. | Rejeição: Nota Fiscal sem a informação do QR-Code |
| ZX02-15 | 65 | Se QR Code versão “100” e DtEmiss > 30/09/2018<br>Versão informada no QR-Code (“100”) não é mais válida para a data de<br>emissão ) (NT 2016.002) | Obrig. | 903 | Rej. | Rejeição Versão informada no QR-Code (“100”) não é mais válida para a data<br>de emissão |

**Tabela (página 129)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX02-20 | 65 | Endereço do site da UF para a Consulta via QR-Code difere do previsto.<br>Nota: O uso diferenciado de maiúsculas ou minúsculas não deve ser<br>considerado na validação.<br>Observação 1: Regra de Validação opcional até 01/11/2016, a critério da UF.<br>Observação 2: Para consultar as URLs por UF utilizadas no QR Code, acesse:<br>http://nfce.encat.org/desenvolvedor/qrcode/ (NT 2015.002) | Obrig. | 395 | Rej. | Rejeição: Endereço do site da UF da Consulta via QR-Code diverge do previsto |
| ZX02-22 | 65 | Se QR Code versão “100” e QR-Code com sequência de escape para o e-<br>comercial “&” (qrCode like “%&amp;%”)<br>Nota: Deve-se usar o CDATA.<br>Observação: A regra de validação não se aplica, em produção, para Nota<br>Fiscal com data de emissão anterior a 03/04/2017. ) (NT 2016.002 / NT<br>2015.002) | Obrig. | 813 | Rej. | Rejeição: QR-Code com sequência de escape para o e-comercial. Usar CDATA |
| ZX02-24 | 65 | Se QR Code versão “100” e Parâmetro Chave de Acesso não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (chAcesso) |
| ZX02-28 | 65 | Se QR Code versão “100” e Parâmetro Chave de Acesso no QR-Code diverge<br>da Chave de Acesso da Nota Fiscal ) (NT 2016.002/NT 2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (chAcesso) |
| ZX02-32 | 65 | Se QR Code versão “100” e Parâmetro Versão não informado noQR-Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002 /NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (nVersao) |
| ZX02-40 | 65 | Se QR Code versão “100” e Parâmetro Tipo de Ambiente não informado no<br>QR-Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002 / NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (tpAmp) |
| ZX02-44 | 65 | Se QR Code versão “100” e Parâmetro Tipo de Ambiente doQR-Code diverge<br>do Tipo de Ambiente da Nota Fiscal (tag:tpAmb, id:B24) ) (NT 2016.002 / NT<br>2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (tpAmb) |
| ZX02-48 | 65 | Se QR Code versão “100” e Parâmetro Código de Identificação do Destinatário<br>não informado no QR-Code, para Nota Fiscal com identificação do<br>destinatário (existe tag:dest, id:E01). ) (NT 2016.002 / NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (cDest) |
| ZX02-52 | 65 | Se QR Code versão “100” e Parâmetro Código de Identificação do Destinatário<br>no QR-Code para Nota Fiscal sem identificação do destinatário (não existe<br>tag:dest, id:E01) ) (NT 2016.002 / NT 2015.002) | Obrig. | 399 | Rej. | Rejeição: Parâmetro de Identificação do destinatário no QR-Code para Nota<br>Fiscal sem identificação do destinatário |
| ZX02-56 | 65 | Se QR Code versão “100” e Parâmetro Código de Identificação do Destinatário<br>no QR-Code diverge do destinatário da Nota Fiscal (tag:CNPJ - id:E02, ou CPF -<br>id:E03 ou idEstrangeiro - id:E03a) ) (NT 2016.002 / NT 2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (cDest) |
| ZX02-60 | 65 | Se QR Code versão “100” e Parâmetro Data de Emissão não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação. (NT 2016.002 / NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (dhEmi) |
| ZX02-64 | 65 | Se QR Code versão “100” e Parâmetro Data de Emissão no QR-Code não está<br>no formato hexadecimal (Caracteres: “0-9”, “a-f”, “A-F”).<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 400 | Rej. | Rejeição: Parâmetro do QR-Code não está no formato hexadecimal (dhEmi) |
| ZX02-68 | 65 | Se QR Code versão “100” e Parâmetro Data de Emissão no QR-Code diverge<br>da Data de Emissão da Nota Fiscal (tag:dhEmi, id:B09) ) (NT 2016.002/ NT<br>2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (dhEmi) |

**Tabela (página 130)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX02-72 | 65 | Se QR Code versão “100” e Parâmetro Valor da Nota Fiscal não informado no<br>QR-Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 396 | Rej | Rejeição: Parâmetro do QR-Code inexistente (vNF) |
| ZX02-76 | 65 | Se QR Code versão “100” e Parâmetro Valor da Nota Fiscal no QR-Code<br>diverge do Valor Total da Nota Fiscal (tag:vNF, id:W16) ) (NT 2016.002/ NT<br>2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (vNF) |
| ZX02-80 | 65 | Se QR Code versão “100” e Parâmetro Valor do ICMS não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (vICMS) |
| ZX02-84 | 65 | Se QR Code versão “100” e Parâmetro Valor do ICMS no QR-Code diverge do<br>Valor Total do ICMS da Nota Fiscal (tag:vICMS, id:W04) (NT 2016.002/ NT<br>2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (vICMS) |
| ZX02-88 | 65 | Se QR Code versão “100” e Parâmetro Digest Value não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (digVal) |
| ZX02-92 | 65 | Se QR Code versão “100” e Parâmetro Digest Value no QR-Code não está no<br>formato hexadecimal (Caracteres: “0-9”, “a-f”,“A-F”).<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 400 | Rej. | Rejeição: Parâmetro do QR-Code não está no formato hexadecimal (digVal) |
| ZX02-96 | 65 | Se QR Code versão “100” e Parâmetro Digest Value no QR-Code diverge do<br>Digest Value da Nota Fiscal (tag grupo: Signature, id:ZZ01) ) (NT 2016.002/ NT<br>2015.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal (digVal) |
| ZX02-100 | 65 | Se QR Code versão “100” e Parâmetro Código Identificador do CSC não<br>informado no QR-Code.<br>Nota: O Schema XML faz esta verificação.<br>Observação: Mais informações sobre o CSC de cada UF estão disponíveis em<br>http://nfce.encat.org/empresario/csc/ ) (NT 2016.002/ NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (cIdToken) |
| ZX02-104 | 65 | Se QR Code versão “100” e Parâmetro Código Identificador do CSC no QR-<br>Code não cadastrado na SEFAZ.<br>Observação 1: Regra de Validação opcional até 01/11/2016, a critério da UF.<br>Observação 2: Mais informações sobre o CSC de cada UF estão disponíveis em<br>http://nfce.encat.org/empresario/csc/ ) (NT 2016.002 / NT 2015.002) | Obrig. | 462 | Rej. | Rejeição: Código Identificador do CSC no QR-Code não cadastrado na SEFAZ |
| ZX02-108 | 65 | Se QR Code versão “100” e Parâmetro Código Identificador do CSC no QR-<br>Code foi revogado pela empresa anteriormente a Data de Emissão.<br>Observação: Regra de Validação opcional até 01/11/2016, a critério da UF. )<br>(NT 2016.002/ NT 2015.002) | Obrig. | 463 | Rej. | Rejeição: Código Identificador do CSC no QR-Code foi revogado pela empresa |
| ZX02-112 | 65 | Se QR Code versão “100” e Parâmetro Hashnão informado no QR-Code.<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente (cHashQRCode) |
| ZX02-116 | 65 | Se QR Code versão “100” e Parâmetro Hash no QR-Code não está no formato<br>hexadecimal (Caracteres: “0-9”, “a-f”,“A-F”).<br>Nota: O Schema XML faz esta verificação. ) (NT 2016.002/ NT 2015.002) | Obrig. | 400 | Rej. | Rejeição: Parâmetro do QR-Code não está no formato hexadecimal<br>(cHashQRCode) |
| ZX02-120 | 65 | Se QR Code versão “100” e Parâmetro Hash no QR-Code diverge do calculado.<br>Observação: Regra de Validação opcional até 01/11/2016, a critério da UF. )<br>(NT 2016.002/ NT 2015.002) | Obrig. | 464 | Rej. | Rejeição: Código de Hash no QR-Code difere do calculado |

**Tabela (página 131)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX02-224 | 65 | Se QR Code versão “2” e Parâmetro Chave de Acesso não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação.<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 1º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx)] |
| ZX02-228 | 65 | Se QR Code versão “2” e Parâmetro Chave de Acesso no QR-Code diverge da<br>Chave de Acesso da Nota Fiscal<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 1º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal [Param: xxx)]. |
| ZX02-232 | 65 | Se QR Code versão “2” e Parâmetro Versão não informado no QR-Code.<br>Nota: O Schema XML faz esta verificação<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 2º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx)] |
| ZX02-236 | 65 | Se QR Code versão “2” e Parâmetro Versão informada no QR-Code diverge do<br>previsto (“2”)<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 2º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 398 | Rej. | Rejeição: Parâmetro Versão informada no QR-Code diverge do previsto (“2”) |
| ZX02-240 | 65 | Se QR Code versão “2” e Parâmetro Tipo de Ambiente não informado no QR-<br>Code.<br>Nota: O Schema XML faz esta verificação<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 3º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx)] |
| ZX02-244 | 65 | Se QR Code versão “2” e Parâmetro Tipo de Ambiente do QR-Code diverge do<br>Tipo de Ambiente da Nota Fiscal (tag:tpAmb, id:B24)<br>Observação: Para NFC-e ONLINE ou OFFLINE é o 3º parâmetro da URL do QR<br>Code ) (NT 2016.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal: [Param: xxx)] |
| ZX02-260 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9):<br>- Parâmetro Dia da Data de Emissão não informado no QR-Code.<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe. Observação 2:<br>Para a NFC-e OFFLINE é o 4º parâmetro da URL do QR Code ) (NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx) |
| ZX02-268 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9):<br>Parâmetro Dia da Data de Emissão no QR-Code diverge do Dia Data de<br>Emissão da Nota Fiscal (tag:dhEmi, id:B09)<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe. Observação 2:<br>Para a NFC-e OFFLINE é o 4º parâmetro da URL do QR Code ) (NT 2016.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal: [Param: xxx)] |
| ZX02-272 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9):<br>Parâmetro Valor da Nota Fiscal não informado no QR-Code.<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe. Observação 2:<br>Para a NFC-e OFFLINE é o 5º parâmetro da URL do QR Code ) (NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx) |

**Tabela (página 132)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX02-276 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9):<br>Parâmetro Valor da Nota Fiscal no QR-Code diverge do Valor Total da Nota<br>Fiscal (tag:vNF, id:W16)<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe. Observação 2:<br>Para a NFC-e OFFLINE é o 5º parâmetro da URL do QR Code ) (NT 2016.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal: [Param: xxx)] |
| ZX02-288 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9): Parâmetro Digest<br>Value não informado no QR-Code<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe.<br>Observação 2: Para a NFC-e OFFLINE é o 6º parâmetro da URL do QR Code )<br>(NT 2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx) |
| ZX02-292 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9): Parâmetro Digest<br>Value no QR-Code não está no formato hexadecimal (Caracteres: “0-9”, “a-<br>f”,“A-F”).<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe.<br>Observação 2: Para a NFC-e OFFLINE é o 6º parâmetro da URL do QR Code )<br>(NT 2016.002) | Obrig. | 400 | Rej. | Rejeição: Parâmetro Digest Value no QR-Code não está no formato<br>hexadecimal (Caracteres: “0-9”, “a-f”,“A-F”). |
| ZX02-296 | 65 | Se QR Code versão “2” e NFC-e de contingência (tpEmis=9): Parâmetro Digest<br>Value no QR-Code diverge do Digest Value da Nota Fiscal (tag grupo:<br>Signature, id:ZZ01)<br>Observação 1: Para NFC-e ONLINE esse parâmetro não existe.<br>Observação 2: Para a NFC-e OFFLINE é o 6º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 397 | Rej. | Rejeição: Parâmetro do QR-Code divergente da Nota Fiscal: [Param: xxx)] |
| ZX02-300 | 65 | Parâmetro Código Identificador do CSC não informado no QR-Code.<br>Observação: Mais informações sobre o CSC de cada UF estão disponíveis em<br>http://nfce.encat.org/empresario/csc/<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE é o 4º parâmetro da URL do QR Code.<br>Observação 2: Para a NFC-e OFFLINE é o 7º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx) |
| ZX02-304 | 65 | Se QR Code versão “2” e Parâmetro Código Identificador do CSC no QR-Code<br>não cadastrado na SEFAZ.<br>Observação : Mais informações sobre o CSC de cada UF estão disponíveis em<br>http://nfce.encat.org/empresario/csc/<br>Observação 1: Para NFC-e ONLINE é o 4º parâmetro da URL do QR Code.<br>Observação 2: Para a NFC-e OFFLINE é o 7º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 462 | Rej. | Rejeição: Parâmetro Código Identificador do CSC no QR-Code não cadastrado<br>na SEFAZ. |
| ZX02-308 | 65 | Se QR Code versão “2” e Parâmetro Código Identificador do CSC no QR-Code<br>foi revogado pela empresa anteriormente a Data de Emissão.<br>Observação 1: Para NFC-e ONLINE é o 4º parâmetro da URL do QR Code.<br>Observação 2: Para a NFC-e OFFLINE é o 7º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 463 | Rej. | Rejeição: Parâmetro Código Identificador do CSC no QR-Code foi revogado<br>pela empresa anteriormente a Data de Emissão. |

**Tabela (página 133)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| ZX02-312 | 65 | Se QR Code versão “2” e Parâmetro Hash não informado no QR-Code.<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE é o 5º parâmetro da URL do QR Code.<br>Observação 2: Para a NFC-e OFFLINE é o 8º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 396 | Rej. | Rejeição: Parâmetro do QR-Code inexistente: [Param: xxx) |
| ZX02-316 | 65 | Se QR Code versão “2” e Parâmetro Hash no QR-Code não está no formato<br>hexadecimal (Caracteres: “0-9”, “a-f”,“A-F”).<br>Nota: O Schema XML faz esta verificação<br>Observação 1: Para NFC-e ONLINE é o 5º parâmetro da URL do QR Code.<br>Observação 2: Para a NFC-e OFFLINE é o 8º parâmetro da URL do QR Code (NT<br>2016.002) | Obrig. | 400 | Rej. | Rejeição: Parâmetro Hash no QR-Code não está no formato hexadecimal<br>(Caracteres: “0-9”, “a-f”,“A-F”). |
| ZX02-320 | 65 | Se QR Code versão “2” e Parâmetro Hash do QR-Code diverge do calculado.<br>Observação 1: O cálculo do Hash do QR Code deve seguir o Manual de<br>especificações técnicas do DANFE NFC-e e QR Code.<br>Observação 2: A URL do QR Code da NFC-e ONLINE possui cinco parâmetros,<br>já a NFC-e OFFLINE possui oito parâmetros. (NT 2016.002) | Obrig. | 464 | Rej. | Rejeição: Parâmetro Hash no QR-Code diverge do calculado |
| ZX03-20 | 65 | Endereço do site da UF para a Consulta por chave de acesso difere do<br>previsto.<br>Observação 1: URLs, por UF, utilizadas para consulta por chave de acesso<br>acesse: http://nfce.encat.org/consumidor/consulte-nota/<br>Observação 2: regra de validação opcional por UF<br>Observação3: regra de validação vigente a partir de 01/04/2019. (NT<br>2016.002) | Facul. | 878 | Rej. | Rejeição: Endereço do site da UF da Consulta por chave de acesso diverge do<br>previsto |

**Tabela (página 133)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 1C03-10 | 55/65 | Razão Social (tag: emit\xNome) do emitente diverge do informado no<br>cadastro da SEFAZ.<br>Observação: Regra de validação opcional, a critério da UF.<br>(NT 2019.001 v1.50) | Facul. | 935 | Rej. | Rejeição: Razão Social do emitente diverge do informado no cadastro da<br>SEFAZ |
| 1C17-10 | 55/65 | Se informada IE do Emitente:<br>– Acessar Cadastro de Contribuinte da UF (Chave: IE Emitente)<br>– IE Emitente não cadastrada | Obrig. | 230 | Rej. | Rejeição: IE do emitente não cadastrada |
| 1C17-20 | 55/65 | Se informada IE do Emitente:<br>– IE Emitente não vinculada ao CNPJ (se informado CNPJ emitente, tratar<br>Regime Especial de IE Única) | Obrig. | 231 | Rej. | Rejeição: IE do emitente não vinculada ao CNPJ |
| 1C17-30 | 55/65 | Se informada IE do Emitente:<br>– IE emitente não vinculada ao CPF (se informado CPF emitente) | Obrig. | 622 | Rej. | Rejeição: IE emitente não vinculada ao CPF |
| 1C17-34 | 55 | Se informada IE do Emitente:<br>– Emitente não autorizado para emissão de NF-e | Obrig. | 203 | Rej. | Rejeição: Emissor não habilitado para emissão da NF-e |

**Tabela (página 134)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 1C17-38 | 65 | Se informada IE do Emitente:<br>– Emitente não autorizado para emissão de NFC-e | Obrig. | 781 | Rej. | Rejeição: Emissor não habilitado para emissão da NFC-e |
| 1C17-40 | 55/65 | Se informada IE do Emitente:<br>– Emitente em situação irregular perante o Fisco | Obrig. | 301 | Den. | Uso Denegado: Irregularidade fiscal do emitente |
| 1C17-50 | 55 | Se IE do Emitente = "ISENTO" (unicamente para Nota Fiscal Avulsa): – Se não<br>for NF-e Avulsa (excluída na NT 2018.001) | Obrig. | 230 | Rej. | Rejeição: IE do emitente não cadastrada |
| 1C17-60 | 55/65 | Mensagens opcionais no caso de IE não vinculada ao CNPJ/CPF.<br>- Acessar Cadastro de Pessoa Jurídica ou Pessoa Física:<br>– CNPJ emitente não cadastrado | Facul. | 245 | Rej. | Rejeição: CNPJ Emitente não cadastrado |
| 1C17-70 | 55 | Mensagens opcionais no caso de IE não vinculada ao CNPJ/CPF.<br>- Acessar Cadastro de Pessoa Jurídica ou Pessoa Física:<br>– CPF Emitente não cadastrado (NT 2011/004) | Facul. | 621 | Rej. | Rejeição: CPF Emitente não cadastrado |

**Tabela (página 134)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 2B08-10 | 55/65 | Modelo 55: Acesso BD NFE (Chave: Modelo, UF, CNPJ/CPF Emitente, Série,<br>Número):<br>– NF-e já cadastrada, com diferença na Chave de Acesso (Código Numérico<br>ou outras posições da Chave de Acesso). (NT 2011/004)<br>Modelo 65: Acesso BD NFE (Chave: Modelo, UF, CNPJ Emitente, Série,<br>Número, Tipo de Emissão):<br>– NF-e já cadastrada, com diferença na Chave de Acesso (Código Numérico<br>ou outras posições da Chave de Acesso).<br>(NT 2011/004) (NT 2018.001 v1.10) | Facul. | 539 | Rej. | Rejeição: Duplicidade de NF-e com diferença na Chave de Acesso [chNFe:<br>99999999999999999999999999999999999999999999][nRec:9999999999999<br>99]<br>Observação: Na resposta assíncrona, a SEFAZ pode devolver o nREC – Número<br>do Recibo do Lote caso tenha condições. |
| 2B08-20 | 55/65 | Acesso BD NFE (Chave: Modelo, UF, CNPJ/CPF Emitente, Série, Número):<br>– NF-e já cadastrada e não Cancelada/Denegada<br>Observação 1: Na resposta assíncrona, a SEFAZ pode devolver o nREC –<br>Número do Recibo do Lote caso tenha condições.<br>Observação 2: A critério da UF, no caso do DigestValue ser igual a NF-e<br>autorizada, poderá retornar o protocolo de Autorização. (NT 2018.005 v1.30<br>/ NT 2018.001 v1.10) | Obrig. | 204 | Rej. | Rejeição: Duplicidade de NF-e [nRec:999999999999999]<br>Observação: Na resposta assíncrona, concatenar na mensagem de erro o<br>Número do Recibo do Lote (opcional). |
| 2B08-30 | 55/65 | Acesso BD NFE (Chave: Modelo, UF, CNPJ/CPF Emitente, Série, Número):<br>– NF-e já cadastrada e está Cancelada (NT 2018.001) | Obrig. | 218 | Rej. | Rejeição: NF-e já está cancelada na base de dados da SEFAZ<br>[nRec:999999999999999]<br>Observação: Na resposta assíncrona, a SEFAZ pode devolver o nREC – Número<br>do Recibo do Lote caso tenha condições. |

**Tabela (página 135)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 2B08-40 | 55/65 | Acesso BD NFE (Chave: Modelo, UF, CNPJ/CPF Emitente, Série, Número):<br>– NF-e já cadastrada e está Denegada (NT 2018.001) | Obrig. | 205 | Rej. | Rejeição: NF-e está denegada na base de dados da SEFAZ<br>[nRec:999999999999999]<br>Observação: Na resposta assíncrona, a SEFAZ pode devolver o nREC – Número<br>do Recibo do Lote caso tenha condições. |
| 2B08-50 | 55/65 | Acesso BD NFE (Chave: Modelo, UF, CNPJ/CPF Emitente, Série, Número):<br>NF-e com mesmo número e série já transmitida e aguardando processamento<br>(NT 2011/004)<br>Observação: Verificação necessária para algumas UF. (NT 2018.001) | Facul. | 635 | Rej. | Rejeição: NF-e com mesmo número e série já transmitida e aguardando<br>processamento |

**Tabela (página 135)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 2AB08-10 | 55 | Acesso ao BD Evento EPEC (Chave:<br>Modelo, UF, CNPJ ou CPF Emitente,<br>Série, Nro): - Se existe EPEC: - Se Tipo<br>Emissão da NF-e <> 4 | Obrig. | 692 | Rej | Rejeição: Existe EPEC registrado para esta Série e Número [Chave EPEC:<br>xxxxxxxxxxx] |
| 2AB08-20 | 55 | - Chave de Acesso da NF-e diverge da Chave de Acesso do EPEC | Obrig. | 691 | Rej | Rejeição: Chave de Acesso da NF-e diverge da Chave de Acesso do EPEC<br>[Chave EPEC: xxxxxxxxx] |
| 2AB08-30 | 55 | - Verificar divergência entre os dados da NF-e e os dados do EPEC (*1) | Obrig. | 467 | Rej | Rejeição: Dados da NF-e divergentes do EPEC [tag: xxxx] |
| 2AB08-40 | 55 | - Se não existe EPEC: - Se Tipo Emissão da NF-e=4-EPEC e Data<br>Emissão NF-e > Data da desativação do DPEC (01/04/2015)<br>(NT 2018.001/NT 2014.001 v1.20) | Obrig. | 468 | Rej | Rejeição: NF-e com Tipo Emissão = 4, sem EPEC correspondente. |

**Tabela (página 135)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 3B08-100 | 55/65 | Acesso BD de Inutilização (Chave: Modelo, UF, CNPJ/CPF, Série, Número):<br>– Numeração da NF-e está inutilizada (NT 2011/004) (NT 2018.001) | Obrig. | 206 | Rej. | Rejeição: NF-e já está inutilizada na Base de Dados da SEFAZ |

**Tabela (página 136)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 3BA02-10 | 55 | Para cada NF-e referenciada (tag:refNFe), se a UF da Chave de Acesso<br>referenciada for igual a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso referenciada (se mod=55)<br>– NF-e referenciada inexistente<br>Exceção: A NF-e referenciada pode não existir no caso de Emissão em<br>Contingência (tpEmis = 2, 4 ou 5) (NT 2013/003)<br>Observação: A exceção acima não se aplica para “finNFe=2" (NF-e<br>Complementar). | Facul. | 267 | Rej. | Rejeição: Chave de Acesso referenciada inexistente [nRef: xxx] |
| 3BA02-20 | 55 | Para cada NF-e referenciada (tag:refNFe), se a UF da Chave de Acesso<br>referenciada for igual a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso referenciada (se mod=55)<br>– NF-e Complementar (finNFe=2) referencia uma outra NF-e Complementar<br>(finNFe=2) | Facul. | 268 | Rej. | Rejeição: NF Complementar referencia uma outra NF-e Complementar |
| 3BA02-30 | 55 | Para cada NF-e referenciada (tag:refNFe), se a UF da Chave de Acesso<br>referenciada for igual a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso referenciada (se mod=55)<br>– NF-e Complementar (finNFe=2) referencia uma NF-e cancelada (NT<br>2013/003) | Facul. | 686 | Rej. | Rejeição: NF Complementar referencia uma NF-e cancelada |
| 3BA02-40 | 55 | Para cada NF-e referenciada (tag:refNFe), se a UF da Chave de Acesso<br>referenciada for igual a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso referenciada (se mod=55)<br>– NF-e Complementar (finNFe=2) referencia uma NF-e denegada (NT<br>2013/003) | Facul. | 687 | Rej. | Rejeição: NF Complementar referencia uma NF-e denegada |
| 3BA15-10 | 55 | Para cada NF de Produtor referenciada (tag:refNFP), se a Nota Fiscal<br>referenciada for da própria UF (tag:refNFP/cUF):<br>– Acessar Cadastro da SEFAZ:<br>– IE de Produtor inexistente (NT 2013/003) | Facul. | 688 | Rej. | Rejeição: NF referenciada de Produtor com IE inexistente [nRef: xxx] |
| 3BA15-20 | 55 | Para cada NF de Produtor referenciada (tag:refNFP), se a Nota Fiscal<br>referenciada for da própria UF (tag:refNFP/cUF):<br>– Acessar Cadastro da SEFAZ:<br>– IE de Produtor não vinculada ao CNPJ / CPF (NT 2013/003) | Facul. | 689 | Rej. | Rejeição: NF referenciada de Produtor com IE não vinculada ao CNPJ/CPF<br>informado [nRef: xxx] |

**Tabela (página 136)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 4I54-10 | 55 | Para cada Chave de Acesso citada na Exportação Indireta<br>(tag:detExport/exportInd/chNFe), se a UF da Chave de Acesso citada for igual<br>a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso (mod=55)<br>– NF-e inexistente | Facul. | 357 | Rej. | Rejeição: Chave de Acesso do grupo de Exportação Indireta inexistente [nRef:<br>xxx] |

**Tabela (página 137)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 4I54-20 | 55 | Para cada Chave de Acesso citada na Exportação Indireta<br>(tag:detExport/exportInd/chNFe), se a UF da Chave de Acesso citada for igual<br>a UF do Emitente:<br>– Acessar BD NFE com Chave de Acesso (mod=55)<br>– NF-e cancelada / denegada | Facul. | 358 | Rej. | Rejeição: Chave de Acesso do grupo de Exportação Indireta cancelada ou<br>denegada [nRef: xxx] |

**Tabela (página 137)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 5E17-10 | 55 | Se informada IE do Destinatário:<br>- Acessar Cadastro de Contribuinte da UF (Chave: UF Dest, IE Dest.) (*5)<br>- IE destinatário não cadastrada (*7) (NT 2019.001 v1.00) | Obrig. | 233 | Rej. | Rejeição: IE do destinatário não cadastrada |
| 5E17-20 | 55 | Se informado CNPJ do destinatário e IE destinatário não vinculada ao CNPJ<br>(tratar Regime Especial de IE Única) (NT 2019.001 v1.00) | Obrig. | 234 | Rej. | Rejeição: IE do destinatário não vinculada ao CNPJ |
| 5E17-30 | 55 | Se informado CPF do destinatário e IE destinatário não vinculada ao CPF (*7)<br>(NT 2019.001 v1.00) | Obrig. | 624 | Rej. | Rejeição: IE Destinatário não vinculada ao CPF |
| 5E17-40 | 55 | Destinatário em situação irregular perante o Fisco, vedada operação na UF<br>(CCC.cSitCNPJ=3-Vedado) (NT 2019.001 v1.00) | Obrig. | 302 | Den. | Uso Denegado: Irregularidade fiscal do destinatário |
| 5E17-43 | 55 | Destinatário bloqueado na UF (CCC.cSitCNPJ=2-Bloqueado) (NT 2019.001<br>v1.00) | Obrig. | 305 | Rej. | Rejeição: Destinatário bloqueado na UF |
| 5E17-46 | 55 | IE do Destinatário não está ativa na UF (CCC.cSitIE=0-Não habilitado) (*7) (NT<br>2019.001 v1.00) | Obrig. | 306 | Rej. | Rejeição: IE do destinatário não está ativa na UF |
| 5E17-50 | 55 | Se IE Destinatário não informada e informado CNPJ do destinatário:<br>- Acessar Cadastro Contribuinte da UF (Chave: UF-Dest, CNPJ-Dest) (*6)<br>- Destinatário possui IE ativa na UF (CCC.cSitIE=1-Habilitado) e<br>CCC.IndIEDestOpc = 0 – Obrig.atório (NT 2019.001 v1.00) | Obrig. | 232 | Rej. | Rejeição: IE do destinatário não informada |
| 5E17-60 | 55 | – Destinatário com CNPJ vedado na UF (CCC.cSitCNPJ=3-Vedado) (NT<br>2019.001 v1.00) | Obrig. | 303 | Den. | Uso Denegado: Destinatário não habilitado a operar na UF |
| 5E17-63 | 55 | – Destinatário bloqueado na UF (CCC.cSitCNPJ=2-Bloqueado) (NT 2019.001<br>v1.00) | Obrig. | 305 | Rej. | Rejeição: Destinatário bloqueado na UF |
| 5E17-70 | 55 | Mensagens opcionais se informada IE do destinatário e IE não vinculada ao<br>CNPJ/CPF.<br>- Acessar Cadastro de Pessoa Jurídica ou Pessoa Física:<br>- CNPJ destinatário não cadastrado (NT 2019.001 v1.00) | Facul. | 246 | Rej. | Rejeição: CNPJ Destinatário não cadastrado |
| 5E17-80 | 55 | CPF destinatário não cadastrado (*7) (NT 2019.001 v1.00) | Facul. | 623 | Rej. | Rejeição: CPF Destinatário não cadastrado |

**Tabela (página 138)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 7B09-10 | 55/65 | Data de Emissão anterior a data de credenciamento do Contribuinte para a<br>emissão de Nota Fiscal na UF, ou anterior a Data de Abertura do<br>estabelecimento na UF. (NT 2015.002) | Facul. | 479 | Rej. | Rejeição: Data de Emissão anterior a data de credenciamento ou anterior a<br>Data de Abertura do estabelecimento |
| 7C10-10 | 55/65 | Código do Município do Emitente diverge do cadastrado na UF (NT 2015.002) | Facul. | 480 | Rej. | Rejeição: Código Município do Emitente diverge do cadastrado na UF |
| 7C21-10 | 55/65 | Código de Regime Tributário do emitente divergente do cadastrado na SEFAZ<br>(tag:emit/CRT):<br>- CRT=”1-Simples Nacional” para Contribuinte cadastrado como Regime<br>Normal na UF;<br>- CRT=”3-Regime Normal” para Contribuinte cadastrado como Simples<br>Nacional na UF;<br>Observação: Implementação futura. (NT 2015.002) | Facul. | 481 | Rej. | Rejeição: Código Regime Tributário do emitente diverge do cadastro na SEFAZ |
| 7E10-10 | 55/65 | Código do Município do Destinatário diverge do cadastrado na UF (NT<br>2015.002) | Facul. | 482 | Rej. | Rejeição: Código do Município do Destinatário diverge do cadastrado na UF |
| 7GA01-10 | 55 | Não informado o Grupo de Autorização para obter o XML, para a UF que exige<br>a identificação do Escritório de Contabilidade na Nota Fiscal, conforme<br>legislação estadual.<br>Observação: Regra de Validação opcional, a critério da UF. (NT 2015.002) | Facul. | 486 | Rej. | Rejeição: Não informado o Grupo de Autorização para UF que exige a<br>identificação do Escritório de Contabilidade na Nota Fiscal |
| 7GA01-20 | 55 | Verificar se o CNPJ/CPF informado na primeira ocorrência do Grupo de<br>Autorização corresponde a um Escritório de Contabilidade cadastrado na<br>SEFAZ, conforme legislação estadual.<br>Observação: Regra de Validação opcional a critério da UF. (NT 2015.002) | Facul. | 487 | Rej. | Rejeição: Escritório de Contabilidade não cadastrado na SEFAZ |
| 7I03-10 | 55/65 | Se não informado GTIN (cEAN=Nulo).<br>Observação: Para produtos que não possuem GTIN, utilizar a informação de<br>"SEM GTIN" (NT 2017.001) | Obrig. | 889 | Rej. | Rejeição: Obrigatória a informação do GTIN para o produto [nItem: 999] |
| 7ZD02-10 | 55/65 | CNPJ do responsável técnico diverge do cadastrado para o emitente<br>(UF/CNPJ).<br>Observação: Implementação futura (NT 2018.005 v1.30) | Facul. | 974 | Rej. | Rejeição: CNPJ do responsável técnico diverge do cadastrado |
| 7ZD08-10 | 55/65 | Identificador do CSRT (tag: idCSRT) não cadastrado na SEFAZ.<br>Observação: Implementação futura (NT 2018.005 v1.30) | Facul. | 976 | Rej. | Rejeição: Identificador do CSRT não cadastrado na SEFAZ |
| 7ZD08-20 | 55/65 | Identificador do CSRT (tag: idCSRT) revogado.<br>Observação: Implementação futura (NT 2018.005 v1.30) | Facul. | 977 | Rej. | Rejeição: Identificador do CSRT revogado |
| 7ZD09-10 | 55/65 | Hash do CSRT (tag: hashCSRT) diverge do calculado.<br>Observação: Implementação futura (NT 2018.005 v1.30) | Facul. | 978 | Rej. | Rejeição: Hash do CSRT diverge do calculado |

**Tabela (página 139)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 8C02-10 | 55 | Na Nota Fiscal de Saída, verificar se a soma das demais Notas Fiscais de Saída<br>(vendas) do Emitente no período ultrapassa o limite anual de faturamento,<br>conforme o Porte da Empresa.<br>Observação 1: Regra de validação opcional a critério da UF.<br>Observação 2: Considerar tolerância, conforme a legislação estadual. (NT<br>2015.002) | Facul. | 488 | Rej. | Rejeição: Vendas do Emitente incompatíveis com o Porte da Empresa |

**Tabela (página 139)**
| Campo-Seq | Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- | --- |
| 9I03-10 | 55/65 | Se informado GTIN (tag: cEAN) com prefixo do Brasil (iniciado em 789 ou 790)<br>e GTIN informado na NF-e inexistente no CCG. (NT 2017.001) | Obrig. | 890 | Rej. | Rejeição: GTIN inexistente no Cadastro Centralizado de GTIN (CCG)<br>[nItem:999] |
| 9I03-20 | 55/65 | Se informado GTIN (tag: cEAN) com prefixo do Brasil (iniciado em 789 ou 790)<br>e NCM informada na NF-e diferente da cadastrada no CCG (NT 2017.001) | Obrig. | 891 | Rej. | Rejeição: GTIN incompatível com a NCM [nItem:999; NCM esperada:<br>99999999] |
| 9I03-30 | 55/65 | Se informado o GTIN (tag: cEAN) com prefixo do Brasil (iniciado em 789 ou<br>790) e CEST informado na NF-e diferente do cadastrado no CCG (NT<br>2017.001) | Obrig. | 892 | Rej. | Rejeição: GTIN incompatível com CEST [nItem:999; CEST esperado: 9999999] |
| 9I03-40 | 55/65 | Se informado GTIN-14 (tag: cEAN>09999999999999) com prefixo do Brasil<br>(iniciado em 789 ou 790) e informado GTIN da unidade tributável (tag:<br>cEANTrib) diferente do GTIN Contido cadastrado no CCG<br>Exceção: a RV não se aplica em operações com exterior (idDest=3)<br>Nota: o GTIN pode possuir GTIN de nível inferior (GTIN Contido), agrupando<br>diversas unidades do mesmo produto. O GTIN da unidade tributável deve<br>corresponder àquele da menor unidade comercializável identificada por<br>código GTIN, ou seja, deve corresponder ao GTIN do menor nível inferior<br>(GTIN Contido). (NT 2017.001) | Obrig. | 893 | Rej. | Rejeição: GTIN da unidade tributável diverge do GTIN Contido cadastrado no<br>CCG [nItem:999; GTIN Contido esperado: 99999999999999] |
| 9I12-10 | 55/65 | Se informado GTIN da unidade tributável (tag: cEANTrib) com prefixo do Brasil<br>(iniciado em 789 ou 790) e GTIN da unidade tributável informado na NF-e<br>(tag: cEANTrib) inexistente no CCG. (NT 2017.001) | Obrig. | 894 | Rej. | Rejeição: GTIN da unidade tributável inexistente no Cadastro Centralizado de<br>GTIN (CCG) [nItem:999] |
| 9I12-20 | 55/65 | Se informado GTIN da unidade tributável (tag: cEANTrib) com prefixo do Brasil<br>(iniciado em 789 ou 790) e NCM informada na NF-e diferente da cadastrada<br>no CCG (NT 2017.001) | Obrig. | 895 | Rej. | Rejeição: GTIN da unidade tributável incompatível com a NCM [nItem:999;<br>NCM esperada: 99999999] |
| 9I12-30 | 55/65 | Se informado GTIN da unidade tributável (tag: cEANTrib) com prefixo do Brasil<br>(iniciado em 789 ou 790) e CEST informado na NF-e diferente do cadastrado<br>no CCG (NT 2017.001) | Obrig. | 896 | Rej. | Rejeição: GTIN da unidade tributável incompatível com CEST [nItem:999; CEST<br>esperado: 9999999] |

**Tabela (página 140)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | NF-e/NFC-e* enviada com mais de 30* rejeições iguais:<br>- Contribuinte ficará com o WS de autorização recebendo a rejeição 656 por até 1 (uma)*<br>hora para todas as requisições.<br>Observação 1: Caso após o tempo de 1 (uma)* hora o contribuinte envie novamente a<br>mesma NF-e/NFC-e* e tenha a mesma rejeição, ele poderá voltar a receber a rejeição 656<br>por até 1 (uma)* hora, e isso se repetirá até ele parar de enviar a NF-e com a mesma<br>rejeição.<br>Observação 2: A verificação do contribuinte para receber a rejeição 656 poderá ser feita em<br>tempo de conexão pela identificação do CNPJ do certificado digital de transmissão mais<br>o endereço IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>Observação 3: A critério da UF, após 50* bloqueios o contribuinte poderá receber a rejeição<br>656 permanentemente, até entrar em contato com a UF autorizadora.<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: Quantidade de<br>rejeições encontradas: XXX, NF-e: CHAVE_ACESSO] |

**Tabela (página 141)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | Recibo consultado mais de 40* vezes em 1 (uma)* hora:<br>- Contribuinte ficará com o WS de Consulta Lote recebendo a rejeição 656 por até 1 (uma)*<br>hora para todas as requisições.<br>Observação 1: Após o tempo de 1 (uma)* hora o contribuinte poderá fazer novamente mais<br>40* consultas do número do lote.<br>Observação 2: A verificação do contribuinte para receber a rejeição 656 será feita em tempo<br>de conexão pela identificação do CNPJ do certificado digital de transmissão mais o endereço<br>IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: Número<br>máximo de consultas excedido (40) para o recibo: NUM_RECIBO] |

**Tabela (página 141)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | Inutilização enviada com mais de 20* rejeições iguais:<br>- Contribuinte (CNPJ + IP) ficará com o WS de Inutilização recebendo a rejeição 656 por até 1<br>(uma)* hora para todas as requisições.<br>Observação 1: Caso após o tempo de 1 (uma)* hora o contribuinte envie novamente a<br>mesma Inutilização e tenha a mesma rejeição, ele poderá voltar a receber a rejeição 656 por<br>até 1 (uma)* hora, e isso se repetirá até ele parar de enviar a Inutilização com a mesma<br>rejeição.<br>Observação 2: A verificação do contribuinte para receber a rejeição 656 poderá ser feita em<br>tempo de conexão pela identificação do CNPJ do certificado digital de transmissão mais o<br>endereço IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>Observação 3: A critério da UF, após 50* bloqueios o contribuinte poderá receber a rejeição<br>656 permanentemente, até entrar em contato com a UF autorizadora.<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: Quantidade de<br>rejeições encontradas: XXX, Inutilização: ID_INUT] |

**Tabela (página 141)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | NF-e consultada mais de 10* vezes em 1 (uma)* hora:<br>- Contribuinte ficará com o WS de Consulta Protocolo recebendo a rejeição 656 por até 1<br>(uma)* hora para todas as requisições.<br>Observação 1: Após o tempo de 1 (uma)* hora o contribuinte poderá fazer novamente mais<br>10* consultas da mesma chave de acesso.<br>Observação 2: A verificação do contribuinte para receber a rejeição 656 poderá ser feita em<br>tempo de conexão pela identificação do CNPJ do certificado digital de transmissão mais o<br>endereço IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: Número<br>máximo de consultas excedido (10) para a NF-e: CHAVE_ACESSO] |

**Tabela (página 142)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | Evento enviado com mais de 20 * rejeições iguais:<br>- Contribuinte ficará com o WS de Eventos recebendo a rejeição 656 por até 1 (uma)* hora<br>para todas as requisições.<br>Observação 1: Caso após o tempo de 1 (uma)* hora o contribuinte envie novamente o<br>mesmo Evento e tenha a mesma rejeição, ele poderá voltar a receber a rejeição 656 por até<br>1 (uma)* hora, e isso se repetirá até ele parar de enviar o Evento com a mesma rejeição.<br>Observação 2: A verificação do contribuinte para receber a rejeição 656 poderá ser feita em<br>tempo de conexão pela identificação do CNPJ do certificado digital de transmissão mais o<br>endereço IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>Observação 3: A critério da UF, após 50* bloqueios o contribuinte poderá receber a rejeição<br>656 permanentemente, até entrar em contato com a UF autorizadora.<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: Quantidade de<br>rejeições encontradas: XXX, NF-e: ID_EVENTO] |

**Tabela (página 142)**
| Modelo | Regra de Validação | Aplic. | Msg | Efeito | Descrição Erro |
| --- | --- | --- | --- | --- | --- |
| 55/65 | Se for verificado algum tipo de envio em looping (mais de 40* envios repetidos) em outro<br>Web Service que gere erro ou onere o sistema autorizador:<br>- Contribuinte ficará com o Web Service recebendo a rejeição 656 por até 1 (uma)* hora<br>para todas as requisições.<br>Observação 1: A verificação do contribuinte para receber a rejeição 656 poderá ser feita em<br>tempo de conexão pela identificação do CNPJ do certificado digital de transmissão mais o<br>endereço IP (CNPJ + IP) ou pela identificação do CNPJ do emitente (emit/CNPJ).<br>(*) Critérios preferenciais, parametrizáveis por ambiente autorizador. | Facul. | 656 | Rej. | Rejeição: Consumo indevido pelo aplicativo da empresa [det: DESC_ERRO] |


### Erros comuns e como evitar (extraído da seção 3.2)

- Não informar TAGs de campos não obrigatórios com conteúdo igual a `0`, vazio ou com espaços. fileciteturn1file0L4-L20
- Não informar TAGs com conteúdo possuindo espaços à direita ou à esquerda. fileciteturn1file0L4-L20
- Não preencher valores numéricos com zeros não significativos (à esquerda). fileciteturn1file0L4-L20

## Cardinalidade e repetição

Grupos repetíveis (cardinalidade > 1), conforme o PDF:

- NFref — Cardinalidade 0..500 — Caminho NFe/infNFe/ide/NFref
- det — Cardinalidade 1..990 — Caminho NFe/infNFe/det
- autXML — Cardinalidade 0..10 — Caminho NFe/infNFe/autXML
- DI — Cardinalidade 0..100 — Caminho NFe/infNFe/det/prod/DI
- adi — Cardinalidade 1..100 — Caminho NFe/infNFe/det/prod/DI/adi
- detExport — Cardinalidade 0..500 — Caminho NFe/infNFe/det/prod/detExport
- rastro — Cardinalidade 0..500 — Caminho NFe/infNFe/det/prod/rastro
- arma — Cardinalidade 1..500 — Caminho NFe/infNFe/det/prod/arma
- reboque — Cardinalidade 0..5 — Caminho NFe/infNFe/transp/reboque
- vol — Cardinalidade 0..5000 — Caminho NFe/infNFe/transp/vol
- dup — Cardinalidade 0..120 — Caminho NFe/infNFe/cobr/dup
- lacres — Cardinalidade 0..5000 — Caminho NFe/infNFe/transp/vol/lacres
- detPag — Cardinalidade 1..100 — Caminho NFe/infNFe/pag/detPag
- obsCont — Cardinalidade 0..10 — Caminho NFe/infNFe/infAdic/obsCont
- obsFisco — Cardinalidade 0..10 — Caminho NFe/infNFe/infAdic/obsFisco
- procRef — Cardinalidade 0..100 — Caminho NFe/infNFe/infAdic/procRef
- forDia — Cardinalidade 1..31 — Caminho NFe/infNFe/cana/forDia
- deduc — Cardinalidade 0..10 — Caminho NFe/infNFe/cana/deduc

## Checklist de montagem

Passo a passo sugerido (seguir a hierarquia e a cardinalidade do PDF):

1. Criar `NFe` (raiz).
2. Criar `infNFe` e preencher seus atributos/identificadores conforme o PDF (`@versao`, `@Id`) e demais regras.
3. Preencher `ide` (identificação) e seus campos obrigatórios.
4. Preencher `emit` (emitente) e `enderEmit`.
5. Se existir no documento/negócio, preencher grupos opcionais (`avulsa`, `dest`, `enderDest`, `retirada`, `entrega`, `autXML`, etc.) respeitando regras condicionais.
6. Para cada item, gerar um `det` e preencher `prod` e `imposto` (incluindo subgrupos de tributos conforme regras do PDF).
7. Preencher `total` (totais) e seus subgrupos.
8. Preencher `transp` (transporte).
9. Se aplicável, preencher `cobr` (cobrança).
10. Preencher `pag` (pagamento) e `detPag` (quando existir) conforme cardinalidade.
11. Se aplicável, preencher `infIntermed`, `infAdic`, `exporta`, `compra`, `cana`, `infRespTec`.
12. Se aplicável, preencher `infNFeSupl`.
13. Garantir que regras gerais de preenchimento (seção 3.2) foram respeitadas.
14. Validar contra as tabelas de regras de validação (seção 4).

## Exemplos extraídos do PDF

```text
Exemplo:
O preenchimento dos campos de tributos relacionados com o “ICMS Normal e ST” depende do conteúdo informado no código de Tributação do ICMS (campo N12),
que pode assumir um dos seguintes valores:
00 - Tributada integralmente;
10 - Tributada e com cobrança do ICMS por substituição tributária;
20 - Com redução de base de cálculo;
30 - Isenta ou não tributada e com cobrança do ICMS por substituição tributária;
40 - Isenta;
41 - Não tributada;
50 - Suspensão;
51 - Diferimento;
60 - ICMS cobrado anteriormente por substituição tributária;
70 - Com redução de base de cálculo e cobrança do ICM
```

```text
Exemplo:<![CDATA[https://www.sefaz.rs.gov.br/NFCE/NFCECOM.aspx?chNFe=43150108287693000157651010000000971000001251&nVersao=100&tpAmb=2&cDest
=99999999000191&dhEmi=323031352d30312d32305431373a30303a34392d30323a3030&vNF=1.00&vICMS=0.00&digVal=2f4a703477714e6d6e4e646d31776b64743
936655a486b65354f513d&cIdToken=000001&cHashQRCode=ecc4f0e7e612456f2e3521768bd572b6f0eae240]]>
2 Informar a URL da “Consulta da NFC-e via QR-Code”, na versão 2, conforme os seguintes modelos:
• Para a NFC-e emitida “on-line: https:// endereco-consulta-QRCode?p=<chave_acesso>|<versao_qrcode>|<tipo_ambiente>|<identificador_cs
```

## Dúvidas/trechos ambíguos

- O grupo `avulsa` (ID `D01`) está sem descrição na coluna **Descrição** no leiaute extraído. (Ver dicionário do grupo `avulsa`.)
- Este guia não interpreta regras que não estejam explicitamente descritas no PDF; se houver inconsistências entre tabelas e regras, priorize o que estiver explicitamente no texto/tabelas do PDF.
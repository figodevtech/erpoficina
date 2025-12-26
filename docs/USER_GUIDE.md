# Manual do Usuário - ERP Oficina

> Guia completo para usuários finais - Como usar todas as funcionalidades do sistema.

**Última atualização:** Dezembro de 2025  
**Versão do Documento:** 1.0  
**Para:** Oficinas mecânicas e usuários do sistema

---

## 📋 Índice

1. [Introdução](#introdução)
2. [Primeiro Acesso](#primeiro-acesso)
3. [Navegação no Sistema](#navegação-no-sistema)
4. [Dashboard](#dashboard)
5. [Gestão de Clientes](#gestão-de-clientes)
6. [Ordens de Serviço](#ordens-de-serviço)
7. [Controle de Estoque](#controle-de-estoque)
8. [Módulo Financeiro](#módulo-financeiro)
9. [Configurações](#configurações)
10. [Dicas e Boas Práticas](#dicas-e-boas-práticas)
11. [FAQ](#faq)

---

## Introdução

### O que é o ERP Oficina?

O **ERP Oficina** é um sistema integrado de gestão para oficinas mecânicas que centraliza:
- 👥 Gestão de clientes e seus veículos
- 🔧 Controle completo de ordens de serviço
- 📦 Inventário de peças e produtos
- 💰 Gestão financeira (contas a pagar/receber)
- 📊 Dashboard com indicadores em tempo real

### Para quem é?

- **Proprietários** - Visão geral do negócio
- **Gerentes** - Gestão operacional
- **Mecânicos** - Execução de serviços
- **Atendentes** - Relacionamento com clientes
- **Financeiro** - Controle de receitas e despesas

### Principais Benefícios

✅ Organização centralizada  
✅ Redução de papelwork  
✅ Melhor atendimento ao cliente  
✅ Controle de estoque eficiente  
✅ Visibilidade financeira completa  
✅ Acessível de qualquer lugar (cloud)  

---

## Primeiro Acesso

### Login

1. **Acesse o endereço do sistema**
   - Digite na barra do navegador: `https://seu-dominio.com.br`

2. **Digite suas credenciais**
   - Email: seu email de cadastro
   - Senha: sua senha pessoal

3. **Clique em "Entrar"**
   - Será redirecionado ao Dashboard

4. **Primeira vez?**
   - Você pode ser solicitado a alterar senha ou completar perfil

### Recuperação de Senha

Se esqueceu sua senha:

1. **Na tela de login**, clique em **"Esqueci minha senha"**
2. **Digite seu email** de cadastro
3. **Verifique sua caixa de entrada**
   - Procure pelo email de recuperação (pode estar no spam)
4. **Clique no link** do email
5. **Cadastre uma nova senha**
6. **Tente fazer login** novamente

> **Nota:** Links de recuperação expiram em 24 horas. Se expirou, repita o processo.

---

## Navegação no Sistema

### Menu Principal (Esquerda)

O menu lateral esquerdo contém todas as seções principais:

```
📊 Dashboard        → Visão geral de indicadores
👥 Clientes         → Gestão de clientes
🔧 Ordens de Serviço → Gerenciamento de O.S.
📦 Estoque          → Controle de peças
💰 Financeiro       → Contas a pagar/receber
⚙️ Configurações    → Ajustes do sistema
```

### Barra Superior

Na parte superior você encontra:

**Lado Esquerdo:**
- 📱 Menu (em mobile)
- 🔍 Busca global
- 🔔 Notificações

**Lado Direito:**
- 👤 Perfil do usuário
- 🌙 Tema claro/escuro
- 🔐 Logout (sair)

### Breadcrumb (Navegação)

Mostra o caminho até a página atual:

```
Dashboard > Clientes > Detalhes > João Silva
```

Clique em qualquer parte para voltar.

### Responsividade

- **Desktop (≥1024px)**: Menu lateral sempre visível
- **Tablet (768px-1023px)**: Menu colapsado, pode expandir
- **Mobile (<768px)**: Menu em hamburger (☰)

---

## Dashboard

### O que é?

Tela inicial com resumo executivo do negócio em tempo real.

### Indicadores Principais (KPIs)

#### 1. **Faturamento do Dia/Mês**
- Total de receitas acumuladas
- Clique para ver detalhamento por serviço

#### 2. **Ordens em Andamento**
- Quantas O.S. estão sendo executadas
- Click para filtrar por status

#### 3. **Ordens Pendentes de Aprovação**
- Quantas aguardam aprovação do cliente
- Indica urgência de contato com clientes

#### 4. **Estoque Crítico**
- Produtos abaixo do estoque mínimo
- Clique para acessar lista de reposição

#### 5. **Contas a Receber (Vencendo)**
- Total a receber no próximo período
- Alerta de inadimplência

#### 6. **Contas a Pagar**
- Total de despesas próximas de vencer
- Previsão de saída de caixa

### Gráficos e Análises

#### Gráfico de Faturamento Mensal
- Evolução de receitas ao longo do mês
- Linha de meta (se configurada)
- Hover para ver valores exatos

#### Status das Ordens de Serviço
- Pie chart com distribuição de status
- Orçamento, Aprovada, Em Andamento, Concluída, Entregue, Cancelada

#### Produtos Mais Vendidos
- Top 5 produtos/serviços
- Ranking de receita e quantidade

#### Evolução de Clientes
- Gráfico de crescimento
- Novos clientes por período

### Ações Rápidas

Botões de acesso rápido para:
- ➕ Nova Ordem de Serviço
- ➕ Novo Cliente
- 📊 Ver Relatório Completo

---

## Gestão de Clientes

### Acessar Módulo

1. Clique em **"Clientes"** no menu lateral
2. Será exibida a lista de todos os clientes

### Visualizar Clientes

**Lista de Clientes:**
- 📝 Nome
- 📞 Telefone
- 📧 Email
- 📅 Data de cadastro
- 🔗 Ações (Editar, Ver detalhes, Excluir)

**Filtros Disponíveis:**
```
🔍 Buscar por nome/CPF/CNPJ
🏷️ Por tipo (PF / PJ)
📅 Data de cadastro
✅ Apenas ativos
```

### Cadastrar Novo Cliente

1. **Clique no botão "+ Novo Cliente"**
2. **Preencha dados obrigatórios:**
   - Nome completo ou Razão Social *
   - CPF (PF) ou CNPJ (PJ) *
   - Tipo (Pessoa Física / Jurídica) *
   - Telefone *
3. **Preencha dados opcionais:**
   - Email
   - Endereço completo
   - Cidade / Estado / CEP
   - Observações
4. **Clique em "Salvar"**

> **Dica:** CPF/CNPJ devem ser únicos. Sistema não permite duplicatas.

### Cadastrar Veículo do Cliente

Um cliente pode ter vários veículos:

1. **Abra a ficha do cliente**
2. **Acesse a aba "Veículos"**
3. **Clique em "+ Novo Veículo"**
4. **Preencha:**
   - Placa (ex: ABC-1234) *
   - Marca (ex: Ford) *
   - Modelo (ex: Focus) *
   - Ano (ex: 2020)
   - Cor
   - KM atual (opcional)
5. **Clique em "Salvar"**

> **Importante:** Placa deve ser única e válida.

### Consultar Histórico

Visualize todo histórico de serviços de um cliente:

1. **Abra a ficha do cliente**
2. **Acesse aba "Histórico"**
3. **Visualize:**
   - Todas as O.S. realizadas
   - Data de início/conclusão
   - Valor total
   - Status final

**Filtrar por:**
- 📅 Período
- 📊 Status
- 💰 Valor

### Editar Cliente

1. **Na lista, clique no botão "Editar"** (ícone de lápis)
2. **Altere os dados necessários**
3. **Clique em "Salvar"**

> Alterações são imediatas no sistema.

### Excluir Cliente

1. **Na lista, clique no botão "Excluir"** (ícone de lixeira)
2. **Confirme a exclusão**

⚠️ **Atenção:**
- Clientes com O.S. ativas não podem ser excluídos
- Finalize ou cancele as O.S. antes
- Exclusão é permanente!

---

## Ordens de Serviço

A coluna vertebral do sistema. Aqui você registra todo serviço realizado.

### Criar Nova Ordem de Serviço

1. **Clique em "Ordens de Serviço"** no menu
2. **Clique em "+ Nova O.S."**

**Passo 1: Cliente e Veículo**
- Selecione cliente na lista (ou crie novo)
- Selecione veículo deste cliente
- Sistema carrega histórico do veículo

**Passo 2: Descrição**
- Descreva o problema/serviço
- Exemplos:
  - "Troca de óleo e filtro"
  - "Alinhamento e balanceamento"
  - "Troca de disco de freio dianteiro"

**Passo 3: Adicionar Serviços/Peças**

Clique em "+ Adicionar Item" para cada serviço ou peça:

| Campo | Descrição |
|-------|-----------|
| Tipo | Serviço (mão de obra) ou Produto (peça) |
| Descrição | Detalhamento |
| Quantidade | Número de unidades |
| Valor Unitário | Preço por unidade |
| Subtotal | Calculado automaticamente |

Exemplos:
```
Tipo: SERVIÇO
Descrição: Troca de óleo
Qtd: 1
Valor: R$ 80,00

Tipo: PRODUTO
Descrição: Óleo de motor (5L)
Qtd: 1
Valor: R$ 150,00

Tipo: SERVIÇO
Descrição: Troca de filtro
Qtd: 1
Valor: R$ 30,00

TOTAL: R$ 260,00
```

**Passo 4: Revisar e Salvar**
- Sistema calcula total automaticamente
- Clique em "Salvar"
- O.S. é criada com status "Orçamento"

### Status das Ordens de Serviço

Cada O.S. passa por ciclos de status:

| Status | Significa | Ação |
|--------|-----------|------|
| 🟡 **Orçamento** | Cliente não aprovou ainda | Enviar orçamento para cliente |
| 🔵 **Aprovada** | Cliente aprovou | Iniciar execução |
| 🟠 **Em Andamento** | Serviço sendo executado | Monitorar progresso |
| 🟢 **Concluída** | Serviço finalizado | Enviar fatura, aguardar entrega |
| ⚫ **Entregue** | Veículo entregue ao cliente | Fechar O.S. |
| ⚪ **Cancelada** | O.S. cancelada | N/A |

### Fluxo de Aprovação

**Cliente precisa aprovar o orçamento:**

1. **Gere um link de aprovação** (botão "Compartilhar")
2. **Envie via email/WhatsApp** para o cliente
3. **Cliente acessa link** e visualiza orçamento
4. **Cliente aprova ou solicita alterações**
5. **Sistema notifica você** quando aprovado
6. **Status muda** para "Aprovada" automaticamente

### Atualizar Status

Para avançar uma O.S. no fluxo:

1. **Abra a O.S. desejada**
2. **Clique em "Alterar Status"**
3. **Selecione novo status**
4. **Adicione observações** (opcionais)
   - Exemplo: "Serviço concluído, aguardando cliente"
5. **Clique em "Confirmar"**

### Adicionar Observações e Fotos

Durante a execução, documente o trabalho:

1. **Abra a O.S.**
2. **Seção "Observações e Fotos"**
3. **Clique em "Adicionar"**
4. **Escreva observação:**
   - Exemplo: "Diagnosticado pneu furado"
   - Sistema registra data/hora e usuário

5. **Ou faça upload de fotos:**
   - Clique em "Adicionar Foto"
   - Selecione imagem do veículo/problema
   - Sistema redimensiona automaticamente

> **Dica:** Fotos ajudam na documentação e cliente vê detalhes do trabalho.

### Finalizar Ordem de Serviço

Quando serviço está completo:

1. **Altere status para "Concluída"**
2. **Sistema solicita confirmação**
3. **Após conclusão:**
   - Status muda para "Concluída"
   - Data de conclusão é registrada
   - Se habilitado, nota fiscal é gerada
4. **Após entrega do veículo:**
   - Altere para "Entregue"
   - Solicite assinatura do cliente (se necessário)
   - O.S. encerrada

### Imprimir/Exportar Ordem

Gerar documentos da O.S.:

1. **Abra a O.S.**
2. **Clique em "Imprimir"**
3. **Escolha opção:**
   - 📄 Imprimir orçamento
   - 📄 Imprimir O.S. completa
   - 📄 Gerar PDF

4. **Ou clique em "Exportar":**
   - 📊 Exportar como PDF (para arquivo)
   - 📊 Exportar como Excel (para planilha)

---

## Controle de Estoque

Gerencie seu inventário de peças e produtos.

### Cadastrar Novo Produto/Peça

1. **Clique em "Estoque"** no menu
2. **Clique em "+ Novo Produto"**

**Preencha:**
- Código (ex: OP001) - gerado automaticamente ou manual
- Nome/Descrição (ex: "Óleo de motor 5L")
- Categoria (ex: "Óleos e fluidos")
- Unidade (UN, LT, KG, etc.)
- Estoque mínimo (5) - para alertas
- Estoque atual (0) - será atualizado
- Preço de custo (R$)
- Preço de venda (R$)
- Foto (opcional)

3. **Clique em "Salvar"**

### Dar Entrada no Estoque

Registrar compra/recebimento de peça:

1. **Localize o produto** na lista
2. **Clique em "Entrada"**
3. **Preencha:**
   - Quantidade recebida
   - Fornecedor (ex: "Distribuidora XYZ")
   - Nota fiscal (opcional)
   - Data
   - Valor unitário (do fornecedor)
4. **Clique em "Confirmar"**

> Sistema atualiza estoque automaticamente.

### Dar Saída do Estoque

Registrar uso/venda de peça:

1. **Localize o produto**
2. **Clique em "Saída"**
3. **Preencha:**
   - Quantidade (quanto saiu)
   - Motivo:
     - 📋 Venda (O.S. realizada)
     - 🔧 Uso (consumo interno)
     - ❌ Perda (danificado, roubado)
     - 🔄 Devolução (devolvido ao fornecedor)
   - O.S. relacionada (se houver)
4. **Clique em "Confirmar"**

> Estoque é reduzido automaticamente.

### Consultar Movimentações

Ver histórico completo de entrada/saída:

1. **Abra o produto**
2. **Aba "Movimentações"**
3. **Visualize:**
   - Data/hora
   - Tipo (entrada/saída)
   - Quantidade
   - Motivo
   - Saldo resultante

**Filtros:**
- 📅 Por período
- 📊 Por tipo (entrada/saída)

### Alertas de Estoque Baixo

Sistema notifica quando produto está baixo:

1. **Indicador de alerta** (🔴 vermelho)
2. **Na lista, produtos críticos aparecem no topo**
3. **Dashboard mostra "Estoque Crítico"**
4. **Notificações** (se habilitadas)

Quando estoque cai abaixo do mínimo, você é alertado para repor.

### Fazer Inventário

Conferência física periódica:

1. **Clique em "Estoque > Inventário"**
2. **Clique em "+ Novo Inventário"**
3. **Sistema gera lista** com todos os produtos
4. **Imprima a lista:**
   - Leve para o galpão
   - Conte manualmente cada peça
5. **Lance os valores reais:**
   - Produto por produto
   - Digite quantidade contada
6. **Clique em "Finalizar"**
7. **Sistema faz reconciliação:**
   - Compara contagem física vs. sistema
   - Cria movimentações para corrigir diferenças
   - Gera relatório de divergências

> **Importante:** Fazer inventário periódico (mensal/trimestral) para evitar descontrole.

---

## Módulo Financeiro

Gestão completa de receitas e despesas.

### Registrar Conta a Receber

Dinheiro que cliente deve pagar:

1. **Clique em "Financeiro > Contas a Receber"**
2. **Clique em "+ Nova Conta"**
3. **Preencha:**
   - Cliente (quem deve)
   - Descrição (ex: "O.S. #001 - Troca de óleo")
   - Valor
   - Data de vencimento
   - Forma de pagamento (esperada)
   - O.S. relacionada (se houver)
4. **Clique em "Salvar"**

**Automático:** Ao finalizar O.S., conta a receber é criada automaticamente.

### Registrar Conta a Pagar

Dinheiro que você deve pagar:

1. **Clique em "Financeiro > Contas a Pagar"**
2. **Clique em "+ Nova Conta"**
3. **Preencha:**
   - Fornecedor/Beneficiário
   - Descrição
   - Valor
   - Data de vencimento
   - Categoria:
     - 🏢 Aluguel
     - 🚗 Fornecedor
     - 💼 Salário
     - ⚡ Utilidades
     - 📱 Telefone/Internet
     - 🛠️ Manutenção
     - Outra
   - Forma de pagamento
4. **Clique em "Salvar"**

### Baixar Conta (Registrar Pagamento)

Marcar conta como paga ou recebida:

1. **Localize a conta** na listagem
2. **Clique em "Baixar"**
3. **Confirme:**
   - Data do pagamento/recebimento
   - Valor pago (pode ser parcial)
   - Forma de pagamento (realizada)
   - Juros/Descontos (se houver)
4. **Clique em "Confirmar"**

**Status resultante:**
- Se valor pago = valor total → Status: **PAGO**
- Se valor pago < valor total → Status: **PARCIAL**
- Guarde recibo para comprovação

### Fluxo de Caixa

Visualizar entrada/saída de dinheiro:

1. **Clique em "Financeiro > Fluxo de Caixa"**
2. **Selecione período** (mês, trimestre, etc.)
3. **Visualize:**
   - 📈 Entradas previstas (não pagas)
   - 📈 Entradas realizadas (pagas)
   - 📉 Saídas previstas (não pagas)
   - 📉 Saídas realizadas (pagas)
   - 💰 Saldo por período

Tabela mostra dia a dia:
```
Data        | Entradas | Saídas  | Saldo
2025-12-01  | R$ 500   | R$ 200  | R$ 300
2025-12-02  | R$   0   | R$ 100  | R$ 200
2025-12-03  | R$ 800   | R$   0  | R$ 1.000
```

> **Importante:** Planeje com base em projeções, não em valores que não recebeu ainda.

### Relatórios Financeiros

Análises gerenciais:

#### Faturamento
- Total de receitas por período
- Comparativos (mês anterior, mesmo mês no ano anterior)
- Por cliente, por serviço
- Gráfico de evolução

#### Despesas
- Total de gastos por categoria
- Ranking de maiores gastos
- Evolução mensal

#### Lucro
- Receitas - Despesas
- Margem percentual
- Tendências

#### Inadimplência
- Contas vencidas não pagas
- Cliente com mais atrasos
- Valor total em risco
- Histórico de pagamentos por cliente

### Exportar Relatórios

Gerar documentos para análise/impressão:

1. **Selecione relatório**
2. **Clique em "Exportar"**
3. **Escolha formato:**
   - 📄 PDF (para imprimir)
   - 📊 Excel (para análise em planilha)
   - 📋 CSV (para importar em outro sistema)
4. **Arquivo é baixado** automaticamente

---

## Configurações

Ajustar sistema conforme suas necessidades.

### Perfil do Usuário

Editar suas informações pessoais:

1. **Clique no avatar** (canto superior direito)
2. **Selecione "Meu Perfil"**
3. **Edite:**
   - Nome completo
   - Email
   - Telefone
   - Foto de perfil
4. **Salve alterações**

**Alterar Senha:**
1. **Clique em "Alterar Senha"**
2. **Digite senha atual**
3. **Crie nova senha** (mínimo 8 caracteres)
4. **Confirme nova senha**
5. **Clique em "Atualizar"**

### Usuários e Permissões (Admin)

Gerenciar acesso de outros usuários.

**Cadastrar Novo Usuário:**

1. **Clique em "Configurações > Usuários"**
2. **Clique em "+ Novo Usuário"**
3. **Preencha:**
   - Nome completo
   - Email
   - Setor (ex: Mecânica, Atendimento)
   - Perfil de permissão
4. **Sistema envia email** com link para criar senha
5. **Novo usuário faz login** na primeira vez

**Perfis de Permissão:**

| Perfil | Acesso | Uso |
|--------|--------|-----|
| 👑 **Admin** | Sistema inteiro | Proprietário |
| 📋 **Gerente** | Tudo exceto configurações críticas | Gerente geral |
| 🔧 **Mecânico** | O.S. e Estoque | Técnico |
| 👥 **Atendente** | Clientes e O.S. | Recepção |
| 💰 **Financeiro** | Módulo Financeiro | Administrativo |

**Editar Permissões:**
1. **Localize usuário**
2. **Clique em "Editar"**
3. **Altere perfil**
4. **Salve**

> Mudanças são efetivas imediatamente.

### Configurações da Empresa

Dados principais da oficina:

1. **Clique em "Configurações > Empresa"**
2. **Preencha/atualize:**
   - Nome da empresa
   - CNPJ
   - Logo (upload)
   - Telefone
   - Email
   - Endereço completo
   - Horário de funcionamento
   - Dados para nota fiscal (se habilitada)
3. **Clique em "Salvar"**

Essas informações aparecem em:
- Cabeçalho de documentos
- E-mails enviados
- Assinatura eletrônica

### Categorias

Organizar produtos e serviços em categorias.

**Gerenciar Categorias de Produtos:**
1. **Clique em "Configurações > Categorias"**
2. **Selecione "Produtos"**
3. **Clique em "+ Nova Categoria"**
4. **Dê um nome** (ex: "Óleos e fluidos")
5. **Clique em "Salvar"**

Depois ao cadastrar produto, selecione a categoria.

**Categorias de Despesas:**
1. **Mesmo processo, mas para "Despesas"**
2. Exemplos: Aluguel, Fornecedor, Salário, Utilidades

---

## Dicas e Boas Práticas

### Gestão de Clientes

✅ **Mantenha cadastros atualizados**
- Telefone e email corretos são essenciais
- Atualize quando cliente muda contato

✅ **Registre todas as interações**
- Mesmo conversa rápida de orçamento
- Ajuda na próxima visita

✅ **Use observações**
- "Cliente preferencial"
- "Paga com cheque"
- "Alergias do carro" (ex: barulho no motor)

✅ **Envie pesquisas de satisfação**
- Após conclusão de cada O.S.
- Feedback melhora serviço

### Ordens de Serviço

✅ **Seja detalhado na descrição**
- "Troca de óleo" é vago
- "Troca de óleo, filtro e inspeção de pastilhas de freio" é melhor

✅ **Tire fotos na entrada**
- Documento do estado inicial do veículo
- Protege contra reclamações

✅ **Mantenha cliente informado**
- Avise quando será iniciado
- Comunique se encontrar novos problemas

✅ **Revise valores antes de enviar**
- Evita discussões sobre preço
- Cliente aprova orçamento com confiança

✅ **Confirme entrega com assinatura**
- Cliente assina que recebeu veículo
- Prova de conclusão

### Controle de Estoque

✅ **Faça inventários periódicos**
- Mínimo trimestral
- Evita descontrole

✅ **Configure estoque mínimo realista**
- Nem muito alto (gasta espaço)
- Nem muito baixo (falta peça)

✅ **Organize por categorias**
- Facilita busca
- Melhora contagem

✅ **Atualize preços periodicamente**
- Negocie com fornecedores
- Reajuste valor de venda

### Gestão Financeira

✅ **Lance tudo no sistema**
- Mesmo pequenas despesas
- Visão real do negócio

✅ **Faça conciliação bancária**
- Pelo menos semanal
- Identifica erros rápido

✅ **Monitore inadimplência**
- Clientes com atraso
- Cobre na primeira cobrança

✅ **Analise relatórios mensalmente**
- Lucro vs. despesas
- Clientes mais lucrativos
- Meses sazonais (mais/menos movimento)

✅ **Planeje com base em projeções**
- Diferencie: contas vencidas vs. a vencer
- Tome decisão com dados reais

---

## FAQ

### Gestão de Clientes

**P: Posso ter dois clientes com mesmo CPF?**
A: Não, sistema impede. CPF/CNPJ deve ser único.

**P: Como excluir um cliente?**
A: Finalize ou cancele todas as O.S. antes. Depois clique em "Excluir".

**P: Posso editar dados de cliente já deletado?**
A: Não, delação é permanente. Crie novo cadastro se necessário.

### Ordens de Serviço

**P: Posso editar uma O.S. já finalizada?**
A: Não diretamente. Cancele e crie nova O.S., ou adicione observação.

**P: Como dar desconto em um serviço?**
A: Ao adicionar item, ajuste o valor unitário com desconto já aplicado.

**P: O cliente vê a O.S. em tempo real?**
A: Não. Cliente vê apenas quando você compartilha link de aprovação.

**P: Posso cancelar uma O.S.?**
A: Sim, altere status para "Cancelada". Mas registre motivo em observações.

### Estoque

**P: Produto está negativo no estoque?**
A: Possível se registrou saída sem entrada. Faça entrada corretiva.

**P: Como ajustar estoque sem criar movimentação?**
A: Na ficha do produto, edite "Estoque atual" diretamente (uso raro).

**P: Produto não aparece na lista?**
A: Verifique se marcado como "Inativo". Habilite novamente.

### Financeiro

**P: Qual a diferença entre "Previsto" e "Realizado"?**
A: Previsto = data de vencimento. Realizado = quando foi pago/recebido.

**P: Posso registrar pagamento parcial?**
A: Sim, valor pago fica menor que total. Status fica "Parcial".

**P: Como exportar dados financeiros para meu contador?**
A: Gere relatório em formato "Exportar > Excel" e compartilhe.

### Geral

**P: Posso usar sistema offline?**
A: Não, sistema é 100% cloud. Precisa de internet.

**P: Tenho limite de usuários?**
A: Depende do plano contratado. Consulte Configurações > Plano.

**P: Como fazer backup dos dados?**
A: Em Configurações > Segurança, solicite "Exportar todos os dados".

**P: Perdi acesso ao email de cadastro. Como faço?**
A: Entre em contato com suporte para recuperação.

**P: Sistema em português? E em outros idiomas?**
A: Atualmente em português brasileiro. Outros idiomas em roadmap.

---

## Suporte

### Encontrou um bug ou problema?

1. **Tente recarregar a página** (F5 ou Ctrl+R)
2. **Limpe cache do navegador** (Ctrl+Shift+Delete)
3. **Teste em outro navegador** (Chrome, Firefox, Safari, Edge)
4. **Se persistir, contate suporte:**

### Canais de Suporte

📧 **Email**  
`suporte@erpoficina.com.br`  
Resposta em até 24h

💬 **Chat**  
Disponível no canto inferior direito do sistema  
Resposta em tempo real (horário comercial)

📱 **WhatsApp**  
`+55 (XX) XXXXX-XXXX`  
Para questões urgentes

📚 **Base de Conhecimento**  
`docs.erpoficina.com.br`  
Artigos e vídeos tutoriais

### Informações ao Contactar Suporte

Para acelerar ajuda, informe:
- 🐛 Descrição do problema
- 📱 Navegador/dispositivo usado
- 📸 Screenshot se possível
- 🕐 Hora que o problema ocorreu

---

<div align="center">

**Manual do Usuário v1.0**

Última atualização: Dezembro de 2025

[← Voltar ao README](../README.md)  |  [Documentação Técnica →](TECHNICAL.md)

</div>

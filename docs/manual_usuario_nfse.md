# Guia do Usuário: Emissão de NFS-e (Serviços)

Bem-vindo ao sistema de emissão de Notas Fiscais de Serviço Eletrônicas (NFS-e). Este guia orienta você em todos os passos para emitir suas notas fiscais de forma rápida e segura.

---

## 1. Como Acessar a Emissão

A partir de qualquer Ordem de Serviço (OS) que possua serviços lançados:

1.  Abra a Ordem de Serviço.
2.  Clique no botão **Emitir Nota** (localizado no topo ou nas ações da OS).
3.  O diálogo de emissão será aberto, mostrando o resumo financeiro da OS.

---

## 2. Diferença Entre NF-e e NFS-e

No diálogo de emissão, você verá duas opções:

-   **NF-e (Produto)**: Notas referentes a peças e materiais vendidos.
-   **NFS-e (Serviço)**: Notas referentes à mão de obra e serviços prestados.

> [!NOTE]
> Clique no botão **NFS-e (Serviço)** para abrir a lista de serviços disponíveis para emissão individual.

---

## 3. Emitindo uma Nota de Serviço

Ao abrir o diálogo de serviços:

1.  Você verá uma lista com todos os serviços da OS.
2.  Cada serviço pode ser emitido individualmente.
3.  Clique em **Emitir Nota** ao lado do serviço desejado.
4.  O sistema enviará os dados para a prefeitura e atualizará o status.

---

## 4. Status da Nota

| Cor | Status | Significado |
| :--- | :--- | :--- |
| 🟢 | **Autorizada** | A nota foi aceita pela prefeitura e é válida legalmente. |
| 🔵 | **Processando** | A nota está na fila da prefeitura. Aguarde alguns segundos. |
| 🔴 | **Rejeitada** | Ocorreu um erro nos dados (ex: CEP errado). Clique no status para ver o motivo. |
| 🟠 | **Cancelada** | A nota foi invalidada após ter sido emitida. |

---

## 5. Consultando o Status

Às vezes a prefeitura demora a responder. Se a nota ficar em "Processando":

1.  Vá até a lista de notas emitidas no final do diálogo.
2.  Clique nas reticências (**...**) ao lado da nota.
3.  Selecione **Consultar NFS-e** para obter o status atualizado em tempo real.

---

## 6. Cancelando uma Nota

Se você emitiu uma nota por engano:

1.  No menu de ações (**...**) da nota, selecione **Cancelar NFS-e**.
2.  Escreva uma justificativa com no mínimo 15 caracteres.
3.  Confirme o cancelamento. A nota passará ao status de **Cancelada**.

---

## 7. Ambiente de Testes vs. Real

Fique atento ao aviso no topo do diálogo:

-   🏷️ **AMBIENTE: HOMOLOGAÇÃO**: A nota gerada **NÃO POSSUI VALOR LEGAL**. Use para testes.
-   🏷️ **AMBIENTE: PRODUÇÃO**: A nota gerada **É UM DOCUMENTO REAL**. Tenha atenção total.

> [!TIP]
> Caso queira emitir uma segunda nota para o mesmo serviço (correção), o sistema permite o botão **Re-emitir Nota** no mesmo item, gerando um novo documento legal independente.

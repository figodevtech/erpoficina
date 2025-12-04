// src/lib/pagarme-connect.ts

const URL_BASE_PAGARME = process.env.PAGARME_API_BASE!;
const CHAVE_SECRETA_PAGARME = process.env.PAGARME_SECRET_KEY!;
const SERIE_MAQUININHA_STONE = process.env.STONE_POS_SERIAL!;

if (!URL_BASE_PAGARME || !CHAVE_SECRETA_PAGARME) {
  throw new Error(
    "Variáveis de ambiente PAGARME_API_BASE ou PAGARME_SECRET_KEY não configuradas"
  );
}

/**
 * Monta o cabeçalho Authorization no formato Basic Auth
 * usando a chave secreta do Pagar.me.
 */
function obterCabecalhoAutenticacao() {
  // Basic base64("chave_secreta:")
  const token = Buffer.from(`${CHAVE_SECRETA_PAGARME}:`).toString("base64");
  return `Basic ${token}`;
}

type DadosCliente = {
  nome?: string;
  email?: string | null;
};

type ParametrosCriarPedidoPos = {
  valorEmCentavos: number;
  descricao: string;
  cliente?: DadosCliente;
  direto?: boolean; // true = Pagamento Direto, false = Listagem de Pedidos
  parcelas?: number; // apenas crédito
  tipoParcelamento?: "merchant" | "issuer";
  tipoPagamento?: "credit" | "debit" | "voucher" | "pix";
};

/**
 * Cria um pedido no Pagar.me para ser pago na maquininha (Connect Stone).
 */
export async function criarPedidoPos(
  parametros: ParametrosCriarPedidoPos
): Promise<any> {
  const {
    valorEmCentavos,
    descricao,
    cliente,
    direto = true,
    parcelas = 1,
    tipoParcelamento = "merchant",
    tipoPagamento = "credit",
  } = parametros;

  const configuracoesPagamentoPos: any = {
    visible: true,
    display_name: descricao, // texto exibido na maquininha
    print_order_receipt: false,
    devices_serial_number: [SERIE_MAQUININHA_STONE],
  };

  // Se for "Pagamento Direto", precisamos informar o payment_setup
  if (direto) {
    configuracoesPagamentoPos.payment_setup = {
      type: tipoPagamento,
      installments: parcelas,
      installment_type: tipoParcelamento,
    };
  }

  // Monta o customer sem forçar e-mail inválido
  const customer: any = {
    name: cliente?.nome || "Cliente",
  };

  // Só envia e-mail se parecer minimamente válido
  if (cliente?.email && cliente.email.includes("@")) {
    customer.email = cliente.email;
  }
  // Se você quiser sempre mandar um e-mail padrão quando não tiver:
  // else {
  //   customer.email = "cliente@teste.com.br";
  // }

  const corpoRequisicao = {
    customer,
    items: [
      {
        amount: valorEmCentavos,
        description: descricao,
        quantity: 1,
      },
    ],
    closed: false,
    poi_payment_settings: configuracoesPagamentoPos,
  };

  const resposta = await fetch(`${URL_BASE_PAGARME}/orders`, {
    method: "POST",
    headers: {
      Authorization: obterCabecalhoAutenticacao(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(corpoRequisicao),
  });

  if (!resposta.ok) {
    const textoErro = await resposta.text();
    console.error(
      "Erro ao criar pedido no Pagar.me:",
      resposta.status,
      textoErro
    );
    throw new Error(
      `Falha ao criar pedido no Pagar.me. Código HTTP: ${resposta.status}`
    );
  }

  const dados = await resposta.json();
  return dados;
}

/**
 * Fecha um pedido no Pagar.me / POS Connect.
 * Depois de fechado (closed = true), ele some da fila da maquininha.
 * Endpoint: PATCH /core/v5/orders/{order_id}/closed
 */
export async function fecharPedidoPos(orderId: string): Promise<void> {
  if (!orderId) return;

  try {
    const resposta = await fetch(
      `${URL_BASE_PAGARME}/orders/${orderId}/closed`,
      {
        method: "PATCH",
        headers: {
          Authorization: obterCabecalhoAutenticacao(),
          "Content-Type": "application/json",
        },
        // corpo vazio mesmo, a API de fechamento não exige payload
        body: JSON.stringify({}),
      }
    );

    if (!resposta.ok) {
      const textoErro = await resposta.text().catch(() => "");
      console.error(
        "Erro ao fechar pedido no Pagar.me:",
        resposta.status,
        textoErro
      );
    }
  } catch (erro) {
    console.error("Erro inesperado ao fechar pedido no Pagar.me:", erro);
  }
}

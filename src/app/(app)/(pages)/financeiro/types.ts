export enum tipo_transacao {
    RECEITA = 'RECEITA',
    DESPESA = 'DESPESA',
    DEPOSITO = 'DEPOSITO',
    SAQUE = 'SAQUE',
}

export enum categoria_transacao {
    SERVICO='SERVICO',
    PRODUTO='PRODUTO',
    TRANSPORTE_LOGISTICA='TRANSPORTE/LOGISTICA',
    COMISSAO_REPASSE='COMISSAO/REPASSE',
    TRANSFERENCIA='TRANSFERENCIA',
    ALUGUEL='ALUGUEL',
    EQUIPAMENTO_FERRAMENTA='EQUIPAMENTO/FERRAMENTA',
    OUTROS='OUTROS',
    PECA='PEÇA',
    SALARIO='SALARIO',
    IMPOSTO_TAXA='IMPOSTO/TAXA',
    UTILIDADE='UTILIDADE',
}

export enum metodo_pagamento {
    PIX = 'PIX',
    CREDITO = 'CREDITO',
    DEBITO = 'DEBITO',
    BOLETO = 'BOLETO',
    TRANSFERENCIA = 'TRANSFERENCIA',
    DINHEIRO = 'DINHEIRO',
}

export interface transacao {
    id: number;
    descricao: string;
    valor: number;
    data: Date;
    metodopagamento: metodo_pagamento;
    categoria: categoria_transacao;
    tipo: tipo_transacao;
    cliente_id?: number;
    banco_id: number;

}
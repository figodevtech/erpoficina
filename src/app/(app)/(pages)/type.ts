export interface Config {
    id: number;
    aviso_pagamento: boolean;
    checklist_obrigatorio: boolean;
    alerta_estoque_pdv: boolean;
    habilitar_emissao_nfe: boolean;
    emissao_nf_no_modulo_ordens: boolean;
    emissao_nf_no_modulo_vendas: boolean;
    emissao_nf_ordens_nao_pagas: boolean;
    emissao_nf_vendas_nao_pagas: boolean;
    habilitar_drawers: boolean;
    created_at: string;
}
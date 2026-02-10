export interface Config {
    id: number;
    aviso_pagamento: boolean;
    checklist_obrigatorio: boolean;
    alerta_estoque_pdv: boolean;
    habilitar_emissao_nfe: boolean;
    habilitar_drawers: boolean;
    created_at: string;
}
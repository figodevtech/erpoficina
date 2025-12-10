// src/lib/nfe/statusNfe.ts

export const StatusNfe = {
  RASCUNHO: 'RASCUNHO',
  AUTORIZADA: 'AUTORIZADA',
  CANCELADA: 'CANCELADA',
  REJEITADA: 'REJEITADA',
  DENEGADA: 'DENEGADA',
  ENVIADA: 'ENVIADA',
} as const;

export type StatusNfe = (typeof StatusNfe)[keyof typeof StatusNfe];

export function traduzStatusNfe(status: StatusNfe | string): string {
  switch (status) {
    case 'RASCUNHO':
      return 'Rascunho';
    case 'AUTORIZADA':
      return 'Autorizada';
    case 'CANCELADA':
      return 'Cancelada';
    case 'REJEITADA':
      return 'Rejeitada';
    case 'DENEGADA':
      return 'Denegada';
    case 'ENVIADA':
      return 'Enviada / Aguardando retorno';
    default:
      return status;
  }
}

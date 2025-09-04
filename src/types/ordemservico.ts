// types/ordemservico.ts
import type { EnumStatusOS, EnumStatusAprovacao, EnumTipoOS } from './enum';

export interface OrdemServico {
  id: number;
  clienteid: number;                 // FK -> cliente(id)
  veiculoid?: number | null;         // FK -> veiculo(id)
  tipoos: EnumTipoOS;                // USER-DEFINED
  usuariocriadorid?: string | null;  // uuid FK -> usuario(id)
  setorid?: number | null;           // FK -> setor(id)
  status?: EnumStatusOS | null;      // default 'ABERTA'
  statusaprovacao?: EnumStatusAprovacao | null; // default 'PENDENTE'
  descricao?: string | null;
  dataentrada?: string | null;       // timestamp
  datasaidaprevista?: string | null;
  datasaidareal?: string | null;
  orcamentototal?: number | null;    // numeric
  observacoes?: string | null;
  createdat?: string | null;
  updatedat?: string | null;
}

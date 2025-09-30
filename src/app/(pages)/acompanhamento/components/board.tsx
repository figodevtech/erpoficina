"use client";

import PainelAcompanhamento from "../ui/painel";

/** Container simples; se quiser, adicione aqui toggles (ex.: hoje|recentes) */
export default function BoardAcompanhamento() {
  return <PainelAcompanhamento finalizadas="recentes" horasRecentes={12} />;
}

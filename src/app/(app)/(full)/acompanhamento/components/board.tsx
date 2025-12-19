"use client";

import PainelAcompanhamento from "../ui/painel";

export default function BoardAcompanhamento() {
  return (
    <div className="min-h-screen w-full px-3 py-4 sm:px-4">
      <div className="mx-auto w-full max-w-[1800px]">
        <PainelAcompanhamento finalizadas="recentes" horasRecentes={12} />
      </div>
    </div>
  );
}

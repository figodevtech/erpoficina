"use client";

import * as React from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useListaInterpolada(
  alvo: number[],
  {
    duracao = 700,
    easing = easeOutCubic,
    dependencias,
  }: {
    duracao?: number;
    easing?: (t: number) => number;
    dependencias?: React.DependencyList | any;
  } = {}
) {
  const [valores, setValores] = React.useState<number[]>(() => alvo.map(() => 0));
  const origemRef = React.useRef<number[]>(valores);

  React.useEffect(() => {
    const origem = origemRef.current;
    const tamAlvo = alvo.length;
    const tamOrigem = origem.length;

    const origemAjustada =
      tamOrigem === tamAlvo ? origem.slice() : Array.from({ length: tamAlvo }, (_, i) => origem[i] ?? 0);

    const destino = alvo.slice();

    let raf = 0;
    const inicio = performance.now();

    const tick = () => {
      const agora = performance.now();
      const t = Math.min(1, (agora - inicio) / duracao);
      const e = easing(t);

      const atual = destino.map((v, i) => origemAjustada[i] + (v - origemAjustada[i]) * e);
      setValores(atual);

      if (t < 1) raf = requestAnimationFrame(tick);
      else origemRef.current = atual;
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(alvo), duracao, ...(Array.isArray(dependencias) ? dependencias : [dependencias])]);

  return valores;
}

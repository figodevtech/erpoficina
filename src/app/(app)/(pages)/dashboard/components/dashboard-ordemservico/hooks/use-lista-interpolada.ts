"use client";

import * as React from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

type OpcaoListaInterpolada =
  | {
      duracao?: number;
      easing?: (t: number) => number;
      dependencias?: React.DependencyList | React.DependencyList[number];
    }
  | undefined;

/**
 * Hook genérico para animar uma lista de números
 * saindo do valor anterior até o novo alvo.
 *
 * A animação roda apenas no cliente (useEffect),
 * então não impacta o SSR.
 */
export function useListaInterpolada(
  alvo: number[],
  { duracao = 700, easing = easeOutCubic, dependencias }: OpcaoListaInterpolada = {},
) {
  const [valores, setValores] = React.useState<number[]>(() =>
    Array.isArray(alvo) ? alvo.map(() => 0) : [],
  );

  // Guarda o último valor final animado para ser a "origem" na próxima animação
  const origemRef = React.useRef<number[] | null>(null);

  React.useEffect(() => {
    if (!Array.isArray(alvo) || alvo.length === 0) {
      setValores([]);
      origemRef.current = [];
      return;
    }

    const origem = origemRef.current ?? alvo.map(() => 0);

    // Se o tamanho mudou, ajusta suavemente
    const origemAjustada =
      origem.length === alvo.length
        ? origem
        : alvo.map((_, i) => origem[i] ?? origem[origem.length - 1] ?? 0);

    const inicio = performance.now();
    const destino = [...alvo];

    let animFrame: number;

    const tick = (now: number) => {
      const tBruto = (now - inicio) / duracao;
      const t = Math.min(1, Math.max(0, tBruto));
      const e = easing(t);

      const atual = destino.map(
        (v, i) => origemAjustada[i] + (v - origemAjustada[i]) * e,
      );
      setValores(atual);

      if (t < 1) {
        animFrame = window.requestAnimationFrame(tick);
      } else {
        // guarda o último quadro como nova origem
        origemRef.current = atual;
      }
    };

    animFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animFrame);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    JSON.stringify(alvo),
    duracao,
    ...(Array.isArray(dependencias)
      ? dependencias
      : dependencias != null
      ? [dependencias]
      : []),
  ]);

  return valores;
}

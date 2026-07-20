"use client";

import { useEffect, useRef } from "react";

export interface EscapeChainLayer {
  isActive: boolean;
  onEscape: () => void;
}

// Peels exactly one active layer per Escape press — the first active layer in priority order
// wins, and later layers never fire alongside it on the same press (TOR-09-YrywFkB). Layers are
// read from a ref updated every render so the keydown listener itself registers once, the same
// pattern app/graph/page.tsx already uses for resetViewRef.
export function useEscapeChain(layers: EscapeChainLayer[]): void {
  const layersRef = useRef(layers);

  // Refs must not be written during render (react-hooks/refs) — this effect keeps the ref
  // current after every commit instead, which is still synchronous with respect to the keydown
  // listener below by the time any real key event fires.
  useEffect(() => {
    layersRef.current = layers;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") {
        return;
      }
      const layer = layersRef.current.find((candidate) => candidate.isActive);
      if (!layer) {
        return;
      }
      event.preventDefault();
      layer.onEscape();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

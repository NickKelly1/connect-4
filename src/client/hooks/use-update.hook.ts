import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { useIsMounted } from "./use-is-mounted.hook";

/**
 * Use effect, after initial mount
 *
 * @param effect
 * @param deps
 */
export function useUpdate(effect: EffectCallback, deps?: DependencyList) {
  const isMounted = useIsMounted();
  useEffect(() => { if (isMounted) return effect(); }, deps);
}
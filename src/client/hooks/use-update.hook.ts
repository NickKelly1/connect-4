import { DependencyList, EffectCallback, useEffect, useRef } from "react";
import { useHasMounted } from "./use-has-mounted.hook";

/**
 * Use effect, after initial mount
 *
 * @param effect
 * @param deps
 */
export function useUpdate(effect: EffectCallback, deps?: DependencyList) {
  const hasMounted = useHasMounted();
  useEffect(() => { if (hasMounted) return effect(); }, deps);
}
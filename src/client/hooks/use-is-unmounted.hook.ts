import { useCallback, useEffect, useRef } from "react";

interface IIsUnmounted { (): boolean; }

/**
 * Has the component been mounted yet?
 */
export function useIsUnmounted(): IIsUnmounted {
  const isUnmountedRef = useRef(false);
  useEffect(() => { () => isUnmountedRef.current = true; }, []);
  const isUnmounted: IIsUnmounted = useCallback(() => isUnmountedRef.current === true, []);
  return isUnmounted;
}

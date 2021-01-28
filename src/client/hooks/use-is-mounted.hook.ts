import { useEffect, useRef } from "react";

/**
 * Has the component been mounted yet?
 */
export function useIsMounted(): boolean {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
  }, []);

  return isMounted.current;
}
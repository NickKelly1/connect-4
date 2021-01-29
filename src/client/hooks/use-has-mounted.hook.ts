import { useEffect, useRef } from "react";

/**
 * Has the component been mounted yet?
 */
export function useHasMounted(): boolean {
  const hasMounted = useRef(false);

  useEffect(() => {
    hasMounted.current = true;
  }, []);

  return hasMounted.current;
}
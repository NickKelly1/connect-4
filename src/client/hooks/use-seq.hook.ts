import { useCallback, useRef } from "react";

interface ISeq { (): number; }
export function useSeq(): ISeq {
  const seq = useRef(1);
  const next = useCallback(() => (seq.current += 1), []);
  return next;
}
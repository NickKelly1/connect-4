import { useState, useCallback, useMemo } from "react";

export interface IModalState {
  isOpen: boolean;
  doClose(): void;
  doOpen(): void;
  doToggle(): void;
  doSet(to: boolean): void;
}
export const useModalState = (initial: boolean = false): IModalState => {
  const [isOpen, setIsOpen] = useState(initial);

  const doOpen = useCallback(() => setIsOpen(true), [setIsOpen]);
  const doClose = useCallback(() => setIsOpen(false), [setIsOpen]);
  const doToggle = useCallback(() => setIsOpen((prev) => !prev), [setIsOpen]);
  const doSet = useCallback((to: boolean) => setIsOpen(to), [setIsOpen]);

  const result = useMemo<IModalState>(
    () => ({ isOpen, doClose, doOpen, doSet, doToggle, }),
    [isOpen, doClose, doOpen, doSet, doToggle,],
  );

  return result;
}
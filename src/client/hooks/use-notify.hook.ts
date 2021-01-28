import { useCallback } from 'react';
import { useToast, toast, ToastOptions, ToastContent } from 'react-toastify';

export interface INotifcation {
  content: ToastContent,
  options: ToastOptions,
}

export interface INotify {
  (notification: INotifcation): void;
}

export function useNotify(): INotify {
  const notify: INotify = useCallback((notification: INotifcation) => {
    const { content, options, } = notification;
    toast(content, options);
  }, []);
  return notify;
}
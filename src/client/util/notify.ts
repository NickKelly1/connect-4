import { ToastContent, ToastOptions } from 'react-toastify';
import { INotifcation } from "../hooks/use-notify.hook";

export const Notify = {
  success(content: ToastContent): INotifcation {
    const options: ToastOptions = {
      type: 'success',
    };
    const notification: INotifcation = { content, options };
    return notification;
  },
  warn(content: ToastContent): INotifcation {
    const options: ToastOptions = {
      type: 'warning',
    };
    const notification: INotifcation = { content, options };
    return notification;
  },
  error(content: ToastContent): INotifcation {
    const options: ToastOptions = {
      type: 'error',
    };
    const notification: INotifcation = { content, options };
    return notification;
  },
  // warn(content: SnackbarMessage): INotifcation {
  //   const notification: INotifcation = {
  //     message: content,
  //     variant: 'warning',
  //   };
  //   return notification;
  // },
  // error(message: SnackbarMessage): INotifcation {
  //   const notification: INotifcation = {
  //     message,
  //     variant: 'error',
  //   };
  //   return notification;
  // },
};

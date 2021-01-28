import React from 'react';
import { BROADCAST_TYPE } from '../../../common/enum/broadcast-type.enum';
import { useBroadcast } from '../../contexts/ws/ws.context';
import { useNotify } from '../../hooks/use-notify.hook';
import { Notify } from '../../util/notify';

interface IErrorToasterProps {
  children: React.ReactNode;
}

export function ErrorToaster(props: IErrorToasterProps): JSX.Element {
  const { children } = props;
  const notify = useNotify();

  useBroadcast((broadcast) => {
    if (broadcast.t !== BROADCAST_TYPE.ERROR) return;
    notify(Notify.error(broadcast.p.message));
  }, [notify]);

  return <>{children}</>;
}
import './ws.context.scss';
import React, { createContext, useEffect, useState, Context, DependencyList, useContext } from 'react';
import SocketIOClient, { io } from 'socket.io-client';
import { IMessage } from '../../../common/interface/message.interface';
import { IBroadcast } from '../../../common/interface/broadcast.interface';
import { BROADCAST_TYPE } from '../../../common/enum/broadcast-type.enum';
import { MESSAGE_TYPE } from '../../../common/enum/message-type.enum';
import { Util } from '../../../common/fn/util.fn';
import { nanoid } from 'nanoid';
import faker from 'faker';
import { IHandshakeQuery } from '../../../common/interface/handshake-query.interface';
import { logger } from '../../../common/fn/logger.fn';

let user_id: string;
let user_name: string;
if (typeof localStorage) {
  const _ls_user_id = localStorage.getItem('user_id');
  if (_ls_user_id) { user_id = _ls_user_id; }
  else {
    user_id = nanoid();
    localStorage.setItem('user_id', user_id);
  }

  const _ls_user_name = localStorage.getItem('user_name');
  if (_ls_user_name) { user_name = _ls_user_name; }
  else {
    user_name = faker.name.firstName();
    localStorage.setItem('user_name', user_name);
  }
} else {
  // one-time id
  user_id = nanoid();
  user_name = faker.name.firstName();
}

const handshakeQuery: IHandshakeQuery = {
  user_id,
  user_name,
};

export const _socket = io({
  autoConnect: false,
  query: handshakeQuery,
});

// patch send...
const _send = _socket.send;
_socket.send = function(this: SocketIOClient.Socket, message: IMessage, ...rest) {
  if (typeof message === 'object' && message != null && message.t != null) {
    logger.info(`[${_socket.id}] sending: ${MESSAGE_TYPE[message.t]}`);
  } else {
    logger.info(`[${_socket.id}] sending (unknown): ${Util.pretty(message)}`);
  }
  return _send.call(this, message, ...rest);
}

export interface IWsCtx {
  socket: SocketIOClient.Socket;
  connected: boolean;
}

export const WsCtx: Context<IWsCtx> = createContext<IWsCtx>(null as unknown as IWsCtx);

export function useBroadcast(handler: (broadcast: IBroadcast) => void, deps: DependencyList): void {
  const { socket } = useContext(WsCtx);
  useEffect(() => {
    socket.on('message', handler);
    return () => void socket.off('message', handler);
  }, deps);
}

interface IWsCtxProviderProps {
  //
}

export function WsCtxProvider(props: React.PropsWithChildren<IWsCtxProviderProps>) {
  const { children, } = props;

  const [ctx, setCtx] = useState<IWsCtx>({
    socket: _socket,
    connected: _socket.connected,
  });

  // synchronise conected status...
  useEffect(() => {
    let onConnect: Function
    _socket.on('connect', (onConnect = () => {
      console.log('on::connect', _socket.connected);
      setCtx((prev) => ({ ...prev, connected: _socket.connected, }));
    }));
    let onDisconnected: Function;
    _socket.on('disconnected', (onDisconnected = () => {
      console.log('on::disconnected');
      setCtx((prev) => ({ ...prev, connected: _socket.connected, }));
    }));
    let onMessage: Function;
    _socket.on('message', (onMessage = (broadcast: IBroadcast) => {
      if (broadcast && broadcast.t != null) {
        console.log(`[${_socket.id}] receiving: ${BROADCAST_TYPE[broadcast.t]}`)
      } else {
        console.log(`[${_socket.id}] receiving (unknown): ${Util.pretty(broadcast)}`)
      }
    }));
    return () => {
      _socket.off('connect', onConnect);
      _socket.off('disconnected', onDisconnected);
      _socket.off('message', onMessage);
    }
  }, [])

  // connect on load...
  useEffect(() => void _socket.connect(), []);

  return (
    <WsCtx.Provider value={ctx}>
      {children}
    </WsCtx.Provider>
  );
}
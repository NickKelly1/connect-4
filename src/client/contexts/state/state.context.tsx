export {}
// import React, { createContext, useEffect, useState, Context, DependencyList, useContext, useCallback } from 'react';
// import SocketIOClient, { io } from 'socket.io-client';
// import { IMessage } from '../../../common/interface/message.interface';
// import { IBroadcast } from '../../../common/interface/broadcast.interface';
// import { BROADCAST_TYPE } from '../../../common/enum/broadcast-type.enum';
// import { IGameDto } from '../../../common/interface/game-dto.interface';
// import { useBroadcast, WsCtx } from '../ws/ws.context';
// import { IGameId } from '../../../common/interface/game-id.interface';
// import { IMatchDto } from '../../../common/interface/match-dto.interface';
// import * as immer from 'immer';
// import { logger } from '../../../common/fn/logger.fn';
// import { Util } from '../../../common/fn/util.fn';

// export interface IStateCtx {
//   matchIds: IGameId[];
//   matchesById: Record<IGameId, IMatchDto>;
// }

// export const StateCtx: Context<IStateCtx> = createContext<IStateCtx>(null as unknown as IStateCtx);

// interface IStateCtxProviderProps {
//   children: React.ReactChild;
// }

// const initial: IStateCtx = {
//   matchIds: [],
//   matchesById: {},
// };

// export function StateCtxProvider(props: IStateCtxProviderProps) {
//   const { children, } = props;
//   const { socket } = useContext(WsCtx);
//   const [ctx, setCtx] = useState<IStateCtx>(initial);

//   const handleBroadcast = useCallback((state: IStateCtx, broadcast: IBroadcast) => {
//     switch (broadcast.t) {
//       case BROADCAST_TYPE.ERROR: {
//         // ignore...
//         break;
//       }
//       case BROADCAST_TYPE.GAME_FINISHED: {
//         // ignore...
//         if (!state.matchesById[broadcast.p.match.id]) break;
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         break;
//       }
//       case BROADCAST_TYPE.GAME_STARTED: {
//         // ignore...
//         if (!state.matchesById[broadcast.p.match.id]) break;
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         break;
//       }
//       case BROADCAST_TYPE.GAME_UPDATED: {
//         // ignore...
//         if (!state.matchesById[broadcast.p.match.id]) break;
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         break;
//       }
//       case BROADCAST_TYPE.JOINED_GAME: {
//         // join game
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         state.matchIds.push(broadcast.p.match.id);
//         break;
//       }
//       case BROADCAST_TYPE.PLAYER_ONE_TURN: {
//         // ignore...
//         if (!state.matchesById[broadcast.p.match.id]) break;
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         break;
//       }
//       case BROADCAST_TYPE.PLAYER_TWO_TURN: {
//         // ignore...
//         if (!state.matchesById[broadcast.p.match.id]) break;
//         state.matchesById[broadcast.p.match.id] = broadcast.p.match;
//         break;
//       }
//       default: {
//         logger.warn(`Unhandled broadcast ${Util.pretty(broadcast)}`);
//       }
//     }
//   }, []);


//   useBroadcast((broadcast) => {
//     setCtx((state) => immer.produce(state, draft => handleBroadcast(draft, broadcast)));
//   }, [handleBroadcast]);

//   // game
//   return (
//     <StateCtx.Provider value={ctx}>
//       {children}
//     </StateCtx.Provider>
//   );
// }
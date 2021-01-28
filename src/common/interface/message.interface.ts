import { BROADCAST_TYPE } from "../enum/broadcast-type.enum";
import { MESSAGE_TYPE } from "../enum/message-type.enum";
import { IGameDto } from "./game-dto.interface";
import { IGameId } from "./game-id.interface";

export interface IMessagePlace { t: MESSAGE_TYPE.PLACE, p: { game_id: IGameId; col: number; }; };
export interface IMessageCriticalError { t: MESSAGE_TYPE.CRITICAL_ERROR, p: { error: unknown; errorInfo: unknown; }; };
export interface IMessageJoinGame { t: MESSAGE_TYPE.JOIN_GAME, p: { game_id: IGameId; } };
export interface IMessageStartGame { t: MESSAGE_TYPE.START_GAME, p: { game_id: IGameId; } };

export type IMessage =
  | IMessagePlace
  | IMessageCriticalError
  | IMessageJoinGame
  | IMessageStartGame
;

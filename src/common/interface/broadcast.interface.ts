import { BROADCAST_TYPE } from "../enum/broadcast-type.enum";
import { IGameDto } from "./game-dto.interface";
import { IMatchDto } from "./match-dto.interface";

export interface IBroadcastError { t: BROADCAST_TYPE.ERROR, p: { message: string } };
export interface IBroadcastGameFinished { t: BROADCAST_TYPE.GAME_FINISHED, p: { match: IMatchDto; } };
export interface IBroadcastGameStarted { t: BROADCAST_TYPE.GAME_STARTED, p: { match: IMatchDto; } };
export interface IBroadcastGameUpdated { t: BROADCAST_TYPE.GAME_UPDATED, p: { match: IMatchDto; } };
export interface IBroadcastPlayerOneTurn { t: BROADCAST_TYPE.PLAYER_ONE_TURN, p: { match: IMatchDto; } };
export interface IBroadcastPlayerTwoTurn { t: BROADCAST_TYPE.PLAYER_TWO_TURN, p: { match: IMatchDto; } };
export interface IBroadcastJoinedGame { t: BROADCAST_TYPE.JOINED_GAME, p: { match: IMatchDto; } };

export type IBroadcast =
  | IBroadcastError
  | IBroadcastGameFinished
  | IBroadcastGameStarted
  | IBroadcastGameUpdated
  | IBroadcastPlayerOneTurn
  | IBroadcastPlayerTwoTurn
  | IBroadcastJoinedGame
;

import { GAME_STATE } from "../enum/game-state.enum";
import { PLAYER } from "../enum/player.enum";
import { IBoard } from "./board.interface";
import { IGameId } from "./game-id.interface";
import { IUserId } from "./user.interface";

export interface IGame {
  id: IGameId;
  state: GAME_STATE;
  board: IBoard;
  player_one_id: null | IUserId;
  player_two_id: null | IUserId;
  player_one_socket_ids: string[];
  player_two_socket_ids: string[];
  winner: null | PLAYER;
  observer_ids: IUserId[]
} 
import { IUserDto } from './user-dto.interface';
import { GAME_STATE } from '../enum/game-state.enum';
import { IBoardDto } from './board-dto.interface';
import { IGameId } from './game-id.interface';
import { PLAYER_STATUS } from '../enum/player-status.enum';

export interface IGameDto {
  id: IGameId;
  player_one: null | string;
  player_one_status: PLAYER_STATUS;
  player_two: null | string;
  player_two_status: PLAYER_STATUS;
  observers: string[]
  state: GAME_STATE;
  board: IBoardDto;
} 
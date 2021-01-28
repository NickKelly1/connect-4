import { IUserDto } from './user-dto.interface';
import { GAME_STATE } from '../enum/game-state.enum';
import { IBoardDto } from './board-dto.interface';
import { IGameId } from './game-id.interface';
import { IGameDto } from './game-dto.interface';
import { ICan } from './can.interface';
import { PLAYER } from '../enum/player.enum';

export interface IMatchDto {
  id: IGameId;
  game: IGameDto;
  can: ICan;
  you: null | PLAYER;
} 
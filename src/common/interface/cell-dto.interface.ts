import { PLAYER } from '../enum/player.enum';
import { ICoordinateDto } from './coordinate-dto.interface';

export interface ICellDto {
  p: null | PLAYER;
  c: ICoordinateDto;
  i: number;
} ;
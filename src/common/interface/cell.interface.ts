import { PLAYER } from '../enum/player.enum';
import { ICoordinate } from './coordinate.interface';

export interface ICell {
  p: null | PLAYER;
  c: ICoordinate;
  i: number;
} ;
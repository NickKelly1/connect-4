import { IGame } from './game.interface';

export interface IData {
  gamesById: Record<string, IGame>;
  gameIds: string[];
  version: number;
}
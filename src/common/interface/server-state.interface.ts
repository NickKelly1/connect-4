import { IGame } from './game.interface';
import { IUser } from './user.interface';

export interface IServerState {
  connections: number;
  version: number;

  usersById: Record<string, IUser>;
  userIds: string[];

  gamesById: Record<string, IGame>;
  gameIds: string[];
}
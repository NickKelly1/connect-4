import SocketIO from 'socket.io';
import { IGame } from '../common/interface/game.interface';
import { IServerState } from '../common/interface/server-state.interface';
import { Game } from './game.fn';
import { Ws } from './ws.fn';

export const GamePolicy = {
  /**
   * Can the user start the game?
   *
   * @param socket
   * @param state
   */
  canStart(socket: SocketIO.Socket, state: IServerState, game_id: string): boolean {
    // get game
    const game = Game.byId(state, game_id);

    // is a player
    if (Ws.playerNumber(socket, game) == null) return false;

    // game is startable
    if (!Game.isStartable(game)) return false;

    // pass
    return true;
  },

  /**
   * Can the user start the game?
   *
   * @param socket
   * @param game
   */
  canPlace(socket: SocketIO.Socket, state: IServerState, game_id: string): boolean {
    // get game
    const game = Game.byId(state, game_id);

    // get player
    const player = Ws.playerNumber(socket, game);

    // is a player
    if (player == null) return false;

    // player has turn
    if (!Game.hasTurn(game, player)) return false;

    // pass
    return true;
  },
}
import SocketIO from 'socket.io';
import { PLAYER } from '../common/enum/player.enum';
import { logger } from '../common/fn/logger.fn';
import { IBroadcast } from '../common/interface/broadcast.interface';
import { ICan } from '../common/interface/can.interface';
import { IGame } from '../common/interface/game.interface';
import { IHandshakeQuery } from '../common/interface/handshake-query.interface';
import { ILogger } from '../common/interface/logger.interface';
import { IMatchDto } from '../common/interface/match-dto.interface';
import { IMessage } from '../common/interface/message.interface';
import { IServerState } from '../common/interface/server-state.interface';
import { Broadcast } from './broadcast';
import { Game } from './game.fn';
import { GamePolicy } from './game.policy';

const SocketLoggerCache: WeakMap<SocketIO.Socket, ILogger> = new WeakMap();

export const Ws = {
  /**
   * Get a IMatchDTO
   *
   * @param socket
   * @param state
   * @param game
   */
  matchDto(socket: SocketIO.Socket, state: IServerState, game_id: string): IMatchDto {
    const game = Game.byId(state, game_id);
    const can = Ws.can(socket, state, game.id);
    const player = Ws.playerNumber(socket, game);
    const gameDto = Game.dto(state, game_id);
    const dto: IMatchDto = { can, id: game.id, you: player, game: gameDto, };
    return dto;
  },

  /**
   * Send an individualised broadcast to each socket in the room
   *
   * @param room
   * @param fn
   */
  array(room: SocketIO.Server): SocketIO.Socket[] {
    return Array.from(room.sockets.sockets.values());
  },

  /**
   * Broadcast a message to every socket in the room
   *
   * @param room
   * @param fn
   * @param IBroadcast
   */
  sendEach(room: SocketIO.Server, fn: (socket: SocketIO.Socket) => IBroadcast): void {
    this.array(room).forEach(socket => socket.send(fn(socket)));
  },

  /**
   * Broadcast to the room that the game has been updated
   *
   * @param room
   * @param fn
   */
  broadcastGameUpdate(room: SocketIO.Server, state: IServerState, game_id: string) {
    Ws.sendEach(room, socket => Broadcast.gameUpdated(Ws.matchDto(socket, state, game_id)));
  },

  /**
   * Get the handshake query of a socket
   *
   * @param socket
   */
  handshakeQuery(socket: SocketIO.Socket): IHandshakeQuery {
    return socket.handshake.query as IHandshakeQuery;
  },

  /**
   * What can the socket do?
   *
   * @param socket
   * @param state
   * @param game_id
   */
  can(socket: SocketIO.Socket, state: IServerState, game_id: string): ICan {
    return {
      startGame: GamePolicy.canStart(socket, state, game_id),
      place: GamePolicy.canPlace(socket, state, game_id),
    };
  },


  /**
   * Is the Socket PlayerOne?
   *
   * @param socket
   * @param game
   */
  isPlayerOne(socket: SocketIO.Socket, game: IGame): boolean {
    return game.player_one_id === Ws.handshakeQuery(socket).user_id;
  },

  /**
   * Is the Socket PlayerTwo?
   *
   * @param socket
   * @param game
   */
  isPlayerTwo(socket: SocketIO.Socket, game: IGame): boolean {
    return game.player_two_id === Ws.handshakeQuery(socket).user_id;
  },

  /**
   * Get the Player number of the Socket
   *
   * @param socket
   * @param game
   */
  playerNumber(socket: SocketIO.Socket, game: IGame): PLAYER | null {
    if (Ws.isPlayerOne(socket, game)) return PLAYER.ONE;
    if (Ws.isPlayerTwo(socket, game)) return PLAYER.TWO;
    return null;
  },

  /**
   * Get a logger for the socket
   *
   * @param socket
   */
  log(socket: SocketIO.Socket): ILogger {
    // retrieve from cache
    let _logger = SocketLoggerCache.get(socket);
    if (_logger) return _logger;
    // create & cache
    _logger = {
      warn(message: string) {
        const query = socket.handshake.query as IHandshakeQuery;
        const { user_id, user_name, } = query;
        logger.warn(`[socket::${socket.id}::${user_id}::${user_name}] ${message}`);
      },
      debug(message: string) {
        const query = socket.handshake.query as IHandshakeQuery;
        const { user_id, user_name, } = query;
        logger.debug(`[socket::${socket.id}::${user_id}::${user_name}] ${message}`);
      },
      error(message: string) {
        const query = socket.handshake.query as IHandshakeQuery;
        const { user_id, user_name, } = query;
        logger.error(`[socket::${socket.id}::${user_id}::${user_name}] ${message}`);
      },
      info(message: string) {
        const query = socket.handshake.query as IHandshakeQuery;
        const { user_id, user_name, } = query;
        logger.info(`[socket::${socket.id}::${user_id}::${user_name}] ${message}`);
      },
    };
    SocketLoggerCache.set(socket, _logger);
    return _logger;
  },
}

import SocketIO from 'socket.io';
import { COMPASS } from '../common/enum/compass.enum';
import { GAME_STATE } from '../common/enum/game-state.enum';
import { MESSAGE_TYPE } from '../common/enum/message-type.enum';
import { PLAYER } from '../common/enum/player.enum';
import { Board } from '../common/fn/board.fn';
import { Game } from './game.fn';
import { User } from '../common/fn/user.fn';
import { Util } from '../common/fn/util.fn';
import { IHandshakeQuery } from '../common/interface/handshake-query.interface';
import { IMessage } from '../common/interface/message.interface';
import { IObservable } from '../common/interface/observable.interface';
import { IServerState } from '../common/interface/server-state.interface';
import { Broadcast } from './broadcast';
import { Ws } from './ws.fn';
import { GamePolicy } from './game.policy';

export function wss(io: SocketIO.Server, store: IObservable<IServerState>): SocketIO.Server {
  io.use((socket, next) => {
    const query = socket.handshake.query as IHandshakeQuery;
    if (!(typeof query.user_id === 'string')) {
      // fail
      next(new Error('user_id is required'));
    }
    else if (!(typeof query.user_name === 'string')) {
      // fail
      next(new Error('user_name is required'));
    }
    else {
      // success
      next();
    }
  });

  io.on('connection', handleConnection);

  /**
   * @param {SocketIO.Socket} socket
   */
  function handleConnection(socket: SocketIO.Socket): void {
    store.set((state) => { state.connections += 1 });
    Ws.log(socket).info(`connection... (${store.value().connections})`);
    socket.on('disconnect', handleDisconnect(socket));

    socket.on('ping', () => {
      Ws.log(socket).info(`on::ping...`);
      socket.emit('pong');
    });
    socket.on('pong', () => {
      Ws.log(socket).info('on::pong');
    });

    // join the server...
    const { user_id, user_name, }: IHandshakeQuery = Ws.handshakeQuery(socket);

    store.set((state) => {
      // connected in another tab already (or were previously connected)?
      if (state.usersById[user_id]) {
        state.usersById[user_id].name = user_name;
        state.usersById[user_id].connections += 1;
      }

      // new connection?
      else {
        state.usersById[user_id] = {
          connections: 1,
          id: user_id,
          name: user_name,
        }
      }
    });

    socket.on('message', Util.onError(handleMessage(socket)).ignore((error, message) => {
      Ws.log(socket).error([
        `Errored handling message:`,
        `message:${Util.pretty(message)}`,
        `error: ${Util.pretty(Util.errorToJson(error as Error))}`,
      ].join('\n'));
    }));
  }


  /**
   * Handle a Socket message
   *
   * @param socket
   */
  function handleMessage(socket: SocketIO.Socket) {
    /**
     * @param {unknown} message
     */
    return function doHandleMessage(message: IMessage) {
      Ws.log(socket).info(`Handling message: ${message && message.t}`);

      // check message validity
      if (!message || message.t == null) {
        const msg = `Unknown message: ${Util.pretty(message)}`;
        Ws.log(socket).warn(msg);
        socket.send(Broadcast.error(msg));
        return;
      }

      // handle message
      switch (message.t) {
        /**
         * Handle CRITICAL_REROR
         */
        case MESSAGE_TYPE.CRITICAL_ERROR: {
          const msg = `Critical client error: ${Util.pretty(message.p)}`;
          Ws.log(socket).error(msg);
          break;
        }

        /**
         * Handle JOIN_GAME
         */
        case MESSAGE_TYPE.JOIN_GAME: {
          const { game_id } = message.p;
          { // validate constraints

            // game exists
            if (!Game.exists(store.value(), game_id)) {
              const msg = `Cannot join game ${game_id}: not found`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              break;
            }
          }

          Ws.log(socket).info(`[${MESSAGE_TYPE[message.t]}] joining game ${game_id}`);

          // join
          store.set((state) => {
            const { user_id } = Ws.handshakeQuery(socket);
            const game = state.gamesById[game_id];

            // join as player one
            if (!game.player_one_id) {
              game.player_one_id = user_id;
              game.player_one_socket_ids.push(socket.id);
            }

            // join as player two
            else if (!game.player_two_id) {
              game.player_two_id = user_id;
              game.player_two_socket_ids.push(socket.id);
            }

            // join as observer
            else { game.observer_ids.push(user_id); }
          });

          const room = Game.room(game_id);
          socket.join(room);
          // notify client
          socket.send(Broadcast.joinedGame(Ws.matchDto(socket, store.value(), game_id)));
          // notify room
          Ws.broadcastGameUpdate(io.to(room), store.value(), game_id);
          break;
        }

        /**
         * Handle START_GAME
         */
        case MESSAGE_TYPE.START_GAME: {
          const { game_id } = message.p;

          { // validate constraints
            const _game = store.value().gamesById[game_id];

            // game exists
            if (!_game) {
              const msg = `Cannot start game ${game_id}: not found`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              return;
            }

            // is in game
            const player = Ws.playerNumber(socket, _game);
            if (!player) {
              const msg = `Cannot start game ${game_id}: you are not in this game`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              break;
            }

            // can start game
            if (!GamePolicy.canStart(socket, store.value(), game_id)) {
              const msg = `You cannot start game ${game_id}`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              break;
            }
          }

          Ws.log(socket).info(`[${MESSAGE_TYPE[message.t]}] starting game ${game_id}...`);
          // start game
          store.set(state => { state.gamesById[game_id].state = GAME_STATE.PLAYER_ONE_TURN; });

          const room = Game.room(game_id);
          // notify game started
          Ws.sendEach(io.to(room), (socket) => Broadcast.gameStarted(Ws.matchDto(socket, store.value(), game_id)));
          // notify game updated
          Ws.broadcastGameUpdate(io.to(room), store.value(), game_id);
          break;
        }

        /**
         * Handle PLACE
         */
        case MESSAGE_TYPE.PLACE: {
          const { game_id, col, } = message.p;
          let player: PLAYER;

          { // validate constraints
            // game exists
            if (!Game.exists(store.value(), game_id)) {
              const msg = `Cannot start game ${game_id}: not found`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              return;
            }

            // is in game
            const _player = Ws.playerNumber(socket, Game.byId(store.value(), game_id));
            if (_player == null) {
              const msg = `Cannot start game ${game_id}: you are not in this game`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              return;
            }
            player = _player;

            // can place
            if (!GamePolicy.canPlace(socket, store.value(), game_id)) {
              const msg = `You cannot place a piece right now`;
              Ws.log(socket).warn(msg);
              socket.send(Broadcast.error(msg));
              return;
            }
          }

          // target colunm
          const targetColumn = Board.slice(Game.byId(store.value(), game_id).board, col, COMPASS.NORTH);
          // find first empty spot (from the bottom up-)
          const emptyCell = targetColumn.reverse().find(cell => cell.p === null);
          // no empty cell found
          if (!emptyCell) {
            // error - no empty spots
            const msg = `Cannot place in column ${message.p.col}`;
            Ws.log(socket).warn(msg);
            socket.send(Broadcast.error(msg));
            return;
          }

          // place the piece
          store.set((state) => { state.gamesById[game_id].board.cells[emptyCell.i].p = player; });
          // check for victory
          const victories = Board.findVictoriesAround(Game.byId(store.value(), game_id).board, emptyCell.i);

          // handle win
          Ws.log(socket).info(`Victories: ${Util.pretty(victories)}`);
          if (victories.length) {
            // won!
            store.set((state) => {
              state.gamesById[game_id].state = GAME_STATE.FINISHED;
              state.gamesById[game_id].winner = player;
            });
            Ws.broadcastGameUpdate(io.to(Game.room(game_id)), store.value(), game_id);
            break;
          }

          // handle next players turn
          store.set((state) => {
            if (state.gamesById[game_id].state === GAME_STATE.PLAYER_ONE_TURN) {
              // switch to player two
              state.gamesById[game_id].state = GAME_STATE.PLAYER_TWO_TURN;
            }
            else if (state.gamesById[game_id].state === GAME_STATE.PLAYER_TWO_TURN) {
              // switch to player one
              state.gamesById[game_id].state = GAME_STATE.PLAYER_ONE_TURN;
            }
          });

          // notify clients
          Ws.broadcastGameUpdate(io.to(Game.room(game_id)), store.value(), game_id);
          break;
        }
        default: {
          socket.send(Broadcast.error(`Unhandled message: ${String(Util.pretty(message))}`));
          Ws.log(socket).warn(`Unhandled message: ${message}`);
        }
      }
    }
  }


  /**
   * Handle a Socket disconnection event
   *
   * @param socket
   */
  function handleDisconnect(socket: SocketIO.Socket) {
    return function doHandleDisconnect() {
      Ws.log(socket).info(`disconnect... (${store.value().connections})`);

      {
        const _state = store.value();
        const userIds = _state.userIds;
        const usersById = _state.usersById;
        const disconnectingUserId = Ws.handshakeQuery(socket).user_id;
        const disconnectingUser = User.byId(_state, disconnectingUserId);
        const disconnectingSocketId = socket.id;
        const updatedGameIds: Set<string> = new Set();
        store.set(state => {
          state.connections -= 1;
          const user = state.usersById[disconnectingUserId];
          user.connections -= 1;
          // ? fully disconnected
          const noConnections = user.connections <= 0;
          const games = state.gameIds.map(Util.obj(state.gamesById).item).map(Util.assertDefined);
          // remove the sockets id from games that the user is/was in...
          games.forEach(game => {
            if (game.player_one_id === disconnectingUserId) {
              // disconnect player 1 socket_id
              const _len = game.player_one_socket_ids.length;
              game.player_one_socket_ids = Util.filterOut(game.player_one_socket_ids, disconnectingSocketId);
              if (_len !== game.player_one_socket_ids.length) {
                updatedGameIds.add(game.id);
              }
            }
            if (game.player_two_id === disconnectingUserId) {
              // disconnect player 2 socket_id
              const _len = game.player_two_socket_ids.length;
              game.player_two_socket_ids = Util.filterOut(game.player_two_socket_ids, disconnectingSocketId);
              if (_len !== game.player_two_socket_ids.length) {
                updatedGameIds.add(game.id);
              }
            }
            if (noConnections) {
              // disconnect from observer slots
              const _len = game.player_two_socket_ids.length;
              game.observer_ids = Util.filterOut(game.observer_ids, disconnectingUserId);
              if (_len !== game.observer_ids.length) {
                updatedGameIds.add(game.id);
              }
            }
          });
        });

        updatedGameIds.forEach(game_id => {
          // notify every updated room
          Ws.broadcastGameUpdate(io.to(Game.room(game_id)), store.value(), game_id);
        });
      }
    }
  }

  return io;
}
import SocketIO from 'socket.io';
import { GAME_STATE } from '../common/enum/game-state.enum';
import { IGame } from '../common/interface/game.interface';
import { Board } from '../common/fn/board.fn';
import { IGameDto } from '../common/interface/game-dto.interface';
import { IServerState } from '../common/interface/server-state.interface';
import { PLAYER } from '../common/enum/player.enum';
import { Util } from '../common/fn/util.fn';
import { IMatchDto } from '../common/interface/match-dto.interface';
import { Ws } from './ws.fn';
import { nanoid } from 'nanoid';
import { PLAYER_STATUS } from '../common/enum/player-status.enum';

const GameDtoCache = new WeakMap<IGame, IGameDto>();

export const Game = {
  /**
   * Create a Game
   */
  create(): IGame {
    const game_id = nanoid();
    const game: IGame = {
      id: game_id,
      board: {
        winning_length: 4,
        cells: Array.from({ length: 7 * 7 }, (_, i) => ({
          p: null,
          i,
          c: Board.coordinate({ cols: 7, rows: 7, }, i),
        })),
        cols: 7,
        rows: 7,
      },
      state: GAME_STATE.NOT_STARTED,
      player_one_id: null,
      player_two_id: null,
      player_one_socket_ids: [],
      player_two_socket_ids: [],
      winner: null,
      observer_ids: [],
    };

    return game;
  },



  /**
   * Transform the Game to a GameDto
   *
   * @param game
   */
  dto(state: IServerState, game_id: string): IGameDto {
    // memoise the game dto so it doesn't have to be re-calculated frequently...
    const game = Game.byId(state, game_id);
    const _dto = GameDtoCache.get(game);
    if (_dto) return _dto;

    const userOne = Util.obj(state.usersById).item(game.player_one_id);
    const userTwo = Util.obj(state.usersById).item(game.player_two_id);

    // get player one status
    let player_one_status: PLAYER_STATUS;
    if (!userOne) player_one_status = PLAYER_STATUS.NOT_JOINED;
    else if (userOne.connections <= 0) player_one_status = PLAYER_STATUS.DISCONNECTED;
    else if (game.player_one_socket_ids.length <= 0) player_one_status = PLAYER_STATUS.ACTIVE;
    else player_one_status = PLAYER_STATUS.ACTIVE;

    // get player two status
    let player_two_status: PLAYER_STATUS;
    if (!userTwo) player_two_status = PLAYER_STATUS.NOT_JOINED;
    else if (userTwo.connections <= 0) player_two_status = PLAYER_STATUS.DISCONNECTED;
    else if (game.player_one_socket_ids.length <= 0) player_two_status = PLAYER_STATUS.ACTIVE;
    else player_two_status = PLAYER_STATUS.ACTIVE;

    //= player_one == null?  game.player_one_socket_ids ? 
    const observers: string[] = game
      .observer_ids
      .map(Util.obj(state.usersById).item)
      .filter(Util.isDefined)
      .map(user => user.name);

    const dto: IGameDto = {
      id: game.id,
      player_one: userOne?.name ?? null,
      player_two: userTwo?.name ?? null,
      player_one_status,
      player_two_status,
      board: Board.dto(game.board),
      state: game.state,
      observers,
    };

    GameDtoCache.set(game, dto);

    return dto;
  },


  /**
   * Room name for a game
   *
   * @param game_id
   */
  room(game_id: string): string {
    return `game-${game_id}`;
  },


  /**
   * Does the game exist?
   *
   * @param state
   * @param game_id
   */
  exists(state: IServerState, game_id: string): boolean {
    // does the game exist?
    return !!state.gamesById[game_id];
  },


  /**
   * Get game by id
   * Assert exists
   *
   * @param state
   * @param game_id
   */
  byId(state: IServerState, game_id: string): IGame {
    const game = state.gamesById[game_id];
    if (!game) throw new ReferenceError(`Game ${game_id} not found`);
    return game;
  },


  /**
   * Is the game startable?
   *
   * @param game
   */
  isStartable(game: IGame): boolean {
    // game is startable
    if (game.state !== GAME_STATE.NOT_STARTED) return false;

    // player one taken
    if (!game.player_one_id) return false;

    // player two taken
    if (!game.player_two_id) return false;

    return true;
  },


  /**
   * Is the Game NotStarted?
   *
   * @param game
   */
  isNotStarted(game: IGame) {
    // is not started
    return game.state === GAME_STATE.NOT_STARTED;
  },


  /**
   * Is the Game Finished?
   *
   * @param game
   */
  isFinished(game: IGame) {
    // is finished
    return game.state === GAME_STATE.FINISHED;
  },


  /**
   * Is the Game at Player One's Turn
   *
   * @param game
   */
  isPlayerOneTurn(game: IGame) {
    // is player one's turn
    return game.state === GAME_STATE.PLAYER_ONE_TURN;
  },


  /**
   * Is the Game at Player Two's Turn
   *
   * @param game
   * @returns {boolean}
   */
  isPlayerTwoTurn(game: IGame | IGameDto) {
    // is player two's turn
    return game.state === GAME_STATE.PLAYER_TWO_TURN;
  },


  /**
   * Does the socket have this turn?
   *
   * @param game
   * @param player
   */
  hasTurn(game: IGame, player: PLAYER): boolean {
    // is player 1 && is player 1's turn
    if (player === PLAYER.ONE && game.state === GAME_STATE.PLAYER_ONE_TURN) {
      return true;
    }
    // is player 2 && is player 2's turn
    if (player === PLAYER.TWO && game.state === GAME_STATE.PLAYER_TWO_TURN) {
      return true;
    }
    // fail
    return false;
  },
}

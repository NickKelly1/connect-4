import {
  IBroadcast,
  IBroadcastError,
  IBroadcastGameStarted,
  IBroadcastGameUpdated,
  IBroadcastJoinedGame,
  IBroadcastPlayerOneTurn,
  IBroadcastPlayerTwoTurn,
} from '../common/interface/broadcast.interface';
import { BROADCAST_TYPE } from "../common/enum/broadcast-type.enum";
import { IMatchDto } from "../common/interface/match-dto.interface";

export const Broadcast = {
  /**
   * GAME_UPDATED broadcast message payload
   *
   * @param dto
   */
  gameUpdated(dto: IMatchDto): IBroadcast {
    const broadcast: IBroadcastGameUpdated = {
      t: BROADCAST_TYPE.GAME_UPDATED,
      p: { match: dto },
    }
    return broadcast;
  },


  /**
   * ERROR broadcast message payload
   *
   * @param message
   */
  error(message: string): IBroadcast {
    const broadcast: IBroadcastError = {
      t: BROADCAST_TYPE.ERROR,
      p: { message, } 
    }
    return broadcast;
  },


  /**
   * GAME_STARTED broadcast message payload
   *
   * @param dto
   */
  gameStarted(dto: IMatchDto): IBroadcast {
    const broadcast: IBroadcastGameStarted = {
      t: BROADCAST_TYPE.GAME_STARTED,
      p: { match: dto },
    }
    return broadcast;
  },


  /**
   * PLAYER_ONE_TURN broadcast message payload
   *
   * @param dto
   */
  playerOneTurn(dto: IMatchDto): IBroadcast {
    const broadcast: IBroadcastPlayerOneTurn = {
      t: BROADCAST_TYPE.PLAYER_ONE_TURN,
      p: { match: dto },
    }
    return broadcast;
  },

  /**
   * PLAYER_TWO_TURN broadcast message payload
   *
   * @param dto
   */
  playerTwoTurn(dto: IMatchDto): IBroadcast {
    const broadcast: IBroadcastPlayerTwoTurn = {
      t: BROADCAST_TYPE.PLAYER_TWO_TURN,
      p: { match: dto },
    }
    return broadcast;
  },

  /**
   * JOINED_GAME broadcast message payload
   *
   * @param dto
   */
  joinedGame(dto: IMatchDto): IBroadcast {
    const broadcast: IBroadcastJoinedGame = {
      t: BROADCAST_TYPE.JOINED_GAME,
      p: { match: dto },
    }
    return broadcast;
  },
}

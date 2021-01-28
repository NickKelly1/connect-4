import { ErrorInfo } from "react";
import { MESSAGE_TYPE } from "../common/enum/message-type.enum";
import { Util } from "../common/fn/util.fn";
import { ICellDto } from "../common/interface/cell-dto.interface";
import { IGameId } from "../common/interface/game-id.interface";
import { IMessage, IMessagePlace, IMessageCriticalError, IMessageJoinGame, IMessageStartGame } from "../common/interface/message.interface";

export const Message = {
  /**
   * CLICK_COLUMN message
   *
   * @param message
   */
  place(cell: ICellDto, game_id: IGameId): IMessage {
    const message: IMessagePlace = {
      t: MESSAGE_TYPE.PLACE,
      p: { col: cell.c.x, game_id, },
    }
    return message;
  },

  /**
   * CRITICAL_ERROR message
   *
   * @param error
   * @param errorInfo
   */
  criticalError(error: Error, errorInfo: ErrorInfo): IMessage {
    const message: IMessageCriticalError = {
      t: MESSAGE_TYPE.CRITICAL_ERROR,
      p: {
        error: Util.errorToJson(error),
        errorInfo: Util.pretty(errorInfo),
      },
    };
    return message;
  },

  /**
   * JOIN_GAME message
   *
   * @param message
   */
  joinGame(game_id: IGameId): IMessage {
    const message: IMessageJoinGame = {
      t: MESSAGE_TYPE.JOIN_GAME,
      p: { game_id, },
    }
    return message;
  },


  /**
   * START_GAME message
   *
   * @param message
   */
  startGame(game_id: string): IMessage {
    const message: IMessageStartGame = {
      t: MESSAGE_TYPE.START_GAME,
      p: { game_id, },
    }
    return message;
  },
}
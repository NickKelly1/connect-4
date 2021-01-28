import React, { useEffect } from 'react';
import { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BROADCAST_TYPE } from '../../../common/enum/broadcast-type.enum';
import { logger } from '../../../common/fn/logger.fn';
import { Util } from '../../../common/fn/util.fn';
import { IMatchDto } from '../../../common/interface/match-dto.interface';
import { Message } from '../../../server/message';
import { useBroadcast, WsCtx } from '../../contexts/ws/ws.context';
import { Match } from '../match/match';

interface IMatchContainerProps {
  game_id: string;
}

export function MatchContainer(props: IMatchContainerProps) {
  const { game_id } = props;
  const wsCtx = useContext(WsCtx);

  // match state
  const [matchState, setMatchState] = useState<null | IMatchDto>(null);

  // on mount, join the game
  useEffect(() => { wsCtx.socket.send(Message.joinGame(game_id)); }, []);

  // handle broadcasts about the game...
  useBroadcast((broadcast) => {
    switch (broadcast.t) {
      // ignore...
      case BROADCAST_TYPE.ERROR: { break; }
      case BROADCAST_TYPE.GAME_FINISHED:
      case BROADCAST_TYPE.GAME_STARTED:
      case BROADCAST_TYPE.GAME_UPDATED:
      case BROADCAST_TYPE.PLAYER_ONE_TURN:
      case BROADCAST_TYPE.PLAYER_TWO_TURN: {
        // wrong game...
        if (broadcast.p.match.id !== game_id) break;
        setMatchState(broadcast.p.match);
        break;
      }
      case BROADCAST_TYPE.JOINED_GAME: {
        // wrong game...
        if (broadcast.p.match.id !== game_id) break;
        // join game
        setMatchState(broadcast.p.match);
      }
    }
  }, [setMatchState]);


  if (!matchState) return (
    <div>
      Loading...
    </div>
  );
  //

  return (
    <Match match={matchState} />
  );
}
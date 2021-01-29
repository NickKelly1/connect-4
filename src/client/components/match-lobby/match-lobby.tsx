import './match-lobby.scss';
import React, { useContext, useRef } from 'react';
import { IMatchDto } from '../../../common/interface/match-dto.interface';
import clsx from 'clsx';
import { GAME_STATE } from '../../../common/enum/game-state.enum';
import { PLAYER_STATUS } from '../../../common/enum/player-status.enum';
import { PLAYER } from '../../../common/enum/player.enum';
import { WsCtx } from '../../contexts/ws/ws.context';
import { useModalState } from '../../hooks/use-modal.hook';
import { useNotify } from '../../hooks/use-notify.hook';
import { useUpdate } from '../../hooks/use-update.hook';
import { Modal } from '../modal/modal';
import { Match } from '../match/match';

interface IMatchLobbyProps {
  match: IMatchDto;
}

export function MatchLobby(props: IMatchLobbyProps): JSX.Element {
  const { match } = props;
  const { connected, socket, } = useContext(WsCtx);
  const boardRef = useRef<HTMLDivElement>(null);

  const notify = useNotify();

  const modalState = useModalState(match.game.state === GAME_STATE.NOT_STARTED);

  useUpdate(() => {
    if (modalState.isOpen && match.game.state !== GAME_STATE.NOT_STARTED) {
      // game is running and modal is open - close it
      modalState.doClose();
    }

    else if (!modalState.isOpen && match.game.state === GAME_STATE.NOT_STARTED) {
      // game is not started and modal is not open - open it
      modalState.doOpen();
    }
  }, [match.game.state]);

  return (
    <div className="match-lobby">
      <Modal state={modalState}>
        <div className="grid">
          <h2 className="grid-item xs-12">
            Awaiting worthy opponent...
          </h2>
          <div className="grid-item xs-12">
            <span>
              Share with a friend
            </span>
            {/* <input value="hello world this is text..." /> */}
          </div>
          <div className="grid-item xs-12">
            grid item...
          </div>
        </div>
      </Modal>
      <Match match={match} />
    </div>
  );
}
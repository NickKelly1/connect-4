import './match.scss';
import clsx from 'clsx';
import React, { useContext, useEffect, useLayoutEffect, useRef } from "react";
import { WsCtx } from '../../contexts/ws/ws.context';
import { GAME_STATE } from '../../../common/enum/game-state.enum';
import { PLAYER } from '../../../common/enum/player.enum';
import { ICellDto } from '../../../common/interface/cell-dto.interface';
import { Message } from '../../../server/message';
import { useNotify } from '../../hooks/use-notify.hook';
import { IMatchDto } from '../../../common/interface/match-dto.interface';
import { PLAYER_STATUS } from '../../../common/enum/player-status.enum';
import { useModalState } from '../../hooks/use-modal.hook';
import { Modal } from '../modal/modal';
import { useUpdate } from '../../hooks/use-update.hook';

interface IMatchProps {
  match: IMatchDto;
}

export function Match(props: IMatchProps) {
  const { match } = props;
  const { connected, socket, } = useContext(WsCtx);
  const boardRef = useRef<HTMLDivElement>(null);

  const notify = useNotify();

  useLayoutEffect(() => {
    function handleResize(): void {
      const $board = boardRef.current;
      if (!$board) return;
      const innerHeight = window.innerHeight;
      const innerWidth = window.innerWidth;
      const min = Math.floor(0.7 * Math.min(innerHeight, innerWidth));
      $board.style.height = `${min}px`;
      $board.style.width = `${min}px`;
      console.log(`Adjusting board to: ${min}px`);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  function handleClick(cell: ICellDto) {
    socket.send(Message.place(cell, match.id));
  }

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
    <div className="match">
      <Modal state={modalState}>
        Awaiting worthy opponent...
      </Modal>
      <div className="centered flex-col">
        <div>{`${match.game.board.cols} x ${match.game.board.rows}`}</div>
        <div>{GAME_STATE[match.game.state]}</div>

        <div className="d-flex justify-between">
          <div className="d-flex justify-start mr-3">
            <span>{match.game.player_one ?? '_'}</span>
            {(match.you === PLAYER.ONE) && (<span>&nbsp;(You)</span>)}
            {!(match.you === PLAYER.ONE) && (<span>{PLAYER_STATUS[match.game.player_one_status]}</span>)}
            <span className="player one" />
          </div>

          <div className="d-flex justify-end ml-3">
            <span className="player two" />
            <span>{match.game.player_two ?? '_'}</span>
            {(match.you === PLAYER.TWO) && (<span>&nbsp;(You)</span>)}
            {!(match.you === PLAYER.ONE) && (<span>{PLAYER_STATUS[match.game.player_two_status]}</span>)}
          </div>
        </div>

      </div>
      <div className="centered flex-col">
        <div
          className="board m-3"
          style={{ gridTemplateColumns: `repeat(${match.game.board.cols}, 1fr)`, }}
          ref={boardRef}
        >
          {match.game.board.cells.map(cell => {
            const onClick = cell.p == null ? () => handleClick(cell) : undefined;
            const btnCls = cell.p == null ? undefined : 'cursor-inherit';
            return (
              <button onClick={onClick} className={clsx('cell nobtn', btnCls)} key={cell.i}>
                <div className="pos-relative full p-2">
                  {cell.p === PLAYER.ONE && ( <div className="player one" />)}
                  {cell.p === PLAYER.TWO && ( <div className="player two" />)}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

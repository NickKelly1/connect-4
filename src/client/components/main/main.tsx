import './main.scss';
import clsx from 'clsx';
import { useMutation } from 'react-query';
import React, { Component, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useBroadcast, WsCtx, } from '../../contexts/ws/ws.context';
import { BROADCAST_TYPE } from '../../../common/enum/broadcast-type.enum';
import { useNotify } from '../../hooks/use-notify.hook';
import { Notify } from '../../util/notify';
import { useModalState } from '../../hooks/use-modal.hook';
import { Modal } from '../modal/modal';
import { Req } from '../../util/req';
import { ICreateGameDto } from '../../../common/http/create-game-dto.interface';
import { Util } from '../../../common/fn/util.fn';
import { BrowserRouter, Switch, Route, useLocation, useHistory, } from 'react-router-dom';
import { MatchContainer } from '../match-container/match-container';

interface IMainProps {
  //
}

export function Main(props: IMainProps): JSX.Element {
  const { connected, socket } = useContext(WsCtx);

  const history = useHistory();
  const notify = useNotify();

  useBroadcast((broadcast) => {
    if (broadcast.t === BROADCAST_TYPE.ERROR) return;
    notify(Notify.success(`Received broadcast: ${BROADCAST_TYPE[broadcast.t]}`));
  }, [notify]);


  const createGameState = useMutation<ICreateGameDto>(
    async () => {
      const result = await Req.createGame();
      return result;
    },
    {
      onSuccess: (dto) => {
        // redirect to the game...
        history.push(`/games/${dto.game_id}`);
      },
      onError: (error) => {
        notify(Notify.success(`Errored creating game: ${Util.pretty(error)}`));
      },
    }
  );

  const modalState = useModalState(true);

  return (
    <main className="main">
      {/* no match - show create match modal... */}
      <Switch>
        <Route path="/games/:game_id" render={({ match }) => (
          <MatchContainer game_id={match.params.game_id} />
        )}>
        </Route>
        <Route path="/">
          <Modal state={modalState}>
            <h1>Welcome</h1>
            <button onClick={() => createGameState.mutate()}>
              Create a game?
            </button>
          </Modal>
        </Route>
      </Switch>
    </main>
  );
};

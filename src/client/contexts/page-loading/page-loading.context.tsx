import './page-loading.context.scss';
import clsx from 'clsx';
import React, { useContext, useEffect, useState } from 'react';
import { WsCtx } from '../ws/ws.context';
import { GAME_STATE } from '../../../common/enum/game-state.enum';

interface IPageLoadingProviderProps {
  //
}

enum GATE_STATE {
  CLOSED,
  OPENING,
  OPEN,
  CLOSING,
}

export function PageLoadingProvider(props: React.PropsWithChildren<IPageLoadingProviderProps>) {
  const { children } = props;
  const wsCtx = useContext(WsCtx);

  // let [isGatesOpen, setIsGatesOpen] = useState(true);
  let [isSpinning, setIsSpinning] = useState(true);

  interface IGateState { state: GATE_STATE }
  const [gate, setGate] = useState<IGateState>({ state: GATE_STATE.CLOSED });

  // useEffect(
  //   () => {
  //     if (!wsCtx.connected)  {
  //       // not connected
  //       document
  //         .querySelector('body')
  //         ?.classList
  //         .remove('loaded');
  //     }
  //     else {
  //       // not connected
  //       setTimeout(() => {
  //         document
  //           .querySelector('body')
  //           ?.classList
  //           .add('loaded');
  //       }, 500);
  //     }
  //   },
  //   [wsCtx.connected],
  // );

  const gateCls = gate.state === GATE_STATE.CLOSED ? 'gate-closed'
    : gate.state === GATE_STATE.CLOSING ? 'gate-closing'
    : gate.state === GATE_STATE.OPEN ? 'gate-open'
    : gate.state === GATE_STATE.OPENING ? 'gate-opening'
    : null;

  console.log('==== rendering: ====', { gates: gate, gateCls, });
  console.dir({ gates: gate, gateCls, }, { depth: 5 });


  return (
    <>
      <div className="page-loading">
        <div
          style={{
            zIndex: 5000,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          <button onClick={() => {
            setGate(prev => {
              switch (prev.state) {
                case GATE_STATE.CLOSED: {
                  return { ...prev, state: GATE_STATE.OPENING, };
                }
                case GATE_STATE.CLOSING: {
                  return { ...prev, state: GATE_STATE.CLOSED, };
                }
                case GATE_STATE.OPEN: {
                  return { ...prev, state: GATE_STATE.CLOSING, };
                }
                case GATE_STATE.OPENING: {
                  return { ...prev, state: GATE_STATE.OPEN, };
                }
                default: {
                  throw new Error();
                }
              }
              //
            });
          }}>
            cycle...
          </button>
          <div>
            {`state: ${GATE_STATE[gate.state]}`}
          </div>
        </div>
        <div className={clsx('gate gate-left', gateCls)} />
        <div className={clsx('gate gate-right', gateCls)} />
      </div>
      {/* <div id="page-loading-wrapper">
        <div id="page-loading" />
        <div className="page-loading-section section-left" />
        <div className="page-loading-section section-right" />
      </div> */}
      {children}
    </>
  );
}
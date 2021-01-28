import './page-loading.context.scss';
import React, { useContext, useEffect } from 'react';
import { WsCtx } from '../ws/ws.context';

interface IPageLoadingProviderProps {
  //
}

export function PageLoadingProvider(props: React.PropsWithChildren<IPageLoadingProviderProps>) {
  const { children } = props;
  const wsCtx = useContext(WsCtx);

  useEffect(
    () => {
      if (!wsCtx.connected)  {
        // not connected
        document
          .querySelector('body')
          ?.classList
          .remove('loaded');
      }
      else {
        // not connected
        setTimeout(() => {
          document
            .querySelector('body')
            ?.classList
            .add('loaded');
        }, 500);
      }
    },
    [wsCtx.connected],
  );

  return (
    <>
      <div id="page-loading-wrapper">
        <div id="page-loading" />
        <div className="page-loading-section section-left" />
        <div className="page-loading-section section-right" />
      </div>
      {children}
    </>
  );
}
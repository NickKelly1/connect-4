import './normalise.css';
import { QueryClientProvider, QueryClient } from 'react-query';
import './index.scss';
import 'react-toastify/dist/ReactToastify.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Main } from './components/main/main';
import { PageLoadingProvider } from './contexts/page-loading/page-loading.context';
import { WsCtx, WsCtxProvider } from './contexts/ws/ws.context';
// import { StateCtxProvider } from './contexts/state/state.context';
import { ErrorToaster } from './components/error-toaster/error-toaster';
import { ToastContainer as NpmToastContainer } from 'react-toastify';
import { ErrorBoundary } from './components/error-boundary/error-boundary';
import ReactModal from 'react-modal';
import { setLogger } from '../common/fn/logger.fn';
import { BrowserRouter } from 'react-router-dom';

setLogger(console);

ReactModal.setAppElement('#app');

const client = new QueryClient();

ReactDOM.render(
  <>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <WsCtxProvider>
          <PageLoadingProvider>
            <WsCtx.Consumer>
              {(wsCtx) => (
                <ErrorBoundary wsCtx={wsCtx}>
                  {/* <StateCtxProvider> */}
                    <ErrorToaster>
                      {/* <WaitingForGameModal /> */}
                      <Main />
                    </ErrorToaster>
                  {/* </StateCtxProvider> */}
                </ErrorBoundary>
              )}
            </WsCtx.Consumer>
          </PageLoadingProvider>
        </WsCtxProvider>
      </BrowserRouter>
    </QueryClientProvider>
    <NpmToastContainer />
  </>,
  document.getElementById('app')
);

// if (module.hot) { // enables hot module replacement if plugin is installed
//   module.hot.accept();
// }

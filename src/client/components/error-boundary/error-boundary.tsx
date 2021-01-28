import React, { Component, ErrorInfo } from 'react';
import { MESSAGE_TYPE } from '../../../common/enum/message-type.enum';
import { Message } from '../../../server/message';
import { IWsCtx } from '../../contexts/ws/ws.context';

interface IErrorBoundaryProps {
  children: React.ReactNode;
  wsCtx: IWsCtx;
}

interface IErrorBoudnaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoudnaryState> {
  state = { hasError: false };

  constructor(props: IErrorBoundaryProps) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    // update state so next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { wsCtx } = this.props;
    const { socket } = wsCtx;
    socket.send(Message.criticalError(error, errorInfo));
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="m-3">
          <h1 className="centered text-center">
            Something went wrong
            <br />
            Please refresh the page
          </h1>
        </main>
      );
    }

    const { children } = this.props;
    return children;
  }
}

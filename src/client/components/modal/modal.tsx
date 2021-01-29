import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReactModal from 'react-modal';
import { IModalState } from '../../hooks/use-modal.hook';


const defaultStyle: ReactModal.Styles = {
  overlay: {
    backgroundColor: 'var(--bg-overlay)',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    height: 'auto',
    width: 'auto',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--primary)',
  },
};

interface IModal extends Omit<ReactModal.Props, 'isOpen'> {
  state: IModalState;
  children: React.ReactNode;
}

export function Modal(props: IModal) {
  const { state, style, children, ...modalProps } = props;

  return (
    <ReactModal
      {...modalProps}
      style={style ?? defaultStyle}
      isOpen={state.isOpen}
    >
      {children}
    </ReactModal>
  );
}
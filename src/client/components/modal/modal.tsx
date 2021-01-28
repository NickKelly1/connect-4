import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReactModal from 'react-modal';
import { IModalState } from '../../hooks/use-modal.hook';


const defaultStyle: ReactModal.Styles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    backgroundColor: 'var(--modal-bg-color)',
    border: '1px solid var(--main-color)',
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
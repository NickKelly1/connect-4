import './button.scss';
import clsx from 'clsx';
import React, { MouseEventHandler, ReactNode, useCallback, useRef, useState } from 'react';
import { useIsUnmounted } from '../../hooks/use-is-unmounted.hook';
import { useSeq } from '../../hooks/use-seq.hook';

interface IButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  children?: ReactNode;
}

export function Button(props: IButtonProps): JSX.Element {
  const { className, onClick, children, } = props;

  const isUnmounted = useIsUnmounted();

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    const $button = e.currentTarget;
    const $ripple = document.createElement('span');
    const diameter = Math.max($button.clientWidth, $button.clientHeight);
    const radius = diameter / 2;
    $ripple.style.width = `${diameter}px`;
    $ripple.style.height = `${diameter}px`;
    const clickLeft = e.clientX;
    const clickTop = e.clientY;
    const btnRect = $button.getBoundingClientRect();
    const btnLeft = btnRect.left;
    const btnTop = btnRect.top;
    const dx = clickLeft - btnLeft;
    const dy = clickTop - btnTop;
    const rx0 = dx - radius;
    const ry0 = dy - radius;
    $ripple.style.left = `${rx0}px`;
    $ripple.style.top = `${ry0}px`;
    $ripple.classList.add('ripple');
    $button.appendChild($ripple);
    setTimeout(() => { if (!isUnmounted()) $button.removeChild($ripple) }, 1000);
    onClick?.(e);
  };

  return (
    <button className={clsx('button', className)} onClick={handleClick}>
      {children}
    </button>
  );
}
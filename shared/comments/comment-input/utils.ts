import type { RefObject } from 'react';

interface FocusableInput {
  focus: () => void;
}

export function focusBottomSheetInput(inputRef: RefObject<FocusableInput | null | undefined>) {
  let animationFrame: number | null = null;
  const focusInput = () => {
    animationFrame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };
  let cancelIdle = () => {};

  if (typeof requestIdleCallback === 'function' && typeof cancelIdleCallback === 'function') {
    const idleCallback = requestIdleCallback(focusInput);
    cancelIdle = () => cancelIdleCallback(idleCallback);
  } else {
    const timeout = setTimeout(focusInput, 0);
    cancelIdle = () => clearTimeout(timeout);
  }

  return () => {
    cancelIdle();
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
  };
}

export function getCommentInputHeight(contentHeight: number) {
  return Math.min(Math.max(contentHeight, 52), 120);
}

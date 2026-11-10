"use client";

import { useCallback, useRef, useState } from "react";

export function useModalExit(closedValue = false) {
  const [value, setValueState] = useState(closedValue);
  const [closing, setClosing] = useState(false);
  const valueRef = useRef(closedValue);

  const setValue = useCallback((nextValue) => {
    const next = typeof nextValue === "function" ? nextValue(valueRef.current) : nextValue;
    if (Object.is(next, closedValue) && !Object.is(valueRef.current, closedValue)) {
      setClosing(true);
      return;
    }

    valueRef.current = next;
    setClosing(false);
    setValueState(next);
  }, [closedValue]);

  const onAnimationEnd = useCallback((event) => {
    if (closing && event.target === event.currentTarget) {
      valueRef.current = closedValue;
      setValueState(closedValue);
      setClosing(false);
    }
  }, [closedValue, closing]);

  return [value, setValue, closing, onAnimationEnd];
}

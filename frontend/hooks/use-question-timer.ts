"use client";

import { useEffect, useRef, useState } from "react";

export const QUESTION_TIME_LIMIT_SEC = 60;

export function useQuestionTimer(
  startedAt: number | null,
  limitSec = QUESTION_TIME_LIMIT_SEC,
  onExpire: () => void
) {
  const [now, setNow] = useState(() => Date.now());
  const [isExpired, setIsExpired] = useState(false);
  const expireCalled = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setNow(Date.now());
    setIsExpired(false);
    expireCalled.current = false;
  }, [startedAt]);

  useEffect(() => {
    if (startedAt === null || isExpired) return;

    const tick = () => {
      const currentNow = Date.now();
      const remaining = Math.max(
        0,
        limitSec - Math.floor((currentNow - startedAt) / 1000)
      );
      setNow(currentNow);

      if (remaining === 0 && !expireCalled.current) {
        expireCalled.current = true;
        setIsExpired(true);
        onExpireRef.current();
      }
    };

    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [startedAt, isExpired]);

  const remaining = startedAt === null
    ? limitSec
    : Math.max(0, limitSec - Math.floor((now - startedAt) / 1000));

  return {
    remaining,
    progress: (remaining / limitSec) * 100,
    isExpired,
  };
}

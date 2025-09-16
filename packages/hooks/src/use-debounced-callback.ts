import { useCallback, useRef } from "react";

/**
 * คืน callback ที่ถูก debounce ตาม delay (ms)
 * - ถ้า delay <= 0/ไม่มี → เรียกทันที (ไม่ debounce)
 * - คืน [debouncedFn, clear] เป็น tuple
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number | null | undefined
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // อัปเดต fn ปัจจุบันเสมอ
  fnRef.current = fn;

  const debounced = useCallback(
    (...args: Parameters<T>): void => {
      if (delay == null || delay <= 0) {
        fnRef.current(...args);
        return;
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay]
  );

  const clear = useCallback((): void => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return [debounced, clear] as const;
}

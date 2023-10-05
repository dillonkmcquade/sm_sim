import { useRef, useMemo, useEffect } from "react";
import { debounce } from "../utils/utils";

/**
 * A react hook implementation of debounce
 *
 * @param callback - The function to be returned
 * @param t - The length of the timeout in milliseconds
 *
 */
export const useDebounce = (callback: Function, t: number) => {
  const ref = useRef<typeof callback>();

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = () => {
      ref.current?.();
    };

    return debounce(func, t);
  }, [t]);

  return debouncedCallback;
};

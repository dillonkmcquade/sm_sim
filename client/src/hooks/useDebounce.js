//For making debounce work in react
import { useRef, useMemo, useEffect } from "react";
import { debounce } from "../utils/utils";

export const useDebounce = (callback, t) => {
  const ref = useRef();

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

//Fetch latest quote of specified ticker symbol, cached in sessionstorage

import { useEffect, useState } from "react";
import { Quote } from "../types";

/**
 * @param ticker - The ticker symbol ie. `TSLA`
 * @throws Error if fetched data is invalid
 * @returns the most recent price for a stock
 * @example
 *  ```js
 *  const { quote } = useQuote(id)
 *  ```
 */
export function useQuote(ticker: string) {
  const [quote, setQuote] = useState<Quote | null>();
  useEffect(() => {
    async function getQuote() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/stock/quote/${ticker}`,
        );
        const parsed = await response.json();
        if (parsed.data.c) {
          setQuote(parsed.data);
          window.sessionStorage.setItem(ticker, "null");
        } else {
          throw new Error(`Error fetching ${ticker} quote`);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        }
      }
    }
    if (!quote) {
      getQuote();
    }
  }, [ticker, quote]);
  return { quote };
}

import type { Holding } from "../types";

/**
 * Extracts the total amount of currency spent from the user's transactions
 *
 * @returns the total invested value as a number
 */
export function getInvestedValue(holdings: Holding[]): number {
  return holdings.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.quantity) * currentValue.price;
  }, 0);
}

/**
 * Returns the current price for a list of tickers
 *
 * @param holdings - An array of objects of type <Holding>
 * @returns A new Map<string, number> representing the price (number) of each ticker (string)
 *
 */
export async function getPrices(
  holdings: Holding[],
): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  const uniqueTickers = new Set(holdings.map((holding) => holding.ticker));
  try {
    const priceRequests = [...uniqueTickers].map(async (ticker) => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/stock/quote/${ticker}`,
      );
      const parsed = await response.json();
      if (!parsed.data.c) {
        throw new Error(`Error fetching ${ticker} quote`);
      }
      prices.set(ticker, parsed.data.c);
    });

    await Promise.all(priceRequests);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  }
  return prices;
}

/**
 *
 * Get the total portfolio value
 *
 * @param holdings - An array of objects of type <Holding>
 *
 * @param prices - A Map<string, number> representing the most recent price (number) of each ticker (string)
 *
 * @returns The total value as a number
 */
export function getTotalValue(
  holdings: Holding[],
  prices: Map<string, number>,
): number {
  return holdings.reduce((accumulator: number, currentValue: Holding) => {
    const price = prices.get(currentValue.ticker);
    if (price === undefined || price < 0) {
      throw new Error("Missing price");
    }
    return accumulator + currentValue.quantity * price;
  }, 0);
}

/**
 * Returns the user's holdings of each ticker, removes entries with quantities less than 0
 *
 * @returns A Map where the key = ticker and value = # of shares
 */
export function getUniques(holdings: Holding[]): Map<string, number> {
  //accumulate quantity and store in map
  const uniqueValues = new Map<string, number>();
  for (let i = 0; i < holdings.length; i++) {
    const holding = holdings[i];
    const value = uniqueValues.get(holding.ticker);
    if (value) {
      uniqueValues.set(holding.ticker, value + holding.quantity);
    } else {
      uniqueValues.set(holding.ticker, holding.quantity);
    }
  }
  // remove quantities less than 0
  uniqueValues.forEach((value, key) => {
    if (value <= 0) {
      uniqueValues.delete(key);
    }
  });
  return uniqueValues;
}

/**
 * Provides a debounce implementation for the useDebounce hook (wrapper to make it work in react)
 *
 * @param fn - The function to call after the timeout
 * @param t - The length of the timeout
 *
 */
export function debounce(fn: Function, t: number) {
  let timer: NodeJS.Timeout;
  return function (...args: any[]) {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      return fn(...args);
    }, t);
  };
}

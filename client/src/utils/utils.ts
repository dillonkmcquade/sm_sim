//return invested value, calculated from user holdings
//quantity and price derived from holdings array in DB

import type { Holding } from "../types";

//price = purchase price
export function getInvestedValue(holdings: Holding[]): number {
  return holdings.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.quantity) * currentValue.price;
  }, 0);
}

//create map containing {ticker, price} combinations
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

//returns total value of holdings
export function getTotalValue(
  holdings: Holding[],
  prices: Map<string, number>,
): number {
  // const prices = await getPrices(holdings);

  return holdings.reduce((accumulator: number, currentValue: Holding) => {
    const price = prices.get(currentValue.ticker);
    if (price === undefined) {
      throw new Error("Missing price");
    }
    return accumulator + currentValue.quantity * price;
  }, 0);
}

// narrow holdings to holdings with acummulated quantity > 0
// Some holdings might have negative quantity in the case of a sell transaction
// So we have to add up all the positive and negatives of each ticker symbol to get the # of shares
//
// Returns a map
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

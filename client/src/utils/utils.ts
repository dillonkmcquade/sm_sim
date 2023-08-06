//return invested value, calculated from user holdings
//quantity and price derived from holdings array in DB

import type { Holding } from "../types";

//price = purchase price
export function getInvestedValue(holdings: Holding[]) {
  return holdings.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue.quantity) * currentValue.price;
  }, 0);
}

//create object containing {ticker: price} combinations
export async function getPrices(holdings: Holding[]) {
  const prices: { [key: string]: number } = {};
  const uniqueTickers = Array.from(
    new Set(holdings.map((holding) => holding.ticker)),
  );
  try {
    const priceRequests = uniqueTickers.map(async (ticker) => {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/stock/quote/${ticker}`,
      );
      const parsed = await response.json();
      if (!parsed.data.c) {
        throw new Error(`Error fetching ${ticker} quote`);
      }
      prices[ticker] = parsed.data.c;
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
export async function getTotalValue(holdings: Holding[]) {
  const prices = await getPrices(holdings);

  return holdings.reduce((accumulator: number, currentValue: Holding) => {
    return accumulator + currentValue.quantity * prices[currentValue.ticker];
  }, 0);
}

export function getUniques(holdings: Holding[]) {
  const uniqueValues: any = {};
  for (let i = 0; i < holdings.length; i++) {
    const holding = holdings[i];
    if (uniqueValues[holding.ticker]) {
      uniqueValues[holding.ticker] += holding.quantity;
    } else {
      uniqueValues[holding.ticker] = holding.quantity;
    }
  }

  const uniqueTickers = Object.keys(uniqueValues);
  const newArr: { ticker: string; quantity: number }[] = new Array(
    uniqueTickers.length,
  );

  for (let i = 0; i < uniqueTickers.length; i++) {
    const ticker = uniqueTickers[i];
    const quantity = uniqueValues[ticker];
    if (quantity <= 0 || quantity === undefined) continue;
    newArr[i] = { ticker, quantity };
  }

  return newArr.filter(Boolean);
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

import { redisClient } from "./services/database.service";

export async function getPrice(symbol: string): Promise<number> {
  const price = await redisClient.get(`/stock/quote?symbol=${symbol}`);
  if (price) {
    return JSON.parse(price);
  }
  const request = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_KEY}`,
  );
  const data = await request.json();
  if (data["c"]) {
    return data.c;
  } else {
    throw new Error("Error fetching quote");
  }
}

/*
 * GET /stock/candle?symbol={}&resolution={}&from={}
 *
 * Returns an array of candlestick data objects
 *
 * 200:
 *  Response {
 *   status      number
 *   data      Candle[] // see front-end types.d.ts for interface
 *  }
 * 400:
 *  Response {
 *   status      number
 *   message     string
 *  }
 * 500:
 *  Response {
 *   status      number
 *   message     string
 *  }
 */

import { Response, Request } from "express";
import { redisClient } from "../services/database.service";

export async function getCandle(req: Request, res: Response) {
  const { ticker } = req.params; // ticker symbol
  const { resolution, from } = req.query;
  if (!ticker) {
    return res.status(400).json({ status: 400, message: "Missing ticker id" });
  }
  try {
    const request = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${Math.floor(
        Date.now() / 1000,
      )}&token=${process.env.FINNHUB_KEY}`,
    );
    const data = await request.json();

    // return data if response contains actual data, sometimes it returns no_data even with 200 response
    if (data["c"]) {
      await redisClient.set(req.url, JSON.stringify(data), { EX: 180 });
      return res.status(200).json({ status: 200, data });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Failed request, possibly incorrect ticker symbol",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
}

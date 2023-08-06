import { Response, Request } from "express";
import dotenv from "dotenv";
import { redisClient } from "../services/database.service";

export async function getCandle(req: Request, res: Response) {
  dotenv.config();
  const { ticker } = req.params;
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
    if (data["c"]) {
      await redisClient.set(req.url, JSON.stringify(data), { EX: 180 });
      return res.status(200).json({ status: 200, data });
    } else {
      return res.status(404).json({
        status: 404,
        message: "Failed request, possibly incorrect ticker symbol",
      });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
}

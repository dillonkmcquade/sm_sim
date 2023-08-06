import { Response, Request } from "express";
import dotenv from "dotenv";
import { redisClient } from "../services/database.service";
export async function getNews(req: Request, res: Response) {
  dotenv.config();
  const { ticker } = req.params;
  if (!ticker) {
    return res.status(400).json({ status: 400, message: "Missing ticker id" });
  }
  try {
    const request = await fetch(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&apiKey=${process.env.POLYGON_KEY}`,
    );
    const data = await request.json();
    if (data.results) {
      await redisClient.set(req.url, JSON.stringify(data));
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

/*
 * GET /stock/news/:ticker
 *
 * Returns an array of article objects
 *
 * 200:
 *  Response {
 *   status      number
 *   data     Article[]     // see front-end types.d.ts for interface
 *  }
 * 400:
 *  Response {
 *   status      number
 *   message     string
 *  }
 * 404:
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

export async function getNews(req: Request, res: Response) {
  const { ticker } = req.params; // ticker symbol
  if (!ticker) {
    return res.status(400).json({ status: 400, message: "Missing ticker id" });
  }
  try {
    const request = await fetch(
      `https://api.polygon.io/v2/reference/news?ticker=${ticker}&apiKey=${process.env.POLYGON_KEY}`,
    );
    const data = await request.json();

    // Check that our request returned data
    if (!data.results) {
      return res.status(404).json({
        status: 404,
        message: "Failed request, possibly incorrect ticker symbol",
      });
    }

    // store results in cache
    await redisClient.set(req.url, JSON.stringify(data));

    // return data
    return res.status(200).json({ status: 200, data });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
}

import { Request, Response, NextFunction } from "express";
import { redisClient } from "./services/database.service";

export async function checkCache(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const url = req.url;

  const cached = await redisClient.get(url);
  if (cached) {
    console.log(`Using cache for request: ${url}`);
    return res
      .status(200)
      .json({ status: 200, fromCache: true, data: JSON.parse(cached) });
  } else {
    return next();
  }
}

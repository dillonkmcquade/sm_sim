import { Request, Response, NextFunction } from "express";
import { redis } from "../index";
import { auth } from "express-oauth2-jwt-bearer";

export async function checkCache(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const url = req.url;
  try {
    const cached = await redis.get(url);
    if (cached) {
      return res
        .status(200)
        .json({ status: 200, fromCache: true, data: JSON.parse(cached) });
    } else {
      return next();
    }
  } catch (error) {
    console.error(error);
  }
}

export const jwtCheck = auth({
  audience: "my-api",
  issuerBaseURL: "https://dev-twp4lk0d7utxiu7i.us.auth0.com/",
});

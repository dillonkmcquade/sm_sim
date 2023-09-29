import { Router } from "express";
import { getQuote } from "../controllers/getQuote";
import { getCandle } from "../controllers/getCandle";
import { getNews } from "../controllers/getNews";
import { checkCache } from "../middleware/middleware";

const stockRouter = Router();

stockRouter
  .use(checkCache)
  .get("/news/:ticker", getNews)
  .get("/quote/:ticker", getQuote)
  .get("/candle/:ticker", getCandle);

export default stockRouter;

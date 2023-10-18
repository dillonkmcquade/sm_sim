import { Router } from "express";
import { checkCache } from "../middleware/middleware";
import { stockController } from "../index";

const stockRouter = Router();

stockRouter
  .use(checkCache)
  .get("/news/:ticker", (req, res) => stockController.news(req, res))
  .get("/quote/:ticker", (req, res) => stockController.quote(req, res))
  .get("/candle/:ticker", (req, res) => stockController.candle(req, res))
  .get("/search", (req, res) => stockController.search(req, res));

export default stockRouter;

import { Router } from "express";
import { buyStock } from "../controllers/buyStock";
import { sellStock } from "../controllers/sellStock";
import { jwtCheck } from "../middleware/middleware";

const transactionRouter = Router();

transactionRouter
  .use(jwtCheck)
  .patch("/buy/:id", buyStock)
  .patch("/sell/:id", sellStock);

export default transactionRouter;

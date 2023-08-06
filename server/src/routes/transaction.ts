import { Router } from "express";
import { buyStock } from "../handlers/buyStock";
import { sellStock } from "../handlers/sellStock";
import { jwtCheck } from "../middleware";

const transactionRouter = Router();

transactionRouter
  .use(jwtCheck)
  .patch("/buy/:id", buyStock)
  .patch("/sell/:id", sellStock);

export default transactionRouter;

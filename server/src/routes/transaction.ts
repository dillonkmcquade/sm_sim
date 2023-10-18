import { Router } from "express";
import { jwtCheck } from "../middleware/middleware";
import { transactionController } from "../index";

const transactionRouter = Router();

transactionRouter
  .use(jwtCheck)
  .patch("/buy/:id", (req, res) => transactionController.buy(req, res))
  .patch("/sell/:id", (req, res) => transactionController.sell(req, res));

export default transactionRouter;

import { Router } from "express";
import { jwtCheck } from "../middleware/middleware";
import { userController } from "../index";

const userRouter = Router();

userRouter
  .use(jwtCheck)
  .post("/", (req, res) => userController.create(req, res))
  .get("/", (req, res) => userController.findOne(req, res))
  .patch("/update", (req, res) => userController.update(req, res))
  .delete("/", (req, res) => userController.delete(req, res))
  .patch("/toggleWatchList", (req, res) =>
    userController.toggleWatchList(req, res),
  );

export default userRouter;

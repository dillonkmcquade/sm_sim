import { Router } from "express";
import { createUser } from "../controllers/createUser";
import { deleteUser } from "../controllers/deleteUser";
import { updateUser } from "../controllers/updateUser";
import { getUser } from "../controllers/getUser";
import { toggleWatchList } from "../controllers/toggleWatchList";
import { jwtCheck } from "../middleware/middleware";

const userRouter = Router();

userRouter
  .use(jwtCheck)
  .post("/", createUser)
  .delete("/", deleteUser)
  .patch("/update", updateUser)
  .get("/", getUser)
  .patch("/toggleWatchList", toggleWatchList);

export default userRouter;

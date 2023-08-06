import { Router } from "express";
import { createUser } from "../handlers/createUser";
import { deleteUser } from "../handlers/deleteUser";
import { updateUser } from "../handlers/updateUser";
import { getUser } from "../handlers/getUser";
import { toggleWatchList } from "../handlers/toggleWatchList";
import { jwtCheck } from "../middleware";

const userRouter = Router();

userRouter
  .use(jwtCheck)
  .post("/", createUser)
  .delete("/", deleteUser)
  .patch("/update", updateUser)
  .get("/", getUser)
  .patch("/toggleWatchList", toggleWatchList);

export default userRouter;

"use strict";
import { Response, Request } from "express";
import { collections } from "../services/database.service";
import { User } from "../types";

export const getUser = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub;
  try {
    const { users } = collections;
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    return res.status(200).json({
      status: 200,
      data: user,
    });
  } catch (error: any) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

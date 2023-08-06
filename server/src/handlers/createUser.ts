"use strict";
import { Response, Request } from "express";
import { collections } from "../services/database.service";
import { ObjectId } from "mongodb";
import { User } from "../types";

export const createUser = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub;
  const { user } = req.body;
  if (!user) {
    return res.status(400).json({ status: 400, message: "missing user UUID" });
  }
  try {
    const { users } = collections;
    const duplicate = await users?.findOne<User>({ sub: auth });
    if (duplicate) {
      return res
        .status(200)
        .json({ status: 200, data: duplicate, message: "User exists" });
    }
    const newUser: User = {
      _id: new ObjectId(),
      balance: 1000000,
      holdings: [],
      watchList: [],
      ...user,
    };
    await users?.insertOne(newUser);
    return res.status(201).json({
      status: 201,
      message: "User created",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

/*
 * POST /user
 * Expects auth0 user object in request body
 * Returns new/existing user object
 *
 * 200:
 *  Response {
 *   status      number
 *   message     string
 *   data         User
 *  }
 * 201:
 *  Response {
 *   status      number
 *   message     string
 *   data         User
 *  }
 * 400:
 *  Response {
 *   status      number
 *   message     string
 *  }
 * 500:
 *  Response {
 *   status      number
 *   message     string
 *  }
 */
"use strict";
import { Response, Request } from "express";
import { collections } from "../services/database.service";
import { ObjectId } from "mongodb";
import { User } from "../types";

export const createUser = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub; // User ID
  const { user } = req.body; // auth0 user object

  //validate that we are receiving the user obj
  if (!user) {
    return res.status(400).json({ status: 400, message: "missing user UUID" });
  }

  try {
    const { users } = collections;

    // If user already exists, return user object
    const duplicate = await users?.findOne<User>({ sub: auth });
    if (duplicate) {
      return res
        .status(200)
        .json({ status: 200, data: duplicate, message: "User exists" });
    }

    // If user does not exist, create new user in database
    const newUser: User = {
      _id: new ObjectId(),
      balance: 1000000,
      holdings: [],
      watchList: [],
      ...user,
    };
    await users?.insertOne(newUser);

    // return new user
    return res.status(201).json({
      status: 201,
      message: "User created",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

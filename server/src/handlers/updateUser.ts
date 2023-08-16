/*
 * PATCH /user
 *
 * Updates user details
 *
 * Returns new user object
 *
 * 200:
 *  Response {
 *   status      number
 *   data          User
 *  }
 * 400:
 *  Response {
 *   status      number
 *   message     string
 *  }
 * 404:
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
import type { Update, User } from "../types";

export const updateUser = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub;
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: 400,
      message: "No update paramaters given.",
    });
  }

  //limit the updateable user fields
  function isUpdate(obj: any): boolean {
    const dummyData: Update = {
      name: "string",
      nickname: "string",
      email: "string",
      address: "string",
      telephone: "string",
    };
    let result = true;
    const keys = Object.keys(obj);
    keys.forEach((key) => {
      const expectedKeys = Object.keys(dummyData);
      if (!expectedKeys.includes(key)) {
        result = false;
      }
    });
    return result;
  }

  // if it fails the test, return bad request
  if (!isUpdate(req.body)) {
    return res.status(400).json({
      status: 400,
      message: "Bad request, unrecognized properties of request body",
    });
  }

  try {
    const { users } = collections;

    // update user
    const update = await users?.updateOne({ sub: auth }, { $set: req.body });

    // handle DB errors
    if (update?.matchedCount === 0 || update?.modifiedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invalid data given. Check variable names in request body",
      });
    }

    // retrieve new user object
    const newUser = await users?.findOne<User>({ sub: auth });

    //return updated user object
    return res.status(200).json({
      status: 200,
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

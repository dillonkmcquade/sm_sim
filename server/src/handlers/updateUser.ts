"use strict";
import { Response, Request } from "express";
import { collections } from "../services/database.service";
import type { Update } from "../types";

export const updateUser = async (req: Request, res: Response) => {
  const { _id } = req.params;
  if (!_id) {
    return res.status(400).json({ status: 400, message: "Missing client ID" });
  }
  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({
      status: 400,
      message: "No update paramaters given.",
      data: req.body,
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
  if (!isUpdate(req.body)) {
    return res.status(400).json({
      status: 400,
      message: "Bad request, unrecognized properties of request body",
    });
  }

  try {
    const { users } = collections;
    const update = await users?.updateOne({ sub: _id }, { $set: req.body });
    if (update?.matchedCount === 0 || update?.modifiedCount === 0) {
      return res.status(404).json({
        status: 404,
        message: "Invalid data given. Check variable names in request body",
      });
    }

    const newUser = await users?.findOne({ sub: _id });

    return res.status(200).json({
      status: 200,
      message: "User updated successfully.",
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

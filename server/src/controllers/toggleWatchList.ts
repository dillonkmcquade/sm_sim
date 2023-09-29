/*
 * POST /user/toggleWatchList
 *
 * Updates user watch list
 * returns new watch list
 *
 * 200:
 *  Response {
 *   status      number
 *   message     string
 *   holdings Holding[]
 *   balance     number
 *  }
 * 204:
 *  Response {}
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
import type { User } from "../types";

export const toggleWatchList = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub;
  const { ticker, isWatched }: { ticker: string; isWatched: boolean } =
    req.body;
  if (!ticker || isWatched === undefined) {
    return res.status(400).json({
      status: 400,
      message: "missing data",
    });
  }
  try {
    const { users } = collections;

    // check if user exists
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 200, message: "user not found" });
    }

    // do nothing if the requested change is already in effect
    if (
      (isWatched && user.watchList.includes(ticker)) ||
      (!isWatched && !user.watchList.includes(ticker))
    ) {
      //do nothing
      return res.status(204);
    }

    // update user watch list
    let update;
    if (isWatched && !user.watchList.includes(ticker)) {
      //Add
      update = await users?.updateOne(
        { sub: auth },
        { $push: { watchList: ticker } },
      );
    } else if (!isWatched && user.watchList.includes(ticker)) {
      //Remove
      update = await users?.updateOne(
        { sub: auth },
        { $pull: { watchList: ticker } },
      );
    }

    // handle DB errors
    if (update && (update.matchedCount === 0 || update.modifiedCount === 0)) {
      return res
        .status(400)
        .json({ status: 400, message: "Could not update user watch list" });
    }

    // retrieve updated user object
    const newUser = await users?.findOne<User>({ sub: auth });

    // return updated user object
    return res.status(200).json({
      status: 200,
      data: newUser?.watchList,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

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
      data: req.body,
      message: "missing data",
    });
  }
  try {
    const { users } = collections;
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 200, message: "user not found" });
    }
    let update: any;
    if (
      (isWatched && user.watchList.includes(ticker)) ||
      (!isWatched && !user.watchList.includes(ticker))
    ) {
      //do nothing
      return res.status(204);
    } else if (isWatched && !user.watchList.includes(ticker)) {
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

    if (update.matchedCount === 0 || update.modifiedCount === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Could not update user watch list" });
    }
    const newUser = await users?.findOne<User>({ sub: auth });

    return res.status(200).json({
      status: 200,
      message: "Watch list updated successfully",
      data: newUser?.watchList,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

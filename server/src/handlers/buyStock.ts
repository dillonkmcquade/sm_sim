"use strict";
import { Response, Request } from "express";
import { collections } from "../services/database.service";
import type { Holding, User } from "../types";
import { getPrice } from "../utils";

export const buyStock = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub;
  const { id } = req.params;
  const { quantity }: { quantity: number } = req.body;
  if (!id || quantity <= 0) {
    return res.status(400).json({
      status: 400,
      data: req.body,
      params: id,
      message: "missing data",
    });
  }
  try {
    const { users } = collections;
    const currentPrice = await getPrice(id);
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 200, message: "user not found" });
    }

    const newHolding: Holding = { ticker: id, quantity, price: currentPrice };
    const amountToSubtract = Number(currentPrice) * quantity;

    if (user.balance < amountToSubtract) {
      return res
        .status(400)
        .json({ status: 400, message: "Insufficient funds" });
    }

    const update = await users?.updateOne(
      { sub: auth },
      { $inc: { balance: -amountToSubtract }, $push: { holdings: newHolding } },
    );

    if (update?.matchedCount === 0 || update?.modifiedCount === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Could not update user holdings" });
    }
    user.holdings.push(newHolding);
    return res.status(200).json({
      status: 200,
      message: "stock purchased successfully",
      holdings: user.holdings,
      balance: user.balance - amountToSubtract,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

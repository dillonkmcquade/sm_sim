/*
 * POST /transaction/sell/:ticker
 *
 * Updates user balance as well as user holdings
 *
 * 200:
 *  Response {
 *   status      number
 *   message     string
 *   holdings Holding[]
 *   balance     number
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
import { Holding, User } from "../types";
import { getPrice } from "../utils";

export const sellStock = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub; // User ID
  const { id } = req.params; // ticker symbol

  // number of shares
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

    // fetch current price
    const currentPrice = await getPrice(id);

    // check if user exists
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 200, message: "user not found" });
    }

    const newTransaction: Holding = {
      ticker: id,
      quantity: -quantity,
      price: currentPrice,
    };
    const amountToSubtract = Number(currentPrice) * quantity;

    // update user balance and holdings
    const update = await users?.updateOne(
      { sub: auth },
      {
        $inc: { balance: amountToSubtract },
        $push: { holdings: newTransaction },
      },
    );

    // handle database errors
    if (update?.matchedCount === 0 || update?.modifiedCount === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Could not update user holdings" });
    }

    // return new balance and holdings
    user.holdings.push(newTransaction);
    return res.status(200).json({
      status: 200,
      message: "stock purchased successfully",
      holdings: user.holdings,
      balance: user.balance + amountToSubtract,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

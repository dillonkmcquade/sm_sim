/*
 * POST /transaction/buy/TSLA
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
import type { Holding, User } from "../types";
import { getPrice } from "../utils";

export const buyStock = async (req: Request, res: Response) => {
  const auth = req.auth?.payload.sub; // User ID
  const { id } = req.params; // ticker symbol
  const { quantity }: { quantity: number } = req.body;

  // Validate that we have id and quantity
  if (!id || quantity <= 0) {
    return res.status(400).json({
      status: 400,
      message: "missing data",
    });
  }
  try {
    const { users } = collections;

    // get the current price of the given symbol
    const currentPrice = await getPrice(id);

    // Check if user exists
    const user = await users?.findOne<User>({ sub: auth });
    if (!user) {
      return res.status(404).json({ status: 200, message: "user not found" });
    }

    const newHolding: Holding = { ticker: id, quantity, price: currentPrice };
    const amountToSubtract = Number(currentPrice) * quantity;

    // Return bad request if insufficient funds in account
    if (user.balance < amountToSubtract) {
      return res
        .status(400)
        .json({ status: 400, message: "Insufficient funds" });
    }

    // Update user holdings and balance
    const update = await users?.updateOne(
      { sub: auth },
      { $inc: { balance: -amountToSubtract }, $push: { holdings: newHolding } },
    );

    // Handle database errors
    if (update?.matchedCount === 0 || update?.modifiedCount === 0) {
      return res
        .status(400)
        .json({ status: 400, message: "Could not update user holdings" });
    }

    // return new holdings and balance for front-end
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

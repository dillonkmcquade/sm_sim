import { Collection } from "mongodb";
import { User } from "../types";
import { Request, Response } from "express";
import { getPrice } from "../utils/utils";

export class TransactionController {
  constructor(private readonly userCollection: Collection<User>) {}

  async buy(req: Request, res: Response) {
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
    let currentPrice: number;

    try {
      // get the current price of the given symbol
      currentPrice = await getPrice(id);
    } catch (err) {
      return res.status(500).json({
        status: 500,
        message: `Error fetching current price for: ${id}`,
      });
    }

    try {
      // Check if user exists
      const user = await this.userCollection.findOne({ sub: auth });
      if (!user) {
        return res.status(404).json({ status: 200, message: "user not found" });
      }

      const newHolding = { ticker: id, quantity, price: currentPrice };
      const amountToSubtract = Number(currentPrice) * quantity;

      // Return bad request if insufficient funds in account
      if (user.balance < amountToSubtract) {
        return res
          .status(400)
          .json({ status: 400, message: "Insufficient funds" });
      }

      // Update user holdings and balance
      const update = await this.userCollection.updateOne(
        { sub: auth },
        {
          $inc: { balance: -amountToSubtract },
          $push: { holdings: newHolding },
        },
      );

      // Handle database errors
      if (update.matchedCount === 0 || update.modifiedCount === 0) {
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
  }
  async sell(req: Request, res: Response) {
    const auth = req.auth?.payload.sub; // User ID
    const { id } = req.params; // ticker symbol

    // number of shares
    const { quantity } = req.body;

    if (!id || quantity <= 0) {
      return res.status(400).json({
        status: 400,
        data: req.body,
        params: id,
        message: "missing data",
      });
    }
    try {
      // fetch current price
      const currentPrice = await getPrice(id);

      // check if user exists
      const user = await this.userCollection.findOne({ sub: auth });
      if (!user) {
        return res.status(404).json({ status: 200, message: "user not found" });
      }

      const newTransaction = {
        ticker: id,
        quantity: -quantity,
        price: currentPrice,
      };
      const amountToSubtract = +currentPrice * quantity;

      // update user balance and holdings
      const update = await this.userCollection.updateOne(
        { sub: auth },
        {
          $inc: { balance: amountToSubtract },
          $push: { holdings: newTransaction },
        },
      );

      // handle database errors
      if (update.matchedCount === 0 || update.modifiedCount === 0) {
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
  }
}

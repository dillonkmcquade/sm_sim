"use strict";
import { Response, Request } from "express";
import { collections, redisClient } from "../services/database.service";
import { Ticker } from "../types";

export const queryTickerByName = async (req: Request, res: Response) => {
  const { name } = req.query;
  if (!name) {
    return res
      .status(400)
      .json({ status: 400, message: "No query string given" });
  }
  const { tickers } = collections;
  try {
    const agg = [
      {
        $search: {
          index: "tickers",
          autocomplete: {
            query: name,
            path: "symbol",
          },
        },
      },
      { $limit: 10 },
      { $project: { symbol: 1, description: 1 } },
    ];
    let data = await tickers?.aggregate<Ticker>(agg).toArray();
    if (data?.length === 0) {
      data = await tickers
        ?.aggregate<Ticker>([
          {
            $search: {
              index: "tickers",
              autocomplete: {
                query: name,
                path: "description",
              },
            },
          },
          { $limit: 10 },
          { $project: { symbol: 1, description: 1 } },
        ])
        .toArray();
    }
    if (data?.length === 0) {
      return res.status(400).json({ status: 400, message: "Not found" });
    }
    await redisClient.set(req.url, JSON.stringify(data));
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

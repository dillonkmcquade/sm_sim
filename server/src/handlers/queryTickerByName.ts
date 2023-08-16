/*
 * GET /search?name={}
 *
 * Returns a search results based on user input
 *
 * 200:
 *  Response {
 *   status      number
 *   data      Result[]  // see front-end types.d.ts for interface
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
    // MongoDB search index allows us to query documents by matching user input
    // Try querying by symbol first
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

    // Try querying by description if no results found
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

    // return not found if no results
    if (data?.length === 0) {
      return res.status(404).json({ status: 404, message: "Not found" });
    }

    // cache results
    await redisClient.set(req.url, JSON.stringify(data));

    // return data
    return res.status(200).json({
      status: 200,
      data,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Server error" });
  }
};

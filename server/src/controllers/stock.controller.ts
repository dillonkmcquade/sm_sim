import { Collection } from "mongodb";
import { Ticker } from "../types";
import { Request, Response } from "express";
import { redis } from "../index";

export class StockController {
  constructor(
    private readonly tickersCollection: Collection<Ticker>,
    private readonly cache: typeof redis,
  ) {}

  async candle(req: Request, res: Response) {
    const { ticker } = req.params; // ticker symbol
    const { resolution, from } = req.query;
    if (!ticker) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing ticker id" });
    }
    try {
      const request = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${ticker}&resolution=${resolution}&from=${from}&to=${Math.floor(
          Date.now() / 1000,
        )}&token=${process.env.FINNHUB_KEY}`,
      );
      const data = await request.json();

      // return data if response contains actual data, sometimes it returns no_data even with 200 response
      if (data["c"]) {
        await this.cache.set(req.url, JSON.stringify(data), { EX: 180 });
        return res.status(200).json({ status: 200, data });
      } else {
        return res.status(400).json({
          status: 400,
          message: "Failed request, possibly incorrect ticker symbol",
        });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }

  async news(req: Request, res: Response) {
    const { ticker } = req.params; // ticker symbol
    if (!ticker) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing ticker id" });
    }
    try {
      const request = await fetch(
        `https://api.polygon.io/v2/reference/news?ticker=${ticker}&apiKey=${process.env.POLYGON_KEY}`,
      );
      const data = await request.json();

      // Check that our request returned data
      if (!data.results) {
        return res.status(404).json({
          status: 404,
          message: "Failed request, possibly incorrect ticker symbol",
        });
      }

      // store results in cache
      await this.cache.set(req.url, JSON.stringify(data));

      // return data
      return res.status(200).json({ status: 200, data });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }
  async quote(req: Request, res: Response) {
    const { ticker } = req.params; // Ticker symbol
    if (!ticker) {
      return res
        .status(400)
        .json({ status: 400, message: "Missing ticker id" });
    }
    try {
      const request = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_KEY}`,
      );
      const data = await request.json();

      // Check that our request returned useable data
      if (!data["c"]) {
        return res.status(404).json({
          status: 404,
          message: "Failed request, possibly incorrect ticker symbol",
        });
      }

      // store results in cache
      await this.cache.set(req.url, JSON.stringify(data), { EX: 60 });

      // Return data
      return res.status(200).json({ status: 200, data });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }
  async search(req: Request, res: Response) {
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ status: 400, message: "No query string given" });
    }
    try {
      // MongoDB search index allows us to query documents by matching user input
      // Try querying by symbol first
      let data = await this.tickersCollection
        .aggregate([
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
        ])
        .toArray();

      // Try querying by description if no results found
      if (data.length === 0) {
        data = await this.tickersCollection
          .aggregate([
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
      if (data.length === 0) {
        return res.status(404).json({ status: 404, message: "Not found" });
      }

      // cache results
      await this.cache.set(req.url, JSON.stringify(data));

      // return data
      return res.status(200).json({
        status: 200,
        data,
      });
    } catch (error) {
      return res.status(500).json({ status: 500, message: "Server error" });
    }
  }
}

import "dotenv/config";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import userRouter from "./routes/user";
import transactionRouter from "./routes/transaction";
import stockRouter from "./routes/stock";

import { MongoClient } from "mongodb";
import { createClient } from "redis";

import { StockController } from "./controllers/stock.controller";
import { UserController } from "./controllers/user.controller";
import { TransactionController } from "./controllers/transaction.controller";

if (
  !process.env.REDIS_CLIENT ||
  !process.env.DB_CONN_STRING ||
  !process.env.DB_NAME
) {
  console.log("Missing environment variables");
  process.exit(1);
}
export const client = new MongoClient(process.env.DB_CONN_STRING);
const db = client.db(process.env.DB_NAME);
export const redis = createClient({
  url: process.env.REDIS_CLIENT,
});

(async () => {
  await redis.connect();
  await client.connect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

export const stockController = new StockController(
  db.collection("tickers"),
  redis,
);
export const userController = new UserController(db.collection("users"));
export const transactionController = new TransactionController(
  db.collection("users"),
);

// Server
const server = express();
const PORT = process.env.PORT || 3001;

server
  .use(express.json())
  .use(helmet())
  .use(morgan("dev"))
  .use(cors({ origin: process.env.ALLOWED_ORIGIN }))
  .use("/stock", stockRouter)

  //Auth required
  .use("/user", userRouter)
  .use("/transaction", transactionRouter)

  .get("*", (_req, res) => {
    return res.send("<h1>Does not exist</h1>");
  });

const app = server.listen(PORT, () => {
  console.log("Listening on port %d", PORT);
});

process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  setTimeout(() => {
    app.close(() => {
      process.exit();
    });
  }, 5000);
});

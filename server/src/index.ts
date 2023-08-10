import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";

import { connectToDatabase } from "./services/database.service";
import { queryTickerByName } from "./handlers/queryTickerByName";

import userRouter from "./routes/user";
import transactionRouter from "./routes/transaction";
import stockRouter from "./routes/stock";
import { checkCache } from "./middleware";

dotenv.config();

const server = express();
const PORT = process.env.PORT || 3001;

connectToDatabase()
  .then(() => {
    server
      .use(express.json())
      .use(helmet())
      .use(morgan("dev"))
      .use(cors({ origin: process.env.ALLOWED_ORIGIN }))
      .use("/stock", stockRouter)

      //Auth required
      .use("/user", userRouter)
      .use("/transaction", transactionRouter)

      .get("/search", checkCache, queryTickerByName)
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
  })
  .catch((error: Error) => {
    console.error("Database connection failed", error);
    process.exit(1);
  });

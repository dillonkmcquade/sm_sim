import { MongoClient, Collection, Db } from "mongodb";
import dotenv from "dotenv";
import { User, Ticker } from "../types";
import { createClient } from "redis";

export const collections: {
  users?: Collection<User>;
  tickers?: Collection<Ticker>;
} = {};

export const redisClient = createClient();

export async function connectToDatabase() {
  dotenv.config();

  //redis
  await redisClient.connect();

  //Mongo client url cannot be undefined, check before using
  let DB_STRING: string;
  if (process.env.DB_CONN_STRING) {
    DB_STRING = process.env.DB_CONN_STRING;
  } else {
    throw new Error("DB_CONN_STRING does not exist");
  }

  const client: MongoClient = new MongoClient(DB_STRING);

  await client.connect();

  const db: Db = client.db(process.env.DB_NAME);

  const userCollection: Collection<User> = db.collection("users");

  const tickerCollection: Collection<Ticker> = db.collection("tickers");

  collections.users = userCollection;
  collections.tickers = tickerCollection;

  console.log(`Successfully connected to database: ${db.databaseName}`);
}

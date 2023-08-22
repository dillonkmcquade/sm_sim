/*
 *
 * Connect to database and redis client, export collections to be used in db queries
 *
 */

import { MongoClient, Collection, Db } from "mongodb";
import { User, Ticker } from "../types";
import { createClient } from "redis";

export const collections: {
  users?: Collection<User>;
  tickers?: Collection<Ticker>;
} = {};

export const redisClient = createClient({ url: process.env.REDIS_CLIENT });

export async function connectToDatabase() {
  //redis
  await redisClient.connect();

  //Mongo client url cannot be undefined, check before using
  let DB_STRING: string;
  if (process.env.DB_CONN_STRING) {
    DB_STRING = process.env.DB_CONN_STRING;
  } else {
    throw new Error("DB_CONN_STRING does not exist");
  }

  // Create and connect to mongo
  const client: MongoClient = new MongoClient(DB_STRING);
  await client.connect();
  const db: Db = client.db(process.env.DB_NAME);

  // store collections in exported collections object
  const userCollection: Collection<User> = db.collection("users");
  const tickerCollection: Collection<Ticker> = db.collection("tickers");
  collections.users = userCollection;
  collections.tickers = tickerCollection;

  console.log(`Successfully connected to database: ${db.databaseName}`);
}

import "dotenv/config";
import { client } from "../index";
import { Ticker } from "../types";
const batchImport = async () => {
  let data;
  await client.connect();
  const tickers = client.db(process.env.DB_NAME).collection<Ticker>("tickers");
  try {
    const fetchTickers = await fetch(
      `https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${process.env.FINNHUB_KEY}`,
    );
    data = await fetchTickers.json();
    if (!data) {
      return;
    }
    const insertTickers = await tickers.insertMany(data);
    if (insertTickers.insertedCount === 0) {
      console.error(insertTickers);
      return;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
  } finally {
    await client.close();
  }
};

batchImport();

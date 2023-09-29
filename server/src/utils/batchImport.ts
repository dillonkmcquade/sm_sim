import "dotenv/config";
import { collections } from "../services/database.service";
const batchImport = async () => {
  let data;
  try {
    const { tickers } = collections;
    if (!tickers) return;
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
  }
};

batchImport();

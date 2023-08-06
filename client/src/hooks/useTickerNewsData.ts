//Fetch news related to specified ticker symbol

import { useEffect, useState } from "react";

export default function useTickerNewsData(ticker: string) {
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  const [news, setNews] = useState<any[] | null>(null);

  useEffect(() => {
    async function getTickerData() {
      setIsLoadingNews(true);
      try {
        const request = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/stock/news/${ticker}`,
        );
        const response = await request.json();
        if (response.data.results) {
          setNews(response["data"].results);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(err);
        }
        setIsLoadingNews(false);
      } finally {
        setIsLoadingNews(false);
      }
    }
    if (!news) {
      getTickerData();
    }
  }, [news, ticker]);
  return { news, isLoadingNews };
}

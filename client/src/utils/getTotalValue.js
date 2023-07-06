export const getInvestedValue = (currentUser) => {
  const investedValue = currentUser.holdings.reduce(
    (accumulator, currentValue) => {
      return accumulator + Number(currentValue.quantity) * currentValue.price;
    },
    0
  );
  return investedValue;
};

const getPrices = async (user) => {
  const uniques = {};
  user.holdings.forEach((holding) => {
    if (!uniques[holding.ticker]) {
      uniques[holding.ticker] = 0;
    }
  });
  const keys = Object.keys(uniques);
  const { REACT_APP_FINNHUB_KEY } = process.env;
  try {
    for await (const key of keys) {
      const response = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${key}&token=${REACT_APP_FINNHUB_KEY}`
      );
      const parsed = await response.json();
      uniques[key] = parsed.c;
    }
  } catch (err) {
    console.error(err.message);
  }
  return uniques;
};

export async function getTotalValue(user) {
  const prices = await getPrices(user);

  return user.holdings.reduce((accumulator, currentValue) => {
    return (
      accumulator + Number(currentValue.quantity) * prices[currentValue.ticker]
    );
  }, 0);
}

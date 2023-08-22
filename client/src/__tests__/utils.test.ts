import { getUniques, getInvestedValue, getTotalValue } from "../utils/utils";

const holdings = [
  { ticker: "BRK.A", quantity: 1, price: 523500 },
  { ticker: "TSLA", quantity: 1000, price: 290.38 },
  { ticker: "TSLA", quantity: 1, price: 288.39 },
  { ticker: "AAPL", quantity: 1, price: 193.47 },
  { ticker: "BRK.A", quantity: -1, price: 523500 },
];
const holdings1 = [
  { ticker: "BRK.A", quantity: 1, price: 523500 },
  { ticker: "TSLA", quantity: 1000, price: 290.38 },
  { ticker: "TSLA", quantity: 1, price: 288.39 },
  { ticker: "AAPL", quantity: 1, price: 193.47 },
  { ticker: "BRK.A", quantity: -1, price: 523500 },
  { ticker: "BRK.A", quantity: -1, price: 523500 },
];
const holdings3 = [
  { ticker: "BRK.A", quantity: 1, price: 523500 },
  { ticker: "BRK.A", quantity: -1, price: 523500 },
];

describe("testing getUniques", () => {
  test("testing for quantities === 0", () => {
    const expected = new Map([
      ["TSLA", 1001],
      ["AAPL", 1],
    ]);
    expect(getUniques(holdings)).toEqual(expected);
  });
  test("testing for negative quantities", () => {
    const expected = new Map([
      ["TSLA", 1001],
      ["AAPL", 1],
    ]);
    expect(getUniques(holdings1)).toEqual(expected);
  });
  test("testing for empty holdings", () => {
    expect(getUniques(holdings3)).toEqual(new Map<string, number>());
  });
});

describe("testing getInvestedValue", () => {
  test("return invested value", () => {
    expect(getInvestedValue(holdings)).toEqual(290861.86);
  });
  test("return 0", () => {
    expect(getInvestedValue(holdings3)).toEqual(0);
  });
});

describe("testing getTotalValue", () => {
  const holdings4 = [
    { ticker: "TSLA", quantity: 1000, price: 290.38 },
    { ticker: "AAPL", quantity: 1, price: 193.47 },
  ];

  const prices = new Map([
    ["TSLA", 150.0],
    ["AAPL", 100],
  ]);
  const prices2 = new Map([
    ["TSLA", 0],
    ["AAPL", 0],
  ]);
  const prices3 = new Map([
    ["TSLA", -100],
    ["AAPL", -150],
  ]);
  const prices4 = new Map([["AAPL", -150]]);

  test("should return 150100", () => {
    expect(getTotalValue(holdings4, prices)).toEqual(150100);
  });
  test("should return 0", () => {
    expect(getTotalValue(holdings4, prices2)).toEqual(0);
  });
  test("negative prices, should throw error", () => {
    expect(() => getTotalValue(holdings4, prices3)).toThrowError(
      "Missing price",
    );
  });
  test("missing price, should throw error", () => {
    expect(() => getTotalValue(holdings4, prices4)).toThrowError(
      "Missing price",
    );
  });
});

import { ObjectId } from "mongodb";
export interface User {
  _id: ObjectId;
  balance: number;
  holdings: Holding[];
  watchList: string[];
  telephone?: string;
  timestamp?: number;
  total?: number;
  sub: string;
  address?: string;
  picture: string;
  name: string;
  nickname: string;
  email: string;
  [key: string]: any;
}

export interface Holding {
  quantity: number;
  ticker: string;
  price: number;
}

export type Update = Partial<User>;

export interface Ticker {
  symbol: string;
  description: string;
}

import LineChart from "../components/LineChart";
import { styled } from "styled-components";
import useHistoricalData from "../hooks/useHistoricalData";
import { MouseEventHandler } from "react";
import { useQuote } from "../hooks/useQuote";

export default function TickerCard({ handler, ticker}: {ticker: string; handler: MouseEventHandler}) {
  const { data } = useHistoricalData(ticker);
  const {quote} = useQuote(ticker);
  return (
    quote &&
    data && (
      <Wrapper onClick={handler}>
        <Title>{ticker}</Title>
        <Price color={quote.d > 0 ? "#027326" : "#e80e19"}>${quote.c}</Price>
        <LineChart small={true} id={ticker} data={data} />
      </Wrapper>
    )
  );
}

const Wrapper = styled.div`
  height: 35vh;
  width: 80vw;
  min-width: 80vw;
  padding: 1rem 1rem 4rem 1rem;
  border: 2px solid white;
  border-radius: 1rem;
  cursor: pointer;
  margin: 1rem 2rem 1rem 0;
  color: black;
  max-width: 350px;
  @media (min-width: 500px) {
    min-width: 350px;
  }
`;

const Title = styled.h1`
  font-size: 1.1rem;
  color: white;
`;
const Price = styled.p`
  color: ${(props) => props.color};
`;

import { useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "styled-components";

import { CircularProgress } from "@mui/material";
import { IconButton } from "@mui/material";
import NewsArticle from "../components/NewsArticle";
import LineChart from "../components/LineChart";
import Button from "../components/Button";

import { WidthContext } from "../context/WidthContext";
import useHistoricalData from "../hooks/useHistoricalData";
import useQuote from "../hooks/useQuote";
import useNewsData from "../hooks/useTickerNewsData";

export default function StockDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { quote } = useQuote(id);
  const { data, loading, state, dispatch } = useHistoricalData(id);
  const { news, isLoadingNews } = useNewsData(id);
  const { width } = useContext(WidthContext);
  const { range } = state;
  const ranges = ["1D", "1W", "1M", "3M", "6M"];
  return !quote ? (
    <Wrapper>
      <CircularProgress />
    </Wrapper>
  ) : (
    <Wrapper>
      <Back onClick={() => window.history.back()}>Back</Back>
      <TickerName>{id}</TickerName>
      <CurrentPrice color={quote.d > 0 ? "#027326" : "#b5050e"}>
        {quote.c.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
        <SecondaryText>
          {quote.d.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
          (%{quote.dp})
        </SecondaryText>
      </CurrentPrice>
      <div style={{ height: "60vh", color: "black" }}>
        {loading || !data ? (
          <CircularProgress />
        ) : (
          <LineChart id={id} data={data} />
        )}
      </div>
      <RangeToggle>
        {ranges.map((rangeType) => (
          <RangeOption
            className={range === rangeType && "active"}
            onClick={() => dispatch({ type: rangeType })}
          >
            {rangeType}
          </RangeOption>
        ))}
      </RangeToggle>
      <ButtonContainer width={width}>
        <Button
          bradius="4px"
          handler={() => navigate(`/transaction/buy/${id}`)}
        >
          Buy
        </Button>
        <Button
          bg="black"
          hovercolor="black"
          color="white"
          hoverbg="white"
          bradius="4px"
          border="1px solid white"
          handler={() => navigate(`/transaction/sell/${id}`)}
        >
          Sell
        </Button>
      </ButtonContainer>
      <NewsTitle>News from {id}</NewsTitle>
      <NewsContainer>
        {isLoadingNews ? (
          <CircularProgress />
        ) : (
          news.map((article) => (
            <NewsArticle article={article} key={article.id} />
          ))
        )}
      </NewsContainer>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  top: 56px;
  display: flex;
  flex-direction: column;
  margin-bottom: 150px;
`;
const TickerName = styled.h1`
  color: white;
  font-size: 2.2rem;
  padding: 0.5rem;
`;

const CurrentPrice = styled.h1`
  color: ${(props) => props.color};
  font-size: 1.5rem;
  margin-left: 1rem;
`;

const SecondaryText = styled.span`
  font-size: 0.75rem;
`;

const NewsContainer = styled.div``;

const NewsTitle = styled.h3`
  margin-left: 1rem;
`;

const ButtonContainer = styled.div`
  width: 100vw;
  background-color: black;
  border-top: 1px solid white;
  position: fixed;
  display: flex;
  justify-content: space-evenly;
  padding: 0.5rem;
  bottom: 0;

  @media only screen and (min-width: 500px) {
    align-self: center;
    max-width: 500px;
    position: static;
    border-top: none;
  }
`;

const RangeToggle = styled.div`
  position: relative;
  display: flex;
  width: 75vw;
  margin: 0 auto;
  justify-content: space-evenly;
`;
const RangeOption = styled.div`
  color: white;
  border-radius: 50%;
  padding: 0.5rem;
  margin: 0.5rem;
  cursor: pointer;

  &.active {
    background-color: white;
    color: black;
  }
`;

const Back = styled.p`
  text-decoration: none;
  margin: 0.3rem 0 0 0.3rem;
  color: #b48ead;
  font-size: 1.1rem;
  cursor: pointer;

  &:hover {
    color: #81a1c1;
  }
`;

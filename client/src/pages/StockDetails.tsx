import {  useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { styled } from "styled-components";

import { CircularProgress } from "@mui/material";
import { IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { VisibilityOutlined } from "@mui/icons-material";

import NewsArticle from "../components/NewsArticle";
import LineChart from "../components/LineChart";
import Button from "../components/Button";

import useHistoricalData from "../hooks/useHistoricalData";
import useQuote from "../hooks/useQuote";
import useNewsData from "../hooks/useTickerNewsData";
import { useDebounce } from "../hooks/useDebounce";
import { useAuth0 } from "@auth0/auth0-react";
import { useCurrentUser } from "../context/UserContext";
import Alert from "../components/Alert";

export default function StockDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();

  //custom hooks
  const { quote } = useQuote(id!);
  const { data, loading, state, currentDay, dispatch } = useHistoricalData(id!);
  const { news, isLoadingNews } = useNewsData(id!);

  //Context
  const { currentUser, setCurrentUser } = useCurrentUser(); 

  //state
  const { range } = state;
  const [error, setError] = useState("");
  const [isWatched, setIsWatched] = useState(() => {
    if (currentUser) {
      return currentUser.watchList.includes(id!);
    } else {
      return false;
    }
  });

  const updateWatched = async () => {
    try {
      const accessToken = await getAccessTokenSilently();
      const { REACT_APP_SERVER_URL } = process.env;
      const response = await fetch(`${REACT_APP_SERVER_URL}/user/toggleWatchList`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticker: id, isWatched }),
      });
      const parsed = await response.json();
      if (parsed.status === 200) {
        setCurrentUser({ ...currentUser, watchList: parsed.data });
        return;
      }
    } catch (error) {
      if (error instanceof Error){
        console.error(error.message);
      }
    }
  };

  const debouncedUpdateWatch = useDebounce(updateWatched, 500);
  const toggleWatched = () => {
    if (isAuthenticated) {
      setIsWatched(!isWatched);
      debouncedUpdateWatch();
    } else {
      setError("Must be logged in to use this feature");
    }
  };

  //Markets closed on weekends, so we don't show data < 1M on weekends
  const ranges =
    currentDay === 6 || currentDay === 0
      ? ["1M", "3M", "6M"]
      : ["1D", "1W", "1M", "3M", "6M"];

  const handleClick = (action: string) => {
    setError("");
    if (isAuthenticated) {
      navigate(`/transaction/${action}/${id}`);
    } else {
      setError("Must be logged in to use these features");
    }
  };

  return !quote ? (
    <Wrapper>
      <CircularProgress sx={{ color: "#027326" }} />
    </Wrapper>
  ) : (
    <Wrapper>
      <Back onClick={() => window.history.back()}>Back</Back>

      <TickerName>
        {id}
        <IconButton onClick={() => toggleWatched()}>
          {isWatched ? (
            <VisibilityIcon fontSize="small" sx={{ color: "white" }} />
          ) : (
            <VisibilityOutlined fontSize="small" sx={{ color: "white" }} />
          )}
        </IconButton>
      </TickerName>

      <CurrentPrice color={quote.d > 0 ? "#027326" : "#e80e19"}>
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

      {error && (
        <Alert severity="warning">
          {error}
        </Alert>
      )}
      <ChartWrapper>
        {!data || loading ? (
          <CircularProgress sx={{ color: "#027326" }} />
        ) : (
          <LineChart id={id!} data={data} small={false} />
        )}
      </ChartWrapper>

      <RangeToggle>
        {ranges.map((rangeType) => (
          <RangeOption
            className={range === rangeType ? "active" : ""}
            key={rangeType}
            onClick={() => dispatch({ type: rangeType })}
          >
            {rangeType}
          </RangeOption>
        ))}
      </RangeToggle>

      <ButtonContainer>
        <Button bradius="4px" handler={() => handleClick("buy")}>
          Buy
        </Button>
        <Button
          bg="black"
          hovercolor="black"
          color="white"
          hoverbg="white"
          bradius="4px"
          border="1px solid white"
          handler={() => handleClick("sell")}
        >
          Sell
        </Button>
      </ButtonContainer>

      <NewsTitle>News from {id}</NewsTitle>
      <NewsContainer>
        {isLoadingNews || !news ? (
          <CircularProgress />
        ) : (
          news.map((article: typeof news[0]) => (
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
  margin: 0 auto;
  @media (min-width: 500px) {
    max-width: 1400px;
  }
`;
const TickerName = styled.h1`
  color: white;
  font-size: 2.2rem;
  padding: 0.5rem;
`;

const CurrentPrice = styled.h1`
  color: ${(props) => props.color};
  font-size: 1.5rem;
  padding-left: 1rem;
`;

const SecondaryText = styled.span`
  font-size: 0.75rem;
`;

const NewsContainer = styled.div`
  @media (min-width: 1400px) {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
`;

const NewsTitle = styled.h3`
  padding-left: 1rem;
`;

const ButtonContainer = styled.div`
  width: 100%;
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
  width: 100%;
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

const ChartWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: black;
`;

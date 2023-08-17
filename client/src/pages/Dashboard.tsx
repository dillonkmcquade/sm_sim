import {  useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { styled } from "styled-components";
import { useNavigate } from "react-router-dom";

import { getTotalValue, getInvestedValue, getUniques } from "../utils/utils";

import PieChart from "../components/PieChart";
import TickerCard from "../components/TickerCard";
import { CircularProgress } from "@mui/material";
import { useCurrentUser } from "../context/UserContext";
import FourOhFour from "../components/FourOhFour";
import type { User } from "../types";

export default function Dashboard() {
  const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useCurrentUser(); 

  //get user object from backend
  useEffect(() => {
    async function getUser() {
      try {
        const { REACT_APP_SERVER_URL } = process.env;
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(
          `${REACT_APP_SERVER_URL}/user`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const { data } = await response.json();
        if (data?.holdings?.length === 0) return;
        const total = await getTotalValue(data?.holdings); //potentially expensive function call
        const modifiedObj: User = { ...data, total, timestamp: Date.now()  };
        setCurrentUser(modifiedObj);
      } catch (err) {
        if (err instanceof Error){
          console.error(err.message);
        }
      }
    }
    if (!isAuthenticated) {
      return;
    }

    //Currently making separate api call to get the price of each stock,
    //This could get costly if the portfolio is large. Therefore we will
    //limit this by doing it once, caching it, and updating every 15 mins
    if (!currentUser || Date.now() - Number( currentUser.timestamp! ) > 300000) {
      getUser();
    }
  }, [setCurrentUser, currentUser, user, isAuthenticated, getAccessTokenSilently]);

  const investedValue = currentUser
    ? getInvestedValue(currentUser.holdings)
    : 0;

  return !currentUser ? (
    <Wrapper>
      <CircularProgress sx={{ color: "#027326", margin: "auto" }} />
    </Wrapper>
  ) : (
    <Wrapper>
      <Title>
        {" "}
        Hello, <Name>{currentUser.nickname || currentUser.name}</Name>!
      </Title>
      <PortfolioValue>
        {Number(currentUser.total! + currentUser.balance).toLocaleString(
          "en-US",
          { style: "currency", currency: "USD" },
        )}
      </PortfolioValue>
      <Profit
        color={currentUser.total! - investedValue > 0 ? "#027326" : "#b5050e"}
      >
        {Number(currentUser.total! - investedValue).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}{" "}
        all time
      </Profit>

      <div style={{ height: "500px", color: "black" }}>
        {currentUser.holdings.length === 0 ? (
          <FourOhFour>Nothing here yet.</FourOhFour>
        ) : (
          <PieChart data={currentUser} />
        )}
      </div>
      <Title>Account Details</Title>
      <AccountDetails>
        <Detail>
          <div>Total Value of all holdings: </div>
          <p>
            <Bold>
              {currentUser.total?.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Bold>
          </p>
        </Detail>
        <Detail>
          <div>Available cash: </div>
          <p>
            <Bold>
              {currentUser.balance.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </Bold>
          </p>
        </Detail>
      </AccountDetails>
      <Title>Holdings</Title>
      <Holdings>
        {currentUser.holdings.length === 0 ? (
          <FourOhFour>Nothing here yet.</FourOhFour>
        ) : (
          [ ...getUniques(currentUser.holdings) ].map((holding) => (
            <TickerCard
              handler={() => navigate(`/research/${holding[0]}`)}
              key={holding[0]}
              ticker={holding[0]}
            />
          ))
        )}
      </Holdings>
      <Title>Watch List</Title>
      <WatchList>
        {currentUser.watchList.length > 0 ? (
          currentUser.watchList.map((item) => (
            <TickerCard
              key={item}
              ticker={item}
              handler={() => navigate(`/research/${item}`)}
            />
          ))
        ) : (
          <FourOhFour>Nothing here yet.</FourOhFour>
        )}
      </WatchList>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  top: 56px;
  width: 85vw;
  height: 100vh;
  margin: 0 auto;
  @media (min-width: 1000px) {
    max-width: 1400px;
    margin: 0 auto;
  }
`;

const Title = styled.h1``;
const PortfolioValue = styled(Title)``;

const Profit = styled.p`
  color: ${(props) => props.color};
  margin: 0 0 1rem 1rem;
`;

const Holdings = styled.div`
  display: flex;
  overflow: auto;
`;

const AccountDetails = styled.div`
  border-radius: 1rem;
  border: 2px solid white;
  margin: 1rem 0;
  padding: 0.5rem;
  color: gray;
  max-width: 500px;
`;

const Detail = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Bold = styled.span`
  font-weight: bold;
  color: #dcf5e7;
`;

const Name = styled.span`
  color: #ebcb8b;
`;

const WatchList = styled(Holdings)``;

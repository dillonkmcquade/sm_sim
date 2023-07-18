import { ChangeEvent, ChangeEventHandler, useContext, useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { WebTarget, styled } from "styled-components";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CircularProgress } from "@mui/material";

import usePurchaseReducer from "../hooks/usePurchaseReducer.js";
import useQuote from "../hooks/useQuote";
import Button from "../components/Button";
import Alert from "../components/Alert.jsx";
import { GlobalContent, Holding, UserContext } from "../context/UserContext";
import { getTotalValue } from "../utils/utils";

export default function Transaction() {
  const { id, transactionType } = useParams();
  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const {
    setLoading,
    updateQuantity,
    success,
    errorMessage,
    changeAction,
    state,
  } = usePurchaseReducer(transactionType);

  const { currentUser, setCurrentUser } = useContext(UserContext) as GlobalContent;
  const { confirmed, quantity, action, loading, error } = state;
  const { quote } = useQuote(id!);
  const [alignment, setAlignment] = useState(transactionType);
  const [shares, setShares] = useState(0);
  const { balance } = currentUser;
  const { REACT_APP_SERVER_URL } = process.env;

  useEffect(() => {
    //fetch most recent balance
    const fetchBalance = async () => {
      try {
        const accessToken = await getAccessTokenSilently();
        const response = await fetch(
          `${REACT_APP_SERVER_URL}/user/${user?.sub}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );
        const data = await response.json();
        if (data.status === 200) {
          setCurrentUser({ ...currentUser, balance: data.data?.balance });
        } else {
          return errorMessage(data.message);
        }

        const numOfShares = data.data?.holdings.reduce(
          (accumulator: number, currentValue: Holding) => {
            if (currentValue.ticker === id) {
              return accumulator + currentValue.quantity;
            } else {
              return accumulator + 0;
            }
          },
          0,
        );

        if (numOfShares >= 0) {
          setShares(numOfShares);
        }
        if (data.data?.balance <= 0) {
          errorMessage("Insufficient funds");
        }
      } catch (error: any) {
        errorMessage(error.message);
      }
    };
    if (!error) {
      fetchBalance();
    }
  }, [getAccessTokenSilently, user, id, error]);

  //toggling buy/sell buttons
  const toggleAction = (event: ChangeEvent<HTMLInputElement>, newAlignment: string) => {
    if (newAlignment === "sell" && quantity > shares) {
      updateQuantity(shares);
    }
    setAlignment(newAlignment);
    changeAction(event.target?.value);
  };

  //changing quantity via number input
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (Number( event.target.value) * quote.c  > balance) {
      errorMessage("Insufficient funds");
      return;
    } else {
      updateQuantity(event.target.value);
    }
  };

  //patch to /${action}/:id endpoint
  const submit = async () => {
    if (quantity < 1) {
      return errorMessage("Invalid quantity");
    }
    if (action === "sell" && quantity > shares) {
      return errorMessage("You cannot sell this many shares");
    }
    try {
      setLoading();
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${REACT_APP_SERVER_URL}/${action}/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify({
          _id: user?.sub, //user UUID
          quantity: Number(quantity),
          currentPrice: quote.c,
        }),
      });
      const parsed = await response.json();
      if (parsed.status === 200) {
        const newTotal = await getTotalValue(parsed.holdings);
        const newUserObj = {
          ...currentUser,
          holdings: parsed.holdings,
          balance: parsed.balance,
          total: newTotal,
        };
        setCurrentUser(newUserObj);
        success();
        setTimeout(() => {
          navigate(`/dashboard`);
        }, 1000);
      }
    } catch (error: any) {
      errorMessage(error.message);
    }
  };

  return !quote || !currentUser ? (
    <CircularProgress sx={{ color: "#027326" }} />
  ) : (
    <Wrapper>
      <Back to={`/research/${id}`}>Back</Back>
      <h3>
        Available to trade:{" "}
        {balance.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        })}
      </h3>
      <p>Chosen share: {id}</p>
      <label htmlFor="qty">Please select number of shares</label>
      <QtySelect
        value={quantity}
        type="number"
        id="qty"
        min={1}
        max={action === "sell" ? shares : undefined}
        onChange={handleChange}
      />
      <ToggleButtonGroup
        color="secondary"
        value={alignment}
        exclusive
        sx={{ margin: "1rem 0" }}
        onChange={toggleAction}
        aria-label="Platform"
      >
        <BuyOrSell selectedcolor="#32a842" value="buy">
          Buy
        </BuyOrSell>
        <BuyOrSell selectedcolor="#d63c44" value="sell">
          Sell
        </BuyOrSell>
      </ToggleButtonGroup>
      <TransactionDetails>
        <h3>
          <Bold>Details</Bold>
        </h3>
        <hr />
        <Detail>
          <div>Max # of shares to sell:</div>
          <div>
            <Bold>{shares}</Bold>
          </div>
        </Detail>
        <Detail>
          <div>Actual price:</div>
          <div>
            <Bold>${Number(quote.c).toFixed(5)}</Bold>
          </div>
        </Detail>
        <Detail>
          <div>Total:</div>
          <div>
            <Bold>${(quantity * quote.c).toFixed(5)}</Bold>
          </div>
        </Detail>
      </TransactionDetails>
      <Button
        disabled={
          loading ||
          confirmed ||
          balance <= 0 ||
          (action === "sell" && shares === 0)
        }
        bradius="0"
        bg={loading ? " #5c5c63" : undefined}
        handler={submit}
      >
        {loading ? (
          <CircularProgress sx={{ color: "#027326" }} />
        ) : (
          "Confirm Transaction"
        )}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
      {confirmed && <Alert severity="success">Transaction Confirmed</Alert>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  position: relative;
  top: 56px;
  display: flex;
  flex-direction: column;
  padding: 5vw;
  @media (min-width: 500px) {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 5vw;
  }
`;

const BuyOrSell = styled(ToggleButton)`
  &.MuiButtonBase-root {
    color: white;
    border: 1px solid white;
  }
  &.MuiButtonBase-root.Mui-selected {
    color: ${(props) => props.selectedcolor ? props.selectedcolor : "green"};
    background-color: #1b111c;
  }
`;

const Detail = styled.div`
  display: flex;
  justify-content: space-between;
`;
const QtySelect = styled.input`
  margin: 1rem 0;
  max-width: 15vw;
`;

const TransactionDetails = styled.div`
  border-radius: 1rem;
  border: 1px solid gray;
  margin: 1rem 0;
  padding: 0.5rem;
  color: gray;
  max-width: 500px;
`;

const Bold = styled.span`
  font-weight: bold;
  color: #dcf5e7;
`;

const Back = styled(Link)`
  text-decoration: none;
  margin: 0.3rem 0 0 0.3rem;
  color: #b48ead;
  font-size: 1.1rem;

  &:hover {
    color: #81a1c1;
  }
`;
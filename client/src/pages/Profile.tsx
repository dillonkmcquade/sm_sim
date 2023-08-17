import { FormEventHandler , useState } from "react";
import { styled } from "styled-components";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { CircularProgress } from "@mui/material";
import { useAuth0 } from "@auth0/auth0-react";

import useProfileReducer from "../hooks/useProfileReducer";
import Alert from "../components/Alert";
import {useCurrentUser} from "../context/UserContext";

export default function Profile() {
  const { getAccessTokenSilently, logout } = useAuth0();
  const { setLoading, success, errorMessage, dispatch, state } =
    useProfileReducer();
  const { formData, confirmed, error, loading } = state;
  const { currentUser } = useCurrentUser(); 
  const [open, setOpen] = useState(false);
  const { REACT_APP_SERVER_URL } = process.env;

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    try {
      setLoading();
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(
        `${REACT_APP_SERVER_URL}/user/update`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        },
      );
      const { status } = await response.json();
      if (status === 200) {
        const newUser = {...currentUser, ...formData};
        return success(newUser);
      } else {
        errorMessage("Nothing to change");
      }
    } catch (error) {
      if (error instanceof Error) {
        errorMessage(error.message);
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: "field",
      field: "formData",
      payload: { ...formData, [event.target.id]: event.target.value },
    });
  };

  const handleDeactivate = async () => {
    try {
      setLoading();
      const accessToken = await getAccessTokenSilently();
      const response = await fetch(`${REACT_APP_SERVER_URL}/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ _id: currentUser?.sub }),
      });
      const data = await response.json();
      if (data.status === 200) {
        window.sessionStorage.clear();
        return logout({ logoutParams: { returnTo: "http://localhost:3000" } });
      } else {
        errorMessage(data.message);
      }
    } catch (error: any) {
      errorMessage(error.message);
    }
  };

  return (
    currentUser && (
      <Wrapper>
        <Head>
          <ProfilePhoto src={currentUser.picture} />
        </Head>
        <ProfileDetails onSubmit={handleSubmit}>
          <UnstyledFieldSet>
            <NameField>
              <label htmlFor="name">Full Name: </label>
              <input
                type="text"
                id="name"
                defaultValue={currentUser.name}
                onChange={handleChange}
              />
            </NameField>
            <NickNameField>
              <label htmlFor="nickname">Nickname: </label>
              <input
                type="text"
                id="nickname"
                defaultValue={currentUser.nickname}
                onChange={handleChange}
              />
            </NickNameField>
            <EmailField>
              <label htmlFor="email">Email: </label>
              <input
                type="email"
                id="email"
                required
                placeholder="yourEmail@email.com"
                defaultValue={currentUser.email}
                onChange={handleChange}
              />
            </EmailField>
            <EmailField>
              <label htmlFor="address">Address: </label>
              <input
                type="address"
                id="address"
                placeholder="81 Address Rd."
                defaultValue={currentUser.address}
                onChange={handleChange}
              />
            </EmailField>
            <EmailField>
              <label htmlFor="phone">Phone: </label>
              <input
                type="tel"
                id="telephone"
                placeholder="Ex. 860-575-1337"
                defaultValue={currentUser.telephone}
                onChange={handleChange}
              />
            </EmailField>
          </UnstyledFieldSet>
          <ButtonContainer>
            <Button
              variant="outlined"
              disabled={
                loading || confirmed || Object.keys(formData).length === 0
              }
              color={loading ? "secondary" : "success"}
              type="submit"
              sx={{
                "&.Mui-disabled": {
                  color: "#c0c0c0",
                },
              }}
            >
              {loading ? (
                <CircularProgress sx={{ color: "#027326" }} />
              ) : confirmed ? (
                "Saved"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpen(!open)}
            >
              Delete Account
            </Button>
          </ButtonContainer>
          <Dialog open={open} onClose={logout}>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete your account? All of your watch
                lists, holdings, and account balance will be deleted.
              </DialogContentText>
              <DialogContentText color="error">
                {error && error}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button color="error" onClick={handleDeactivate}>
                Delete account
              </Button>
              <Button color="success" onClick={() => setOpen(!open)}>
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
        </ProfileDetails>
        {error && <Alert severity="error">{error}</Alert>}
      </Wrapper>
    )
  );
}

const Wrapper = styled.div`
  position: relative;
  top: 56px;
  width: 85vw;
  margin: 0 auto;
  @media (min-width: 500px) {
    max-width: 400px;
  }
`;

const ProfilePhoto = styled.img`
  width: 50px;
  height: 50px;
  overflow: hidden;
  object-fit: cover;
  border-radius: 50%;
`;

const Head = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

const ProfileDetails = styled.form``;
const UnstyledFieldSet = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
`;

const NameField = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 1rem 0;
`;
const NickNameField = styled(NameField)``;
const EmailField = styled(NameField)``;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
`;

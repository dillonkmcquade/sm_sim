import { ReactNode } from "react";
import { AlertColor, Alert as AlertComponent } from "@mui/material";
import { styled } from "styled-components";
export default function Alert({ severity, children }: {severity: AlertColor, children: ReactNode}) {
  return (
    <MyAlert
      severity={severity}
      sx={{
        backgroundColor:
          severity === "success" ? "rgb(12, 19, 13)" : "rgb(22, 11, 11)",
      }}
    >
      {children}
    </MyAlert>
  );
}

const MyAlert = styled(AlertComponent)`
  margin: 1rem 0;
  width: 100%;

  @media (min-width: 500px) {
    max-width: 500px;
  }
`;

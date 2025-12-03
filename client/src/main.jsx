import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import GridBackground from "./components/ui/GridBackground.jsx";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { CurrencyProvider } from "./context/CurrencyContext.jsx";

const client = new ApolloClient({
  link: new HttpLink({
    uri: import.meta.env.VITE_NODE_ENV === "development" ? "http://localhost:4000/graphql" : "/graphql",
    credentials: "include",
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GridBackground>
        <ApolloProvider client={client}>
          <CurrencyProvider>
            <App />
          </CurrencyProvider>
        </ApolloProvider>
      </GridBackground>
    </BrowserRouter>
  </StrictMode>
);

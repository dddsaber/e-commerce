import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { store } from "./redux/store.ts";
import { Provider } from "react-redux";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const client_id =
  "179484103892-mhua62t4t7npopts10vp8rfm31887tlj.apps.googleusercontent.com";

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={client_id}>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </GoogleOAuthProvider>
);

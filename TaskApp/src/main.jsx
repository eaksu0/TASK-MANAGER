// Uygulamanın giriş noktası: Router + Context'ler burada sarılır
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { TasksProvider } from "./context/TasksContext.jsx";
import { UsersProvider } from "./context/UsersContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MailProvider } from "./context/MailContext.jsx";
import "./index.css";
import "./App.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UsersProvider>
        <AuthProvider>
          <TasksProvider>
            <MailProvider>
              <App />
            </MailProvider>
          </TasksProvider>
        </AuthProvider>
      </UsersProvider>
    </BrowserRouter>
  </React.StrictMode>
);

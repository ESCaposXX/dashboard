import React, { useState } from "react";
import Dashboard from "./Dashboard";
import AuthForm from "./AuthForm";
import "./styles.css";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div>
      {isLoggedIn ? (
        <Dashboard onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <AuthForm onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  );
};

export default App;

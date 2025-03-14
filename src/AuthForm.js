import React, { useState } from "react";
import "./AuthForm.css"; // Import CSS souboru
import logo from "./logo_off.png";
import logo1 from "./aiviro.png";

const AuthForm = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validace emailu a hesla
    if (!validateEmail(email)) {
      setEmailError("Prosím zadejte platnou emailovou adresu.");
      return;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("Heslo musí mít alespoň 6 znaků.");
      return;
    } else {
      setPasswordError("");
    }

    onLogin(); // Simulace přihlášení
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <img src={logo} alt="Logo" className="auth-logo" />
        <img src={logo1} alt="Logo" className="auth-logo" />
        <h2>{isRegistering ? "Registrace" : "Přihlášení"}</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            className="auth-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {emailError && <span className="error-text">{emailError}</span>}

          <input
            type="password"
            className="auth-input"
            placeholder="Heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {passwordError && <span className="error-text">{passwordError}</span>}

          <button type="submit" className="auth-button">
            {isRegistering ? "Registrovat" : "Přihlásit se"}
          </button>
        </form>
        <p
          onClick={() => setIsRegistering(!isRegistering)}
          className="toggle-form"
        >
          {isRegistering
            ? "Máte účet? Přihlaste se"
            : "Nemáte účet? Registrujte se"}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;

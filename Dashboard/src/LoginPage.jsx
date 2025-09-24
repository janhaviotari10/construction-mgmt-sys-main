import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css"; // Ensure this file is in the same directory

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username === "admin" && credentials.password === "admin123") {
      navigate("/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  };

  const handleHomeClick = () => {
    navigate("/"); // Redirect to home page
  };

  return (
    <div className="login-div">
      <div className="login-container">
        {/* Home Icon */}
        <div className="home-icon" onClick={handleHomeClick}>
          <i className="fas fa-home"></i>
        </div>
        <div className="login-box">
          <div className="login-left">
            <h1 className="login-title">Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username" className="form-label">Username:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="login-button">Login</button>
            </form>
          </div>
          <div className="login-right"></div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

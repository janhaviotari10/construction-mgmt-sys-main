import React from "react";
import "./NavBarExpense.css";

function NavBarExpense() {
  return (
    <nav className="navbar-expense">
      <h1 className="navbar-title-expense">Expense</h1>
      <div className="navbar-links-expense">
        <a href="#" className="navbar-link-expense">Expense</a>
        <a href="/home" className="navbar-link-expense">Home</a>
        <a href="/dashboard" className="navbar-link-expense">Dashboard</a>
      </div>
    </nav>
  );
}

export default NavBarExpense;

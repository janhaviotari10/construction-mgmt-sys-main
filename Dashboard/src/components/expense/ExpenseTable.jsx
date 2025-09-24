import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ExpenseTable.css";

function ExpenseTable() {
  const [rows, setRows] = useState([]);
  const [errorMessage, setErrorMessage] = useState(""); // For error messages
  const [successMessage, setSuccessMessage] = useState(""); // For success messages

  // Fetch expenses from the backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/expenses")
      .then((response) => {
        if (response.data && response.data.length > 0) {
          setRows(response.data);
        } else {
          setRows([]);
        }
        setErrorMessage("");
      })
      .catch((error) =>
        handleError(error, "Failed to fetch expenses. Please try again.")
      );
  }, []);

  // Handle errors
  const handleError = (error, defaultMsg) => {
    const msg = error.response?.data?.error || defaultMsg;
    setErrorMessage(msg);
    setSuccessMessage(""); // Clear success messages on error
    console.error(msg);
  };

  // Add a new empty row
  const addRow = () => {
    setRows([
      ...rows,
      {
        id: null,
        date: "",
        particulars: "",
        receipt: "",
        paidBy: "",
        through: "",
      },
    ]);
    setErrorMessage("");
    setSuccessMessage("New row added. Fill in the details and save.");
  };

  // Save all expenses to the database
  const saveChanges = () => {
    const unsavedRows = rows.filter((row) => row.id === null);

    // Validate the unsaved rows
    const invalidRows = unsavedRows.filter(
      (row) =>
        !row.date ||
        !row.particulars ||
        !row.receipt ||
        !row.paidBy ||
        !row.through
    );

    if (invalidRows.length > 0) {
      setErrorMessage("Please fill in all required fields before saving.");
      return;
    }

    if (unsavedRows.length === 0) {
      setErrorMessage("No new rows to save.");
      return;
    }

    Promise.all(
      unsavedRows.map((row) =>
        axios
          .post("http://localhost:5000/api/expenses", row)
          .then((response) => {
            // Update the row with the new ID from the database
            row.id = response.data.id;
          })
          .catch((error) =>
            handleError(error, `Failed to save row: ${JSON.stringify(row)}`)
          )
      )
    )
      .then(() => {
        setSuccessMessage("Expenses saved successfully.");
        setErrorMessage("");
        setRows([...rows]); // Trigger re-render
      })
      .catch(() => {
        setErrorMessage("Failed to save some expenses. Please try again.");
      });
  };

  // Remove a row (both from UI and backend)
  const removeRow = (id) => {
    if (id === null) {
      // Remove unsaved row
      setRows(rows.filter((row) => row.id !== null));
      setSuccessMessage("Row removed.");
    } else {
      // Remove saved row from the database
      axios
        .delete(`http://localhost:5000/api/expenses/${id}`)
        .then(() => {
          setRows(rows.filter((row) => row.id !== id));
          setSuccessMessage("Expense deleted successfully.");
        })
        .catch((error) =>
          handleError(error, "Failed to delete the expense. Please try again.")
        );
    }
  };

  // Update row value
  const updateRow = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  return (
    <div className="expense-manager">
      <div className="expense-container">
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <table className="expense-table">
          <thead>
            <tr>
              <th>Sr. No</th>
              <th>Date</th>
              <th>Particulars</th>
              <th>Receipt</th>
              <th>Paid By</th>
              <th>Through</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <tr key={row.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      type="date"
                      value={row.date}
                      onChange={(e) => updateRow(index, "date", e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.particulars}
                      placeholder="Enter particulars"
                      onChange={(e) =>
                        updateRow(index, "particulars", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.receipt}
                      placeholder="Enter receipt"
                      onChange={(e) =>
                        updateRow(index, "receipt", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.paidBy}
                      placeholder="Enter payer"
                      onChange={(e) =>
                        updateRow(index, "paidBy", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.through}
                      placeholder="Enter payment method"
                      onChange={(e) =>
                        updateRow(index, "through", e.target.value)
                      }
                    />
                  </td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => removeRow(row.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No expenses added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="action-buttons">
        <button className="add-expense-button" onClick={addRow}>
          Add Expense
        </button>
        <button className="save-expense-button" onClick={saveChanges}>
          Save Expenses
        </button>
      </div>
    </div>
  );
}

export default ExpenseTable;

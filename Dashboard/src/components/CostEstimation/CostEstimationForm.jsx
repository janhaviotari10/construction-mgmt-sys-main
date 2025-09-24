import React, { useState } from "react";
import "./CostEstimation.css";

const CostEstimationForm = ({ onResult }) => {
  const [area, setArea] = useState("");
  const [floors, setFloors] = useState("");
  const [location, setLocation] = useState("Urban");
  const [quality, setQuality] = useState("Basic");
  const [constructionType, setConstructionType] = useState("Residential");
  const [approxCost, setApproxCost] = useState("");
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};

    if (!area || parseFloat(area) < 400) {
      newErrors.area = "Area must be at least 400 sq. ft.";
    }

    if (!floors || parseInt(floors) < 1) {
      newErrors.floors = "Floors must be at least 1.";
    }

    if (!approxCost || parseFloat(approxCost) <= 0) {
      newErrors.approxCost = "Approximate cost must be a positive number.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInputs()) {
      return; // Do not proceed if inputs are invalid
    }

    const payload = {
      area: parseFloat(area),
      floors: parseInt(floors),
      location,
      quality,
      construction_type: constructionType,
      approx_cost: parseFloat(approxCost),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (response.ok) {
        onResult(data.predicted_cost, data.contributions);
      } else {
        onResult(`Error: ${data.error || "An unexpected error occurred"}`, null);
      }
    
      
    } catch (error) {
      console.error("Fetch Error:", error);
      onResult(`Error: ${error.message}`, null);
    }
    
  };

  return (
    <form className="cost-estimation-form" onSubmit={handleSubmit}>
      <label>
        Area (sq. ft.):
        <input
          type="number"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          required
        />
        {errors.area && <span className="error-message">{errors.area}</span>}
      </label>

      <label>
        Floors:
        <input
          type="number"
          value={floors}
          onChange={(e) => setFloors(e.target.value)}
          required
        />
        {errors.floors && <span className="error-message">{errors.floors}</span>}
      </label>

      <label>
        Location:
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        >
          <option value="Urban">Urban</option>
          <option value="Rural">Rural</option>
        </select>
      </label>

      <label>
        Quality:
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          required
        >
          <option value="Basic">Basic</option>
          <option value="Standard">Standard</option>
          <option value="Premium">Premium</option>
        </select>
      </label>

      <label className="full-width">
        Construction Type:
        <select
          value={constructionType}
          onChange={(e) => setConstructionType(e.target.value)}
          required
        >
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Industrial">Industrial</option>
        </select>
      </label>

      <label className="full-width">
        Approximate Cost (per sq. ft.):
        <input
          type="number"
          value={approxCost}
          onChange={(e) => setApproxCost(e.target.value)}
          required
        />
        {errors.approxCost && <span className="error-message">{errors.approxCost}</span>}
      </label>

      <button type="submit">Calculate Cost</button>
    </form>
  );
};

export default CostEstimationForm;
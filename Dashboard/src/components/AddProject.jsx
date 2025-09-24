import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddProject.css";

const AddProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_name: "",
    location: "",
    project_type: "",
    sponsor: "",
    budget: "",
    project_area: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    const today = new Date().toISOString().split("T")[0];
    const namePattern = /^[a-zA-Z0-9\s]+$/; // Allow letters, numbers, spaces

    // Project Name validation
    if (!formData.project_name.trim()) newErrors.project_name = "Project Name is required";
    else if (!namePattern.test(formData.project_name)) newErrors.project_name = "Invalid characters in Project Name";

    // Location validation
    if (!formData.location.trim()) newErrors.location = "Location is required";

    // Project Type validation
    if (!formData.project_type) newErrors.project_type = "Project Type is required";

    // Sponsor validation
    if (!formData.sponsor.trim()) newErrors.sponsor = "Sponsor is required";
    else if (!namePattern.test(formData.sponsor)) newErrors.sponsor = "Invalid characters in Sponsor name";

    // Budget validation
    if (!formData.budget || formData.budget <= 0) newErrors.budget = "Budget must be greater than 0";

    // Project Area validation
    if (!formData.project_area || formData.project_area <= 0) newErrors.project_area = "Project Area must be greater than 0";

    // Start Date validation
    if (!formData.start_date) newErrors.start_date = "Start Date is required";
    else if (formData.start_date < today) newErrors.start_date = "Start Date cannot be in the past";

    // End Date validation
    if (!formData.end_date) newErrors.end_date = "End Date is required";
    else if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      newErrors.end_date = "End Date must be after Start Date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Sending data to backend
    fetch("http://localhost:5000/schedule/add_project", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message === "Project added successfully!") {
          alert("Project added successfully!");
          navigate("/schedule");
        } else {
          alert(data.message || "Error adding project");
        }
      })
      .catch(() => {
        alert("Error adding project. Please try again later.");
      });
  };

  return (
    <div className="dashboard-container-addp">
      <div className="add-project-card">
        <h2 className="dashboard-title-addp">Add New Project</h2>
        <form onSubmit={handleFormSubmit} className="dashboard-form-addp">
          <div className="form-row">
            <div className="form-group">
              <label className="dashboard-label-addp">Project Name</label>
              <input 
                type="text" 
                name="project_name" 
                value={formData.project_name} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              />
              {errors.project_name && <p className="error-message">{errors.project_name}</p>}
            </div>

            <div className="form-group">
              <label className="dashboard-label-addp">Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              />
              {errors.location && <p className="error-message">{errors.location}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="dashboard-label-addp">Project Type</label>
              <select 
                name="project_type" 
                value={formData.project_type} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              >
                <option value="">Select Project Type</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
              {errors.project_type && <p className="error-message">{errors.project_type}</p>}
            </div>

            <div className="form-group">
              <label className="dashboard-label-addp">Sponsor</label>
              <input 
                type="text" 
                name="sponsor" 
                value={formData.sponsor} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              />
              {errors.sponsor && <p className="error-message">{errors.sponsor}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="dashboard-label-addp">Budget (₹)</label>
              <input 
                type="number" 
                name="budget" 
                value={formData.budget} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
                min="1"
              />
              {errors.budget && <p className="error-message">{errors.budget}</p>}
            </div>

            <div className="form-group">
              <label className="dashboard-label-addp">Area (sq.m)</label>
              <input 
                type="number" 
                name="project_area" 
                value={formData.project_area} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
                min="1"
              />
              {errors.project_area && <p className="error-message">{errors.project_area}</p>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="dashboard-label-addp">Start Date</label>
              <input 
                type="date" 
                name="start_date" 
                value={formData.start_date} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              />
              {errors.start_date && <p className="error-message">{errors.start_date}</p>}
            </div>

            <div className="form-group">
              <label className="dashboard-label-addp">End Date</label>
              <input 
                type="date" 
                name="end_date" 
                value={formData.end_date} 
                onChange={handleInputChange}
                className="dashboard-input-addp"
              />
              {errors.end_date && <p className="error-message">{errors.end_date}</p>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/schedule")} className="secondary-button">
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProject;

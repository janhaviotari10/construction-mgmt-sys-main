import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import './editproject.css';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); // to get the project passed from the details page
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

  useEffect(() => {
    if (state?.project) {
      setFormData(state.project); // use data passed from the project details page if available
    } else {
      // fetch the project details if not passed via state
      fetch(`http://localhost:5000/project_details/${id}`)
        .then((response) => response.json())
        .then((data) => setFormData(data))
        .catch((error) => console.error("Error fetching project details:", error));
    }
  }, [id, state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
  
    // Validation: Check if end date is before start date
    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      alert("End date cannot be before start date.");
      return; // Prevent form submission
    }
  
    fetch(`http://localhost:5000/update_project/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update project");
        }
        return response.json();
      })
      .then(() => navigate(`/schedule/project/${id}`)) // redirect back to the project details page after successful update
      .catch((error) => console.error("Error updating project:", error));
  };

  return (
    <form onSubmit={handleFormSubmit} className="edit-project-form">
      <h2>Edit Project</h2>
      <label>
        Project Name:
        <input
          type="text"
          name="project_name"
          value={formData.project_name}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Location:
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleInputChange}
          required
        />
      </label>
      <label>
        Project Type:
        <input
          type="text"
          name="project_type"
          value={formData.project_type}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Client:
        <input
          type="text"
          name="sponsor"
          value={formData.sponsor}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Budget:
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Area (sq.m):
        <input
          type="number"
          name="project_area"
          value={formData.project_area}
          onChange={handleInputChange}
        />
      </label>
      <label>
        Start Date:
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleInputChange}
        />
      </label>
      <label>
        End Date:
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={handleInputChange}
        />
      </label>
      <button type="submit">Save Changes</button>
      <button type="button" onClick={() => navigate(`/schedule/project/${id}`)}>
        Cancel
      </button>
    </form>
  );
};

export default EditProject;

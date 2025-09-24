import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./projectdetails.css"; 

const ProjectDetails = () => {
  const { id } = useParams(); // Get project ID from the route
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = () => {
    setLoading(true);
    fetch(`http://localhost:5000/project_details?project=${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch project details");
        }
        return response.json();
      })
      .then((data) => {
        if (data.project_id) {
          setProject(data);
        } else {
          setError("Project not found");
        }
      })
      .catch((error) => setError("Error fetching project details"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails(); // Fetch project details on page load
    } else {
      setError("Project ID is missing");
      setLoading(false);
    }
  }, [id]);

  return (
    <div className="project-details-page">
      {loading && <p className="loading">Loading project details...</p>}
      {error && <p className="error">{error}</p>}

      {project && (
        <div className="project-card">
          <h2 className="project-title">{project.project_name}</h2>
          <div className="project-info">
            <p><strong>Location:</strong> {project.location}</p>
            <p><strong>Project Type:</strong> {project.project_type}</p>
            <p><strong>Sponsor:</strong> {project.sponsor}</p>
            <p><strong>Budget:</strong> ₹{project.budget}</p>
            <p><strong>Area:</strong> {project.project_area} sq.m</p>
            <p><strong>Start Date:</strong> {project.start_date}</p>
            <p><strong>End Date:</strong> {project.end_date}</p>
          </div>
          <div className="project-actions">
          <button
              className="status-button" // Added Project Status Button
              onClick={() => navigate(`/schedule/project-status/${id}`)}
            >
              Project Status
            </button>
            <button
              className="edit-button-j"
              onClick={() =>
                navigate(`/schedule/edit-project/${id}`, { state: { project } })
              }
            >
              Edit Project
            </button>
            <button
              className="back-button"
              onClick={() => navigate("/schedule")}
            >
              Back 
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

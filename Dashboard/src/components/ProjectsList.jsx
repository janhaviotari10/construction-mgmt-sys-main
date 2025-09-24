import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./projectlist.css"; // Import CSS for styling

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = () => {
    fetch("http://localhost:5000/projects_list")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProjects(data);
        } else {
          throw new Error(data.error || "Unexpected response format");
        }
      })
      .catch((error) => {
        console.error("Error fetching projects:", error.message);
        setError(error.message || "Failed to load projects. Please try again later.");
      });
  };

  const handleDelete = (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    fetch(`http://localhost:5000/delete_project/${projectId}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete project. Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.message === "Project deleted successfully") {
          alert("Project deleted successfully!");
          setProjects((prevProjects) => prevProjects.filter((p) => p.project_id !== projectId));
        } else {
          throw new Error(data.error || "Failed to delete project.");
        }
      })
      .catch((error) => {
        console.error("Error deleting project:", error.message);
        alert("Are you sure?");
      });
  };

  return (
    <div className="projects-container">
      {/* Navbar */}
      <nav className="navbar-project">
  <h1 className="navbar-title-project">Project List</h1>
  <div className="nav-links">
    <button className="nav-button" onClick={() => navigate("/home")}>
      Home
    </button>
    <button className="nav-button" onClick={() => navigate("/dashboard")}>
      Dashboard
    </button>
  </div>
</nav>
      {/* Page Content */}
      
      {error && <p className="error">{error}</p>}

      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.project_id} className="project-card">
            <h2>{project.project_name}</h2>
            <p><strong>Location:</strong> {project.location}</p>
            <div className="project-buttons">
              <button onClick={() => navigate(`/schedule/project/${project.project_id}`)}>
                Project Details
              </button>
              <button className="delete-button" onClick={() => handleDelete(project.project_id)}>
                Delete Project
              </button>
            </div>
          </div>
        ))}

        {/* Card for Adding a New Project */}
        <div className="project-card new-project-card">
          <h2>Add New Project</h2>
          <div className="project-buttons">
            <button onClick={() => navigate("/schedule/add_project")}>Add Project</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsList;

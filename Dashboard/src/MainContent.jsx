import { Routes, Route, useParams } from "react-router-dom";
import ProjectsList from "./components/ProjectsList";
import ProjectDetails from "./components/ProjectDetails";
import ProjectStatus from "./components/ProjectStatus";
import EditProject from "./components/EditProject";
import AddProject from "./components/AddProject";

const MainContent = () => (
  <Routes>
    <Route path="/" element={<ProjectsList />} />
    <Route path="add_project" element={<AddProject />} />
    <Route path="project/:id" element={<ProjectDetails />} />
    <Route path="edit-project/:id" element={<EditProject />} />
    <Route path="project-status/:id" element={<ProjectStatusWrapper />} />
  </Routes>
);

const ProjectStatusWrapper = () => {
  const { id: projectId } = useParams();
  return <ProjectStatus projectId={projectId} />;
};

export default MainContent;

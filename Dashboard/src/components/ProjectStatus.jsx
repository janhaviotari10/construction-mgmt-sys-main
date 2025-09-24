import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiCheck, FiTrash2, FiPlus, FiArrowLeft, FiActivity } from 'react-icons/fi';
import './projectstatus.css';

const ProjectStatus = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ task_name: '', phase: '' });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectStatus = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:5000/project_status/${projectId}`);
        setTasks(response.data.tasks);
        setCompletionPercentage(response.data.completion_percentage);
      } catch (err) {
        setError('Failed to load project data');
        console.error('Error fetching project status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectStatus();
  }, [projectId]);

  const handleTaskCompletion = async (taskId, completed) => {
    try {
      await axios.put(`http://localhost:5000/update_task/${taskId}`, { completed: !completed });
      const response = await axios.get(`http://localhost:5000/project_status/${projectId}`);
      setTasks(response.data.tasks);
      setCompletionPercentage(response.data.completion_percentage);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task completion:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.task_name.trim() || !newTask.phase.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setError(null);
      await axios.post(`http://localhost:5000/add_task`, {
        project_id: projectId,
        task_name: newTask.task_name.trim(),
        phase: newTask.phase.trim(),
      });
      const response = await axios.get(`http://localhost:5000/project_status/${projectId}`);
      setTasks(response.data.tasks);
      setCompletionPercentage(response.data.completion_percentage);
      setNewTask({ task_name: '', phase: '' });
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`http://localhost:5000/delete_task/${taskId}`);
      const response = await axios.get(`http://localhost:5000/project_status/${projectId}`);
      setTasks(response.data.tasks);
      setCompletionPercentage(response.data.completion_percentage);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
    }
  };

  const handleSave = () => {
    navigate(`/schedule/project/${projectId}`);
  };

  if (isLoading) {
    return (
      <div className="project-status-wrapper">
        <div className="project-status-container">
          <div className="status-header">
            <h2>Project Status</h2>
          </div>
          <div className="status-card loading-card">
            <div className="loading-spinner"></div>
            <p>Loading project data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-status-wrapper">
      <div className="project-status-container">
        <div className="status-header">
          <h2>Project Status</h2>
          <button className="btn back-btn" onClick={handleSave}>
            <FiArrowLeft /> Back to Project
          </button>
        </div>

        {error && (
          <div className="status-card error-card">
            <div className="error-message">
              <span className="error-icon">!</span>
              {error}
            </div>
          </div>
        )}

        <div className="status-card progress-card">
          <div className="progress-section">
            <div className="progress-percentage">
              {Math.round(completionPercentage)}%
              <span className="progress-label">Complete</span>
            </div>
            <div className="progress-details">
              <h3>Project Completion</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="status-card add-task-card">
          <h3>Add New Task</h3>
          <div className="task-form">
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter task name"
                value={newTask.task_name}
                onChange={(e) => setNewTask({ ...newTask, task_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phase</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter phase"
                value={newTask.phase}
                onChange={(e) => setNewTask({ ...newTask, phase: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label invisible-label">Action</label>
              <button className="btn btn-primary add-task-btn" onClick={handleAddTask}>
                <FiPlus /> Add Task
              </button>
            </div>
          </div>
        </div>

        <div className="status-card task-list-card">
          <div className="task-list-header">
            <h3>Task List</h3>
            <span className="task-count">{tasks.length} tasks</span>
          </div>
          
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FiActivity size={48} />
              </div>
              <p className="empty-text">No tasks yet. Add your first task above.</p>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.task_id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-info">
                    <div className="task-name">
                      {task.task_name}
                      {task.completed && <span className="completed-badge">Completed</span>}
                    </div>
                    <span className="task-phase">{task.phase}</span>
                  </div>
                  <div className="task-actions">
                    <button
                      className={`btn ${task.completed ? 'btn-secondary' : 'btn-success'}`}
                      onClick={() => handleTaskCompletion(task.task_id, task.completed)}
                    >
                      {task.completed ? <><FiCheck /> Undo</> : <><FiCheck /> Complete</>}
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDeleteTask(task.task_id)}
                      aria-label="Delete task"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatus;
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./meetings.css";

function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [meetingId, setMeetingId] = useState(null);
  const [meetingTopic, setMeetingTopic] = useState("");
  const [place, setPlace] = useState("");
  const [location, setLocation] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [meetingStatus, setMeetingStatus] = useState("Scheduled");
  const [agenda, setAgenda] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    fetchMeetings();
  }, []);

  //changes done shreya -2 april
  const fetchMeetings = () => {
    setIsLoading(true);
    axios
      .get("http://localhost:5000/meetings")
      .then((response) => {
        let updatedMeetings = response.data.map((meeting) => {
          const meetingDate = new Date(meeting.date_time);
          const now = new Date();
          
          // Auto-update status if meeting has passed
          if (meetingDate < now && meeting.status === "Scheduled") {
            return { ...meeting, status: "Completed" };
          }
          return meeting;
        });
  
        // Sort meetings by date
        updatedMeetings = updatedMeetings.sort((a, b) => new Date(a.date_time) - new Date(b.date_time));
        setMeetings(updatedMeetings);
        setApiError("");
      })
      .catch((error) => {
        console.error("Error fetching meetings:", error.response ? error.response.data : error.message);
        setApiError("Failed to load meetings. Please try again.");
      })
      .finally(() => setIsLoading(false));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!meetingTopic.trim()) newErrors.meetingTopic = "Required field";
    if (!place.trim()) newErrors.place = "Required field";
    if (!location.trim()) newErrors.location = "Required field";
    if (!dateTime) newErrors.dateTime = "Required field";
    if (!clientName.trim()) newErrors.clientName = "Required field";
    if (!agenda.trim()) newErrors.agenda = "Required field";
    
    if (!meetingId && new Date(dateTime) < new Date()) {
      newErrors.dateTime = "Meeting date must be in the future";
    }

    if (dateTime && new Date(dateTime) > new Date() && meetingStatus === "Completed") {
      newErrors.meetingStatus = "Cannot mark future meetings as Completed";
    }
    
    return newErrors;
  };

  const formatDateForServer = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const pad = num => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    const meetingData = {
      meeting_topic: meetingTopic.trim(),
      place: place.trim(),
      location: location.trim(),
      date_time: formatDateForServer(dateTime),
      client_name: clientName.trim(),
      status: meetingStatus,
      agenda: agenda.trim(),
      notes: notes.trim(),
    };

    console.log("Submitting meeting data:", meetingData);

    setIsLoading(true);
    setApiError("");

    const config = {
      headers: {
        "Content-Type": "application/json",
      }
    };

    const request = meetingId
      ? axios.put(`http://localhost:5000/meetings/${meetingId}`, meetingData, config)
      : axios.post("http://localhost:5000/meetings", meetingData, config);

    request
      .then(() => {
        fetchMeetings();
        resetForm();
      })
      .catch((error) => {
        console.error("Error response:", error.response?.data);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setApiError(error.response?.data?.message || "An error occurred. Please try again.");
        }
      })
      .finally(() => setIsLoading(false));
  };

  const handleEdit = (meeting) => {
    setMeetingId(meeting.id);
    setMeetingTopic(meeting.meeting_topic);
    setPlace(meeting.place);
    setLocation(meeting.location);
    setDateTime(meeting.date_time.slice(0, 16));
    setClientName(meeting.client_name);
    setMeetingStatus(meeting.status);
    setAgenda(meeting.agenda);
    setNotes(meeting.notes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
      setIsLoading(true);
      axios
        .delete(`http://localhost:5000/meetings/${id}`)
        .then(() => {
          fetchMeetings();
        })
        .catch((error) => {
          console.error("Error deleting meeting:", error);
          setApiError("Failed to delete meeting. Please try again.");
        })
        .finally(() => setIsLoading(false));
    }
  };

  const resetForm = () => {
    setMeetingId(null);
    setMeetingTopic("");
    setPlace("");
    setLocation("");
    setDateTime("");
    setClientName("");
    setMeetingStatus("Scheduled");
    setAgenda("");
    setNotes("");
    setErrors({});
    setApiError("");
  };

  //changes done shreya -2 april
  const filteredMeetings = meetings.filter((meeting) => {
    const now = new Date();
    const meetingDate = new Date(meeting.date_time);
    
    if (activeTab === "upcoming") {
      // Only show meetings that are in the future AND have status "Scheduled"
      return meetingDate >= now && meeting.status === "Scheduled";
    } else {
      // Only show meetings that are in the past OR have status "Completed"
      return meetingDate < now || meeting.status === "Completed";
    }
  });

  return (
    <div className="meetings-app">
      <header className="app-header">
        <Link to="/dashboard" className="dashboard-link-m">
          <i className="fas fa-home"></i>Dashboard
        </Link>
        <h1>Meetings Management</h1>
      </header>

      <main className="app-content">
        {apiError && (
          <div className="error-banner">
            <i className="fas fa-exclamation-circle"></i>
            {apiError}
          </div>
        )}

        <section className="meeting-form-section">
          <div className="form-container">
            <h2>{meetingId ? "Edit Meeting" : "Schedule New Meeting"}</h2>
            
            <form onSubmit={handleSubmit} className="meeting-form">
              <div className="form-columns">
                <div className="form-column">
                  <div className={`form-group ${errors.meetingTopic ? "has-error" : ""}`}>
                    <label>Meeting Topic*</label>
                    <input
                      type="text"
                      value={meetingTopic}
                      onChange={(e) => setMeetingTopic(e.target.value)}
                      placeholder="Enter meeting topic"
                    />
                    {errors.meetingTopic && <span className="error-message">{errors.meetingTopic}</span>}
                  </div>

                  <div className={`form-group ${errors.place ? "has-error" : ""}`}>
                    <label>Place*</label>
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => setPlace(e.target.value)}
                      placeholder="Enter meeting place"
                    />
                    {errors.place && <span className="error-message">{errors.place}</span>}
                  </div>

                  <div className={`form-group ${errors.location ? "has-error" : ""}`}>
                    <label>Location*</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter location"
                    />
                    {errors.location && <span className="error-message">{errors.location}</span>}
                  </div>
                </div>

                <div className="form-column">
                  <div className={`form-group ${errors.dateTime ? "has-error" : ""}`}>
                    <label>Date & Time*</label>
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                    />
                    {errors.dateTime && <span className="error-message">{errors.dateTime}</span>}
                  </div>

                  <div className={`form-group ${errors.clientName ? "has-error" : ""}`}>
                    <label>Client Name*</label>
                    <input
                      type="text"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Enter client name"
                    />
                    {errors.clientName && <span className="error-message">{errors.clientName}</span>}
                  </div>

                  {/* In the form columns section, update the status form group */}
<div className={`form-group ${errors.meetingStatus ? "has-error" : ""}`}>
  <label>Status</label>
  <select
    value={meetingStatus}
    onChange={(e) => setMeetingStatus(e.target.value)}
  >
    <option value="Scheduled">Scheduled</option>
    <option value="Completed">Completed</option>
  </select>
  {errors.meetingStatus && (
    <span className="error-message">{errors.meetingStatus}</span>
  )}
</div>
                </div>
              </div>

              <div className={`form-group ${errors.agenda ? "has-error" : ""}`}>
                <label>Agenda*</label>
                <input
                  type="text"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Enter meeting agenda"
                />
                {errors.agenda && <span className="error-message">{errors.agenda}</span>}
              </div>

              <div className="form-group">
                <label>Meeting Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  rows="3"
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={isLoading}>
                  {isLoading ? (
                    <span className="button-loader"></span>
                  ) : meetingId ? (
                    "Update Meeting"
                  ) : (
                    "Schedule Meeting"
                  )}
                </button>
                {meetingId && (
                  <button type="button" onClick={resetForm} className="secondary-button" disabled={isLoading}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="meetings-list-section">
          <div className="list-header">
            <h2>Your Meetings</h2>
            <div className="tabs">
              <button
                className={`tab-button ${activeTab === "upcoming" ? "active" : ""}`}
                onClick={() => setActiveTab("upcoming")}
              >
                Upcoming
              </button>
              <button
                className={`tab-button ${activeTab === "past" ? "active" : ""}`}
                onClick={() => setActiveTab("past")}
              >
                Past Meetings
              </button>
            </div>
          </div>

          {isLoading && meetings.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading meetings...</p>
            </div>
          ) : filteredMeetings.length > 0 ? (
            <div className="meetings-grid">
              {filteredMeetings.map((meeting) => (
                <div className="meeting-card" key={meeting.id}>
                  <div className="card-header">
                    <div className="meeting-title">
                      <h3>{meeting.meeting_topic}</h3>
                      <span className={`status-tag ${meeting.status.toLowerCase()}`}>
                        {meeting.status}
                      </span>
                    </div>
                    <div className="meeting-date">
                      {new Date(meeting.date_time).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="detail-row">
                      <span className="detail-label">Client:</span>
                      <span className="detail-value">{meeting.client_name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">{meeting.place}, {meeting.location}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Agenda:</span>
                      <span className="detail-value">{meeting.agenda}</span>
                    </div>
                    {meeting.notes && (
                      <div className="detail-row">
                        <span className="detail-label">Notes:</span>
                        <span className="detail-value">{meeting.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer">
                    <button
                      onClick={() => handleEdit(meeting)}
                      className="edit-button"
                      disabled={isLoading}
                    >
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(meeting.id)}
                      className="delete-button"
                      disabled={isLoading}
                    >
                      <i className="fas fa-trash"></i> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3>No {activeTab === "upcoming" ? "upcoming" : "past"} meetings</h3>
              <p>
                {activeTab === "upcoming"
                  ? "Schedule a new meeting to get started"
                  : "Completed meetings will appear here"}
              </p>
              {activeTab === "upcoming" && (
                <button onClick={resetForm} className="primary-button">
                  Schedule a Meeting
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Meetings;
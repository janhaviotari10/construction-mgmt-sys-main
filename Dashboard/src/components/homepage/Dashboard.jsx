import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaFileAlt, 
  FaCalendarAlt, 
  FaDollarSign,
  FaHardHat,
  FaBell,
  FaHandshake
} from "react-icons/fa";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DashboardNavbar from "./DashboardNavbar";
import "./Dashboard.css";

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState({
    projects: true,
    meetings: true,
    notifications: true
  });

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsRes = await fetch("http://localhost:5000/projects_list");
        const projectsData = await projectsRes.json();
        setProjects(projectsData);

        // Fetch meetings
        const meetingsRes = await fetch("http://localhost:5000/meetings");
        const meetingsData = await meetingsRes.json();
        setMeetings(meetingsData);

        // Fetch notifications
        const notifRes = await fetch("http://localhost:5000/notifications");
        const notifData = await notifRes.json();
        setNotifications(notifData);
        setUnreadNotifications(notifData.filter(n => n.status === 'Sent').length);

      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading({
          projects: false,
          meetings: false,
          notifications: false
        });
      }
    };
    fetchData();
  }, []);

  // Count ongoing projects
  // Count ongoing projects - corrected version
  const ongoingProjectsCount = projects.filter(project => {
    try {
      if (!project.end_date) return false;
      
      // Parse the date in DD-MM-YYYY format
      const [year, month, day] = project.end_date.split('-').map(Number);
      const endDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
      
      // Get current date without time component
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return endDate >= today;
    } catch (error) {
      console.error("Error parsing project end date:", project.end_date, error);
      return false;
    }
  }).length;
  
  // Count upcoming meetings (next 15 days)
  const upcomingMeetingsCount = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date_time);
    const today = new Date();
    const nextWeek = new Date(today.setDate(today.getDate() + 15));
    return meetingDate > new Date() && meetingDate <= nextWeek;
  }).length;

  // Prepare calendar events
  const calendarEvents = meetings.map(meeting => ({
    title: meeting.meeting_topic,
    start: new Date(meeting.date_time),
    end: new Date(new Date(meeting.date_time).setHours(new Date(meeting.date_time).getHours() + 1)),
    allDay: false,
    resource: {
      location: meeting.location,
      client: meeting.client_name
    }
  }));

  // Recent notifications (last 3)
  const recentNotifications = notifications.slice(0, 3);

  return (
    <div className="dashboard-container">
      <DashboardNavbar unreadCount={unreadNotifications} />
      
      {/* Header with Meeting Badge */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Construction Dashboard</h1>
        <Link to="/expense" className="meetings-badge">
          <FaBell className="icon" /> {/* This is now the bell icon */}
          <span>Meetings</span>
          {upcomingMeetingsCount > 0 && (
            <span className="count-bubble">{upcomingMeetingsCount}</span>
          )}
        </Link>
      </div>

      {/* Quick Stats Section */}
      <div className="quick-stats">
        <div className="stat-card project-stat">
          <FaHardHat className="stat-icon" />
          <h3>Ongoing Projects</h3>
          {loading.projects ? (
            <p className="loading">Loading...</p>
          ) : (
            <p>{ongoingProjectsCount}</p>
          )}
        </div>

        <div className="stat-card notification-stat">
          <div className="badge-container">
            <FaHandshake className="stat-icon" /> {/* Changed to handshake icon */}
            {/*{unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}*/}
          </div>
          <h3>Total no. of Meetings</h3>
          <p>{unreadNotifications}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Left Column - Calendar */}
        <div className="dashboard-left">
          <div className="calendar-section">
            <h2>
              <FaCalendarAlt /> Meeting Calendar
            </h2>
            <div className="calendar-container">
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                views={['month', 'week', 'day']}
                defaultView="week"
                eventPropGetter={(event) => ({
                  style: {
                    backgroundColor: '#FF6B35',
                    borderColor: '#FF6B35',
                    borderRadius: '4px'
                  }
                })}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Cards and Notifications */}
        <div className="dashboard-right">
          {/* Cards Container (now only 3 cards) */}
          <div className="cards-container">
            <Link to="/document" className="card-link">
              <div className="card document-card">
                <FaFileAlt className="card-icon" />
                <h3>Documents</h3>
                <p>Manage contracts and blueprints</p>
              </div>
            </Link>

            <Link to="/schedule" className="card-link">
              <div className="card schedule-card">
                <FaCalendarAlt className="card-icon" />
                <h3>Project Schedule</h3>
                <p>Track milestones and deadlines</p>
              </div>
            </Link>

            <Link to="/cost" className="card-link">
              <div className="card cost-card">
                <FaDollarSign className="card-icon" />
                <h3>Cost Estimation</h3>
                <p>Estimate the project cost efficiently</p>
              </div>
            </Link>
          </div>

          {/* Notifications Section (unchanged except icon) */}
          
          {/*<div className="notifications-section">
            
            {/*<div className="section-header">
              <h2>
                <FaHandshake /> Recent Alerts {/* Changed to handshake icon 
              </h2>
              
            </div>*/}
            {/*
            <div className="notifications-list">
              {recentNotifications.map(notif => (
                <div key={notif.id} className="notification-item">
                  <div className="notification-icon-wrapper">
                    <FaHandshake className="notification-icon" /> {/* Changed to handshake icon 
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notif.message}</p>
                    <div className="notification-meta">
                      <span className="notification-client">{notif.recipient}</span>
                      <span className="notification-time">
                        {new Date(notif.sent_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
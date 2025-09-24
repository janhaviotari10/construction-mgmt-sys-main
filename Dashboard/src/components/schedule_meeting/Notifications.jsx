import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiBell } from "react-icons/fi";
import "./notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = () => {
    axios
      .get("http://localhost:5000/notifications")
      .then(response => {
        const currentNotifications = response.data
          .filter(n => {
            const sentTime = new Date(n.sent_at).getTime();
            const now = Date.now();
            return now - sentTime <= 24 * 60 * 60 * 1000; // Last 24 hours
          })
          .map(n => ({
            ...n,
            meetingDateTime: new Date(`${n.meeting_date}T${n.meeting_time}`)
          }))
          // 🔥 Sort by latest meeting date & time first
          .sort((a, b) => b.meetingDateTime - a.meetingDateTime);

        setNotifications(currentNotifications);
        setUnreadCount(currentNotifications.filter(n => !n.read).length);
      })
      .catch(error => console.error("Error fetching notifications", error));
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
    markAllAsRead();
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);

    // Call API to mark notifications as read
    axios.post("http://localhost:5000/notifications/mark-read").catch(err => console.error(err));
  };

  return (
    <div className={`notification-container ${showDropdown ? "active" : ""}`}>
      <div className="notification-icon" onClick={toggleDropdown}>
        <FiBell size={24} />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {showDropdown && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>
          {notifications.length === 0 ? (
            <p>No notifications available.</p>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id} className={`notification-item ${n.read ? "read" : "unread"}`}>
                  <p>{n.message}</p>
                  {n.meeting_date && n.meeting_time && (
                    <small>
                      <strong>Meeting Date:</strong> {new Date(n.meeting_date).toLocaleDateString()}<br />
                      <strong>Time:</strong> {n.meeting_time}
                    </small>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default Notifications;

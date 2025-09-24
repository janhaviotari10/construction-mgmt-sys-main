from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Meeting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_topic = db.Column(db.String(255), nullable=False)
    place = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    date_time = db.Column(db.DateTime, nullable=False)
    client_name = db.Column(db.String(255), nullable=False)
    status = db.Column(db.String(50), default="Scheduled", nullable=False)
    agenda = db.Column(db.Text, nullable=False)
    notes = db.Column(db.Text)

    notifications = db.relationship("Notification", backref="meeting", lazy=True)

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    meeting_id = db.Column(db.Integer, db.ForeignKey("meeting.id"), nullable=False)
    notification_type = db.Column(db.String(50), nullable=False)
    recipient = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sent_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    status = db.Column(db.String(50), default="Sent", nullable=False)

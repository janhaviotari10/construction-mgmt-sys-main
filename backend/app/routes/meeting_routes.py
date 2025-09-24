from flask import Blueprint, request, jsonify
from datetime import datetime
from ..models import db, Meeting, Notification

# Define Blueprint
meeting_bp = Blueprint("meeting_bp", __name__)

# API to Create a Meeting
@meeting_bp.route("/meetings", methods=["POST"])
def create_meeting():
    data = request.json
    
    try:
        meeting_date_time = datetime.strptime(data["date_time"], "%Y-%m-%dT%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use 'YYYY-MM-DDTHH:MM'"}), 400

    new_meeting = Meeting(
        meeting_topic=data["meeting_topic"],
        place=data["place"],
        location=data["location"],
        date_time=meeting_date_time,
        client_name=data["client_name"],
        status=data.get("status", "Scheduled"),
        agenda=data["agenda"],
        notes=data.get("notes", "")
    )
    db.session.add(new_meeting)
    db.session.commit()

    # Create Notification for the Meeting
    notification = Notification(
        meeting_id=new_meeting.id,
        notification_type="Reminder",
        recipient=data["client_name"],
        message=f"Reminder: {new_meeting.meeting_topic} is scheduled at {new_meeting.place}.",
        sent_at=datetime.utcnow(),
        status="Sent"
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({"message": "Meeting Scheduled & Notification Created"}), 201

# API to Get All Meetings
@meeting_bp.route("/meetings", methods=["GET"])
def get_meetings():
    meetings = Meeting.query.all()
    return jsonify([
        {
            "id": m.id,
            "meeting_topic": m.meeting_topic,
            "place": m.place,
            "location": m.location,
            "date_time": m.date_time.isoformat(),
            "client_name": m.client_name,
            "status": m.status,
            "agenda": m.agenda,
            "notes": m.notes
        }
        for m in meetings
    ])

# API to Get All Notifications
@meeting_bp.route("/notifications", methods=["GET"])
def get_notifications():
    notifications = Notification.query.join(Meeting).add_columns(
        Notification.id,
        Notification.notification_type,
        Notification.recipient,
        Notification.message,
        Notification.sent_at,
        Notification.status,
        Meeting.date_time
    ).all()

    return jsonify([
        {
            "id": n.id,
            "notification_type": n.notification_type,
            "recipient": n.recipient,
            "message": n.message,
            "sent_at": n.sent_at.strftime("%Y-%m-%d %H:%M"),
            "status": n.status,
            "meeting_date": n.date_time.strftime("%Y-%m-%d"),
            "meeting_time": n.date_time.strftime("%H:%M")
        }
        for n in notifications
    ])

# API to Update a Meeting
@meeting_bp.route("/meetings/<int:meeting_id>", methods=["PUT"])
def update_meeting(meeting_id):
    data = request.json
    meeting = Meeting.query.get(meeting_id)

    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404

    try:
        meeting.date_time = datetime.strptime(data["date_time"], "%Y-%m-%dT%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use 'YYYY-MM-DDTHH:MM'"}), 400

    meeting.meeting_topic = data["meeting_topic"]
    meeting.place = data["place"]
    meeting.location = data["location"]
    meeting.client_name = data["client_name"]
    meeting.status = data.get("status", meeting.status)
    meeting.agenda = data["agenda"]
    meeting.notes = data.get("notes", "")

    db.session.commit()

    return jsonify({"message": "Meeting updated successfully"}), 200

# API to Delete a Meeting
@meeting_bp.route("/meetings/<int:meeting_id>", methods=["DELETE"])
def delete_meeting(meeting_id):
    meeting = Meeting.query.get(meeting_id)
    if not meeting:
        return jsonify({"error": "Meeting not found"}), 404

    Notification.query.filter_by(meeting_id=meeting_id).delete()
    db.session.delete(meeting)
    db.session.commit()
    
    return jsonify({"message": "Meeting deleted successfully"}), 200

from backend.app import create_app  # Import from backend.app
from backend.app.models import db  # Import db



app = create_app()

# Initialize database and create tables
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True)

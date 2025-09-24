from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from .models import db  # Import db



def create_app():
    app = Flask(__name__)
    CORS(app)

    # 🔥 Configure MySQL (UPDATE credentials)
    app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+pymysql://root:@localhost/construction_mgmt"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)  # Initialize database

    # Register Blueprints
    from .routes.document_routes import document_bp
    from .routes.cost_estimation_routes import cost_estimation_bp
    from .routes.project_routes import project_bp
    from .routes.chatbot_routes import chatbot_bp
    from .routes.meeting_routes import meeting_bp  

    app.register_blueprint(document_bp)
    app.register_blueprint(cost_estimation_bp)
    app.register_blueprint(project_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(meeting_bp)  

    return app

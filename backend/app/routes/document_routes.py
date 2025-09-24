import os
import json
import logging
from flask import Blueprint, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS

from flask import Blueprint, send_from_directory

# Use the blueprint for the route instead of app



# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Create a blueprint for document handling
document_bp = Blueprint('document', __name__)
CORS(document_bp)

# Define the new upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads_new')
if not os.path.exists(UPLOAD_FOLDER):
    logging.warning(f"Upload folder does not exist. Creating: {UPLOAD_FOLDER}")
    os.makedirs(UPLOAD_FOLDER)


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="construction_mgmt"
        )
        if connection.is_connected():
            return connection
    except Error as e:
        logging.error(f"Error while connecting to MySQL: {e}")
        return None
    
@document_bp.route('/uploads_new/<filename>', methods=['GET'])
def serve_file(filename):
    try:
        # Serve files from the uploads_new directory
        return send_from_directory(
            os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'uploads_new'),
            filename,
            as_attachment=False
        )
    except Exception as e:
        logging.error(f"Error serving file {filename}: {e}")
        return jsonify({'error': 'File not found'}), 404


def add_document(role, document_name, metadata):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = "INSERT INTO documents (role, document_name, metadata) VALUES (%s, %s, %s)"
        values = (role, document_name, json.dumps(metadata))  # Serialize metadata as JSON
        cursor.execute(sql, values)
        conn.commit()
        return cursor.lastrowid
    except mysql.connector.Error as err:
        logging.error(f"Database Error: {err}")
        raise
    finally:
        cursor.close()
        conn.close()

def delete_document(document_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT metadata FROM documents WHERE id = %s", (document_id,))
        document = cursor.fetchone()

        if document:
            file_path = json.loads(document[0])['file_path']
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                    logging.debug(f"File deleted successfully from: {file_path}")
                except Exception as e:
                    logging.error(f"Error deleting file: {e}")
                    raise
            else:
                logging.warning(f"File does not exist: {file_path}")

            cursor.execute("DELETE FROM documents WHERE id = %s", (document_id,))
            conn.commit()
            logging.debug(f"Deleted document with ID: {document_id}")
        else:
            logging.error(f"Document with ID {document_id} not found.")
        
        # Reset auto-increment if table is empty
        cursor.execute("SELECT COUNT(*) FROM documents")
        count = cursor.fetchone()[0]
        if count == 0:
            cursor.execute("ALTER TABLE documents AUTO_INCREMENT = 1")
            conn.commit()
            logging.debug("Auto-increment counter reset.")
    except mysql.connector.Error as err:
        logging.error(f"Database Error: {err}")
        raise
    finally:
        cursor.close()
        conn.close()

@document_bp.route('/api/upload', methods=['POST'])
def upload_document():
    role = request.form.get('role')
    document_name = request.form.get('document')
    file = request.files.get('file')

    if not role or not document_name or not file:
        logging.error("Missing required fields")
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        logging.debug(f"Received file: {file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)

        # Check if file already exists
        if os.path.exists(file_path):
            logging.error(f"File already exists: {file_path}")
            return jsonify({'error': 'File already exists'}), 400

        # Save the file
        file.save(file_path)
        logging.info(f"File saved successfully to: {file_path}")

        metadata = {"file_path": file_path}
        document_id = add_document(role, document_name, metadata)
        logging.debug(f"Document added with ID: {document_id}")

        return jsonify({'id': document_id, 'file_name': file.filename}), 201
    except Exception as e:
        logging.exception("Error uploading file")
        return jsonify({'error': 'File upload error occurred'}), 500

@document_bp.route('/api/delete/<int:document_id>', methods=['DELETE'])
def delete_document_route(document_id):
    try:
        delete_document(document_id)
        return '', 204
    except Exception as e:
        logging.error(f"Error deleting document: {e}")
        return jsonify({'error': 'Document deletion error occurred'}), 500

@document_bp.route('/api/documents', methods=['GET'])
def get_documents():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT id, document_name, metadata FROM documents")
        documents = cursor.fetchall()
        result = []
        for doc in documents:
            metadata = json.loads(doc[2])
            result.append({
                'id': doc[0],
                'document_name': doc[1],
                'file_path': metadata['file_path'],
                'file_name': os.path.basename(metadata['file_path'])  # Extract file name from file path
            })
        return jsonify(result)
    except mysql.connector.Error as err:
        logging.error(f"Database Error: {err}")
        return jsonify({'error': 'Database error occurred'}), 500
    finally:
        cursor.close()
        conn.close()
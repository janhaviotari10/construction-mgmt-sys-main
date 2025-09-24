from flask import Blueprint, request, jsonify
import mysql.connector
from mysql.connector import Error
from flask_cors import CORS
from datetime import datetime

project_bp = Blueprint('project', __name__)
CORS(project_bp)

def get_db_connection():
    try:
        return mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="construction_mgmt"
        )
    except Error as e:
        print(f"Database connection error: {e}")
        raise

@project_bp.route('/projects_list', methods=['GET'])
def projects_list():
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        query = "SELECT project_id, project_name, location, start_date, end_date FROM projects"
        cursor.execute(query)
        projects = cursor.fetchall()

        project_list = [
            {
                "project_id": project[0],
                "project_name": project[1].title() if project[1] else "", 
                "location": project[2].capitalize() if project[2] else "",
                "start_date": project[3].strftime('%Y-%m-%d') if project[3] else None,
                "end_date": project[4].strftime('%Y-%m-%d') if project[4] else None
            }
            for project in projects
        ]
        return jsonify(project_list)
    except Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/project_details', methods=['GET'])
def get_project_details():
    conn = None
    cursor = None
    project_id = request.args.get('project')
    if not project_id:
        return jsonify({"message": "Project ID is required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM projects WHERE project_id = %s", (project_id,))
        project = cursor.fetchone()

        if not project:
            return jsonify({"message": "Project not found"}), 404

        if 'project_name' in project and project['project_name']:
            project['project_name'] = project['project_name'].title()

        if 'start_date' in project and project['start_date']:
            project['start_date'] = project['start_date'].strftime('%Y-%m-%d')

        if 'end_date' in project and project['end_date']:
            project['end_date'] = project['end_date'].strftime('%Y-%m-%d')

        return jsonify(project)
    except Exception as e:
        return jsonify({"message": "Error fetching project details", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/update_project/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    conn = None
    cursor = None
    try:
        project_data = request.get_json()
        if not project_data:
            return jsonify({"message": "No data provided"}), 400

        def parse_date(date_str):
            if not date_str:
                return None
            try:
                return datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return None

        start_date = parse_date(project_data.get('start_date'))
        end_date = parse_date(project_data.get('end_date'))

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        query = """
            UPDATE projects
            SET project_name = %s, location = %s, project_type = %s, sponsor = %s,
                budget = %s, project_area = %s, start_date = %s, end_date = %s
            WHERE project_id = %s
        """
        cursor.execute(query, (
            project_data.get('project_name'),
            project_data.get('location'),
            project_data.get('project_type'),
            project_data.get('sponsor'),
            project_data.get('budget'),
            project_data.get('project_area'),
            start_date,
            end_date,
            project_id
        ))
        conn.commit()

        cursor.execute("SELECT * FROM projects WHERE project_id = %s", (project_id,))
        updated_project = cursor.fetchone()

        return jsonify({
            "message": "Project updated successfully!",
            "project": updated_project
        })
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({
            "message": "Error updating project",
            "error": str(e)
        }), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/schedule/add_project', methods=['POST'])
def add_project():
    conn = None
    cursor = None
    try:
        project_data = request.get_json()
        if not project_data:
            return jsonify({"message": "No data provided"}), 400

        required_fields = ['project_name', 'location', 'project_type', 'sponsor', 
                         'budget', 'project_area', 'start_date', 'end_date']
        if not all(field in project_data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        
        add_project_query = """
            INSERT INTO projects (project_name, location, project_type, sponsor, budget, 
                                project_area, start_date, end_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(add_project_query, (
            project_data['project_name'],
            project_data['location'],
            project_data['project_type'],
            project_data['sponsor'],
            project_data['budget'],
            project_data['project_area'],
            project_data['start_date'],
            project_data['end_date']
        ))
        project_id = cursor.lastrowid

        add_tasks_query = """
            INSERT INTO tasks (project_id, task_name, phase)
            SELECT %s, task_name, phase
            FROM task_templates
        """
        cursor.execute(add_tasks_query, (project_id,))
        conn.commit()
        
        return jsonify({
            "message": "Project and tasks added successfully!",
            "project_id": project_id
        }), 201
    except Error as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Error adding project and tasks", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/delete_task/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE task_id = %s", (task_id,))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"message": "Task not found"}), 404

        return jsonify({"message": "Task deleted successfully!"}), 200
    except Error as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Error deleting task", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/tasks/<int:project_id>', methods=['GET'])
def get_project_tasks(project_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM tasks WHERE project_id = %s", (project_id,))
        tasks = cursor.fetchall()
        
        if not tasks:
            return jsonify({"message": "No tasks found for this project"}), 404
            
        return jsonify(tasks)
    except Error as e:
        return jsonify({"message": "Error fetching tasks", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/delete_project/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = None
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM tasks WHERE project_id = %s", (project_id,))
            cursor.execute("DELETE FROM projects WHERE project_id = %s", (project_id,))
            conn.commit()

            if cursor.rowcount == 0:
                return jsonify({"message": "Project not found"}), 404

            return jsonify({"message": "Project deleted successfully!"}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error while deleting project: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

@project_bp.route('/project_status/<int:project_id>', methods=['GET'])
def get_project_status(project_id):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT task_id, task_name, phase, completed 
            FROM tasks 
            WHERE project_id = %s
        """, (project_id,))
        tasks = cursor.fetchall()

        if not tasks:
            return jsonify({"message": "No tasks found for this project"}), 404

        completed_tasks = sum(1 for task in tasks if task['completed'])
        total_tasks = len(tasks)
        completion_percentage = round((completed_tasks / total_tasks) * 100, 2) if total_tasks > 0 else 0.0

        return jsonify({
            "tasks": tasks,
            "completion_percentage": completion_percentage,
            "completed_tasks": completed_tasks,
            "total_tasks": total_tasks
        })
    except Error as e:
        return jsonify({"message": "Error fetching project status", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/update_task/<int:task_id>', methods=['PUT'])
def update_task_status(task_id):
    conn = None
    cursor = None
    try:
        task_data = request.get_json()
        if not task_data or 'completed' not in task_data:
            return jsonify({"message": "Completion status is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tasks 
            SET completed = %s 
            WHERE task_id = %s
        """, (task_data['completed'], task_id))
        conn.commit()

        return jsonify({"message": "Task status updated successfully!"})
    except Error as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Error updating task status", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@project_bp.route('/add_task', methods=['POST'])
def add_task():
    conn = None
    cursor = None
    try:
        task_data = request.get_json()
        if not task_data:
            return jsonify({"message": "No data provided"}), 400

        required_fields = ['project_id', 'task_name', 'phase']
        if not all(field in task_data for field in required_fields):
            return jsonify({"message": "Missing required fields"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        query = """
            INSERT INTO tasks (project_id, task_name, phase, completed)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(query, (
            task_data['project_id'],
            task_data['task_name'],
            task_data['phase'],
            task_data.get('completed', False)
        ))
        conn.commit()

        return jsonify({
            "message": "Task added successfully!",
            "task_id": cursor.lastrowid
        }), 201
    except Error as e:
        if conn:
            conn.rollback()
        return jsonify({"message": "Error adding task", "error": str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == '__main__':
    project_bp.run(debug=True)
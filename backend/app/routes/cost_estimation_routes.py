from flask import Blueprint, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

cost_estimation_bp = Blueprint('cost_estimation', __name__)

# Define base directory (backend folder)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))  

# Correct dataset path
dataset_path = os.path.join(BASE_DIR, "Updated_Construction_Cost_Prediction_Dataset.csv")

# Load dataset
if os.path.exists(dataset_path):
    data = pd.read_csv(dataset_path)
    print("✅ Dataset loaded successfully!")
else:
    print(f"⚠️ WARNING: Dataset file not found at {dataset_path}")
    data = None  # Handle missing dataset

# Load trained model
model_path = os.path.join(BASE_DIR, "improved_construction_cost_model_v6.pkl")

print(f"🔍 Looking for model at: {model_path}")  # Debugging line

try:
    model = joblib.load(model_path)
    print("✅ Model loaded successfully!")
except FileNotFoundError:
    print(f"❌ ERROR: Model file not found at {model_path}")
    model = None

@cost_estimation_bp.route('/predict', methods=['POST'])
def predict_cost():
    if model is None:
        return jsonify({"error": "Model not found. Ensure 'improved_construction_cost_model_v6.pkl' exists."}), 500

    try:
        # Parse JSON input
        input_data = request.json

        # Validate input fields
        required_keys = ['area', 'floors', 'location', 'quality', 'construction_type', 'approx_cost']
        for key in required_keys:
            if key not in input_data:
                return jsonify({"error": f"Missing required field: {key}"}), 400

        # Map input data to match trained model's feature names
        feature_mapping = {
            'area': 'Area',
            'floors': 'Floors',
            'location': 'Location_Urban',
            'quality': {
                'Basic': 'Quality_Basic',
                'Standard': 'Quality_Standard',
                'Premium': 'Quality_Premium'
            },
            'construction_type': {
                'Residential': 'Type_Residential',
                'Commercial': 'Type_Commercial',
                'Industrial': 'Type_Industrial'
            },
            'approx_cost': 'ApproxCost'
        }

        # Prepare the DataFrame
        transformed_data = {
            'Area': input_data['area'],
            'Floors': input_data['floors'],
            'ApproxCost': input_data['approx_cost']
        }

        # Map categorical variables
        transformed_data.update({
            feature_mapping['location']: 1 if input_data['location'] == 'Urban' else 0,
            feature_mapping['quality'][input_data['quality']]: 1,
            feature_mapping['construction_type'][input_data['construction_type']]: 1
        })

        # Add interaction terms
        transformed_data['Floors_Location_Urban'] = transformed_data['Floors'] * transformed_data.get('Location_Urban', 0)
        transformed_data['Floors_Quality_Premium'] = transformed_data['Floors'] * transformed_data.get('Quality_Premium', 0)
        transformed_data['Floors_Quality_Standard'] = transformed_data['Floors'] * transformed_data.get('Quality_Standard', 0)
        transformed_data['Floors_Type_Commercial'] = transformed_data['Floors'] * transformed_data.get('Type_Commercial', 0)
        transformed_data['Floors_Type_Industrial'] = transformed_data['Floors'] * transformed_data.get('Type_Industrial', 0)
        transformed_data['Area_Floors'] = transformed_data['Area'] * transformed_data['Floors']
        transformed_data['ApproxCost_Floors'] = transformed_data['ApproxCost'] * transformed_data['Floors']
        transformed_data['Location_ApproxCost'] = transformed_data.get('Location_Urban', 0) * transformed_data['ApproxCost']
        transformed_data['Location_Floors'] = transformed_data.get('Location_Urban', 0) * transformed_data['Floors']
        transformed_data['Quality_Location_Urban'] = transformed_data.get('Quality_Premium', 0) * transformed_data.get('Location_Urban', 0)

        # Adjust model for higher urban cost and floors
        transformed_data['Location'] = 1.2 if transformed_data.get('Location_Urban', 0) == 1 else 1
        transformed_data['Floors_Urban'] = transformed_data['Floors'] * transformed_data['Location']

        # Create DataFrame
        df = pd.DataFrame([transformed_data])

        # Fill missing columns with zeros
        model_features = model.feature_names_in_  # Get the feature names from the trained model
        for col in model_features:
            if col not in df.columns:
                df[col] = 0

        # Align DataFrame with model input
        df = df[model_features]

        # Predict base cost
        base_cost = model.predict(df)[0]

        # Apply multiplier based on construction type
        construction_type = input_data['construction_type']
        multiplier = 1.0  # Default multiplier for Residential

        if construction_type == 'Industrial':
            multiplier = 1.25
        elif construction_type == 'Commercial':
            multiplier = 1.5

        final_cost = base_cost * multiplier * df['Location'].iloc[0]

        # Calculate contributions based on specified percentages
        percentages = {
            'Cement': 13.0,
            'Sand': 8.3,
            'Aggregate': 5.6,
            'Steel': 15.7,
            'Paint': 2.8,
            'Bricks': 6.5,
            'Flooring': 4.6,
            'Windows': 2.8,
            'Doors': 3.7,
            'Transportation Costs': 4.6,
            'Architect & Design Costs': 6.5,
            'Labor Costs': 21.3,
            'Miscellaneous Costs': 4.6
        }

        contributions = {key: (final_cost * (percentage / 100)) for key, percentage in percentages.items()}

        return jsonify({
            "predicted_cost": round(final_cost, 2),
            "contributions": contributions,
            "percentage_contributions": percentages
        })

    except Exception as e:
        print(f"Unexpected Error: {str(e)}")  # Log the unexpected error
        return jsonify({"error": "An unexpected error occurred"}), 500

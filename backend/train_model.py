import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
import joblib

#print("Pandas version:", pd._version_)
#print("Numpy version:", np._version_)

# Load dataset
dataset_path = "Updated_Construction_Cost_Prediction_Dataset.csv"
data = pd.read_csv(dataset_path)

# Identify numeric columns
numeric_data = data.select_dtypes(include=[np.number])

# Identify the column with the highest value
highest_values = numeric_data.max()
highest_column = highest_values.idxmax()
highest_value = highest_values.max()

print(f"The column with the highest overall value is: {highest_column}, with a value of: {highest_value}")

# Display highest value in each numeric column
print("\nHighest values in each column:")
print(highest_values)

# Validate the number of columns
expected_columns = [
    'Area', 'Floors', 'Location', 'Quality', 'Type', 'ApproxCost', 'ConstructionDays',
    'Cement', 'Sand', 'Aggregate', 'Steel', 'Paint', 'Bricks', 'Flooring', 'Windows', 'Doors', 'TotalCost'
]

if list(data.columns) != expected_columns:
    raise ValueError(f"Dataset columns do not match the expected columns. Found columns: {list(data.columns)}")

# Features and target
X = data[['Area', 'Floors', 'Location', 'Quality', 'Type', 'ApproxCost']]
y = data['TotalCost']

# Encode categorical variables
X = pd.get_dummies(X, columns=['Location', 'Quality', 'Type'], drop_first=True)

# Create interaction terms
X['Floors_Location_Urban'] = X['Floors'] * X.get('Location_Urban', 0)
X['Floors_Quality_Premium'] = X['Floors'] * X.get('Quality_Premium', 0)
X['Floors_Quality_Standard'] = X['Floors'] * X.get('Quality_Standard', 0)
X['Floors_Type_Commercial'] = X['Floors'] * X.get('Type_Commercial', 0)
X['Floors_Type_Industrial'] = X['Floors'] * X.get('Type_Industrial', 0)
X['Area_Floors'] = X['Area'] * X['Floors']
X['ApproxCost_Floors'] = X['ApproxCost'] * X['Floors']
X['Location_ApproxCost'] = X.get('Location_Urban', 0) * X['ApproxCost']
X['Location_Floors'] = X.get('Location_Urban', 0) * X['Floors']
X['Quality_Location_Urban'] = X.get('Quality_Premium', 0) * X.get('Location_Urban', 0)

# Emphasize higher urban cost and floors
X['Location'] = np.where(X['Location_Urban'] == 1, 1.2, 1)
X['Floors_Urban'] = X['Floors'] * X['Location']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
print(f"Mean Absolute Error: ₹{mae}")

# Save the model
joblib.dump(model, 'improved_construction_cost_model_v6.pkl')
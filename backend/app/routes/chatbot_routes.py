from flask import Flask, request, jsonify
from flask import Blueprint, request, jsonify, Flask
from flask_cors import CORS
import os

import json
from sentence_transformers import SentenceTransformer, util

chatbot_bp = Blueprint('chatbot', __name__)
CORS(chatbot_bp)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
dataset_path = os.path.join(BASE_DIR, "construction_dataset.json")

# Check if dataset file exists
if not os.path.exists(dataset_path):
    raise FileNotFoundError(f"Dataset file not found: {dataset_path}")

# Load dataset
with open(dataset_path, "r", encoding="utf-8") as f:
    data = json.load(f)


# Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# Precompute embeddings for dataset queries
dataset_queries = [item["query"] for item in data]
query_embeddings = model.encode(dataset_queries, convert_to_tensor=True)

# Create a dictionary for quick keyword-based matching
keyword_responses = {item["query"].lower(): item["response"] for item in data}

@chatbot_bp.route("/")
def home():
    return jsonify({"message": "Welcome to Construction Chatbot! Ask me queries about construction."})

@chatbot_bp.route("/chat", methods=["POST"])
def chat():
    user_query = request.json.get("query", "").lower()

    # Compute the embedding for the user query
    user_query_embedding = model.encode(user_query, convert_to_tensor=True)

    # Find the closest match using cosine similarity
    similarities = util.cos_sim(user_query_embedding, query_embeddings)
    best_match_idx = similarities.argmax().item()

    # If similarity is high, return dataset response
    if similarities[0][best_match_idx] > 0.7:
        return jsonify({"response": data[best_match_idx]["response"]})

    # If no close match → Check for keywords
    for keyword in keyword_responses:
        if keyword in user_query:
            return jsonify({"response": keyword_responses[keyword]})

    # If nothing matches → Fallback response
    return jsonify({"response": "Sorry, I didn't understand that. Can you rephrase?"})

if __name__ == "_main_":
    chatbot_bp.run(debug=True)
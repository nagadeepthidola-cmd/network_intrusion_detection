from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import joblib
import pandas as pd

app = Flask(
    __name__,
    template_folder=".",
    static_folder=".",
    static_url_path=""
)


# Load model
model = joblib.load("network_intrusion_model.pkl")

# Load feature names
model_features = joblib.load("model_features.pkl")

# Load threshold
best_threshold = joblib.load("best_threshold.pkl")


# Homepage
@app.route("/")
def home():
    return render_template("index.html")


# Prediction API
@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Get data
        data = request.get_json()

        print("Received data:", data)


        # Create empty input with all required features
        input_data = pd.DataFrame(
            0,
            index=[0],
            columns=model_features
        )


        # Numerical features
        input_data["duration"] = data.get("duration", 0)
        input_data["src_bytes"] = data.get("src_bytes", 0)
        input_data["dst_bytes"] = data.get("dst_bytes", 0)


        # Protocol encoding
        protocol = data.get("protocol", "")
        protocol_column = f"protocol_type_{protocol}"

        if protocol_column in input_data.columns:
            input_data[protocol_column] = 1


        # Service encoding
        service = data.get("service", "")
        service_column = f"service_{service}"

        if service_column in input_data.columns:
            input_data[service_column] = 1


        # Flag encoding
        flag = data.get("flag", "")
        flag_column = f"flag_{flag}"

        if flag_column in input_data.columns:
            input_data[flag_column] = 1


        # Prediction probability
        probability = model.predict_proba(input_data)[0][1]


        # Apply threshold
        prediction = (
            "Attack Detected"
            if probability >= float(best_threshold)
            else "Normal Traffic"
        )


        return jsonify({
            "prediction": prediction,
            "attack_probability": round(float(probability) * 100, 2),
            "threshold": float(best_threshold)
        })


    except Exception as e:

        print("PREDICTION ERROR:", str(e))

        return jsonify({
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)

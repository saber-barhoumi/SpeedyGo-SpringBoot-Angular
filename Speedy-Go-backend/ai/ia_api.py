import math
import requests
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from requests.exceptions import RequestException
import pandas as pd

app = Flask(__name__)
CORS(app)

# === Chargement des modèles ML ===
try:
    duration_model = joblib.load('duration_model.pkl')
    traffic_model = joblib.load('traffic_model.pkl')
    le_traffic = joblib.load('label_encoder_traffic.pkl')
    le_route = joblib.load('label_encoder_route.pkl')
    le_weather = joblib.load('label_encoder_weather.pkl')
    print("Models loaded successfully.")
except FileNotFoundError as e:
    print(f"Model files missing: {e}")
    duration_model = None
    traffic_model = None
    le_traffic = None
    le_route = None
    le_weather = None

# === Fonction de calcul de la distance (Haversine) ===
def calculate_distance(start, end):
    # Coordonnées en radians
    lat1, lon1 = math.radians(start[1]), math.radians(start[0])
    lat2, lon2 = math.radians(end[1]), math.radians(end[0])

    # Formule de Haversine pour la distance en km
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    radius = 6371  # Rayon de la Terre en kilomètres
    return radius * c

# === Déterminer le type de route ===
def get_route_type(distance_km):
    if distance_km < 10:
        return "URBAN"
    elif distance_km > 100:
        return "HIGHWAY"
    else:
        return "MIXED"

# === Obtenir la météo à un endroit donné ===
def get_weather_at_location(lat, lon):
    api_key = '6e1e678a844a51c547757c9618bf0ee5'  # Remplace par ta clé API
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={api_key}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        weather_data = response.json()
        weather = weather_data["weather"][0]["main"]
        if weather == "Clear":
            return "CLEAR"
        elif weather == "Rain":
            return "RAIN"
        elif weather == "Snow":
            return "SNOW"
        elif weather == "Fog":
            return "FOG"
        else:
            return "CLEAR"
    return "CLEAR"  # Valeur par défaut en cas d'erreur API

# === Endpoint IA pour prédire durée et trafic ===
@app.route('/api/smart-route', methods=['POST'])
def smart_route():
    try:
        data = request.get_json()
        start = data.get('start')  # [lon, lat]
        end = data.get('end')      # [lon, lat]

        if not start or not end:
            return jsonify({'error': 'Missing coordinates'}), 400

        # Heure et jour actuels
        hour = pd.Timestamp.now().hour
        weekday = pd.Timestamp.now().dayofweek

        # Distance simple pour le type de route
        estimated_distance = calculate_distance(start, end)
        type_route = get_route_type(estimated_distance)

        # Météo au point de départ
        weather = get_weather_at_location(start[1], start[0])  # lat, lon

        # === Appel ORS pour obtenir plusieurs itinéraires ===
        ors_response = requests.post(
            'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
            headers={
                'Authorization': '5b3ce3597851110001cf62481a74b36bf8ff4b5fa91595c72bc11536',
                'Content-Type': 'application/json'
            },
            json={
                'coordinates': [start, end],
                'alternative_routes': {
                    'target_count': 2,
                    'weight_factor': 1.4,
                    'share_factor': 0.6

                }
            }
        )
        print("ORS response:", ors_response.text)
        ors_response.raise_for_status()
        geojson = ors_response.json()

        if "features" not in geojson or not geojson["features"]:
            return jsonify({'error': 'No routes found'}), 404

        # Encodage des variables catégorielles
        route_encoded = le_route.transform([type_route])[0]
        weather_encoded = le_weather.transform([weather])[0]

        # Parcours de chaque itinéraire pour appliquer les prédictions IA
        for feature in geojson["features"]:
            props = feature["properties"]
            distance_km = props["summary"]["distance"] / 1000

            # === Prédiction trafic ===
            X_traffic = pd.DataFrame([{
                "distance_km": distance_km,
                "hour": hour,
                "weekday": weekday,
                "type_route_encoded": route_encoded,
                "weather_encoded": weather_encoded
            }])
            traffic_pred = traffic_model.predict(X_traffic)[0]
            proba = traffic_model.predict_proba(X_traffic)[0]
            traffic_confidence = float(max(proba))
            traffic_encoded = le_traffic.transform([traffic_pred])[0]

            # === Prédiction durée ===
            X_duration = pd.DataFrame([{
                "distance_km": distance_km,
                "traffic_encoded": traffic_encoded,
                "hour": hour,
                "weekday": weekday,
                "type_route_encoded": route_encoded,
                "weather_encoded": weather_encoded
            }])
            predicted_duration = duration_model.predict(X_duration)[0]

            # === Ajout des prédictions dans l'objet GeoJSON ===
            props["traffic"] = traffic_pred
            props["traffic_confidence"] = traffic_confidence
            props["predicted_duration"] = float(predicted_duration)

        return jsonify(geojson)

    except RequestException as e:
        print(f"Erreur ORS : {e}")
        return jsonify({'error': str(e)}), 502
    except Exception as e:
        print(f"Erreur serveur : {e}")
        return jsonify({'error': 'Erreur interne serveur'}), 500


# === Lancement ===
if __name__ == "__main__":
    app.run(debug=True)

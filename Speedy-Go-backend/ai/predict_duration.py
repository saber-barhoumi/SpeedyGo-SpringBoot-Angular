import sys
import pandas as pd
import joblib

# === Lecture des paramètres CLI ===
distance = float(sys.argv[1])            # km
traffic_level = sys.argv[2]              # 'LOW', 'MEDIUM', 'HIGH'
hour = int(sys.argv[3])                  # 0–23
weekday = int(sys.argv[4])               # 0 (lundi) à 6 (dimanche)
type_route = sys.argv[5]                 # 'URBAN', 'HIGHWAY', 'MIXED'
weather = sys.argv[6]                    # 'CLEAR', 'RAIN', 'FOG', 'SNOW'

# === Chargement des modèles et encodeurs ===
model = joblib.load('duration_model.pkl')
le_traffic = joblib.load('label_encoder_traffic.pkl')
le_route = joblib.load('label_encoder_route.pkl')
le_weather = joblib.load('label_encoder_weather.pkl')

# === Encodage des variables catégorielles ===
traffic_encoded = le_traffic.transform([traffic_level])[0]
route_encoded = le_route.transform([type_route])[0]
weather_encoded = le_weather.transform([weather])[0]

# === Construction du DataFrame ===
features = pd.DataFrame([{
    'distance_km': distance,
    'traffic_encoded': traffic_encoded,
    'hour': hour,
    'weekday': weekday,
    'type_route_encoded': route_encoded,
    'weather_encoded': weather_encoded
}])

# === Prédiction ===
predicted_duration = model.predict(features)[0]

print(f"🕒 Durée estimée : {predicted_duration:.1f} minutes")

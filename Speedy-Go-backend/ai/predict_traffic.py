import sys
import pandas as pd
import joblib

# === Lecture des arguments CLI ===
distance = float(sys.argv[1])        # km
hour = int(sys.argv[2])              # 0–23
weekday = int(sys.argv[3])           # 0 = lundi
type_route = sys.argv[4]             # 'URBAN', 'HIGHWAY', 'MIXED'
weather = sys.argv[5]                # 'CLEAR', 'RAIN', 'FOG', 'SNOW'

# === Chargement du modèle et des encodeurs ===
model = joblib.load("traffic_model.pkl")
le_route = joblib.load("label_encoder_route.pkl")
le_weather = joblib.load("label_encoder_weather.pkl")

# === Encodage des variables catégorielles ===
route_encoded = le_route.transform([type_route])[0]
weather_encoded = le_weather.transform([weather])[0]

# === Construction du DataFrame d'entrée ===
X = pd.DataFrame([{
    "distance_km": distance,
    "hour": hour,
    "weekday": weekday,
    "type_route_encoded": route_encoded,
    "weather_encoded": weather_encoded
}])

# === Prédiction du trafic ===
probs = model.predict_proba(X)[0]
pred = model.predict(X)[0]
confidence = max(probs)

# === Affichage du résultat ===
print(f"{pred}:{confidence:.2f}")

import pandas as pd
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, classification_report

# === Charger les données ===
df = pd.read_csv("synthetic_trip_data.csv")

# === Encodage des colonnes catégorielles ===
le_traffic = LabelEncoder()
le_route = LabelEncoder()
le_weather = LabelEncoder()

df['traffic_encoded'] = le_traffic.fit_transform(df['traffic'])
df['type_route_encoded'] = le_route.fit_transform(df['type_route'])
df['weather_encoded'] = le_weather.fit_transform(df['weather'])

# === Modèle 1 : Prédiction du trafic ===
features_traffic = ['distance_km', 'hour', 'weekday', 'type_route_encoded', 'weather_encoded']
X_traffic = df[features_traffic]
y_traffic = df['traffic']

X_train_t, X_test_t, y_train_t, y_test_t = train_test_split(X_traffic, y_traffic, test_size=0.2, random_state=42)
traffic_model = RandomForestClassifier(n_estimators=100, random_state=42)
traffic_model.fit(X_train_t, y_train_t)

# === Modèle 2 : Prédiction de la durée de trajet ===
features_duration = ['distance_km', 'traffic_encoded', 'hour', 'weekday', 'type_route_encoded', 'weather_encoded']
X_duration = df[features_duration]
y_duration = df['duration_minutes']

X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(X_duration, y_duration, test_size=0.2, random_state=42)
duration_model = RandomForestRegressor(n_estimators=100, random_state=42)
duration_model.fit(X_train_d, y_train_d)

# === Évaluation rapide ===
print("📊 MAE (durée prédite) :", round(mean_absolute_error(y_test_d, duration_model.predict(X_test_d)), 2))
print("📊 Rapport classification (trafic) :\n", classification_report(y_test_t, traffic_model.predict(X_test_t)))

# === Sauvegarde des modèles et encoders ===
joblib.dump(traffic_model, 'traffic_model.pkl')
joblib.dump(duration_model, 'duration_model.pkl')
joblib.dump(le_traffic, 'label_encoder_traffic.pkl')
joblib.dump(le_route, 'label_encoder_route.pkl')
joblib.dump(le_weather, 'label_encoder_weather.pkl')

print("✅ Modèles et encoders sauvegardés.")

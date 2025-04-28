import pandas as pd
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from datetime import datetime

# Exemple de dataset (tu peux remplacer ça par des données de TripHistory)
data = pd.DataFrame({
    'distance': [5000, 12000, 8000, 10000],
    'traffic': ['LOW', 'HIGH', 'MEDIUM', 'HIGH'],
    'hour': [8, 17, 13, 18],
    'weekday': [0, 1, 2, 3],  # 0 = Lundi
    'duration_minutes': [8, 30, 15, 28]
})

# Encodage du niveau de trafic
le = LabelEncoder()
data['traffic_encoded'] = le.fit_transform(data['traffic'])

# Features et cible
X = data[['distance', 'traffic_encoded', 'hour', 'weekday']]
y = data['duration_minutes']

# Entraînement
model = RandomForestRegressor()
model.fit(X, y)

# Sauvegarde du modèle et de l’encodeur
joblib.dump(model, 'model.pkl')
joblib.dump(le, 'label_encoder.pkl')

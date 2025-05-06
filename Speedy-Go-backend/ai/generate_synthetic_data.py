import random
import pandas as pd
import numpy as np

def generate_synthetic_data(num_rows=10000):
    data = []

    for _ in range(num_rows):
        # Données de base
        distance = round(random.uniform(1, 3000), 2)  # km
        hour = random.randint(0, 23)
        weekday = random.randint(0, 6)  # 0 = lundi

        # Type de trafic
        traffic = np.random.choice(['LOW', 'MEDIUM', 'HIGH'], p=[0.5, 0.3, 0.2])

        # Type de route
        type_route = np.random.choice(['URBAN', 'HIGHWAY', 'MIXED'], p=[0.4, 0.3, 0.3])

        # Météo
        weather = np.random.choice(['CLEAR', 'RAIN', 'FOG', 'SNOW'], p=[0.6, 0.2, 0.1, 0.1])

        # Vitesse de base selon route et trafic
        base_speed_table = {
            'URBAN': {'LOW': 30, 'MEDIUM': 20, 'HIGH': 10},
            'HIGHWAY': {'LOW': 100, 'MEDIUM': 80, 'HIGH': 60},
            'MIXED': {'LOW': 70, 'MEDIUM': 50, 'HIGH': 30}
        }
        base_speed = base_speed_table[type_route][traffic]

        # Durée initiale (en minutes)
        duration_minutes = (distance / base_speed) * 60

        # Impact météo
        weather_impact = {
            'CLEAR': 1.0,
            'RAIN': 1.15,
            'FOG': 1.25,
            'SNOW': 1.5
        }
        duration_minutes *= weather_impact[weather]

        # Retards aléatoires (5% des cas)
        if random.random() < 0.05:
            duration_minutes *= random.uniform(1.2, 2.0)

        # Arrondi final
        duration_minutes = round(duration_minutes, 2)

        # Enregistrement
        data.append({
            'distance_km': distance,
            'traffic': traffic,
            'hour': hour,
            'weekday': weekday,
            'type_route': type_route,
            'weather': weather,
            'duration_minutes': duration_minutes
        })

    return pd.DataFrame(data)

# Génération et export
df = generate_synthetic_data(10000)
df.to_csv('synthetic_trip_data.csv', index=False)
print("✅ Dataset généré : synthetic_trip_data.csv")
print(df.head())

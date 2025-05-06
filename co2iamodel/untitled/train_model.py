import joblib
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

# Charger les données
df = pd.read_csv('dataset_vehicules_co2.csv')

# Prétraitement des données
df.rename(columns={
    'vehicleType': 'vehicle_type',
    'maxLoadCapacity': 'max_load_capacity',
    'hasRefrigeration': 'has_refrigeration',
    'isInsured': 'is_insured',
    'yearOfManufacture': 'year_of_manufacture',
    'brand': 'brand',
    'model': 'model'
}, inplace=True)

# Encodage des colonnes catégorielles
df['vehicle_type'] = df['vehicle_type'].astype('category').cat.codes
df['brand'] = df['brand'].astype('category').cat.codes
df['model'] = df['model'].astype('category').cat.codes
df['has_refrigeration'] = df['has_refrigeration'].astype(int)
df['is_insured'] = df['is_insured'].astype(int)

X = df[['vehicle_type', 'max_load_capacity', 'has_refrigeration', 'is_insured', 'year_of_manufacture', 'brand', 'model']]
y = df['co2_emission']

# Entraînement
model = RandomForestRegressor()
model.fit(X, y)

# Sauvegarde correcte : dictionnaire
joblib.dump({
    'model': model,
    'columns': X.columns.tolist()
}, 'model_carbon.pkl')

print("✅ Modèle sauvegardé avec dictionnaire (model + columns)")

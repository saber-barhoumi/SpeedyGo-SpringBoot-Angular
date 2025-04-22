import joblib
import pandas as pd
from flask import Flask, request, jsonify
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

# Charger et préparer les données
def load_and_train_model():
    # Charger le CSV
    df = pd.read_csv('dataset_vehicules_co2.csv')

    # Renommer les colonnes si nécessaire
    df.rename(columns={
        'vehicleType': 'vehicle_type',
        'capaciteMaxColis': 'capaciteMaxColis',
        'consommationParKm': 'consommationParKm',
        'energie': 'energie'
    }, inplace=True)

    # Encoder les colonnes catégorielles
    df['vehicle_type'] = df['vehicle_type'].astype('category').cat.codes
    df['energie'] = df['energie'].astype('category').cat.codes

    # Séparer les données d'entrée et de sortie
    X = df[['vehicle_type', 'capaciteMaxColis', 'consommationParKm', 'energie']]
    y = df['co2_emission']  # La colonne cible, ici supposée être 'co2_emission'

    # Séparer les données en ensembles d'entraînement et de test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Entraîner un modèle (par exemple, RandomForest)
    model = RandomForestRegressor()
    model.fit(X_train, y_train)

    # Sauvegarder le modèle pour les prédictions futures
    joblib.dump(model, 'model_carbon.pkl')

# Créer l'app Flask
app = Flask(__name__)

# Charger le modèle une fois que l'application est lancée
load_and_train_model()
model = joblib.load('model_carbon.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # Récupérer les données envoyées dans la requête POST
    data = request.get_json()

    # Vérifier si les données sont sous forme de liste ou non
    try:
        # Si une seule entrée, l'encapsuler dans une liste
        if isinstance(data, dict):
            data = [data]  # L'envelopper dans une liste

        # Créer le DataFrame à partir des données
        df = pd.DataFrame(data)

        # Renommer les colonnes pour qu'elles correspondent à celles du modèle
        df.rename(columns={
            'vehicleType': 'vehicle_type',
            'capaciteMaxColis': 'capaciteMaxColis',
            'consommationParKm': 'consommationParKm',
            'energie': 'energie'
        }, inplace=True)

        # Encoder les colonnes catégorielles
        df['vehicle_type'] = df['vehicle_type'].astype('category').cat.codes
        df['energie'] = df['energie'].astype('category').cat.codes

        # Faire la prédiction
        prediction = model.predict(df[['vehicle_type', 'capaciteMaxColis', 'consommationParKm', 'energie']])

        # Conseils en fonction des émissions de CO2
        advice = []
        for pred in prediction:
            if pred < 50:
                advice.append("Ce véhicule est très écologique et respectueux de l'environnement.")
            elif 50 <= pred < 100:
                advice.append("Ce véhicule est modéré en termes d'émissions de CO2. Il reste une bonne option pour l'environnement.")
            else:
                advice.append("Ce véhicule génère des émissions plus élevées de CO2. Vous pourriez envisager une alternative plus écologique.")

        # Créer la réponse JSON
        response = jsonify({'prediction': prediction.tolist(), 'advice': advice})
        response.headers['Content-Type'] = 'application/json; charset=utf-8'  # Spécifie explicitement l'encodage UTF-8
        return response

    except Exception as e:
        return jsonify({'error': str(e)}), 400

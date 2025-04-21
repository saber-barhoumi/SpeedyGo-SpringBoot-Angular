import joblib
import pandas as pd
from flask import Flask, request, jsonify

# Charger le modèle
model = joblib.load('model_carbon.pkl')

# Créer l'application Flask
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    # Récupérer les données envoyées dans la requête POST
    data = request.get_json()

    # Vérifier si les données sont envoyées sous forme de liste ou dictionnaire
    if isinstance(data, dict):  # Cas où une seule entrée est envoyée
        data = [data]  # Encapsuler dans une liste pour uniformiser

    # Convertir les données en DataFrame
    df = pd.DataFrame(data)

    # Renommer les colonnes
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
    try:
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

        return jsonify({'prediction': prediction.tolist(), 'advice': advice})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Lancer l'application Flask
if __name__ == '__main__':
    app.run(debug=True)

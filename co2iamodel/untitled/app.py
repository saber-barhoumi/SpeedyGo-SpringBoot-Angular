import joblib
import pandas as pd
from flask import Flask, request, jsonify

# Charger le modèle
model_data = joblib.load('model_carbon.pkl')

if isinstance(model_data, dict):
    model = model_data['model']
    columns = model_data['columns']
else:
    raise ValueError("Le modèle chargé n'est pas sous le bon format (dictionnaire).")

# Créer l'application Flask
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        # Support des prédictions pour un ou plusieurs véhicules
        if isinstance(data, dict):
            data = [data]

        df = pd.DataFrame(data)

        # Renommage cohérent avec l'entité
        df.rename(columns={
            'vehicleType': 'vehicle_type',
            'maxLoadCapacity': 'max_load_capacity',
            'hasRefrigeration': 'has_refrigeration',
            'isInsured': 'is_insured',
            'yearOfManufacture': 'year_of_manufacture',
            'brand': 'brand',
            'model': 'model'
        }, inplace=True)

        # Encodage identique à l'entraînement
        df['vehicle_type'] = df['vehicle_type'].astype('category').cat.codes
        df['brand'] = df['brand'].astype('category').cat.codes
        df['model'] = df['model'].astype('category').cat.codes
        df['has_refrigeration'] = df['has_refrigeration'].astype(int)
        df['is_insured'] = df['is_insured'].astype(int)

        # S'assurer que toutes les colonnes sont là
        for col in columns:
            if col not in df.columns:
                raise ValueError(f"Colonne manquante : {col}")

        prediction = model.predict(df[columns])

        # Ajouter des conseils
        advice = []
        for pred in prediction:
            if pred < 50:
                advice.append("Ce véhicule est très écologique.")
            elif pred < 100:
                advice.append("Ce véhicule a un impact environnemental modéré.")
            else:
                advice.append("Ce véhicule a un fort impact environnemental.")

        return jsonify({'prediction': prediction.tolist(), 'advice': advice})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Lancer l'app
if __name__ == '__main__':
    app.run(debug=True)

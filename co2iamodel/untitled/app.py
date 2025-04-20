from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

# Charger le modèle pré-entraîné
model = joblib.load("C:\\Users\\medal\\Downloads\\SpeedyGo-SpringBoot-Angular\\co2iamodel\\untitled\\random_forest_model.pkl")



# Essayer de charger le modèle depuis le fichier .pkl
try:
    model = joblib.load("C:\\Users\\medal\\Downloads\\SpeedyGo-SpringBoot-Angular\\co2iamodel\\untitled\\random_forest_model.pkl")
    print("Modèle chargé avec succès.")
except Exception as e:
    print(f"Erreur lors du chargement du modèle : {e}")

@app.route('/predict_from_csv', methods=['POST'])
def predict_from_csv():
    file_path = request.json.get('file_path')

    try:
        # Charger le fichier CSV généré à partir de Spring
        df = pd.read_csv(file_path)

        # Vérifier que les colonnes nécessaires sont présentes
        if "ConsommationParKm" not in df.columns or "CapaciteMaxColis" not in df.columns:
            return jsonify({"error": "Les colonnes nécessaires sont manquantes dans le CSV"}), 400

        # Sélectionner les colonnes nécessaires
        features = df[["ConsommationParKm", "CapaciteMaxColis"]]

        # Effectuer la prédiction
        predictions = model.predict(features)

        # Ajouter les prédictions au DataFrame
        df["PredictedEmission"] = predictions

        # Retourner les résultats avec les prédictions
        return jsonify(df.to_dict(orient='records'))

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)

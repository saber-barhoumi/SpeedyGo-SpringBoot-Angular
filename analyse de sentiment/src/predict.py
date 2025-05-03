"""
Module mta3 t7lil el sentiment bil anglais.
"""
import argparse
import joblib
import os
from src.model import SentimentModel

def predict_sentiment(text, model_path='models/sentiment_model.joblib'):
    """
    Na3mel prediction mta3 el sentiment lel text bel modèle pre-trained.
    
    Args:
        text (str): El text elli bech n7allelo
        model_path (str): El chemin mta3 el fichier mta3 el modèle
        
    Returns:
        str: El sentiment elli twaqa3neh (positive, neutral, or negative)
    """
    # Nthabit ken el modèle mawjoud
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Modèle mech mawjoud fel {model_path}. Lazem ta3mel training lel modèle 9bal.")
    
    # N7amel el modèle
    model = SentimentModel()
    model.load_model(model_path)
    
    # Na3mel prediction
    sentiment = model.predict(text)
    
    return sentiment

def main():
    """N7allel les arguments w na3mel prediction."""
    parser = argparse.ArgumentParser(description='Tawa9a3 el sentiment lel text')
    parser.add_argument('--text', type=str, required=True,
                        help='El text elli bech n7allelo')
    parser.add_argument('--model', type=str, default='models/sentiment_model.joblib',
                        help='El chemin mta3 el modèle')
    
    args = parser.parse_args()
    
    try:
        sentiment = predict_sentiment(args.text, args.model)
        print(f"Text: {args.text}")
        print(f"El sentiment elli twa9a3neh: {sentiment}")
    except Exception as e:
        print(f"Mochkla fil prediction: {e}")

if __name__ == "__main__":
    main()
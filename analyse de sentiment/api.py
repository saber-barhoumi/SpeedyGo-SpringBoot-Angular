"""
API lel t7lil mta3 el sentiment.
Ta3mel expose lel models mta3 el sentiment ka REST API.
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uvicorn

# Nesta3mel el fonctions mta3 prediction
from src.predict import predict_sentiment as predict_sentiment_en
from src.predict_fr import predire_sentiment as predict_sentiment_fr
from src.simple_predict import predict_sentiment as predict_sentiment_simple

app = FastAPI(title="Sentiment Analysis API")

# Na3mel CORS middleware bech nkhalliw el Angular ynajem ya3mel des requêtes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Yokbel ay domain
    allow_credentials=True,
    allow_methods=["*"],  # Yokbel ay méthode
    allow_headers=["*"],  # Yokbel ay header
)

class SentimentRequest(BaseModel):
    text: str
    language: str = "en"  # Par défaut en anglais

class SentimentResponse(BaseModel):
    text: str
    sentiment: str
    language: str
    model_used: str

@app.get("/")
def read_root():
    return {"message": "Mar7ba bik fel Sentiment Analysis API"}

@app.post("/analyze")
def analyze_sentiment(request: SentimentRequest):
    try:
        text = request.text
        language = request.language.lower()
        
        # N5ayyar el modèle 3ala 7seb el language
        if language == "fr":
            sentiment = predict_sentiment_fr(text)
            model_used = "French Lexicon"
        elif language == "derja":
            # Nesta3mel el simple model lel derja
            sentiment = predict_sentiment_simple(text)
            model_used = "Simple VADER with Derja"
        else:
            # Par défaut bil anglais
            try:
                # N7awel nesta3mel el ML model ken mawjoud
                model_path = 'models/sentiment_model.joblib'
                if os.path.exists(model_path):
                    sentiment = predict_sentiment_en(text, model_path)
                    model_used = "Machine Learning"
                else:
                    # Sinon nesta3mel el modèle simple
                    sentiment = predict_sentiment_simple(text)
                    model_used = "Simple VADER"
            except Exception as e:
                # Fi 7alet ay mochkla nraja3 lel modèle simple
                sentiment = predict_sentiment_simple(text)
                model_used = "Simple VADER (Fallback)"
                
        return {
            "text": text,
            "sentiment": sentiment,
            "language": language,
            "model_used": model_used
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mochkel fel t7lil: {str(e)}")

if __name__ == "__main__":
    # Nlansi el API server
    uvicorn.run(app, host="0.0.0.0", port=8000)
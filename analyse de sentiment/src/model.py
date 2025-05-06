"""
Model mte3 t7lil el sentiment bel derja tounsia.
"""
import os
import warnings

# N7awel njib el packages lazmin, w kif ma najemch n7el bihom
try:
    import numpy as np
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Pandas walla NumPy moch mawjoudin. El fonctionnalités mte3na ma7doudin.")

try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    VISUALIZATION_AVAILABLE = True
except ImportError:
    VISUALIZATION_AVAILABLE = False
    print("Matplotlib walla Seaborn moch mawjoudin. Ma nejem'ch na3mel visualisation.")

try:
    from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
    from sklearn.model_selection import train_test_split, GridSearchCV
    from sklearn.linear_model import LogisticRegression
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
    from sklearn.pipeline import Pipeline
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn moch mawjoud. El training w evaluation ma yemchiwch.")

try:
    import joblib
    JOBLIB_AVAILABLE = True
except ImportError:
    JOBLIB_AVAILABLE = False
    print("Joblib moch mawjoud. Ma najjamch nchargui wala nsajjel el modèles.")

# Njib el modules mte3na
from src.preprocessing import TextPreprocessor

class SentimentModel:
    """Modèle mte3 t7lil el sentiment bel machine learning."""
    
    def __init__(self, model_type='logistic_regression'):
        """
        Na3mel initialization lel modèle mte3 t7lil el sentiment.
        
        Args:
            model_type (str): Naw3 el modèle elli bech nesta3mlo ('logistic_regression', 'naive_bayes', wala 'random_forest')
        """
        # Netchek ken el packages lazmin mawjoudin
        if not SKLEARN_AVAILABLE:
            warnings.warn("Scikit-learn moch minstalli. El fonctionnalités ma7doudin.")
            
        self.preprocessor = TextPreprocessor()
        self.model_type = model_type
        self.pipeline = None
        self.class_labels = None
        
    def _join_tokens(self, tokens_list):
        """
        Na3mel join lel tokens bach ywalli string pour vectorization.
        
        Args:
            tokens_list (list): Liste de listes de tokens
            
        Returns:
            list: Liste de strings de tokens joinés
        """
        return [' '.join(tokens) for tokens in tokens_list]
    
    def _get_classifier(self):
        """
        N7ot classifier elli yelzem 3ala 7seb model_type.
        
        Returns:
            object: Scikit-learn classifier
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn moch minstalli. Ma najjamch n5dem el classifier.")
            
        if self.model_type == 'logistic_regression':
            return LogisticRegression(max_iter=1000, C=1.0, class_weight='balanced')
        elif self.model_type == 'naive_bayes':
            return MultinomialNB()
        elif self.model_type == 'random_forest':
            return RandomForestClassifier(n_estimators=100, class_weight='balanced')
        else:
            raise ValueError(f"Model type '{self.model_type}' ma nesta3mlouhch")
    
    def preprocess_data(self, data):
        """
        Na3mel prétraitement lel données lel training walla prediction.
        
        Args:
            data (pandas.DataFrame): Données fihom colonne 'text'
            
        Returns:
            list: Textes après el prétraitement
        """
        preprocessed_texts = []
        for text in data['text']:
            tokens = self.preprocessor.preprocess(text)
            preprocessed_texts.append(tokens)
        
        return preprocessed_texts
    
    def build_pipeline(self):
        """
        Na3mel pipeline mte3 classification.
        
        Returns:
            sklearn.pipeline.Pipeline: Pipeline mte3 classification
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn moch minstalli. Ma najjamch na3mel pipeline.")
            
        classifier = self._get_classifier()
        
        pipeline = Pipeline([
            ('vectorizer', TfidfVectorizer(min_df=2, max_df=0.85, ngram_range=(1, 2))),
            ('classifier', classifier)
        ])
        
        return pipeline
    
    def train(self, data, label_col='sentiment'):
        """
        Na3mel entrainement lel modèle mte3 t7lil el sentiment.
        
        Args:
            data (pandas.DataFrame): Données d'entraînement fihom colonnes 'text' w labels mte3 sentiment
            label_col (str): Esm el colonne elli fiha el labels mte3 sentiment
            
        Returns:
            self: El modèle ba3d el entrainement
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn moch minstalli. Ma najjamch na3mel training.")
            
        # Na5raw les labels de classe
        self.class_labels = data[label_col].unique().tolist()
        
        # Na3mlo prétraitement lel textes
        texts_preprocessed = self.preprocess_data(data)
        
        # Na3mlo join lel tokens pour vectorization
        texts_joined = self._join_tokens(texts_preprocessed)
        
        # Na3mlo pipeline
        self.pipeline = self.build_pipeline()
        
        # Na3mlo entrainement lel modèle
        self.pipeline.fit(texts_joined, data[label_col])
        
        return self
    
    def evaluate(self, test_data, label_col='sentiment'):
        """
        Na3mel évaluation lel modèle 3ala données de test.
        
        Args:
            test_data (pandas.DataFrame): Données de test avec colonnes 'text' et labels de sentiment
            label_col (str): Nom de la colonne contenant les labels de sentiment
            
        Returns:
            dict: Métriques d'évaluation
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn is not installed. Cannot evaluate model.")
            
        if self.pipeline is None:
            raise ValueError("Model not trained. Call train() first.")
        
        # Prétraitement mte3 données de test
        texts_preprocessed = self.preprocess_data(test_data)
        
        # Na3mel join lel tokens pour vectorization
        texts_joined = self._join_tokens(texts_preprocessed)
        
        # Prédiction
        y_pred = self.pipeline.predict(texts_joined)
        
        # N7asbou métriques
        accuracy = accuracy_score(test_data[label_col], y_pred)
        report = classification_report(test_data[label_col], y_pred, output_dict=True)
        
        # Na3mel confusion matrix
        cm = confusion_matrix(test_data[label_col], y_pred)
        
        return {
            'accuracy': accuracy,
            'classification_report': report,
            'confusion_matrix': cm
        }
    
    def visualize_results(self, evaluation_metrics):
        """
        Na3mel visualisation lel résultats d'évaluation.
        
        Args:
            evaluation_metrics (dict): Output mte3 evaluate()
        """
        if not VISUALIZATION_AVAILABLE:
            print("Visualization packages not available. Skipping visualization.")
            print("\nClassification Report:")
            report = evaluation_metrics['classification_report']
            for label in self.class_labels + ['macro avg', 'weighted avg']:
                if label in report:
                    print(f"{label}:")
                    print(f"  Precision: {report[label]['precision']:.4f}")
                    print(f"  Recall: {report[label]['recall']:.4f}")
                    print(f"  F1-score: {report[label]['f1-score']:.4f}")
                    print(f"  Support: {report[label]['support']}")
                    print()
            
            print(f"Overall Accuracy: {evaluation_metrics['accuracy']:.4f}")
            return
            
        # Na3mel plot lel confusion matrix
        plt.figure(figsize=(10, 8))
        cm = evaluation_metrics['confusion_matrix']
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                    xticklabels=self.class_labels, 
                    yticklabels=self.class_labels)
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.tight_layout()
        
        # Nsajel el plot
        os.makedirs('models', exist_ok=True)
        plt.savefig('models/confusion_matrix.png')
        plt.close()
        
        # Naffichi el classification report
        report = evaluation_metrics['classification_report']
        print("\nClassification Report:")
        for label in self.class_labels + ['macro avg', 'weighted avg']:
            if label in report:
                print(f"{label}:")
                print(f"  Precision: {report[label]['precision']:.4f}")
                print(f"  Recall: {report[label]['recall']:.4f}")
                print(f"  F1-score: {report[label]['f1-score']:.4f}")
                print(f"  Support: {report[label]['support']}")
                print()
        
        print(f"Overall Accuracy: {evaluation_metrics['accuracy']:.4f}")
    
    def save_model(self, filepath='models/sentiment_model.joblib'):
        """
        Nsajjel el modèle fel disque.
        
        Args:
            filepath (str): El blasa win bech nsajjel el modèle
        """
        if not JOBLIB_AVAILABLE:
            print(f"Joblib moch minstalli. Ma najjamch nsajjel el modèle fi {filepath}.")
            return
            
        if self.pipeline is None:
            raise ValueError("El modèle mazal ma traininahch. Lazem ta3mel train() 9bal.")
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self.pipeline, filepath)
        print(f"El modèle tsajjel fi {filepath}")
    
    def load_model(self, filepath='models/sentiment_model.joblib'):
        """
        N7amel el modèle elli tsajjel 9bal.
        
        Args:
            filepath (str): Chemin mte3 el modèle
            
        Returns:
            self: El modèle avec pipeline chargé
        """
        if not JOBLIB_AVAILABLE:
            raise ImportError(f"Joblib moch minstalli. Ma najjamch nchargi el modèle min {filepath}.")
            
        self.pipeline = joblib.load(filepath)
        print(f"El modèle tchargi min {filepath}")
        return self
    
    def predict(self, text):
        """
        Netwaqa3 el sentiment mte3 texte.
        
        Args:
            text (str): Texte bech n7allelo
            
        Returns:
            str: El sentiment elli twa9a3neh
        """
        if not SKLEARN_AVAILABLE:
            raise ImportError("Scikit-learn moch minstalli. Ma najjamch na3mel prediction.")
            
        if self.pipeline is None:
            raise ValueError("El modèle mazal ma traininahch. Lazem ta3mel train() 9bal.")
        
        # Na3mlo prétraitement lel texte
        tokens = self.preprocessor.preprocess(text)
        
        # Na3mlo join lel tokens pour vectorization
        text_joined = ' '.join(tokens)
        
        # Na3mlo prediction
        prediction = self.pipeline.predict([text_joined])[0]
        
        return prediction
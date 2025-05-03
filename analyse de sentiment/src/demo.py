"""
Demonstration script for sentiment analysis.

This script demonstrates how to:
1. Train a sentiment analysis model
2. Evaluate the model
3. Save the model
4. Load the model
5. Use the model for predictions
"""
import os
import sys

# Try importing required packages, but handle if not installed
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False
    print("Pandas is not installed. Limited functionality available.")

try:
    from sklearn.model_selection import train_test_split
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("Scikit-learn is not installed. Model training and evaluation disabled.")

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.preprocessing import TextPreprocessor
from src.model import SentimentModel

def main():
    """Run demonstration of sentiment analysis model."""
    # Check if required packages are installed
    if not PANDAS_AVAILABLE:
        print("Error: Pandas is required to run this demonstration.")
        print("Please install pandas with: pip install pandas")
        return
        
    if not SKLEARN_AVAILABLE:
        print("Error: Scikit-learn is required to run this demonstration.")
        print("Please install scikit-learn with: pip install scikit-learn")
        return
    
    print("SENTIMENT ANALYSIS DEMONSTRATION")
    print("--------------------------------\n")
    
    # 1. Load the sample dataset
    try:
        print("1. Loading sample dataset...")
        data_path = 'data/customer_reviews.csv'
        data = pd.read_csv(data_path)
        print(f"   Loaded {len(data)} customer reviews")
        
        # Display a few samples
        print("\n   Sample reviews:")
        for i, (text, sentiment) in enumerate(zip(data['text'].head(3), data['sentiment'].head(3))):
            print(f"   {i+1}. '{text}' - {sentiment}")
        print()
    except Exception as e:
        print(f"Error loading data: {e}")
        return
    
    # 2. Split the data
    try:
        print("2. Splitting data into train/test sets (80%/20%)...")
        train_data, test_data = train_test_split(
            data, test_size=0.2, random_state=42, stratify=data['sentiment']
        )
        print(f"   Training set: {len(train_data)} samples")
        print(f"   Test set: {len(test_data)} samples\n")
    except Exception as e:
        print(f"Error splitting data: {e}")
        return
    
    # 3. Create and train the model
    try:
        print("3. Training sentiment analysis model...")
        model = SentimentModel(model_type='logistic_regression')
        model.train(train_data)
        print("   Model training complete\n")
    except Exception as e:
        print(f"Error training model: {e}")
        return
    
    # 4. Evaluate the model
    try:
        print("4. Evaluating model performance...")
        metrics = model.evaluate(test_data)
        model.visualize_results(metrics)
        print("   Evaluation complete\n")
    except Exception as e:
        print(f"Error evaluating model: {e}")
        return
    
    # 5. Save the model
    try:
        model_path = 'models/sentiment_model.joblib'
        print(f"5. Saving model to {model_path}...")
        model.save_model(model_path)
        print("   Model saved\n")
    except Exception as e:
        print(f"Error saving model: {e}")
    
    # 6. Demonstrate prediction
    try:
        print("6. Demonstrating predictions with new texts:")
        
        # Define some example texts
        example_texts = [
            "The customer service was excellent and I'm very satisfied with my purchase!",
            "This product is neither amazing nor terrible, it's just okay for the price.",
            "I'm extremely disappointed with the quality and would never buy this again."
        ]
        
        # Make predictions
        for i, text in enumerate(example_texts):
            sentiment = model.predict(text)
            print(f"\n   Example {i+1}:")
            print(f"   Text: '{text}'")
            print(f"   Predicted sentiment: {sentiment}")
        
        print("\nDemonstration complete!")
    except Exception as e:
        print(f"Error making predictions: {e}")

if __name__ == "__main__":
    main()
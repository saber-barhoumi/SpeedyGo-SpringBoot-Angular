"""
Programme principal mte3 analyse de sentiment.
"""
import os
import sys
import argparse

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

from src.preprocessing import TextPreprocessor
from src.model import SentimentModel

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Sentiment Analysis Training and Prediction')
    parser.add_argument('--data', type=str, default='data/customer_reviews.csv',
                        help='Path to the dataset CSV file')
    parser.add_argument('--model_type', type=str, default='logistic_regression',
                        choices=['logistic_regression', 'naive_bayes', 'random_forest'],
                        help='Type of model to use')
    parser.add_argument('--test_size', type=float, default=0.2,
                        help='Proportion of data to use for testing')
    parser.add_argument('--random_state', type=int, default=42,
                        help='Random seed for reproducibility')
    parser.add_argument('--save_model', type=str, default='models/sentiment_model.joblib',
                        help='Path to save the trained model')
    parser.add_argument('--predict', type=str, default=None,
                        help='Text to predict sentiment for (if provided, skips training)')
    parser.add_argument('--load_model', type=str, default=None,
                        help='Path to load a pre-trained model')
    
    return parser.parse_args()

def main():
    """Main function to run sentiment analysis."""
    # Check if required packages are installed
    if not PANDAS_AVAILABLE:
        print("Error: Pandas is required to run this script.")
        print("Please install pandas with: pip install pandas")
        return
        
    if not SKLEARN_AVAILABLE:
        print("Error: Scikit-learn is required to run this script.")
        print("Please install scikit-learn with: pip install scikit-learn")
        return

    args = parse_args()
    
    # Create model
    model = SentimentModel(model_type=args.model_type)
    
    # If predict with pre-trained model
    if args.predict and args.load_model:
        try:
            model.load_model(args.load_model)
            sentiment = model.predict(args.predict)
            print(f"\nPredicted sentiment: {sentiment}")
            return
        except Exception as e:
            print(f"Error loading model or making prediction: {e}")
            return
    
    # Load and preprocess data
    try:
        print(f"Loading data from {args.data}...")
        data = pd.read_csv(args.data)
    except Exception as e:
        print(f"Error loading data: {e}")
        return
    
    # Split data into train and test
    print("Splitting data into train and test sets...")
    try:
        train_data, test_data = train_test_split(
            data, 
            test_size=args.test_size, 
            random_state=args.random_state,
            stratify=data['sentiment']
        )
        
        print(f"Training set size: {len(train_data)}")
        print(f"Test set size: {len(test_data)}")
    except Exception as e:
        print(f"Error splitting data: {e}")
        return
    
    # Train model
    try:
        print(f"Training {args.model_type} model...")
        model.train(train_data)
    except Exception as e:
        print(f"Error training model: {e}")
        return
    
    # Evaluate model
    try:
        print("Evaluating model...")
        metrics = model.evaluate(test_data)
        model.visualize_results(metrics)
    except Exception as e:
        print(f"Error evaluating model: {e}")
        return
    
    # Save model
    if args.save_model:
        try:
            model.save_model(args.save_model)
        except Exception as e:
            print(f"Error saving model: {e}")
    
    # If prediction text is provided
    if args.predict:
        try:
            sentiment = model.predict(args.predict)
            print(f"\nPredicted sentiment: {sentiment}")
        except Exception as e:
            print(f"Error making prediction: {e}")

if __name__ == "__main__":
    main()
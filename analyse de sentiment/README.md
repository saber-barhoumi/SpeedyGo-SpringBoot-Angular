# Customer Sentiment Analysis

A Python-based sentiment analysis model that can detect the sentiment of customer text inputs as positive, neutral, or negative.

## Features

- Text preprocessing (stopwords removal, lowercasing, punctuation removal)
- Tokenization and vectorization using TF-IDF
- Multiple model options (Logistic Regression, Naive Bayes, Random Forest)
- Model evaluation with accuracy, precision, recall, and F1-score
- Simple prediction interface for new texts

## Project Structure

```
sentiment-analysis/
├── data/                  # Contains datasets
│   └── customer_reviews.csv   # Sample customer reviews dataset
├── models/                # Saved trained models
├── src/                   # Source code
│   ├── __init__.py        # Package initialization
│   ├── preprocessing.py   # Text preprocessing module
│   ├── model.py           # Model training and evaluation
│   ├── main.py            # Main script for training and evaluation
│   └── predict.py         # Simple prediction script
└── requirements.txt       # Project dependencies
```

## Installation

1. Clone this repository or download the source code.

2. Install the required dependencies:
```
pip install -r requirements.txt
```

## Usage

### Training a Model

To train a sentiment analysis model with the default settings:

```
python -m src.main
```

This will:
- Load the sample dataset from `data/customer_reviews.csv`
- Preprocess the text data
- Train a Logistic Regression model (default)
- Evaluate the model and print performance metrics
- Save the trained model to `models/sentiment_model.joblib`

### Customizing Training

You can customize the training process with various command-line arguments:

```
python -m src.main --data=path/to/your/data.csv --model_type=naive_bayes --test_size=0.3
```

Available options:
- `--data`: Path to your CSV dataset (must have 'text' and 'sentiment' columns)
- `--model_type`: Type of model to use ('logistic_regression', 'naive_bayes', or 'random_forest')
- `--test_size`: Proportion of data to use for testing (default: 0.2)
- `--random_state`: Random seed for reproducibility (default: 42)
- `--save_model`: Path to save the trained model (default: 'models/sentiment_model.joblib')

### Predicting Sentiment

To predict the sentiment of a new text using a pre-trained model:

```
python -m src.predict --text="Your text goes here" --model=models/sentiment_model.joblib
```

Or import and use the prediction function in your own code:

```python
from src.predict import predict_sentiment

text = "I really enjoyed the customer service, very helpful!"
sentiment = predict_sentiment(text)
print(f"The sentiment is: {sentiment}")
```

## Creating Your Own Dataset

The model expects a CSV file with at least two columns:
- `text`: The customer text to analyze
- `sentiment`: The sentiment label (positive, neutral, or negative)

Example:
```
text,sentiment
"I absolutely love this product!",positive
"The service was okay, nothing special.",neutral
"Terrible experience, would not recommend.",negative
```

## Evaluation Metrics

The model evaluation includes:
- Accuracy
- Precision, Recall, and F1-score for each sentiment class
- Confusion matrix visualized and saved to 'models/confusion_matrix.png'

## License

This project is licensed under the MIT License.
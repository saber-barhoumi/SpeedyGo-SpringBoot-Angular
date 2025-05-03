"""
T7lil el sentiment bil VADER - Version améliorée bel derja tounsia.
"""
import re
import string
import os
import argparse
import sys
import csv
from pathlib import Path

class VaderLexicon:
    """Lexique VADER lil t7lil el sentiment."""
    
    def __init__(self):
        """Initialization mte3 el lexique VADER."""
        # N5alq el répertoire lexique ken ma mawjoudch
        lexicon_dir = Path('data/lexicons')
        lexicon_dir.mkdir(parents=True, exist_ok=True)
        
        # Na3mel initialization lel lexiques
        self.lexicon = {}
        
        # N7ot el lexique intégré w el lexiques externes
        self._initialize_lexicon()
        self._load_external_lexicons()
        
    def _initialize_lexicon(self):
        """Na3mel initialization mte3 el lexique inclu."""
        # El klemét positives m3a score mte3hom (m5outhin min VADER)
        pos_words = {
            'good': 1.9, 'great': 3.1, 'excellent': 3.5, 'amazing': 3.4, 'wonderful': 2.9,
            'fantastic': 3.3, 'terrific': 3.0, 'outstanding': 3.1, 'superb': 3.2, 'brilliant': 3.0,
            'awesome': 3.4, 'love': 3.3, 'best': 2.8, 'perfect': 3.0, 'superior': 2.1,
            'happy': 2.3, 'pleased': 1.8, 'satisfied': 1.6, 'enjoy': 2.0, 'enjoyed': 2.0,
            'impressive': 2.5, 'incredible': 3.1, 'exceptional': 2.9, 'delighted': 3.0, 
            'exceeded': 2.0, 'recommend': 2.2, 'worth': 1.9, 'valuable': 2.0, 'positive': 2.1,
            'favorite': 2.3, 'nice': 1.8, 'kind': 2.1, 'helpful': 2.1, 'friendly': 2.2,
            'generous': 2.2, 'smart': 1.6, 'intelligent': 2.0, 'wise': 1.8, 'beautiful': 2.5, 
            'attractive': 1.9, 'elegant': 1.9, 'pleasant': 1.8, 'reliable': 1.6, 'trustworthy': 2.3,
            'honest': 2.2, 'joy': 2.4, 'excited': 2.3, 'glad': 1.9, 'thrilled': 2.9, 
            'pleased': 1.9, 'impressed': 2.1, 'grateful': 2.2, 'thankful': 2.2, 'satisfied': 1.7,
            'content': 1.5, 'proud': 1.9, 'win': 2.5, 'winning': 2.3, 'won': 2.2, 
            'success': 2.0, 'successful': 2.1, 'achievement': 1.9, 'achieve': 1.8, 'accomplished': 1.9,
            'hero': 2.3, 'blessing': 2.4, 'blessed': 2.4, 'congratulations': 2.5, 'congrats': 2.3,
            'cheers': 1.9, 'fun': 2.1, 'funny': 1.7, 'humor': 1.6, 'laugh': 1.9, 
            'laughing': 1.8, 'lol': 1.9, 'smile': 2.0, 'smiling': 2.0, 'amen': 1.9,
            'praise': 2.0, 'praising': 2.0, 'praised': 2.0, 'thank': 1.9, 'thanks': 1.9, 
            'thanked': 1.9, 'thanking': 1.9, 'appreciate': 2.1, 'appreciated': 2.1, 'appreciating': 2.1,
            'welcome': 1.8, 'welcomed': 1.8, 'greeting': 1.6, 'greet': 1.6, 'reward': 1.9,
            'rewarding': 1.9, 'rewarded': 1.9, 'award': 1.8, 'awarded': 1.8, 'benefit': 1.6
        }
        
        # El klemét négatives m3a score mte3hom (m5outhin min VADER)
        neg_words = {
            'bad': -2.5, 'poor': -2.0, 'terrible': -3.4, 'horrible': -3.2, 'awful': -2.9,
            'disappointing': -2.2, 'disappointed': -2.1, 'worst': -3.1, 'waste': -2.3, 'useless': -2.1,
            'hate': -3.0, 'dislike': -2.1, 'regret': -2.0, 'unfortunately': -1.9, 'problem': -1.8,
            'broken': -1.9, 'damaged': -2.0, 'defective': -2.1, 'fails': -2.0, 'failed': -2.0,
            'inferior': -1.8, 'worse': -2.3, 'annoying': -2.2, 'annoyed': -2.1, 'frustrated': -2.0,
            'unhappy': -2.1, 'dissatisfied': -2.2, 'negative': -2.0, 'complaint': -1.9, 'stupid': -2.5,
            'dumb': -2.3, 'idiot': -2.8, 'idiotic': -2.7, 'fool': -2.2, 'foolish': -2.1, 'ridiculous': -2.0,
            'pathetic': -2.6, 'incompetent': -2.2, 'worthless': -2.5, 'disgusting': -2.8, 'offensive': -2.4,
            'rude': -2.5, 'mean': -2.0, 'nasty': -2.5, 'cruel': -2.9, 'evil': -3.0, 'vile': -2.9,
            'angry': -2.1, 'furious': -2.5, 'outraged': -2.4, 'hostile': -2.4, 'aggressive': -2.1,
            'dangerous': -2.2, 'threatening': -2.1, 'suspicious': -1.9, 'dishonest': -2.4, 'deceitful': -2.4,
            'lying': -2.3, 'liar': -2.5, 'cheating': -2.3, 'cheater': -2.4, 'ugly': -2.2,
            'hideous': -2.5, 'gross': -2.0, 'creepy': -2.1, 'scary': -2.0, 'frightening': -2.1,
            'terrified': -2.6, 'worried': -1.8, 'worry': -1.8, 'sad': -2.0, 'depressed': -2.4,
            'depressing': -2.3, 'miserable': -2.6, 'heartbroken': -2.6, 'devastated': -2.8, 'upset': -2.1,
            'shame': -2.2, 'ashamed': -2.1, 'embarrassed': -2.0, 'embarrassing': -2.0, 'humiliated': -2.5,
            'humiliating': -2.5, 'suffer': -2.2, 'suffering': -2.2, 'suffered': -2.2, 'sick': -1.9,
            'illness': -2.0, 'disease': -2.0, 'pain': -2.2, 'painful': -2.2, 'hurt': -2.1,
            'hurting': -2.1, 'injury': -1.9, 'injured': -1.9, 'wound': -1.9, 'wounded': -1.9,
            'kill': -2.8, 'killed': -2.8, 'killing': -2.8, 'murder': -3.4, 'murdered': -3.4,
            'death': -2.8, 'die': -2.7, 'died': -2.7, 'dead': -2.7, 'crime': -2.5,
            'criminal': -2.5, 'illegal': -2.0, 'corrupt': -2.7, 'corruption': -2.7, 'fraud': -2.8,
            'scam': -2.8, 'scandal': -2.4, 'shit': -2.5, 'bullshit': -2.7, 'crap': -2.5,
            'fuck': -3.0, 'fucking': -3.0, 'damn': -1.9, 'jerk': -2.5, 'asshole': -3.1,
            'bitch': -3.0, 'bastard': -2.8, 'hell': -2.0, 'disaster': -2.6, 'catastrophe': -2.7,
            'crisis': -2.3, 'emergency': -1.9, 'chaos': -2.1, 'riot': -2.3, 'war': -2.7,
            'fight': -2.0, 'fighting': -2.0, 'violent': -2.5, 'violence': -2.5, 'assault': -2.8,
            'attack': -2.4, 'attacked': -2.4, 'invade': -2.3, 'invaded': -2.3, 'invasion': -2.3,
            'failure': -2.3, 'fail': -2.2, 'failed': -2.2, 'failing': -2.2, 'deny': -1.8,
            'denied': -1.8, 'denying': -1.8, 'reject': -1.9, 'rejected': -1.9, 'rejecting': -1.9,
            'refuse': -1.8, 'refused': -1.8, 'refusing': -1.8, 'prohibit': -1.7, 'prohibited': -1.7,
            'ban': -1.8, 'banned': -1.8, 'banning': -1.8, 'block': -1.7, 'blocked': -1.7,
            'lose': -2.0, 'losing': -2.0, 'lost': -2.0, 'defeat': -2.1, 'defeated': -2.1,
            'loser': -2.3, 'missed': -1.8, 'miss': -1.8, 'tragic': -2.5, 'tragedy': -2.6
        }
        
        # Nda5al kol el lexiques fi dictionnaire wa7ed
        self.lexicon.update(pos_words)
        self.lexicon.update(neg_words)
    
    def _load_external_lexicons(self):
        """Nchargi les lexiques externes min el fichiers CSV."""
        lexicon_files = [
            'data/lexicons/en/lexicon_sentiment.csv',
            'data/lexicons/fr/lexique_sentiment.csv',
            'data/lexicons/derja/lexique_derja.csv'
        ]
        
        for file_path in lexicon_files:
            if os.path.exists(file_path):
                try:
                    with open(file_path, 'r', encoding='utf-8') as file:
                        reader = csv.reader(file)
                        next(reader)  # N9afez el ligne d'entête
                        for row in reader:
                            if row and len(row) >= 2 and not row[0].startswith('#'):
                                word, score = row[0], row[1]
                                try:
                                    # N7awel el score min string l float
                                    score_float = float(score)
                                    self.lexicon[word] = score_float
                                except ValueError:
                                    # Ken famma problème fil conversion, nokhl lil kelmé hadhi
                                    continue
                except Exception as e:
                    print(f"Erreur lors du chargement du lexique {file_path}: {e}")
    
    def get_sentiment_score(self, word):
        """Njib el score mte3 kelma. Positif lil ijébi, négatif lil selbi."""
        return self.lexicon.get(word, 0)
    
    def is_positive(self, word):
        """Nchouf ken el kelma 3andha sentiment ijébi."""
        return self.get_sentiment_score(word) > 0
    
    def is_negative(self, word):
        """Nchouf ken el kelma 3andha sentiment selbi."""
        return self.get_sentiment_score(word) < 0

class SimplePreprocessor:
    """Préprocesseur bsit bidoun dépendances 5arjia."""
    
    def __init__(self):
        """Initialization mte3 el préprocesseur bel stopwords."""
        # Stopwords anglais les plus courants
        self.stop_words = set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
                           'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 
                           'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 
                           'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 
                           'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 
                           'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
                           'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 
                           'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 
                           'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 
                           'through', 'during', 'before', 'after', 'above', 'below', 'to', 
                           'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 
                           'again', 'further', 'then', 'once', 'here', 'there', 'when', 
                           'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 
                           'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 
                           'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 
                           'just', 'don', 'should', 'now'])
    
    def clean_text(self, text):
        """Na3mel nettoyage lel texte: minuscules, suppression des URLs, HTML, ponctuation, etc."""
        text = text.lower()
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        text = re.sub(r'<.*?>', '', text)
        text = text.translate(str.maketrans('', '', string.punctuation))
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    def tokenize(self, text):
        """N9asem el texte l kelmét bel espaces."""
        return text.split()
    
    def remove_stopwords(self, tokens):
        """Na7i el stopwords mil kelmét."""
        return [token for token in tokens if token not in self.stop_words]
    
    def preprocess(self, text):
        """Na3mel el traitement complet."""
        cleaned_text = self.clean_text(text)
        tokens = self.tokenize(cleaned_text)
        tokens_without_stopwords = self.remove_stopwords(tokens)
        return tokens_without_stopwords
    
class VaderSentimentAnalyzer:
    """Analyseur mte3 sentiment basé 3la VADER."""
    
    def __init__(self):
        """Initialization mte3 el analyseur."""
        self.preprocessor = SimplePreprocessor()
        self.lexicon = VaderLexicon()
        
        # El klemét mte3 négation eli yi9albo el sentiment
        self.negation_words = set(['not', 'no', 'never', 'neither', 'none', 'nobody', 'nowhere', 'nothing', 'cannot', 'cant', "can't", 'wont', "won't", 'isnt', "isn't", 'arent', "aren't", 'wasnt', "wasn't", 'werent', "weren't", 'hasnt', "hasn't", 'havent', "haven't", 'hadnt', "hadn't", 'doesnt', "doesn't", 'dont', "don't", 'didnt', "didn't"])
        
        # El klemét mte3 intensification eli yzido fel sentiment
        self.intensifiers = {
            'very': 1.3, 'really': 1.2, 'extremely': 1.5, 'incredibly': 1.4, 'absolutely': 1.4,
            'completely': 1.3, 'totally': 1.2, 'utterly': 1.3, 'highly': 1.2, 'especially': 1.1,
            'particularly': 1.1, 'entirely': 1.2, 'so': 1.1, 'too': 1.1, 'quite': 1.1, 
            'rather': 1.1, 'somewhat': 0.9, 'slightly': 0.9, 'barely': 0.8, 'hardly': 0.8, 
            'kind of': 0.9, 'sort of': 0.9, 'at all': 1.2, 'fucking': 1.5, 'damn': 1.3,
            'super': 1.3, 'extra': 1.2
        }
    
    def _check_for_negation(self, tokens, i):
        """Nchouf ken kelma m3aha négation (example: 'not good')."""
        if i > 0 and tokens[i-1] in self.negation_words:
            return True
        if i > 1 and tokens[i-2] in self.negation_words and tokens[i-1] in ['a', 'the', 'so', 'very', 'really', 'quite', 'extremely']:
            return True
        return False
        
    def _check_for_intensifier(self, tokens, i):
        """Nchouf ken kelma 3andha intensificateur (example: 'very good')."""
        if i > 0 and tokens[i-1] in self.intensifiers:
            return self.intensifiers[tokens[i-1]]
        return 1.0
    
    def analyze_sentiment(self, text):
        """N7alel el sentiment mte3 texte w na3ti score."""
        # Na3mel preprocessing lel texte
        cleaned_text = self.preprocessor.clean_text(text)
        tokens = self.preprocessor.tokenize(cleaned_text)
        
        # Mana7ich el stopwords besh n7afedh 3al négations w intensificateurs
        
        # N7seb el score mte3 el sentiment
        total_score = 0
        
        for i, token in enumerate(tokens):
            score = self.lexicon.get_sentiment_score(token)
            
            if score != 0:
                # Nchouf ken famma négation (yi9leb el signe)
                if self._check_for_negation(tokens, i):
                    score *= -0.8  # N9alel el effet shwaya
                
                # Nchouf ken famma intensificateur
                intensifier = self._check_for_intensifier(tokens, i)
                score *= intensifier
                
                total_score += score
        
        # N7seb el points d'exclamation (yzidou fel sentiment)
        exclamation_count = text.count('!')
        if exclamation_count > 0:
            # Akther exclamations = sentiment akther
            exclamation_boost = min(exclamation_count * 0.3, 1.5)
            if total_score > 0:
                total_score += exclamation_boost
            elif total_score < 0:
                total_score -= exclamation_boost
        
        # N7seb el MAJUSCULES (yzidou fel sentiment)
        words = re.findall(r'\b[A-Z]{2,}\b', text)
        if words:
            # Akther mots en MAJUSCULES = sentiment akther
            caps_boost = min(len(words) * 0.5, 1.5)
            if total_score > 0:
                total_score += caps_boost
            elif total_score < 0:
                total_score -= caps_boost
        
        return total_score
    
    def predict(self, text):
        """Netwaqa3 el sentiment: positive, negative, wala neutral."""
        score = self.analyze_sentiment(text)
        
        # Classification 7seb el score
        if score > 0.05:
            return "positive"
        elif score < -0.05:
            return "negative"
        else:
            # Lel scores neutres barcha, nchouf el klemét offensantes
            lower_text = text.lower()
            offensive_words = ['stupid', 'idiot', 'dumb', 'fool', 'retard', 'retarded', 'fuck', 'bitch', 'bastard', 'asshole', 'shit']
            
            if any(word in lower_text for word in offensive_words):
                return "negative"
            
            # Pour les mots inconnus ou ambigus, on retourne "neutral" au lieu de "negative"
            return "neutral"

def predict_sentiment(text):
    """Netwaqa3 el sentiment mte3 el texte."""
    analyzer = VaderSentimentAnalyzer()
    sentiment = analyzer.predict(text)
    return sentiment

def main():
    """El fonction principale mte3 el programme."""
    parser = argparse.ArgumentParser(description='Netwaqa3 el sentiment mte3 texte')
    parser.add_argument('--text', type=str, required=True,
                        help='El texte eli besh n7allelo')
    parser.add_argument('--score', action='store_true',
                        help='Affichi el score numérique mte3 el sentiment')
    
    args = parser.parse_args()
    
    try:
        analyzer = VaderSentimentAnalyzer()
        sentiment = analyzer.predict(args.text)
        score = analyzer.analyze_sentiment(args.text)
        
        print(f"Text: {args.text}")
        print(f"Predicted sentiment: {sentiment}")
        if args.score:
            print(f"Sentiment score: {score:.2f}")
    except Exception as e:
        print(f"Famma ghalta: {e}")

if __name__ == "__main__":
    main()
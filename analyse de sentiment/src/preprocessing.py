"""
Module mte3 prétraitement lel t7lil el sentiment.
"""
import re
import string

# N7awel nchouf ken NLTK mawjoud, sinon na3mel 7el badil
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import word_tokenize
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("NLTK mech minstalé. Bech nesta3mel prétraitement basique.")

# Téléchargement mte3 ressources NLTK eli n7tajhom
def download_nltk_resources():
    """N7awel ndownloadi el ressources mte3 NLTK."""
    if not NLTK_AVAILABLE:
        return
        
    resources = ['punkt', 'stopwords', 'wordnet', 'omw-1.4']
    for resource in resources:
        try:
            nltk.download(resource, quiet=True)
        except Exception as e:
            print(f"Tenbih: Ma n9adrech nnezzel el ressource NLTK {resource}: {e}")

class TextPreprocessor:
    """Classe lel prétraitement mte3 texte."""
    
    def __init__(self):
        """Na3mel initialization lel préprocesseur."""
        if NLTK_AVAILABLE:
            # Ndownloadi el ressources 9bal l'initialization
            download_nltk_resources()
            try:
                self.stop_words = set(stopwords.words('english'))
                self.lemmatizer = WordNetLemmatizer()
            except Exception as e:
                print(f"Tenbih: Mategmech bech nesta3mel NLTK mzyan: {e}")
                # Nraj3ou lel prétraitement basique
                NLTK_AVAILABLE = False
                self._initialize_basic_preprocessing()
        else:
            self._initialize_basic_preprocessing()
    
    def _initialize_basic_preprocessing(self):
        """Na3mel initialization lel prétraitement basique ken NLTK mech mawjoud."""
        # N3arfou el stopwords mte3 el anglais ken NLTK mech mawjoud
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
        """
        Na3mel nettoyage lel texte.
        
        Args:
            text (str): Texte eli besh nettoyah
            
        Returns:
            str: Texte après nettoyage
        """
        # N7awlou lel minuscules
        text = text.lower()
        
        # Na7iw el URLs
        text = re.sub(r'https?://\S+|www\.\S+', '', text)
        
        # Na7iw les balises HTML
        text = re.sub(r'<.*?>', '', text)
        
        # Na7iw el ponctuation
        text = text.translate(str.maketrans('', '', string.punctuation))
        
        # Na7iw el espaces zeydin
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def tokenize(self, text):
        """
        N9asam el texte l tokens.
        
        Args:
            text (str): Texte besh na3mlou tokenization
            
        Returns:
            list: Liste mte3 tokens
        """
        if NLTK_AVAILABLE:
            try:
                return word_tokenize(text)
            except Exception as e:
                print(f"Tenbih: El tokenization bel NLTK ma mchéch: {e}")
                # Nraj3ou lel tokenization simple
                return text.split()
        else:
            # Tokenization simple bel espaces
            return text.split()
    
    def remove_stopwords(self, tokens):
        """
        Na7i el stopwords.
        
        Args:
            tokens (list): Liste mte3 tokens
            
        Returns:
            list: Liste mte3 tokens bidoun stopwords
        """
        return [token for token in tokens if token not in self.stop_words]
    
    def lemmatize(self, tokens):
        """
        Na3mel lemmatization lel tokens.
        
        Args:
            tokens (list): Liste mte3 tokens
            
        Returns:
            list: Liste mte3 tokens après lemmatization
        """
        if NLTK_AVAILABLE:
            try:
                return [self.lemmatizer.lemmatize(token) for token in tokens]
            except Exception as e:
                print(f"Tenbih: El lemmatization bel NLTK ma mchéch: {e}")
                # Nraj3ou el tokens kima homma
                return tokens
        else:
            # Nraj3ou el tokens kima homma ken NLTK mech mawjoud
            return tokens
    
    def preprocess(self, text):
        """
        Na3mel el prétraitement kammel lel texte.
        
        Args:
            text (str): Texte besh na3mlou prétraitement
            
        Returns:
            list: Liste mte3 tokens après prétraitement
        """
        # Nettoyage mte3 texte
        cleaned_text = self.clean_text(text)
        
        # Tokenization
        tokens = self.tokenize(cleaned_text)
        
        # Na7iw el stopwords
        tokens_without_stopwords = self.remove_stopwords(tokens)
        
        # Lemmatization
        lemmatized_tokens = self.lemmatize(tokens_without_stopwords)
        
        return lemmatized_tokens
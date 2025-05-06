"""
Analyse de sentiment en français utilisant un lexique inspiré de VADER.
Ynajem ya3mel tahlil mta3 les commentaires bil français w bil anglais w bil derja.
"""
import re
import string
import os
import argparse
import sys
import csv
from pathlib import Path

class LexiqueFrancais:
    """
    Lexique français pour l'analyse de sentiment.
    Hadhaya el dictionnaire elli fih el klemét el bihom bech na3rfou el sentiment mta3 el texte.
    """
    
    def __init__(self):
        """
        Initialisation avec le lexique français.
        Nebda nesta3mel el lexique mta3na bech nfassar les sentiments.
        """
        # Initialiser les lexiques - N7adhrou el dictionnaire
        self.lexique = {}
        
        # Charger les lexiques externes - Na3mlou load lel klemét men el fichiers
        self._charger_lexiques()
        
    def _charger_lexiques(self):
        """
        Charger les lexiques depuis les fichiers CSV.
        N7adhrou el klemét bil français, bil anglais w bil derja men el fichiers.
        """
        # Chemin de base du projet
        base_path = Path(__file__).parent.parent
        
        # Charger le lexique français
        self._charger_lexique_depuis_csv(base_path / 'data' / 'lexicons' / 'fr' / 'lexique_sentiment.csv')
        
        # Charger le lexique anglais
        self._charger_lexique_depuis_csv(base_path / 'data' / 'lexicons' / 'en' / 'lexicon_sentiment.csv')
        
        # Charger le lexique derja
        self._charger_lexique_depuis_csv(base_path / 'data' / 'lexicons' / 'derja' / 'lexique_derja.csv')
    
    def _charger_lexique_depuis_csv(self, chemin_fichier):
        """
        Charger un lexique depuis un fichier CSV.
        N7ott el klemét w el scores mte3hom fel dictionnaire.
        """
        if not chemin_fichier.exists():
            print(f"Attention: Le fichier lexique {chemin_fichier} n'existe pas.")
            return
            
        try:
            with open(chemin_fichier, 'r', encoding='utf-8') as f:
                lecteur = csv.reader(f)
                # Ignorer l'en-tête
                en_tete = next(lecteur)
                
                for ligne in lecteur:
                    # Ignorer les lignes de commentaire
                    if ligne and not ligne[0].startswith('#'):
                        mot = ligne[0].strip()
                        try:
                            score = float(ligne[1])
                            self.lexique[mot] = score
                        except (IndexError, ValueError):
                            # Ignorer les lignes mal formatées
                            pass
        except Exception as e:
            print(f"Erreur lors du chargement du lexique {chemin_fichier}: {e}")
    
    def obtenir_score_sentiment(self, mot):
        """
        Obtenir le score de sentiment pour un mot.
        N7awlou na3rfou ida el kelma fiha sentiment ijébi walla selbi.
        """
        return self.lexique.get(mot, 0)
    
    def est_positif(self, mot):
        """
        Vérifier si un mot a un sentiment positif.
        Nchoufou ida el kelma behi walla lé.
        """
        return self.obtenir_score_sentiment(mot) > 0
    
    def est_negatif(self, mot):
        """
        Vérifier si un mot a un sentiment négatif.
        Nchoufou ida el kelma khayba walla lé.
        """
        return self.obtenir_score_sentiment(mot) < 0

class PreprocesseurSimple:
    """Préprocesseur mte3 text bsit."""
    
    def __init__(self):
        """Initialization bel stopwords."""
        # El klemét vides mte3 el français
        self.mots_vides = set(['le', 'la', 'les', 'un', 'une', 'des', 'ce', 'cette', 'ces', 
                           'mon', 'ma', 'mes', 'ton', 'ta', 'tes', 'son', 'sa', 'ses',
                           'notre', 'nos', 'votre', 'vos', 'leur', 'leurs', 'de', 'du', 
                           'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 
                           'et', 'ou', 'mais', 'donc', 'car', 'pour', 'avec', 'dans', 
                           'sur', 'sous', 'a', 'à', 'au', 'aux', 'en', 'par', 'que', 
                           'qui', 'quoi', 'dont', 'où', 'est', 'sont', 'étais', 'était', 
                           'étaient', 'suis', 'es', 'sommes', 'êtes', 'être', 'avoir',
                           'as', 'avons', 'avez', 'ont'])
    
    def nettoyer_texte(self, texte):
        """Na3mel nettoyage lel texte: n7awel kol fi minuscule, na7i URLs, HTML, ponctuation, etc."""
        texte = texte.lower()
        texte = re.sub(r'https?://\S+|www\.\S+', '', texte)
        texte = re.sub(r'<.*?>', '', texte)
        texte = texte.translate(str.maketrans('', '', string.punctuation))
        texte = re.sub(r'\s+', ' ', texte).strip()
        return texte
    
    def tokeniser(self, texte):
        """N9asem el texte l kelmet (tokens)."""
        return texte.split()
    
    def supprimer_mots_vides(self, tokens):
        """N9asem el texte l kelmet (tokens)."""
        return [token for token in tokens if token not in self.mots_vides]
    
    def pretraiter(self, texte):
        """Na3mel el traitement complet."""
        texte_nettoye = self.nettoyer_texte(texte)
        tokens = self.tokeniser(texte_nettoye)
        tokens_sans_mots_vides = self.supprimer_mots_vides(tokens)
        return tokens_sans_mots_vides

class AnalyseurSentimentFrancais:
    """
    Analyseur de sentiment utilisant un lexique français et anglais.
    Outil li ynajem y7allel el commentaires bel français, anglais w derja.
    """
    
    def __init__(self):
        """
        Initialisation de l'analyseur de sentiment.
        Ta7dhir el analyseur mta3 el sentiment.
        """
        self.preprocesseur = PreprocesseurSimple()
        self.lexique = LexiqueFrancais()
        
        # Mots de négation qui inversent le sentiment
        # El klemét li ya9elbou el ma3na (mithél "pas bon" = khayeb)
        self.mots_negation = set(['ne', 'pas', 'jamais', 'aucun', 'aucune', 'sans', 'ni', 'non', 
                             'personne', 'rien', 'plus', 'aucunement', 'nullement',
                             # Mots anglais pour le derja - Klemét anglais lel derja
                             'not', 'no', 'never', 'none', 'nothing',
                             # Derja - Bil derja
                             'ma', 'moch', 'mouch', 'makch', 'makech', 'mahouch', 'manish'])
        
        # Mots intensificateurs qui amplifient le sentiment
        # El klemét li yzidou fil 9owet el sentiment (mithél "très bon" = behi barcha)
        self.intensificateurs = {
            # Français - Bil français
            'très': 1.3, 'vraiment': 1.2, 'extrêmement': 1.5, 'incroyablement': 1.4, 'absolument': 1.4,
            'complètement': 1.3, 'totalement': 1.2, 'entièrement': 1.3, 'hautement': 1.2, 'particulièrement': 1.1,
            'tout à fait': 1.2, 'si': 1.1, 'trop': 1.1, 'assez': 1.1, 'plutôt': 1.1, 
            'un peu': 0.9, 'légèrement': 0.9, 'à peine': 0.8, 'super': 1.3, 'extra': 1.2,
            'carrément': 1.3, 'tellement': 1.3, 'vachement': 1.3,
            
            # Anglais - Bil anglais (pour le Derja)
            'very': 1.3, 'really': 1.2, 'extremely': 1.5, 'incredibly': 1.4, 'absolutely': 1.4,
            'completely': 1.3, 'totally': 1.2, 'entirely': 1.3, 'highly': 1.2, 'especially': 1.1,
            'so': 1.1, 'too': 1.1, 'quite': 1.1, 
            
            # Derja tunisien - Bil derja tounsia
            'barcha': 1.4, 'yaser': 1.4, 'hakkeka': 1.2, 'hakka': 1.1, 'bezzef': 1.3
        }
    
    def _verifier_negation(self, tokens, i):
        """Nchouf ken famma négation (mithél: 'pas bon')."""
        if i > 0 and tokens[i-1] in self.mots_negation:
            return True
        if i > 1 and tokens[i-2] in self.mots_negation and tokens[i-1] in ['le', 'la', 'les', 'un', 'une', 'des', 'très', 'vraiment', 'si', 'trop']:
            return True
        return False
        
    def _verifier_intensificateur(self, tokens, i):
        """Nchouf ken famma intensificateur (mithél: 'très bon')."""
        if i > 0 and tokens[i-1] in self.intensificateurs:
            return self.intensificateurs[tokens[i-1]]
        return 1.0
    
    def analyser_sentiment(self, texte):
        """
        Analyser le sentiment du texte et retourner un score.
        N7allel el texte w na3ti score mta3 el sentiment mt3ou.
        """
        # Prétraiter le texte - Nwajjed el texte
        texte_nettoye = self.preprocesseur.nettoyer_texte(texte)
        tokens = self.preprocesseur.tokeniser(texte_nettoye)
        
        # Ne pas supprimer les mots vides pour conserver les négations et intensificateurs
        # Manfasakh'ch el mots vides bech nkhalliw el klemét kima "ne...pas" walla "barcha"
        
        # Calculer le score de sentiment - N7esbo el score mta3 el sentiment
        score_total = 0
        
        for i, token in enumerate(tokens):
            score = self.lexique.obtenir_score_sentiment(token)
            
            if score != 0:
                # Vérifier la négation (inverse le signe)
                # Nchoufou ken famma négation (kima "ma...ch")
                if self._verifier_negation(tokens, i):
                    score *= -0.8  # Réduire légèrement pour la négation
                
                # Vérifier les intensificateurs
                # Nchoufou ken famma modifiers (kima "barcha", "yaser")
                intensificateur = self._verifier_intensificateur(tokens, i)
                score *= intensificateur
                
                score_total += score
        
        # Tenir compte des points d'exclamation (amplifient le sentiment)
        # Zid 9ima lel sentiment ki famma points d'exclamation "!!!"
        nb_exclamations = texte.count('!')
        if nb_exclamations > 0:
            # Plus de points d'exclamation = sentiment plus fort
            boost_exclamation = min(nb_exclamations * 0.3, 1.5)
            if score_total > 0:
                score_total += boost_exclamation
            elif score_total < 0:
                score_total -= boost_exclamation
        
        # Tenir compte des MAJUSCULEES (amplifient le sentiment)
        # Zid 9ima lel sentiment ki el kelma mektouba bil MAJUSCULE
        mots = re.findall(r'\b[A-Z]{2,}\b', texte)
        if mots:
            # Plus de mots en majuscules = sentiment plus fort
            boost_majuscules = min(len(mots) * 0.5, 1.5)
            if score_total > 0:
                score_total += boost_majuscules
            elif score_total < 0:
                score_total -= boost_majuscules
        
        return score_total
    
    def predire(self, texte):
        """
        Prédire le sentiment comme positif, négatif, ou neutre.
        N9arrer ida el texte ijébi, selbi walla neutre.
        """
        score = self.analyser_sentiment(texte)
        
        # Classifier basé sur le score avec seuil
        # N9arrer 3la 7seb el score
        if score > 0.05:
            return "positif"
        elif score < -0.05:
            return "négatif"
        else:
            # Pour les scores très neutres, vérifier les mots offensants spécifiques
            # Ken el score 9rib lel zero, nlawjou 3la klemét khayba
            texte_min = texte.lower()
            mots_offensants = [
                # Français - Bil français
                'stupide', 'idiot', 'bête', 'con', 'débile', 'crétin', 'imbécile',
                'merde', 'putain', 'connard', 'salaud', 'enfoiré', 'nul', 'pourri',
                
                # Anglais - Bil anglais
                'stupid', 'idiot', 'dumb', 'fool', 'shit', 'fuck', 'asshole', 'bitch',
                                 
            ]
            
            if any(mot in texte_min for mot in mots_offensants):
                return "négatif"
            
            # Si le texte contient des mots anglais ou français communs, essayons de deviner
            # Ken famma klemét anglais walla français ma3roufin, n7awlou nkhamnou
            mots_positifs_communs = ['good', 'great', 'nice', 'bien', 'bon', 'super', 'behi', 'mizyen']
            if any(mot in texte_min for mot in mots_positifs_communs):
                return "positif"
                
            mots_negatifs_communs = ['bad', 'poor', 'mauvais', 'khayeb', 'mouch behi']
            if any(mot in texte_min for mot in mots_negatifs_communs):
                return "négatif"
            
            # S'il y a du contenu mais que le score est neutre, par défaut neutre
            # Ken famma contenu amma el score neutre, n9oulou neutre
            if len(texte.strip()) > 0 and not texte.isspace():
                return "neutre"
            
            return "neutre"

def predire_sentiment(texte):
    """Tawa93 el sentiment mte3 texte."""
    analyseur = AnalyseurSentimentFrancais()
    sentiment = analyseur.predire(texte)
    return sentiment

def main():
    """
    Analyser les arguments et prédire le sentiment.
    N7allel el arguments w netnabbé bel sentiment.
    """
    parser = argparse.ArgumentParser(description='Prédire le sentiment pour un texte')
    parser.add_argument('--texte', type=str, required=True,
                        help='Texte à analyser')
    parser.add_argument('--score', action='store_true',
                        help='Afficher le score numérique de sentiment')
    
    args = parser.parse_args()
    
    try:
        analyseur = AnalyseurSentimentFrancais()
        sentiment = analyseur.predire(args.texte)
        score = analyseur.analyser_sentiment(args.texte)
        
        print(f"Texte: {args.texte}")
        print(f"Sentiment prédit: {sentiment}")
        if args.score:
            print(f"Score de sentiment: {score:.2f}")
    except Exception as e:
        print(f"Erreur lors de la prédiction du sentiment: {e}")

if __name__ == "__main__":
    main()
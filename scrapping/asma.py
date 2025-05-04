import requests
from bs4 import BeautifulSoup
import csv
import time
import random
import json
import os
import mysql.connector
from mysql.connector import Error
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Configuration mta3 el database MySQL
DB_CONFIG = {
    'host': 'localhost',
    'database': 'speedy_db',
    'user': 'root',
    'password': ''
}

# Dictionnaire mta3 wilayat tounes m3a les URLs mta3hom 3la TripAdvisor
GOVERNORATES = {
    "Sousse": "https://www.tripadvisor.com/Tourism-g295401-Sousse_Sousse_Governorate-Vacations.html",
    "Tunis": "https://www.tripadvisor.com/Tourism-g293758-Tunis_Tunis_Governorate-Vacations.html",
    "Bizerte": "https://www.tripadvisor.com/Tourism-g480249-Bizerte_Bizerte_Governorate-Vacations.html",
    "Sfax": "https://www.tripadvisor.com/Tourism-g317087-Sfax_Sfax_Governorate-Vacations.html",
    "Ariana": "https://www.tripadvisor.com/Tourism-g2629125-Ariana_Ariana_Governorate-Vacations.html",
    "Ben Arous": "https://www.tripadvisor.com/Tourism-g2629179-Ben_Arous_Ben_Arous_Governorate-Vacations.html",
    "Gafsa": "https://www.tripadvisor.com/Tourism-g651644-Gafsa_Gafsa_Governorate-Vacations.html",
    "Jendouba": "https://www.tripadvisor.com/Tourism-g953410-Jendouba_Jendouba_Governorate-Vacations.html",
    "Kairouan": "https://www.tripadvisor.com/Tourism-g303925-Kairouan_Kairouan_Governorate-Vacations.html",
    "Kasserine": "https://www.tripadvisor.com/Tourism-g1441363-Kasserine_Kasserine_Governorate-Vacations.html",
    "Kebili": "https://www.tripadvisor.com/Tourism-g1115268-Kebili_Kebili_Governorate-Vacations.html",
    "Mahdia": "https://www.tripadvisor.com/Tourism-g297947-Mahdia_Mahdia_Governorate-Vacations.html",
    "Medenine": "https://www.tripadvisor.com/Tourism-g2629156-Medenine_Governorate-Vacations.html",
    "Nabeul": "https://www.tripadvisor.com/Tourism-g2629157-Nabeul_Governorate-Vacations.html",
    "Sidi Bouzid": "https://www.tripadvisor.com/Tourism-g2011442-Sidi_Bouzid_Sidi_Bouzid_Governorate-Vacations.html",
    "Siliana": "https://www.tripadvisor.com/Tourism-g2629161-Siliana_Governorate-Vacations.html",
    "Tozeur": "https://www.tripadvisor.com/Tourism-g293757-Tozeur_Tozeur_Governorate-Vacations.html",
    "Zaghouan": "https://www.tripadvisor.com/Tourism-g2629168-Zaghouan_Governorate-Vacations.html",
    "Tataouine": "https://www.tripadvisor.com/Tourism-g477975-Tataouine_Tataouine_Governorate-Vacations.html",
    "Le Kef": "https://www.tripadvisor.com/Tourism-g946559-Le_Kef_Le_Kef_Governorate-Vacations.html",
    "Gabes": "https://www.tripadvisor.com/Tourism-g612360-Gabes_Gabes_Governorate-Vacations.html",
    "Beja": "https://www.tripadvisor.com/Tourism-g2629135-Beja_Governorate-Vacations.html",
    "Manouba": "https://www.tripadvisor.com/Tourism-g946556-La_Goulette_Tunis_Governorate-Vacations.html",
    "Monastir": "https://www.tripadvisor.com/Tourism-g297949-Monastir_Monastir_Governorate-Vacations.html"
}

# Function bech nconnectiw lel base de données
def get_db_connection():
    """A3mel connection m3a el MySQL database"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            print(f"Connectina bel base de données MySQL b najeh: {DB_CONFIG['database']}")
            return connection
    except Error as e:
        print(f"Mochkla fel connection m3a el MySQL database: {e}")
        return None

# Function bech na3mlou el tabla tourist_places ken ma famech
def create_table_if_not_exists(connection):
    """Ne5lqou el tabla tourist_places ken ma mawjoudech"""
    try:
        cursor = connection.cursor()
        # Query SQL bech ne5lqou el tabla
        create_table_query = """
        CREATE TABLE IF NOT EXISTS tourist_places (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            governorate VARCHAR(100) NOT NULL,
            rating VARCHAR(50),
            reviews VARCHAR(100),
            type VARCHAR(100),
            url TEXT,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        connection.commit()
        print("El tabla tourist_places te5alqet wela rahou kanet mawjouda")
        return True
    except Error as e:
        print(f"Mochkla fel création mta3 la table: {e}")
        return False
    finally:
        if cursor:
            cursor.close()

# Function bech ned5lou les données mta3 el attractions fel database
def save_to_database(data, governorate, connection):
    """Ne5aznou el données mta3 el attractions fel MySQL database"""
    if not data:
        print("Mafeech données bech nsajlou fel database.")
        return 0
    
    try:
        cursor = connection.cursor()
        
        # Query SQL bech ned5lou el données
        insert_query = """
        INSERT INTO tourist_places (name, governorate, rating, reviews, type, url, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        records_inserted = 0
        for attraction in data:
            # N7adhrou les valeurs lel insertion
            values = (
                attraction['name'],
                governorate,
                attraction['rating'],
                attraction['reviews'],
                attraction['type'],
                attraction['url'],
                attraction['image_url']
            )
            
            cursor.execute(insert_query, values)
            records_inserted += 1
        
        connection.commit()
        print(f"Da5alna {records_inserted} attraction fel database b najeh")
        return records_inserted
    
    except Error as e:
        print(f"Mochkla fel insertion mta3 el données fel database: {e}")
        return 0
    finally:
        if cursor:
            cursor.close()

# Function bech ndirou temps de pause 3achwe2i bin el requests
def random_delay(min_seconds=3, max_seconds=7):
    """N7ottou pause 3achwe2iya bin el requests bech ma yet7assech bina ka robots"""
    delay = random.uniform(min_seconds, max_seconds)
    print(f"Nestannew {delay:.2f} therwenya 9bal el request eli jey...")
    time.sleep(delay)

# Na3mlou directory bech nsajlou fiha les fichiers CSV
def create_output_directory(directory_name="tunisia_attractions"):
    """Ne5lqou directory bech n7ottou fiha les fichiers CSV ken ma mawjoudech"""
    if not os.path.exists(directory_name):
        os.makedirs(directory_name)
        print(f"5la9na el directory: {directory_name}")
    return directory_name

def get_search_result_with_selenium(search_term):
    """
    Nesta3mlou Selenium bech na3mlou recherche fel page principale mta3 TripAdvisor w nejbdou el premier URL mta3 el résultat
    """
    print(f"Nbadew Selenium bech nlawjou 3la: {search_term}")
    
    # Na3mlou paramétrage lel Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Nkhaddmou fel mode invisible (bla interface)
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    try:
        # Nbadew el Chrome driver
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        # Nmchiw lel page principale mta3 TripAdvisor
        driver.get("https://www.tripadvisor.com/")
        print("T7allet page TripAdvisor principale")
        
        # Nestannew bech yethal el search box
        wait = WebDriverWait(driver, 10)
        search_box = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "input[type='search']")))
        
        # Nda5lou el mot de recherche w nsubmitiw
        search_box.clear()
        search_box.send_keys(search_term)
        search_box.send_keys(Keys.RETURN)
        print(f"Da5alna el kelma bech nlawjou 3liha: {search_term}")
        
        # Nestannew bech yetl3ou les résultats
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "#typeahead_results a")))
        print("Tzadou les résultats mta3 el recherche")
        
        # Nejbdou URL mta3 awel résultat
        first_result = driver.find_element(By.CSS_SELECTOR, "#typeahead_results a")
        result_url = first_result.get_attribute("href")
        print(f"L9ina URL mta3 awel résultat: {result_url}")
        
        driver.quit()
        return result_url
        
    except Exception as e:
        print(f"Mochkla m3a Selenium fel recherche: {e}")
        try:
            driver.quit()
        except:
            pass
        return None

def get_search_result_with_api(search_term):
    """
    Nesta3mlou el API mta3 TripAdvisor bech nejbdou les résultats mta3 el recherche
    """
    base_url = "https://www.tripadvisor.com"
    api_url = f"{base_url}/data/graphql/ids"
    
    # Headers bech netshabhou b navigateur normal
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Content-Type': 'application/json',
        'X-Requested-By': 'TNI1625!APlkECMcNZL+OqAtRmS3yT/viPGlsMhN+FJvTj3MZ7s/oGxjJuDbS4zBCmCMcMnRQhOVQFm1ACn35kFKSA60PUOzRPH+P/WT2kFfLZZIvjyvXngWxhFyDXl7BoVOX8UbnGYtP9TQOqoe3TkmBH2EsKfg/A3kIGBSoHv1UtQW0iK7',
        'Referer': 'https://www.tripadvisor.com/'
    }
    
    # El query GraphQL mta3 el recherche
    payload = {
        "variables": {
            "request": {
                "query": search_term,
                "limit": 10,
                "scope": "GLOBAL",
                "locale": "en-US",
                "scopeGeoId": 1,
                "searchCenter": None,
                "searchCenterGeoId": None,
                "nearestGeoId": None,
                "updateSessionId": True,
                "initialSessionId": "null",
                "boundingBox": None
            }
        },
        "extensions": {
            "preRegisteredQueryId": "e6912326ef9c5cdb240e5d93dc3ce7c7"
        }
    }
    
    try:
        # Nab3thou el request POST lel API
        print(f"Nab3thou el request lel API bech nlawjou 3la: {search_term}")
        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Next5arjou les résultats mel réponse
            if 'data' in data and 'Typeahead_autocomplete' in data['data']:
                results = data['data']['Typeahead_autocomplete']['results']
                
                if results:
                    # Nlawjou 3al awel résultat eli houma blassa
                    for result in results:
                        if result['__typename'] == 'Typeahead_LocationItem':
                            url = result['url']
                            full_url = base_url + url if not url.startswith('http') else url
                            print(f"L9ina awel résultat kima blassa: {full_url}")
                            return full_url
            
            print("Mal9inech résultats kima blassa fel réponse mta3 el API")
            return None
        else:
            print(f"El requête lel API feshlet, code: {response.status_code}")
            return None
    
    except Exception as e:
        print(f"Mochkla fel API fel recherche: {e}")
        return None

def scrape_tripadvisor_attractions(url):
    # Headers bech netshabhou b navigateur normal
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://www.google.com/'
    }
    
    # Nab3thou requête GET lel URL
    print(f"Nejbdou el page: {url}")
    response = requests.get(url, headers=headers)
    
    # Nvirifiw ken el requête nj7et
    if response.status_code == 200:
        # Nparsiw el contenu HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Nlawjou 3al liste mta3 el attractions (bel class eli 3andna)
        attractions_list = soup.find('ul', class_='DSinh')
        
        if not attractions_list:
            print("Mal9inech el liste mta3 el attractions. Yomken el class name tbaddel wela el structure mouch kifkif.")
            print("Nlawjou 3la containers o5rin...")
            
            # Nlawjou 3la containers o5rin mta3 attractions
            attractions_containers = soup.find_all(['div', 'ul'], class_=lambda c: c and ('attraction' in c.lower() or 'list' in c.lower() or 'card' in c.lower()))
            
            if attractions_containers:
                print(f"L9ina {len(attractions_containers)} containers momkin. Nesta3mlou el lewel.")
                attractions_list = attractions_containers[0]
            else:
                # Nlawjou 3al 7all el a5er - nlawjou bel pattern mta3 attractions
                print("Nlawjou 3al cards mta3 attractions wa7da wa7da...")
                attractions = []
                for card in soup.find_all(['div', 'li'], class_=lambda c: c and ('attraction' in c.lower() or 'item' in c.lower() or 'card' in c.lower())):
                    if card.find('a') and card.find(['img', 'picture']):
                        attractions.append(card)
                
                if attractions:
                    print(f"L9ina {len(attractions)} cards mta3 attractions wahdahom.")
                    results = process_attractions(attractions)
                    return results
                else:
                    print("Ma l9ina 7atta attraction fel page.")
                    return []
        
        # Nlawjou 3a les items eli n7ottou fihom el attractions
        attractions = attractions_list.find_all('li')
        
        if not attractions:
            print("Ma l9ina 7atta list item fel liste mta3 el attractions. Nlawjou 3al divs flokhrin...")
            attractions = attractions_list.find_all('div', class_=lambda c: c and ('item' in c.lower() or 'card' in c.lower()))
        
        print(f"L9ina {len(attractions)} attractions momkinin.")
        
        results = process_attractions(attractions)
        return results
    else:
        print(f"El requête mta3 el page feshlet: Code {response.status_code}")
        return []

def process_attractions(attractions):
    """Na9raw liste mta3 el attractions w next5arjou el ma3loumet mte3hom"""
    results = []
    for attraction in attractions:
        try:
            # Nlawjou 3a les class names w attributs momkin yekounou fihom esm el attraction
            name_element = None
            for class_name in ['biGQs _P fiohW alXOW', 'name', 'title', 'heading']:
                name_element = attraction.find(['div', 'h3', 'span', 'a'], class_=lambda c: c and class_name.lower() in c.lower())
                if name_element:
                    break
            
            # Ken mal9inech class spécifique, nlawjou 3a les patterns mta3 tags 3adiyyin
            if not name_element:
                for tag in ['h2', 'h3', 'h4']:
                    name_element = attraction.find(tag)
                    if name_element:
                        break
            
            name = name_element.get_text().strip() if name_element else "Name not found"
            
            # Nlawjou 3a les patterns différents bech nejbdou el rating
            rating_element = None
            for data_attr in ['bubbleRatingValue', 'rating', 'score']:
                rating_element = attraction.find(['div', 'span'], attrs={'data-automation': data_attr})
                if rating_element:
                    break
                rating_element = attraction.find(['div', 'span'], class_=lambda c: c and 'rating' in c.lower())
                if rating_element:
                    break
            
            rating = rating_element.get_text().strip() if rating_element else "Rating not found"
            
            # Nlawjou 3a les patterns différents bech nejbdou 3adad el reviews
            reviews_element = None
            for data_attr in ['bubbleReviewCount', 'reviewCount', 'reviews']:
                reviews_element = attraction.find(['div', 'span'], attrs={'data-automation': data_attr})
                if reviews_element:
                    break
                reviews_element = attraction.find(['div', 'span'], class_=lambda c: c and 'review' in c.lower())
                if reviews_element:
                    break
            
            reviews = reviews_element.get_text().strip() if reviews_element else "Reviews not found"
            
            # Nlawjou 3a les patterns différents bech nejbdou naw3 el attraction
            type_element = None
            for class_name in ['biGQs _P pZUbB hmDzD', 'category', 'type']:
                type_element = attraction.find(['span', 'div'], class_=lambda c: c and class_name.lower() in c.lower())
                if type_element:
                    break
            
            attraction_type = type_element.get_text().strip() if type_element else "Type not found"
            
            # Nlawjou 3a les patterns différents bech nejbdou el URL
            link_element = attraction.find('a')
            base_url = "https://www.tripadvisor.com"
            attraction_url = base_url + link_element['href'] if link_element and 'href' in link_element.attrs else "URL not found"
            
            # Nlawjou 3a les patterns différents bech nejbdou el URL mta3 el image
            image_element = None
            for data_attr in ['photoShelfCarouselImage-0', 'photo', 'image']:
                image_element = attraction.find('img', attrs={'data-automation': data_attr})
                if image_element:
                    break
                image_element = attraction.find('img')
                if image_element:
                    break
            
            image_url = image_element['src'] if image_element and 'src' in image_element.attrs else "Image not found"
            
            # Ken el attraction 3andha esm (bech nfiltrw el items eli mouch pertinents)
            if name != "Name not found":
                results.append({
                    'name': name,
                    'rating': rating,
                    'reviews': reviews,
                    'type': attraction_type,
                    'url': attraction_url,
                    'image_url': image_url
                })
            
        except Exception as e:
            print(f"Mochkla fel 9rayet mta3 attraction: {e}")
            continue
    
    return results

def save_to_csv(data, filename='gabes_attractions.csv'):
    if not data:
        print("Mafeech data bech nsajlouha.")
        return
    
    # Nejbdou les noms mta3 les champs mel awel élément
    fieldnames = data[0].keys()
    
    # Nektbou el données fel CSV
    with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)
    
    print(f"El données etsajlou b najeh fel fichier {filename}")

def scrape_all_governorates(output_dir=None, min_delay=3, max_delay=7):
    """
    Nejbdou les attractions mel wilayat tounes lkol w nsajlouhom fel database
    
    Args:
        output_dir: Directory eli bech nsajlou fiha les fichiers CSV (yet5la9 ken ma mawjoudech)
        min_delay: A9al wa9t pause bin les requêtes bel théweni
        max_delay: Akther wa9t pause bin les requêtes bel théweni
    """
    # Na3mlou el directory ken ma da5alouhech
    if not output_dir:
        output_dir = create_output_directory()
    
    results_summary = []
    
    # Na3mlou el connection m3a el database
    db_connection = get_db_connection()
    if not db_connection:
        print("Mochkla: Ma najamtech nconnecti lel MySQL database. Chouf el configuration mta3 el database.")
        return []
    
    # Na3mlou el tabla tourist_places ken ma famech
    if not create_table_if_not_exists(db_connection):
        print("Mochkla: Ma najamtech na3mel el tabla tourist_places.")
        if db_connection and db_connection.is_connected():
            db_connection.close()
        return []
    
    # Na3mlou loop 3al wilayat lkol
    for i, (governorate, url) in enumerate(GOVERNORATES.items()):
        print(f"\n{'='*80}\nKhedma [{i+1}/{len(GOVERNORATES)}]: {governorate}\n{'='*80}")
        
        try:
            # Nejbdou les attractions mta3 el wilaya
            attractions_data = scrape_tripadvisor_attractions(url)
            
            if attractions_data:
                # Nsajlou el données fel database
                records_inserted = save_to_database(attractions_data, governorate, db_connection)
                
                # Na3mlou el filename mta3 el CSV (backup)
                filename = os.path.join(output_dir, f"{governorate.lower().replace(' ', '_')}_attractions.csv")
                
                # Nsajlou el données fel CSV ka backup
                save_to_csv(attractions_data, filename)
                
                # Nzidhom fel summary
                results_summary.append({
                    'governorate': governorate,
                    'attractions_count': len(attractions_data),
                    'db_records_inserted': records_inserted,
                    'status': 'Success',
                    'backup_csv': filename
                })
                
                print(f"Jbedna b najeh {len(attractions_data)} attractions mta3 {governorate}")
                print(f"Da5alna {records_inserted} records fel database")
            else:
                print(f"Mal9ina 7atta attraction mta3 {governorate}")
                results_summary.append({
                    'governorate': governorate,
                    'attractions_count': 0,
                    'db_records_inserted': 0,
                    'status': 'No data found',
                    'backup_csv': None
                })
        
        except Exception as e:
            print(f"Mochkla fel extraction mta3 {governorate}: {str(e)}")
            results_summary.append({
                'governorate': governorate,
                'attractions_count': 0,
                'db_records_inserted': 0,
                'status': f'Error: {str(e)}',
                'backup_csv': None
            })
        
        # Na3mlou wa9t pause 9bal el requête eli ba3dha (ella ken hetha a5er wa7da)
        if i < len(GOVERNORATES) - 1:
            random_delay(min_delay, max_delay)
    
    # Nsajlou el rapport mta3 el summary
    summary_file = os.path.join(output_dir, "scraping_summary.csv")
    with open(summary_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['governorate', 'attractions_count', 'db_records_inserted', 'status', 'backup_csv']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(results_summary)
    
    print(f"\nEl extraction tkammlet. El summary etsajel fi {summary_file}")
    
    # Nsakrou el connection m3a el database
    if db_connection and db_connection.is_connected():
        db_connection.close()
        print("El connection m3a el database tsakret.")
    
    return results_summary

if __name__ == "__main__":
    # Na7touh True bech nejbdou el wilayat elkol, False bech nejbdou wilaya wa7da
    scrape_all = True
    
    if scrape_all:
        # Nejbdou el wilayat elkol m3a wa9t pause modifiable
        print(f"Nbadew nejbdou les attractions mta3 el {len(GOVERNORATES)} wilaya fi tounes...")
        # Nesta3mlou wa9t twil bin les requêtes (5-10 théweni) bech ma ykachfouch 3lina
        scrape_all_governorates(min_delay=5, max_delay=10)
    else:
        # Nejbdou wilaya wa7da (lel testing wela bech nchoufou chnowa el mochkla)
        search_term = "gabes"  # Baddel hedhom lel wilaya eli t7eb tejbedha
        
        # Lawel nlawjou ken mawjouda fel liste mta3na
        if search_term.title() in GOVERNORATES:
            destination_url = GOVERNORATES[search_term.title()]
            print(f"Nesta3mlou el URL eli na3rfou mta3 {search_term}: {destination_url}")
        else:
            # Nlawjou bel API lewel (asra3 w ma te7tejech lel Selenium)
            destination_url = get_search_result_with_api(search_term)
            
            # Ken el methode mta3 el API feshlet, njarbou bel Selenium
            if not destination_url:
                print("El methode mta3 el API feshlet, njarbou bel Selenium...")
                destination_url = get_search_result_with_selenium(search_term)
            
            # El 7all el a5er ken el zouz methodes feshlou
            if not destination_url:
                print("El zouz methodes mta3 el recherche feshlou. Vérifi el kelmet el recherche.")
                destination_url = None
        
        if destination_url:
            print("Nejbdou TripAdvisor bech nejbdou les attractions...")
            attractions_data = scrape_tripadvisor_attractions(destination_url)
            
            if attractions_data:
                print(f"L9ina {len(attractions_data)} attractions.")
                filename = f"{search_term.lower().replace(' ', '_')}_attractions.csv"
                save_to_csv(attractions_data, filename)
            else:
                print("Mafeech données tetsajlou.")
        else:
            print("Ma najamtech n7adedou el URL mta3 el destination bech nejbdou el attractions.")
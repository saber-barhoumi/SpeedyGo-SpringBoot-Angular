import requests
from bs4 import BeautifulSoup
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def get_first_search_result(query):
    """
    Get the href of the first search result from TripAdvisor for a given query.
    Uses Selenium to interact with the search bar and get the dropdown results.
    
    Args:
        query (str): The search term to look for on TripAdvisor
        
    Returns:
        str: The URL of the first search result or None if not found
    """
    # Set up Chrome options
    chrome_options = Options()
    # Uncomment the next line to run Chrome in headless mode
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--window-size=1920,1080")
    
    try:
        # Initialize the Chrome WebDriver
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
        
        # Navigate to TripAdvisor
        driver.get("https://www.tripadvisor.com/")
        print("Opened TripAdvisor homepage")
        
        # Wait for the search input to be available
        wait = WebDriverWait(driver, 10)
        search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='search'][name='q']")))
        
        # Clear any existing text and input the search query
        search_input.clear()
        search_input.send_keys(query)
        print(f"Entered search query: {query}")
        
        # Wait a moment for the search results dropdown to appear
        time.sleep(2)
        
        # Wait for the dropdown results to be visible
        dropdown_results = wait.until(EC.presence_of_element_located((By.ID, "typeahead_results")))
        
        # Find all search result links in the dropdown
        result_links = driver.find_elements(By.CSS_SELECTOR, "#typeahead_results a.bUIiC")
        
        if result_links and len(result_links) > 0:
            # Get the href of the first result
            first_result_href = result_links[0].get_attribute("href")
            print(f"Found first result: {first_result_href}")
            
            # Take a screenshot for debugging (optional)
            # driver.save_screenshot("tripadvisor_search.png")
            
            return first_result_href
        else:
            print("No search results found in the dropdown")
            # Take a screenshot for debugging (optional)
            # driver.save_screenshot("tripadvisor_no_results.png")
            return None
            
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
        
    finally:
        # Close the browser
        if 'driver' in locals():
            driver.quit()
            print("WebDriver closed")

# Example usage
if __name__ == "__main__":
    search_query = input("Enter your search term: ")
    print("Searching TripAdvisor for:", search_query)
    
    result_url = get_first_search_result(search_query)
    
    if result_url:
        print("\nFirst search result URL:")
        print(result_url)
    else:
        print("\nCould not find any search results.")

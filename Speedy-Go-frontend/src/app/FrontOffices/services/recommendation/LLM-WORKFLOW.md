# LLM-Powered Recommendation System

This document outlines the LLM (Large Language Model) recommendation workflow integrated into SpeedyGo to provide personalized store and offer recommendations.

## Architecture Overview

```
+----------------+     +----------------+     +---------------+
| User Interface |---->| Auth Service   |---->| Backend API   |
+----------------+     +----------------+     +---------------+
        |                     |                      |
        v                     v                      v
+----------------+     +----------------+     +---------------+
| Store Component|---->|Recommendation  |---->| Groq LLM API  |
+----------------+     |Service         |     +---------------+
                       +----------------+
```

## Workflow Description

1. **User Authentication**
   - User logs in through the authentication service
   - Basic user data is stored in localStorage
   - Initially, demographic data may be missing

2. **Demographic Data Retrieval**
   - When the user visits the store page, demographic data (age, gender) is needed
   - If demographic data is missing in localStorage, `AuthService.fetchAndUpdateUserDemographics()` is called
   - This fetches user data from backend API endpoint `/api/user/getUser/{userId}`
   - Demographic data is stored in localStorage for future use

3. **Store Recommendation Process**
   - The `RecommendationService.recommendStores()` method is triggered
   - It builds a user profile containing demographic data (age, gender)
   - Store data is prepared and formatted for the LLM prompt
   - A carefully crafted prompt is generated that asks the LLM to recommend stores based on user demographics

4. **LLM Integration**
   - The prompt is sent to Groq's API using the llama3-70b-8192 model
   - The LLM analyzes the user profile and available stores
   - It returns a JSON response with ranked store IDs and explanations for each recommendation

5. **Response Processing**
   - The recommendation service parses the LLM response
   - Store data is sorted according to the rankings
   - Top recommendations are displayed to the user in the UI
   - Debug information is available in the UI for testing/demo purposes

## Example Prompt Template

```
I need you to recommend stores for a user based on their demographics and preferences.

USER PROFILE:
- Age: {age}
- Gender: {gender}

AVAILABLE STORES:
{store_data_formatted_as_json}

IMPORTANT: You must respond ONLY with a valid JSON object and no additional text, explanations, or markdown formatting.

The JSON must follow this exact format:
{
  "rankings": [store_id_1, store_id_2, ...], // ordered by relevance
  "explanations": {
    "store_id_1": "Reason why this store is recommended",
    "store_id_2": "Reason why this store is recommended"
  }
}

Include your reasoning for the top 3 rankings in the explanations field, explaining why they would be most relevant to this user.
Do not include any text outside the JSON object.
```

## Fallback Mechanisms

To ensure robustness, the system includes multiple fallback mechanisms:

1. If user demographic data is missing, it's fetched directly from the backend
2. If the API call fails, default values are used (MEN, age 30)
3. If the LLM call fails, a simple algorithm sorts stores alphabetically
4. If parsing fails, the original unfiltered store list is returned

## Debug Mode

A debug panel is available in the UI that shows:
- User demographic data used for recommendations
- The recommendation process steps
- LLM explanations for each recommendation
- API connection status

This can be toggled with the "Demo Mode" button for testing and demonstration purposes. 

## Real Example: Console Logs of LLM Workflow

Below is a real example of the LLM recommendation process as captured in the browser console:

### 1. Starting the Recommendation Process
```
📝 [RecommendationService] Starting store recommendation process
📝 [RecommendationService] Demographics missing, fetching directly from backend
```

### 2. Fetching User Demographics
```
🔍 Fetching user demographics directly from the UserController...
Adding JWT token to request: http://localhost:8084/api/user/getUser/9
Request with headers: ['Authorization']
📊 Raw user data received: 
{
  first_name: 'Taha', 
  last_name: 'Ghz', 
  birth_date: [2000, 1, 1], 
  email: 'tahaghazouani@gmail.com', 
  password: '$2a$10$.rL6FxsU/xDqWIou5agtZ.U.inpVlMLmQ760YM/U1NHV9s99ZSaoC',
  ...
}
✅ Updating localStorage with demographics: {sexe: 'MEN', birthDate: [2000, 1, 1]}
```

### 3. Building User Profile and Generating Prompt
```
🧠 RECOMMENDATION DETAILS
👤 User Data Used for Recommendation
{
  userId: 9,
  demographic: {
    age: 24,
    sex: "MEN"
  },
  rawUserData: {
    birthDate: [2000, 1, 1],
    sexe: "MEN"
  }
}

📤 Prompt Sent to LLM
Rank the following stores by relevance for a user with these characteristics:
- Age: 24
- Sex: MEN

Stores to rank:
[
  {
    "id": 1,
    "name": "boutique",
    "type": "SHOP",
    "description": "Description of the boutique store",
    "city": "Tunis"
  },
  {
    "id": 3,
    "name": "new cafe shop",
    "type": "CAFE",
    "description": "A modern coffee shop with specialty brews",
    "city": "Sousse"
  },
  {
    "id": 5,
    "name": "gggggg",
    "type": "ELECTRONICS",
    "description": "Latest gadgets and tech accessories",
    "city": "Sfax"
  }
]

IMPORTANT: You must respond ONLY with a valid JSON object and no additional text, explanations, or markdown formatting.

The JSON must follow this exact format:
{
  "rankings": [3, 1, 5, 2, 4],
  "explanations": {
    "3": "This store is recommended because...",
    "1": "This store is recommended because...",
    "5": "This store is recommended because..."
  }
}

Include your reasoning for the top 3 rankings in the explanations field, explaining why they would be most relevant to this user.
Do not include any text outside the JSON object.
```

### 4. LLM API Call
```
📝 [RecommendationService] Calling Groq API (llama3-70b-8192)...
Skipping JWT interceptor for: https://api.groq.com/openai/v1/chat/completions
```

### 5. Raw LLM Response
```
📥 Raw LLM Output
{
  "rankings": [5, 3, 1],
  "explanations": {
    "5": "As a 24-year-old man, you're likely interested in technology and electronics. The 'gggggg' electronics store offers the latest gadgets and tech accessories, which aligns well with interests common among men in your age group.",
    "3": "Young men often enjoy socializing in café settings. 'New cafe shop' offers specialty brews which appeals to the 24-year-old demographic that appreciates modern coffee culture and social environments.",
    "1": "The boutique store offers general shopping options which, while not as specifically targeted to your demographic as the electronics store, still provides value for everyday needs."
  }
}
```

### 6. Final Result
```
Recommended stores loaded
(3) [{…}, {…}, {…}]
0: {storeID: 5, name: 'gggggg', opening: '23:48', closing: '13:50', logo: 'www.date.com', …}
1: {storeID: 3, name: 'new cafe shop', opening: '23:36', closing: '23:36', logo: 'www.date.com', …}
2: {storeID: 1, name: 'boutique', opening: '17:07', closing: '19:07', logo: 'www.date.com', …}
```

The logs show the complete flow from detecting missing demographic data, fetching it from the backend, building the user profile (24-year-old man), generating a prompt with the available stores, sending it to the LLM, receiving ranked recommendations, and finally displaying them to the user.

Note how the stores are sorted in the final output according to the rankings returned by the LLM (5, 3, 1), with store ID 5 (electronics store) being ranked highest for the young male demographic.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpContext } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../user/auth.service';
import { Store, StoreType } from '../../modules/store/store/model/store';
import { Offer } from '../offres/offre.service';
import { SKIP_AUTH_INTERCEPTOR } from '../../../interceptors/jwt.interceptor';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private readonly GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  
  // Environment setting for logging level
  private debugMode: boolean = false;
  
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Check for debug mode in localStorage
    this.debugMode = localStorage.getItem('debugMode') === 'true';
  }
  
  // Helper method to get the context for skipping auth
  private getSkipAuthContext(): HttpContext {
    return new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true);
  }
  
  /**
   * Structured logging function to replace scattered console.logs
   * @param level Log level (info, warn, error, debug)
   * @param message Message to log
   * @param data Optional data to include
   */
  private log(level: 'info' | 'warn' | 'error' | 'debug', message: string, data?: any): void {
    if (!this.debugMode && level === 'debug') return;
    
    const emoji = {
      info: '📝',
      warn: '⚠️',
      error: '❌',
      debug: '🔍'
    };
    
    const prefix = `${emoji[level]} [RecommendationService]`;
    
    switch (level) {
      case 'info':
        console.log(`${prefix} ${message}`, data !== undefined ? data : '');
        break;
      case 'warn':
        console.warn(`${prefix} ${message}`, data !== undefined ? data : '');
        break;
      case 'error':
        console.error(`${prefix} ${message}`, data !== undefined ? data : '');
        break;
      case 'debug':
        console.log(`${prefix} ${message}`, data !== undefined ? data : '');
        break;
    }
  }
  
  /**
   * Creates a console log group with proper styling
   * @param title Title of the log group
   * @param type Type of log group (info, warn, error)
   */
  private logGroup(title: string, type: 'info' | 'warn' | 'error' = 'info'): void {
    // Simple styling that's more readable
    console.group(title);
  }
  
  /**
   * Closes a log group
   */
  private logGroupEnd(): void {
    console.groupEnd();
  }
  
  /**
   * Logs detailed data within a group with improved formatting
   * @param title Section title
   * @param data Data to log
   */
  private logDetailedData(title: string, data: any): void {
    const isString = typeof data === 'string';
    
    console.log(title);
    
    if (isString) {
      // For string data (like prompts), just log it directly
      console.log(data);
    } else {
      // For object data, just log it normally for expandable view
      console.log(data);
    }
    
    // Simple separator
    console.log('----------------------------------------');
  }
  
  /**
   * Sets up the headers for Groq API call
   * @param apiKey The Groq API key
   * @returns HttpHeaders with authorization
   */
  private getGroqHeaders(apiKey: string): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    });
  }
  
  /**
   * Sets test demographic data for demonstration purposes
   * @param userId The user ID
   */
  setTestDemographicData(userId: number): void {
    this.log('info', 'Setting test demographic data for user', userId);
    
    // Use the direct method from auth service to fetch the data
    this.authService.fetchAndUpdateUserDemographics(userId).subscribe({
      next: (userData) => {
        this.log('info', 'Successfully fetched and updated user data', userData);
      },
      error: (err) => {
        this.log('error', 'Error fetching direct user data', err);
        
        // Fallback to test data
        const currentUser = this.authService.getUser();
        const updatedUser = {
          ...currentUser,
          sexe: 'MEN',
          birthDate: '1990-01-01'
        };
        
        this.log('warn', 'Using fallback test demographic data', updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    });
  }
  
  /**
   * Normalizes the sex value to match the database enum
   */
  private normalizeSexValue(sexValue: string | null): string {
    if (!sexValue) return 'UNKNOWN';
    
    // Convert to uppercase for case-insensitive comparison
    const upperSex = sexValue.toUpperCase();
    
    if (upperSex === 'MEN' || upperSex === 'MALE' || upperSex === 'M') {
      return 'MEN';
    } else if (upperSex === 'WOMEN' || upperSex === 'FEMALE' || upperSex === 'F') {
      return 'WOMEN';
    }
    
    return upperSex; // Return as is if it doesn't match known values
  }
  
  /**
   * Recommends stores based on user preferences using Groq LLM
   * @param stores List of all stores
   * @param apiKey Groq API key
   * @returns Observable of ranked stores
   */
  recommendStores(stores: Store[], apiKey: string): Observable<Store[]> {
    this.log('info', 'Starting store recommendation process');
    
    // First try to get user from localStorage
    const user = this.authService.getUser();
    this.log('debug', 'Retrieved user information from localStorage', user);
    
    if (!user || !user.userId || stores.length === 0) {
      this.log('warn', 'Missing user data or no stores available. Returning unfiltered stores.');
      return of(stores);
    }
    
    // If demographics are missing, fetch them directly
    if ((!user.sexe || user.sexe === '') || (!user.birthDate || user.birthDate === '')) {
      this.log('info', 'Demographics missing, fetching directly from backend');
      
      return this.authService.fetchAndUpdateUserDemographics(user.userId).pipe(
        switchMap(userData => {
          // Refresh user data after update
          const updatedUser = this.authService.getUser();
          this.log('debug', 'Updated user data', updatedUser);
          
          return this.processRecommendation(updatedUser, stores, apiKey);
        }),
        catchError(error => {
          this.log('warn', 'Direct fetch failed, using fallback', error);
          
          // If demographics are still missing, use fallback values
          if ((!user.sexe || user.sexe === '') && (!user.birthDate || user.birthDate === '')) {
            user.sexe = 'MEN';
            user.birthDate = '1990-01-01';
            
            // Update localStorage with fallback data
            const currentUser = this.authService.getUser();
            localStorage.setItem('user', JSON.stringify({
              ...currentUser,
              sexe: 'MEN',
              birthDate: '1990-01-01'
            }));
          }
          
          return this.processRecommendation(user, stores, apiKey);
        })
      );
    }
    
    // If demographics are available, proceed with recommendation
    return this.processRecommendation(user, stores, apiKey);
  }
  
  /**
   * Processes the recommendation with complete user data
   */
  private processRecommendation(user: any, stores: Store[], apiKey: string): Observable<Store[]> {
    // Try to extract age and sex with more aggressive fallbacks
    const birthDateValue = user.birthDate || user.birth_date || user.dateOfBirth || null;
    let sexValue = user.sexe || user.sex || user.gender || null;
    
    // Normalize sex value
    sexValue = this.normalizeSexValue(sexValue);
    
    // Extract relevant user information
    const userProfile = {
      age: this.calculateAge(birthDateValue),
      sex: sexValue
    };
    
    // Start a log group for recommendation details - always visible
    this.logGroup('SPEEDY GO LLM RECOMMENDATION WORKFLOW');
    console.log('1. STARTING RECOMMENDATION ENGINE');
    
    this.logDetailedData('USER DEMOGRAPHIC PROFILE', {
      userId: user.userId,
      age: userProfile.age,
      gender: userProfile.sex,
      calculatedFrom: {
        birthDate: birthDateValue,
        originalFormat: Array.isArray(birthDateValue) ? 'Array' : typeof birthDateValue
      }
    });
    
    // Extract store data for LLM
    const storeData = stores.map(store => ({
      id: store.storeID,
      name: store.name,
      type: store.storeType,
      description: store.description,
      city: store.city
    }));
    
    console.log('2. GENERATING LLM PROMPT');
    
    // Build the prompt for the LLM
    const prompt = this.buildRecommendationPrompt(userProfile, storeData);
    this.logDetailedData('PROMPT SENT TO GROQ LLM API', prompt);
    
    console.log('3. CALLING GROQ LLM API (llama3-70b-8192)');
    
    return this.callGroqAPI(prompt, apiKey).pipe(
      map(response => {
        console.log('4. RECEIVED LLM RESPONSE');
        this.logDetailedData('RAW LLM RESPONSE', response);
        
        try {
          // Parse the LLM response to get store IDs in order of relevance
          const rankings = this.parseRankings(response);
          
          console.log('5. PROCESSING RESULTS');
          this.logDetailedData('PARSED RANKINGS', rankings);
          
          // Sort the original store list based on the rankings
          const sortedStores = this.sortStoresByRanking(stores, rankings);
          
          console.log('6. RECOMMENDATION COMPLETE');
          this.logDetailedData('FINAL RECOMMENDATIONS', sortedStores.slice(0, 3));
          
          this.logGroupEnd();
          return sortedStores;
        } catch (error) {
          console.log('ERROR PROCESSING LLM RESPONSE');
          console.error(error);
          this.logGroupEnd();
          return stores; // Return original stores if there's an error
        }
      }),
      catchError(error => {
        console.log('ERROR CALLING LLM API');
        console.error(error);
        this.logGroupEnd();
        return of(stores); // Return original stores on error
      })
    );
  }
  
  /**
   * Recommends offers based on user preferences
   * @param offers List of all offers
   * @param apiKey Groq API key
   * @returns Observable of top 3 recommended offers
   */
  recommendOffers(offers: Offer[], apiKey: string): Observable<Offer[]> {
    this.log('info', 'Starting offer recommendation process');
    
    const user = this.authService.getUser();
    
    if (!user || !user.userId || offers.length === 0) {
      this.log('warn', 'Missing user data or no offers available. Returning top 3 unfiltered offers.');
      return of(offers.slice(0, 3)); // Return first 3 offers if no user data
    }
    
    // Extract relevant user information
    const userProfile = {
      age: this.calculateAge(user.birthDate),
      sex: user.sexe || 'UNKNOWN'
    };
    
    // Start a log group for offer recommendation details - always visible
    this.logGroup('SPEEDY GO OFFER RECOMMENDATION WORKFLOW');
    console.log('1. STARTING OFFER RECOMMENDATION ENGINE');
    
    this.logDetailedData('USER DEMOGRAPHIC PROFILE', {
      userId: user.userId,
      age: userProfile.age,
      gender: userProfile.sex
    });
    
    // Extract offer data for LLM
    const offerData = offers.map(offer => ({
      id: offer.offre_id,
      title: offer.title,
      description: offer.description,
      price: offer.price,
      discount: offer.discount,
      category: offer.category,
      storeName: offer.store_name
    }));
    
    console.log('2. GENERATING LLM PROMPT');
    
    const prompt = this.buildOfferRecommendationPrompt(userProfile, offerData);
    this.logDetailedData('PROMPT SENT TO GROQ LLM API', prompt);
    
    console.log('3. CALLING GROQ LLM API (llama3-70b-8192)');
    
    return this.callGroqAPI(prompt, apiKey).pipe(
      map(response => {
        console.log('4. RECEIVED LLM RESPONSE');
        this.logDetailedData('RAW LLM RESPONSE', response);
        
        try {
          // Parse the LLM response to get offer IDs in order of relevance
          const rankings = this.parseRankings(response);
          
          console.log('5. PROCESSING RESULTS');
          this.logDetailedData('PARSED RANKINGS', rankings);
          
          // Sort and limit to top 3 offers
          const sortedOffers = this.sortOffersByRanking(offers, rankings);
          const topOffers = sortedOffers.slice(0, 3);
          
          console.log('6. RECOMMENDATION COMPLETE');
          this.logDetailedData('FINAL RECOMMENDATIONS', topOffers);
          
          this.logGroupEnd();
          return topOffers;
        } catch (error) {
          console.log('ERROR PROCESSING LLM RESPONSE');
          console.error(error);
          this.logGroupEnd();
          return offers.slice(0, 3); // Return first 3 offers if there's an error
        }
      }),
      catchError(error => {
        console.log('ERROR CALLING LLM API');
        console.error(error);
        this.logGroupEnd();
        return of(offers.slice(0, 3)); // Return first 3 offers on error
      })
    );
  }
  
  /**
   * Calls the Groq API with the given prompt
   * @param prompt The prompt to send to Groq
   * @param apiKey Groq API key
   * @returns Observable of the LLM response
   */
  private callGroqAPI(prompt: string, apiKey: string): Observable<string> {
    const payload = {
      model: 'llama3-70b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a recommendation system for a delivery service app. Your task is to rank stores based on user preferences. Provide clear explanations for your recommendations and respond in the requested JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    };
    
    // Create headers directly here to avoid the JWT interceptor
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    });
    
    // Use an absolute URL and pass skipInterceptor flag
    return this.http.post<any>(
      this.GROQ_API_URL, 
      payload,
      { 
        headers,
        context: this.getSkipAuthContext()
      }
    ).pipe(
      map(response => response.choices[0].message.content),
      catchError(error => {
        this.log('error', 'Error calling Groq API', error);
        throw error;
      })
    );
  }
  
  /**
   * Builds a prompt for store recommendations
   */
  private buildRecommendationPrompt(userProfile: any, storeData: any[]): string {
    return `
Rank the following stores by relevance for a user with these characteristics:
- Age: ${userProfile.age || 'unknown'}
- Sex: ${userProfile.sex || 'UNKNOWN'}

Stores to rank:
${JSON.stringify(storeData, null, 2)}

CRITICAL: You must respond with ONLY a valid, properly formatted JSON object. No text before or after the JSON.
Do not use markdown formatting like \`\`\`json or \`\`\`.

The JSON must strictly follow this exact format with no deviations:
{
  "rankings": [3, 1, 5, 2, 4],
  "explanations": {
    "3": "This store is recommended because...",
    "1": "This store is recommended because...",
    "5": "This store is recommended because..."
  }
}

Be extremely careful with quotes, brackets, and commas. Double-check that all array brackets and quotes are properly matched.
Include your reasoning for the top 3 rankings in the explanations field, explaining why they would be most relevant to this user.
`.trim();
  }
  





















  /**
   * THIS IS NOT BEING USED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   */
  private buildOfferRecommendationPrompt(userProfile: any, offerData: any[]): string {
    return `
Rank the following offers by relevance for a user with these characteristics:
- Age: ${userProfile.age || 'unknown'}
- Sex: ${userProfile.sex || 'UNKNOWN'}

Offers to rank:
${JSON.stringify(offerData, null, 2)}

CRITICAL: You must respond with ONLY a valid, properly formatted JSON object. No text before or after the JSON.
Do not use markdown formatting like \`\`\`json or \`\`\`.

The JSON must strictly follow this exact format with no deviations:
{
  "rankings": [3, 1, 5, 2, 4],
  "explanations": {
    "3": "This offer is recommended because...",
    "1": "This offer is recommended because...",
    "5": "This offer is recommended because..."
  }
}

Be extremely careful with quotes, brackets, and commas. Double-check that all array brackets and quotes are properly matched.
Include your reasoning for the top 3 rankings in the explanations field, explaining why they would be most relevant to this user.
`.trim();
  }
  
  /**
   * Parses the LLM response to extract rankings and explanations
   */
  private parseRankings(response: string): any {
    try {
      // More robust cleaning of the response
      // 1. Remove any markdown code blocks
      let cleanedResponse = response.replace(/```json|```/g, '').trim();
      
      // 2. Find the first { and last } to extract just the JSON object
      const startIdx = cleanedResponse.indexOf('{');
      const endIdx = cleanedResponse.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedResponse = cleanedResponse.substring(startIdx, endIdx + 1);
      }
      
      // 3. Replace common JSON formatting errors
      cleanedResponse = cleanedResponse
        // Fix mismatched quotes in arrays
        .replace(/\[\s*([^"\[\]]+?)\s*\]/g, (match, content) => {
          // Replace any mismatched quotes in array elements
          return '[' + content.replace(/"+/g, '').split(',').map((s: string) => s.trim()).filter((s: string) => s).join(', ') + ']';
        })
        // Remove trailing commas
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
      
      console.log('Cleaned JSON before parsing:', cleanedResponse);
      
      const parsedResponse = JSON.parse(cleanedResponse);
      
      // Log the explanations for demonstration
      if (parsedResponse.explanations) {
        // Create a log group for explanations
        console.log('LLM EXPLANATIONS FOR RECOMMENDATIONS');
        
        Object.entries(parsedResponse.explanations).forEach(([id, explanation]) => {
          console.log(`ID ${id}: ${explanation}`);
        });
        
        // Dispatch custom event for the debug panel
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('recommendation-explanation', {
            detail: { explanations: parsedResponse.explanations }
          });
          window.dispatchEvent(event);
        }
      }
      
      // Return just the rankings array for sorting
      return parsedResponse.rankings || [];
    } catch (error) {
      console.log('ERROR PARSING LLM JSON RESPONSE');
      console.error('Error parsing response:', error);
      console.log('Raw response:', response);
      
      // Attempt manual extraction of rankings if JSON parsing fails
      try {
        const rankingsMatch = response.match(/"rankings"\s*:\s*\[(.*?)\]/);
        if (rankingsMatch && rankingsMatch[1]) {
          // Extract numbers from the rankings match
          const manualRankings = rankingsMatch[1]
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n));
          
          console.log('Manually extracted rankings:', manualRankings);
          return manualRankings;
        }
      } catch (fallbackError) {
        console.error('Even manual extraction failed:', fallbackError);
      }
      
      return [];
    }
  }
  
  /**
   * Sorts stores based on the ranking returned by the LLM
   */
  private sortStoresByRanking(stores: Store[], rankings: number[]): Store[] {
    // Create a map for quick lookup of ranking position
    const rankMap = new Map<number, number>();
    rankings.forEach((id, index) => rankMap.set(id, index));
    
    // Sort stores based on their position in rankings
    return [...stores].sort((a, b) => {
      // Ensure storeID is a number and provide fallback to avoid undefined
      const idA = a.storeID !== undefined ? a.storeID : -1;
      const idB = b.storeID !== undefined ? b.storeID : -1;
      // Safely get ranking position with fallback to Infinity if not found
      const rankA = idA !== -1 && rankMap.has(idA) ? (rankMap.get(idA) ?? Infinity) : Infinity;
      const rankB = idB !== -1 && rankMap.has(idB) ? (rankMap.get(idB) ?? Infinity) : Infinity;
      
      return rankA - rankB;
    });
  }
  
  /**
   * THIS IS NOT BEING USED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   */
  private sortOffersByRanking(offers: Offer[], rankings: number[]): Offer[] {
    // Create a map for quick lookup of ranking position
    const rankMap = new Map<number, number>();
    rankings.forEach((id, index) => rankMap.set(id, index));
    
    // Sort offers based on their position in rankings
    return [...offers].sort((a, b) => {
      // Safely get ranking position with fallback to Infinity if not found
      const rankA = rankMap.has(a.offre_id) ? (rankMap.get(a.offre_id) ?? Infinity) : Infinity;
      const rankB = rankMap.has(b.offre_id) ? (rankMap.get(b.offre_id) ?? Infinity) : Infinity;
      
      return rankA - rankB;
    });
  }
  
  /**
   * Calculates age from birthdate
   */
  private calculateAge(birthDate: string): number | null {
    if (!birthDate) return null;
    
    try {
      this.log('debug', 'Calculating age from birthDate', birthDate);
      const dob = new Date(birthDate);
      
      // Check if date is valid
      if (isNaN(dob.getTime())) {
        this.log('warn', 'Invalid date format', birthDate);
        return null;
      }
      
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      this.log('debug', 'Calculated age', age);
      return age;
    } catch (error) {
      this.log('error', `Error calculating age from ${birthDate}`, error);
      return null;
    }
  }
} 
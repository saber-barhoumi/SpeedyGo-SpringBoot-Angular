// src/app/shared/services/chatbot.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  title: string;
  lastUpdated: Date;
  messages: ChatMessage[];
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private apiKey = 'AIzaSyAC8vTUuK7altAi4lsEb5g-6BMsCg6K2GM';
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';
  private sessions: ChatSession[] = [];
  private currentSessionId: string | null = null;

  constructor(private http: HttpClient) {
    // Load sessions from localStorage
    this.loadSessions();
  }

  private loadSessions(): void {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      this.sessions = JSON.parse(savedSessions);
      // Convert string dates back to Date objects
      this.sessions.forEach(session => {
        session.lastUpdated = new Date(session.lastUpdated);
        session.messages.forEach(msg => {
          msg.timestamp = new Date(msg.timestamp);
        });
      });
    }
  }

  private saveSessions(): void {
    localStorage.setItem('chatSessions', JSON.stringify(this.sessions));
  }

  createNewSession(): string {
    const sessionId = 'session_' + Date.now();
    const newSession: ChatSession = {
      id: sessionId,
      title: 'New Chat',
      lastUpdated: new Date(),
      messages: []
    };
    
    this.sessions.unshift(newSession); // Add to beginning of array
    this.currentSessionId = sessionId;
    this.saveSessions();
    return sessionId;
  }

  setCurrentSession(sessionId: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      this.currentSessionId = sessionId;
    }
  }

  getCurrentSession(): ChatSession | null {
    if (!this.currentSessionId) return null;
    return this.sessions.find(s => s.id === this.currentSessionId) || null;
  }

  getAllSessions(): ChatSession[] {
    return this.sessions;
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const session = this.sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = title;
      session.lastUpdated = new Date();
      this.saveSessions();
    }
  }

  deleteSession(sessionId: string): void {
    const index = this.sessions.findIndex(s => s.id === sessionId);
    if (index !== -1) {
      this.sessions.splice(index, 1);
      if (this.currentSessionId === sessionId) {
        this.currentSessionId = this.sessions.length > 0 ? this.sessions[0].id : null;
      }
      this.saveSessions();
    }
  }

  sendMessage(text: string): Observable<ChatMessage> {
    // Create and add user message
    const userMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      content: text,
      role: 'user',
      timestamp: new Date()
    };

    // Ensure we have a current session
    if (!this.currentSessionId) {
      this.createNewSession();
    }

    const session = this.getCurrentSession()!;
    session.messages.push(userMessage);
    session.lastUpdated = new Date();
    
    // If this is the first message, set the title based on content
    if (session.messages.length === 1) {
      session.title = text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }
    
    this.saveSessions();

    // Prepare the API request
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const requestBody = {
      contents: [
        {
          parts: [{ text }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    const url = `${this.apiUrl}?key=${this.apiKey}`;

    // Make the API call
    return this.http.post(url, requestBody, { headers }).pipe(
      map((response: any) => {
        const responseText = response.candidates[0]?.content?.parts[0]?.text || 'Sorry, I couldn\'t generate a response.';
        
        // Create and add assistant message
        const assistantMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          content: responseText,
          role: 'assistant',
          timestamp: new Date()
        };
        
        session.messages.push(assistantMessage);
        session.lastUpdated = new Date();
        this.saveSessions();
        
        return assistantMessage;
      }),
      catchError(error => {
        console.error('Error calling Gemini API:', error);
        
        // Create error message
        const errorMessage: ChatMessage = {
          id: 'msg_' + Date.now(),
          content: 'Sorry, there was an error processing your request. Please try again later.',
          role: 'assistant',
          timestamp: new Date()
        };
        
        session.messages.push(errorMessage);
        session.lastUpdated = new Date();
        this.saveSessions();
        
        return of(errorMessage);
      })
    );
  }

  searchSessions(query: string): ChatSession[] {
    if (!query.trim()) return this.sessions;
    
    const lowerQuery = query.toLowerCase();
    return this.sessions.filter(session => 
      session.title.toLowerCase().includes(lowerQuery) || 
      session.messages.some(msg => msg.content.toLowerCase().includes(lowerQuery))
    );
  }
}
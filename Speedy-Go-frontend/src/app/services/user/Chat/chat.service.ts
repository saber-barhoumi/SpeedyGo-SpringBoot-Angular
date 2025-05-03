import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, of, throwError } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';
import SockJS from 'sockjs-client';  // Importation par défaut
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../FrontOffices/services/user/auth.service';
import { Client, Message as StompMessage } from '@stomp/stompjs';

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  conversationId: number;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: number;
  title: string;
  createdAt: string;
  participants: User[];
  lastMessage: Message | null;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  online: boolean;
  profilePicture?: any;
  profilePictureType?: string;
}

export interface ChatNotification {
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: string;
}

export interface UserStatusUpdate {
  userId: number;
  email: string;
  online: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private stompClient: any = null;
  private socketConnected = false;
  private baseUrl = environment.apiUrl;
  
  private messageSubject = new Subject<Message>();
  private notificationSubject = new Subject<ChatNotification>();
  private userStatusSubject = new Subject<UserStatusUpdate>();
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private selectedConversationSubject = new BehaviorSubject<Conversation | null>(null);
  
  // Track messages in memory for message status updates
  private sentMessages: Message[] = [];
  private userStatusMap = new Map<number, boolean>();

  private connectPromise: Promise<boolean> | null = null;
  
  public messages$ = this.messageSubject.asObservable();
  public notifications$ = this.notificationSubject.asObservable();
  public userStatus$ = this.userStatusSubject.asObservable();
  public conversations$ = this.conversationsSubject.asObservable();
  public selectedConversation$ = this.selectedConversationSubject.asObservable();

  private subscriptions: { [key: string]: any } = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('ChatService initialized with baseUrl:', this.baseUrl);
    // Just connect at initialization if token exists
    if (this.authService.getToken()) {
      this.connect();
    }
  }

  private initializeConnection(): void {
    // Use hasToken check instead of AuthState$
    if (this.authService.getToken()) {
      this.connect();
    }
  }
  
  public getCurrentUserId(): number {
    const userData = this.authService.getUser();
    return userData?.userId || 0;
  }

  // ******************************************************************
  // Code الجديد يبدأ من هنا
  // ******************************************************************

  private isStompConnected(): boolean {
    return this.socketConnected && 
           this.stompClient && 
           this.stompClient.connected;
  }

  public connect(): Promise<boolean> {
    // Return existing promise if connection is in progress
    if (this.connectPromise) {
      return this.connectPromise;
    }
    
    if (this.isStompConnected()) {
      return Promise.resolve(true);
    }
    
    // Reset any existing state
    if (this.stompClient) {
      this.disconnect();
    }
    
    const token = this.authService.getToken();
    if (!token) {
      return Promise.reject('No authentication token available');
    }
    
    // Create a new promise for this connection attempt
    this.connectPromise = new Promise<boolean>((resolve, reject) => {
      try {
        const wsUrl = `${this.baseUrl.replace('/api', '')}/ws`;
        console.log('Connecting to WebSocket at:', wsUrl);
        
        const socket = new SockJS(wsUrl);
        
        import('@stomp/stompjs').then((stompModule: any) => {
          const Client = stompModule.Client;
          const client = new Client();
          
          (client as any).webSocketFactory = () => socket;
          
          client.connectHeaders = {
            'Authorization': `Bearer ${token}`,
            'X-Client-Type': 'angular'
          };
          
          // Add heartbeat to detect connection drops
          client.heartbeatIncoming = 4000;
          client.heartbeatOutgoing = 4000;
          
          // Add debug logging to diagnose issues
          client.debug = (str: string) => {
            console.debug('STOMP:', str);
          };
          
          client.onConnect = (frame: any) => {
            console.log('WebSocket connected successfully!');
            this.socketConnected = true;
            this.setupSubscriptions(client);
            this.sendInitialStatus(client);
            this.loadConversations();
            this.connectPromise = null;
            resolve(true);
          };

          client.onStompError = (frame: any) => {
            console.error('STOMP error:', frame.headers['message']);
            this.socketConnected = false;
            this.connectPromise = null;
            reject(new Error(`STOMP error: ${frame.headers['message']}`));
            this.handleConnectionError(frame);
          };

          client.onWebSocketError = (error: any) => {
            console.error('WebSocket error:', error);
            this.socketConnected = false;
            this.connectPromise = null;
            reject(error);
            this.handleConnectionError(error);
          };

          client.onDisconnect = () => {
            console.log('WebSocket disconnected');
            this.socketConnected = false;
            this.connectPromise = null;
          };

          this.stompClient = client;
          client.activate();
        }).catch(error => {
          console.error('Failed to load STOMP client:', error);
          this.socketConnected = false;
          this.connectPromise = null;
          reject(error);
        });
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        this.socketConnected = false;
        this.connectPromise = null;
        reject(error);
      }
    });
    
    return this.connectPromise;
  }

 
  public disconnect(): void {
    if (!this.stompClient || !this.socketConnected) {
      console.log('No active connection to disconnect');
      return;
    }

    try {
      // Notify server we're going offline
      this.stompClient.publish({
        destination: '/app/chat.userStatus',
        body: JSON.stringify({ online: false, timestamp: new Date().toISOString() })
      });

      // Unsubscribe from all topics
      Object.keys(this.subscriptions).forEach(key => {
        try {
          this.subscriptions[key].unsubscribe();
          console.log(`Unsubscribed from ${key}`);
        } catch (error) {
          console.error(`Failed to unsubscribe from ${key}:`, error);
        }
      });
      this.subscriptions = {};

      // Disconnect
      this.stompClient.deactivate();
      this.socketConnected = false;
      console.log('WebSocket successfully disconnected');
    } catch (error) {
      console.error('Error during disconnection:', error);
    }
  }

  private setupSubscriptions(client: any): void {
    try {
      // Subscribe to notifications
      this.subscriptions['notifications'] = client.subscribe(
        '/user/queue/notifications',
        (message: any) => {
          try {
            const notification = JSON.parse(message.body) as ChatNotification;
            console.log('Received notification:', notification);
            this.notificationSubject.next(notification);
          } catch (error) {
            console.error('Failed to parse notification:', error);
          }
        }
      );

      // Subscribe to user status updates
      this.subscriptions['status'] = client.subscribe(
        '/topic/user.status',
        (message: any) => {
          try {
            const status = JSON.parse(message.body) as UserStatusUpdate;
            console.log('Received user status update:', status);
            this.userStatusSubject.next(status);
            this.updateUserStatusInConversations(status);
          } catch (error) {
            console.error('Failed to parse user status:', error);
          }
        }
      );

      // Subscribe to conversation updates
      this.subscriptions['conversations'] = client.subscribe(
        '/user/queue/conversations',
        (message: any) => {
          try {
            const conversation = JSON.parse(message.body) as Conversation;
            console.log('Received conversation update:', conversation);
            this.updateConversationList(conversation);
          } catch (error) {
            console.error('Failed to parse conversation update:', error);
          }
        }
      );
    } catch (error) {
      console.error('Failed to setup subscriptions:', error);
    }
  }

  private sendInitialStatus(client: any): void {
    try {
      client.publish({
        destination: '/app/chat.userStatus',
        body: JSON.stringify({ online: true, timestamp: new Date().toISOString() })
      });
      console.log('Sent initial online status');
    } catch (error) {
      console.error('Failed to send initial status:', error);
    }
  }

  private handleConnectionError(error: any): void {
    console.error('Connection error occurred:', error);
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      this.connect();
    }, 5000);
  }

  private updateConversationList(updatedConversation: Conversation): void {
    const currentConversations = this.conversationsSubject.value;
    const index = currentConversations.findIndex(c => c.id === updatedConversation.id);
    
    if (index >= 0) {
      // Update existing conversation
      currentConversations[index] = updatedConversation;
    } else {
      // Add new conversation
      currentConversations.push(updatedConversation);
    }
    
    this.conversationsSubject.next([...currentConversations]);
  }

  public loadConversations(): void {
    this.http.get<Conversation[]>(`${this.baseUrl}/conversations`)
      .pipe(
        catchError(error => {
          console.error('Failed to load conversations:', error);
          return of([]);
        })
      )
      .subscribe({
        next: (conversations) => {
          console.log('Loaded conversations:', conversations?.length);
          this.conversationsSubject.next(conversations || []);
        }
      });
  }

  public selectConversation(conversation: Conversation): void {
    if (!conversation) {
      console.error('Cannot select null conversation');
      return;
    }

    console.log('Selecting conversation:', conversation.id);
    this.selectedConversationSubject.next(conversation);
    
    if (this.socketConnected && this.stompClient) {
      try {
        // Unsubscribe from previous conversation if exists
        if (this.subscriptions['conversation']) {
          this.subscriptions['conversation'].unsubscribe();
          delete this.subscriptions['conversation'];
        }

        const topicPath = `/topic/conversation.${conversation.id}`;
        
        this.subscriptions['conversation'] = this.stompClient.subscribe(
          topicPath,
          (message: any) => {
            try {
              const chatMessage = JSON.parse(message.body) as Message;
              console.log('Received message:', chatMessage);
              this.messageSubject.next(chatMessage);
            } catch (error) {
              console.error('Failed to parse message:', error);
            }
          }
        );

        this.loadMessages(conversation.id);
      } catch (error) {
        console.error('Error selecting conversation:', error);
      }
    }
  }

  public loadMessages(conversationId: number): Observable<Message[]> {
    console.log(`Loading messages for conversation ${conversationId}`);
    return this.http.get<Message[]>(`${this.baseUrl}/conversations/${conversationId}/messages`)
      .pipe(
        catchError(error => {
          console.error(`Failed to load messages for conversation ${conversationId}:`, error);
          return of([]);
        }),
        map(messages => {
          messages = messages || [];
          messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          console.log(`Loaded ${messages.length} messages for conversation ${conversationId}`);
          return messages;
        })
      );
  }

  public markAsRead(conversationId: number): Observable<void> {
    console.log(`Marking conversation ${conversationId} as read`);
    return this.http.put<void>(`${this.baseUrl}/conversations/${conversationId}/read`, {})
      .pipe(
        catchError(error => {
          console.error(`Failed to mark conversation ${conversationId} as read:`, error);
          return throwError(() => error);
        })
      );
  }

  public getOrCreateCommonConversation(): Observable<Conversation> {
    console.log('Getting or creating common conversation');
    return this.http.post<Conversation>(`${this.baseUrl}/conversations/common`, {
      title: 'General Chat'
    }).pipe(
      tap(conversation => {
        console.log('Common conversation:', conversation);
        this.updateConversationList(conversation);
      }),
      catchError(error => {
        console.error('Failed to get or create common conversation:', error);
        return throwError(() => error);
      })
    );
  }

  private updateUserStatusInConversations(statusUpdate: UserStatusUpdate): void {
    // Update the status map
    this.userStatusMap.set(statusUpdate.userId, statusUpdate.online);
    
    const conversations = this.conversationsSubject.value;
    let updated = false;
    
    conversations.forEach(conversation => {
      if (!conversation.participants) return;
      
      const userIndex = conversation.participants.findIndex(
        user => user.userId === statusUpdate.userId
      );
      
      if (userIndex > -1 && conversation.participants[userIndex].online !== statusUpdate.online) {
        conversation.participants[userIndex].online = statusUpdate.online;
        updated = true;
      }
    });
    
    if (updated) {
      console.log('Updated user status in conversations');
      this.conversationsSubject.next([...conversations]);
    }
  }

  public createConversation(title: string, participantId: number): Observable<Conversation> {
    console.log(`Creating conversation with ${participantId}, title: ${title}`);
    return this.http.post<Conversation>(`${this.baseUrl}/conversations`, {
      participantId,
      title: title || 'New Conversation'
    }).pipe(
      tap(conversation => {
        console.log('Created conversation:', conversation);
        const currentConversations = this.conversationsSubject.value;
        this.conversationsSubject.next([...currentConversations, conversation]);
        this.selectConversation(conversation);
      }),
      catchError(error => {
        console.error('Failed to create conversation:', error);
        return throwError(() => error);
      })
    );
  }

  public async sendMessage(conversationId: number, content: string): Promise<void> {
    if (!content || !content.trim()) {
      console.error('Cannot send empty message');
      return;
    }
    
    if (!conversationId) {
      console.error('Cannot send message: conversationId is null or undefined');
      return;
    }
  
    console.log(`Sending message to conversation ${conversationId}`);
    
    // Create a temporary local message for immediate display
    const tempMessage: Message = {
      id: -Date.now(),
      senderId: this.getCurrentUserId(),
      senderName: 'You',
      conversationId: conversationId,
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: true
    };
    
    this.sentMessages.push(tempMessage);
    this.messageSubject.next(tempMessage);
    
    // Try to ensure connection is established
    if (!this.isStompConnected()) {
      try {
        // Try to connect with a timeout
        console.log('WebSocket not connected, attempting to connect...');
        await Promise.race([
          this.connect(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
        ]);
      } catch (error) {
        console.warn('WebSocket connection failed, using HTTP fallback:', error);
        this.sendMessageViaHttp(conversationId, content.trim(), tempMessage);
        return;
      }
    }
    
    // Now that we're connected (or failed to connect), try sending
    if (this.isStompConnected()) {
      try {
        const message = {
          conversationId: conversationId,
          content: content.trim(),
          timestamp: new Date().toISOString()
        };
        
        console.log('Raw JSON payload:', JSON.stringify(message));
        
        this.stompClient.publish({
          destination: '/app/chat.sendMessage',
          body: JSON.stringify(message),
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
          }
        });
        console.log('Message sent successfully via WebSocket');
      } catch (error) {
        console.error('Failed to send via WebSocket, using HTTP fallback:', error);
        this.sendMessageViaHttp(conversationId, content.trim(), tempMessage);
      }
    } else {
      // Connection attempt failed, use HTTP
      this.sendMessageViaHttp(conversationId, content.trim(), tempMessage);
    }
  }
  
  private sendMessageViaHttp(conversationId: number, content: string, tempMessage: Message): void {
    const messageRequest = {
      conversationId: conversationId,
      content: content,
      timestamp: new Date().toISOString()
    };
    
    this.http.post<Message>(`${this.baseUrl}/conversations/${conversationId}/messages`, messageRequest)
      .subscribe({
        next: (message) => {
          console.log('Message sent via HTTP fallback:', message);
        },
        error: (error) => {
          console.error('Failed to send message via HTTP fallback:', error);
          const failedMsg = this.sentMessages.find(msg => msg.id === tempMessage.id);
          if (failedMsg) {
            console.log('Message failed to send:', failedMsg);
          }
        }
      });
  }

  // Add a method to check if a user is online
public isUserOnline(userId: number): boolean {
  return this.userStatusMap.get(userId) || false;
}
}
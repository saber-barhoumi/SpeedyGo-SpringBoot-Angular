import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatService, Conversation, Message, User } from '../../../../services/user/Chat/chat.service';
import { AuthService } from '../../../services/user/auth.service';
import { faComment, faPaperPlane, faSearch, faTimes, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateY(100%)',
        opacity: 0,
        display: 'none'
      })),
      transition('out => in', [
        style({ display: 'block' }),
        animate('200ms ease-in')
      ]),
      transition('in => out', [
        animate('200ms ease-out')
      ])
    ])
  ]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  
  // Icons
  faComment = faComment;
  faPaperPlane = faPaperPlane;
  faSearch = faSearch;
  faTimes = faTimes;
  faUser = faUser;
  faUsers = faUsers; // Added for community chat
  
  // Chat state
  isChatOpen = false;
  activeConversation: Conversation | null = null;
  conversations: Conversation[] = [];
  messages: Message[] = [];
  searchTerm = '';
  messageForm: FormGroup;
  currentUser: User | null = null;
  
  private subscriptions: Subscription[] = [];
  
  // Add this property to track user statuses
  private userStatusMap = new Map<number, boolean>();
  
  constructor(
    public chatService: ChatService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      message: ['', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    console.log('Chat component initialized');
    
    // Get current user
    this.currentUser = this.getUserFromAuth();
    
    // Connect to WebSocket
    this.chatService.connect();
    
    // Subscribe to conversations
    this.subscriptions.push(
      this.chatService.conversations$.subscribe((conversations: Conversation[]) => {
        console.log('Received conversations:', conversations);
        this.conversations = conversations || [];
      })
    );
    
    // Subscribe to selected conversation
    this.subscriptions.push(
      this.chatService.selectedConversation$.subscribe((conversation: Conversation | null) => {
        console.log('Selected conversation:', conversation);
        this.activeConversation = conversation;
        
        if (conversation) {
          this.loadMessages(conversation.id);
        }
      })
    );
    
    // Subscribe to new messages
    this.subscriptions.push(
      this.chatService.messages$.subscribe((message: Message) => {
        console.log('New message received:', message);
        if (this.activeConversation && message.conversationId === this.activeConversation.id) {
          this.messages.push(message);
          this.scrollToBottom();
        }
      })
    );
  }
  
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  
  ngOnDestroy(): void {
    console.log('Chat component destroyed');
    
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
    
    // Disconnect from WebSocket
    this.chatService.disconnect();
  }
  
  toggleChat(): void {
    console.log('Toggling chat:', !this.isChatOpen);
    this.isChatOpen = !this.isChatOpen;
    
    if (this.isChatOpen) {
      // If conversations exist, select the first one or join community chat
      if (this.conversations.length > 0) {
        // Look for common chat first
        const commonChat = this.conversations.find(c => c.title === 'General Chat');
        if (commonChat && !this.activeConversation) {
          this.openConversation(commonChat);
        } else if (!this.activeConversation) {
          this.openConversation(this.conversations[0]);
        }
      } else {
        // No conversations, offer to join community chat
        this.openCommonChat();
      }
    } else {
      this.activeConversation = null;
    }
  }
  
  // Replace old createDefaultConversation with openCommonChat
  openCommonChat(): void {
    console.log('Opening common chat');
    
    this.chatService.getOrCreateCommonConversation()
      .subscribe({
        next: (conversation) => {
          if (conversation) {
            console.log('Opened common conversation:', conversation);
            this.openConversation(conversation);
          }
        },
        error: (error) => {
          console.error('Error opening common chat:', error);
        }
      });
  }
  
  // Keep this for backward compatibility - can be used for 1-on-1 chats later
  createDefaultConversation(): void {
    console.log('Creating default conversation');
    
    // Redirect to common chat instead
    this.openCommonChat();
  }
  
  openConversation(conversation: Conversation): void {
    console.log('Opening conversation:', conversation);
    this.chatService.selectConversation(conversation);
  }
  
  closeConversation(): void {
    console.log('Closing conversation');
    this.activeConversation = null;
  }
  
  sendMessage(): void {
    if (this.messageForm.invalid || !this.activeConversation) return;
    
    const content = this.messageForm.value.message.trim();
    if (content) {
      console.log('Sending message:', content);
      this.chatService.sendMessage(this.activeConversation.id, content);
      this.messageForm.reset();
    }
  }
  
  loadMessages(conversationId: number): void {
    console.log('Loading messages for conversation:', conversationId);
    this.chatService.loadMessages(conversationId).subscribe({
      next: (messages: Message[]) => {
        console.log('Loaded messages:', messages);
        this.messages = messages || [];
        this.scrollToBottom();
        this.chatService.markAsRead(conversationId).subscribe();
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.messages = [];
      }
    });
  }
  
  filterConversations(): Conversation[] {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return this.conversations;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    
    return this.conversations.filter(conversation => {
      // Search in conversation title
      if (conversation.title?.toLowerCase().includes(term)) {
        return true;
      }
      
      // For common chat, check if search term matches "community"
      if (conversation.title === 'General Chat' && 'community'.includes(term)) {
        return true;
      }
      
      // Search in participant names
      if (conversation.participants?.some((user: User) => {
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
        return fullName.includes(term);
      })) {
        return true;
      }
      
      // Search in last message
      if (conversation.lastMessage?.content?.toLowerCase().includes(term)) {
        return true;
      }
      
      return false;
    });
  }
  
  getOtherParticipant(conversation: Conversation): User | null {
    if (!this.currentUser || !conversation?.participants) return null;
    
    // For common conversations, return null
    if (conversation.title === 'General Chat') {
      return null;
    }
    
    // For 1-1 conversations, find the other participant
    if (conversation.participants.length === 2) {
      return conversation.participants.find((p: User) => p.userId !== this.currentUser?.userId) || null;
    }
    
    // For group conversations, return null
    return null;
  }
  
  getUserFromAuth(): User | null {
    try {
      const userData = this.authService.getUser();
      if (!userData || !userData.userId) return null;
      
      return {
        userId: userData.userId,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        role: userData.role || '',
        online: true,
        profilePicture: userData.profilePicture,
        profilePictureType: userData.profilePictureType
      };
    } catch (error) {
      console.error('Error getting user from auth:', error);
      return null;
    }
  }
  
  
  private scrollToBottom(): void {
    try {
      if (this.messageContainer) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // Add or update this method to properly handle date formatting
  formatTime(timestamp: any): string {
    if (!timestamp) return '';
    
    try {
      let date: Date;
      
      // Check if timestamp is an array (Java LocalDateTime format)
      if (Array.isArray(timestamp)) {
        // Format: [year, month, day, hour, minute, second]
        const [year, month, day, hour, minute, second] = timestamp;
        // Note: JavaScript months are 0-based, but Java's are 1-based
        date = new Date(year, month - 1, day, hour, minute, second);
      } 
      // Check if it's a Java LocalDateTime object
      else if (timestamp && typeof timestamp === 'object' && 'year' in timestamp) {
        date = new Date(
          timestamp.year, 
          timestamp.monthValue - 1, // JavaScript months are 0-based
          timestamp.dayOfMonth,
          timestamp.hour || 0,
          timestamp.minute || 0,
          timestamp.second || 0
        );
      } 
      // Regular string date
      else if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      }
      else {
        date = new Date(timestamp);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp);
        return '';
      }
      
      const now = new Date();
      
      // Same day
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Yesterday
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      }
      
      // This week
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      if (date > oneWeekAgo) {
        return date.toLocaleDateString([], { weekday: 'short' });
      }
      
      // Older
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting time:', error, timestamp);
      return '';
    }
  }

  // Add a method to check if a user is online
  public isUserOnline(userId: number): boolean {
    return this.userStatusMap.get(userId) || false;
  }
  getSenderOnlineStatus(senderId: number): boolean {
    if (!this.activeConversation || !this.activeConversation.participants) {
      return false;
    }
    
    const sender = this.activeConversation.participants.find(p => p.userId === senderId);
    return sender ? sender.online : false;
  }
}
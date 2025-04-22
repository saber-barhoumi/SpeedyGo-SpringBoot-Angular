// src/app/FrontOffices/pages/chatbot/chatbot.component.ts
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ChatbotService, ChatSession, ChatMessage } from 'src/app/FrontOffices/pages/shared/services/chatbot.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;
  @ViewChild('shareInput') private shareInput!: ElementRef;

  currentSession: ChatSession | null = null;
  filteredSessions: ChatSession[] = [];
  userMessage: string = '';
  isLoading: boolean = false;
  isDarkMode: boolean = false;
  showSidebar: boolean = true;
  searchQuery: string = '';
  showShareDialog: boolean = false;
  shareLink: string = '';
  
  constructor(
  private chatbotService: ChatbotService,
  private sanitizer: DomSanitizer,
  // Make dialogRef optional with ? so it works both as a standalone page and dialog
  public dialogRef?: MatDialogRef<ChatbotComponent>
) {}

  ngOnInit(): void {
    // Load theme preference from localStorage
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    // Get all sessions
    this.filteredSessions = this.chatbotService.getAllSessions();
    
    // Create a new session if none exists
    if (this.filteredSessions.length === 0) {
      this.startNewChat();
    } else {
      // Set the current session to the most recent one
      this.chatbotService.setCurrentSession(this.filteredSessions[0].id);
      this.currentSession = this.chatbotService.getCurrentSession();
    }
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = 
        this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }

  startNewChat(): void {
    const newSessionId = this.chatbotService.createNewSession();
    this.chatbotService.setCurrentSession(newSessionId);
    this.currentSession = this.chatbotService.getCurrentSession();
    this.filteredSessions = this.chatbotService.getAllSessions();
    this.focusMessageInput();
  }

  selectSession(sessionId: string): void {
    this.chatbotService.setCurrentSession(sessionId);
    this.currentSession = this.chatbotService.getCurrentSession();
    this.focusMessageInput();
  }

  deleteSession(sessionId: string, event: Event): void {
    event.stopPropagation();
    this.chatbotService.deleteSession(sessionId);
    this.filteredSessions = this.chatbotService.getAllSessions();
    this.currentSession = this.chatbotService.getCurrentSession();
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) return;
    
    const message = this.userMessage.trim();
    this.userMessage = '';
    this.isLoading = true;

    // If no current session, create one
    if (!this.currentSession) {
      this.startNewChat();
    }

    this.chatbotService.sendMessage(message).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.currentSession = this.chatbotService.getCurrentSession();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.isLoading = false;
      }
    });
  }

  onEnterPress(event: Event): void {
    // Cast the event to KeyboardEvent
    const keyboardEvent = event as KeyboardEvent;
    
    // Send message on Enter, but allow Shift+Enter for new line
    if (keyboardEvent.key === 'Enter' && !keyboardEvent.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  formatMessage(content: string): SafeHtml {
    // Convert URLs to links, format code blocks, etc.
    let formattedContent = content
      // URLs to links
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>')
      // Bold text with asterisks
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic text with underscores
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Convert line breaks to <br>
      .replace(/\n/g, '<br>');

    // Convert code blocks
    formattedContent = formattedContent.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre class="code-block"><code>${code}</code></pre>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(formattedContent);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Show a toast or notification that copying was successful
      alert('Copied to clipboard!');
    });
  }

  shareMessage(message: ChatMessage): void {
    // In a real app, you might generate a unique URL for this message
    this.shareLink = `${window.location.origin}/share/${this.currentSession?.id}/message/${message.id}`;
    this.showShareDialog = true;
  }

  shareConversation(): void {
    // In a real app, you might generate a unique URL for this conversation
    this.shareLink = `${window.location.origin}/share/${this.currentSession?.id}`;
    this.showShareDialog = true;
  }

  copyShareLink(inputElement: HTMLInputElement): void {
    inputElement.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
  }

  shareViaEmail(): void {
    const subject = encodeURIComponent(`Shared AI Conversation: ${this.currentSession?.title}`);
    const body = encodeURIComponent(`Check out this AI conversation: ${this.shareLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  shareViaSocial(platform: string): void {
    const text = encodeURIComponent(`Check out this AI conversation: ${this.shareLink}`);
    let url = '';
    
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${text}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.shareLink)}`;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  onSearch(): void {
    this.filteredSessions = this.chatbotService.searchSessions(this.searchQuery);
  }

  private focusMessageInput(): void {
    setTimeout(() => {
      if (this.messageInput) {
        this.messageInput.nativeElement.focus();
      }
    }, 0);
  }

  closeDialog(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
  
  // Add this method to check if component is in dialog mode
  isInDialogMode(): boolean {
    return !!this.dialogRef;
  }
}
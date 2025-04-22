// src/app/FrontOffices/pages/SpeedyChat/chat-button/chat-button.component.ts
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatbotComponent } from '../../chatbot/chatbot.component';
import { chatDialogAnimations } from '../../../../shared/animations/chat-dialog.animations';
import { MatDialogConfig } from '@angular/material/dialog';

@Component({
  selector: 'app-chat-button',
  templateUrl: './chat-button.component.html',
  styleUrls: ['./chat-button.component.scss']
})
export class ChatButtonComponent implements OnInit {
  showChat = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

  openChatbot(): void {
    this.showChat = !this.showChat;
    if (this.showChat) {
      const dialogConfig = new MatDialogConfig();
      
      // Configure dialog for left side positioning
      dialogConfig.width = '80%';
      dialogConfig.height = '80%';
      dialogConfig.maxWidth = '1000px';
      dialogConfig.maxHeight = '700px';
      dialogConfig.panelClass = 'chatbot-dialog-container';
      dialogConfig.position = { left: '20px' }; // Position from left side
      dialogConfig.enterAnimationDuration = '300ms';
      dialogConfig.exitAnimationDuration = '200ms';
      
      const dialogRef = this.dialog.open(ChatbotComponent, dialogConfig);

      dialogRef.afterClosed().subscribe(() => {
        this.showChat = false;
      });

      dialogRef.afterClosed().subscribe(() => {
        this.showChat = false;
      });
    }
  }
}
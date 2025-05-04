import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-all-template-back',
  templateUrl: './all-template-back.component.html',
  styleUrls: ['./all-template-back.component.css']
})
export class AllTemplateBackComponent implements OnInit {
  isAdmin: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getUser();
    this.isAdmin = user && user.role === 'ADMIN';
  }
}
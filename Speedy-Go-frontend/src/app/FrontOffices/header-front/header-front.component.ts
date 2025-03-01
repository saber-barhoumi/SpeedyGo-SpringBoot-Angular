import { Component } from '@angular/core';
import { AuthService } from '../services/user/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-front',
  templateUrl: './header-front.component.html',
  styleUrls: ['./header-front.component.css']
})
export class HeaderFrontComponent {

  isLoggedIn: boolean = false;
  first_name: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    
    if (this.isLoggedIn) {
      const user = this.authService.getUser();
      console.log("ahawa",user);
      this.first_name = user ? user.firstName : 'User';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login page
  }
}


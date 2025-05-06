import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-navbar-back',
  templateUrl: './navbar-back.component.html',
  styleUrls: ['./navbar-back.component.css']
})
export class NavbarBackComponent  {
  constructor(private authService: AuthService, private router: Router) {}
  user: any;


  logout(): void {
    this.authService.logout();
    this.router.navigate(['/loginAdmin']); // Redirect to login after logout
  }
  ngOnInit(): void {
   
    this.user = this.authService.getUser(); // Get the logged-in user data
    console.log(this.user)
  }

}

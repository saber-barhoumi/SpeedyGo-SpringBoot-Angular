import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/FrontOffices/services/user/auth.service';

@Component({
  selector: 'app-sidebar-back',
  templateUrl: './sidebar-back.component.html',
  styleUrls: ['./sidebar-back.component.css']
})
export class SidebarBackComponent  implements OnInit {
  user: any;


  constructor(private authService: AuthService) {}

  ngOnInit(): void {
   
    this.user = this.authService.getUser(); // Get the logged-in user data
    console.log(this.user)
  }

}

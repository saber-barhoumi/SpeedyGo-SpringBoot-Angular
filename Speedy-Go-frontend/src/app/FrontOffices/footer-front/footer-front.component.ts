import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-footer-front',
  templateUrl: './footer-front.component.html',
  styleUrls: ['./footer-front.component.css']
})
export class FooterFrontComponent {

  isAdminPage: boolean = false;

  constructor(private router: Router) {
    // Subscribe to router events to detect when URL changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      // Check if current URL contains '/admin'
      this.isAdminPage = event.url.includes('/admin');
    });
  }

  ngOnInit(): void {
    // Check current URL on component initialization
    this.isAdminPage = this.router.url.includes('/admin');
  }



}

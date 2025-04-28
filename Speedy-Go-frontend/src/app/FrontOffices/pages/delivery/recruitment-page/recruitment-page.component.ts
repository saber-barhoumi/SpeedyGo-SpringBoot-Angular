import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recruitment-page', // Important: choose a meaningful selector
  template: `
    <div class="recruitment-page">
      <app-recruitment-form></app-recruitment-form>
      <app-recruitment-detail></app-recruitment-detail>
    </div>
  `,
  styles: [`
    .recruitment-page {
      display: flex; /* Example: display side-by-side */
      justify-content: space-around; /* Example: space them out */
    }
  `]
})
export class RecruitmentPageComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
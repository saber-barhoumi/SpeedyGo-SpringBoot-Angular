import { Component, OnInit } from '@angular/core';
import { ReturnsService } from 'src/app/services/returns.service'; // Import the ReturnsService
import { Returns } from 'src/app/models/returns/returns.module'; // Import the Returns model

@Component({
  selector: 'app-returns',
  templateUrl: './returns.component.html',
  styleUrls: ['./returns.component.css']
})
export class ReturnsComponent implements OnInit {
  returns: Returns[] = []; // Array to store fetched returns
  errorMessage: string = ''; // To display error messages

  constructor(private returnsService: ReturnsService) {} // Inject the ReturnsService

  ngOnInit(): void {
    this.getReturns(); // Fetch returns on component initialization
  }

  // Method to fetch all returns
  getReturns(): void {
    this.returnsService.getAllReturns().subscribe({
      next: (data: Returns[]) => {
        this.returns = data; // Assign the fetched returns to the local array
      },
      error: (error) => {
        this.errorMessage = 'Failed to load returns data'; // Handle error
        console.error(error);
      }
    });
  }

  // Method to delete a return by ID
  deleteReturn(id: number): void {
    this.returnsService.deleteReturn(id).subscribe({
      next: () => {
        this.getReturns(); // Refresh the list after deletion
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete return'; // Handle error
        console.error(error);
      }
    });
  }
}

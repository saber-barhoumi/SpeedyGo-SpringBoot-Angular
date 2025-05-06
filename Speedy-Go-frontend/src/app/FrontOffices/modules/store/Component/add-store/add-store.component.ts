import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreService } from 'src/app/FrontOffices/services/store/store.service';
import { StoreType, StoreStatus, Store } from '../../store/model/store';
import { HttpEventType } from '@angular/common/http';

@Component({
  selector: 'app-add-store',
  templateUrl: './add-store.component.html',
  styleUrls: ['./add-store.component.css']
})
export class addstoreComponent implements OnInit {
  StoreForm!: FormGroup;
  StoreTypes = Object.values(StoreType);
  StoreStatuses = Object.values(StoreStatus);
  isSubmitting = false;
  dialogTitle: string;
  selectedFile: File | null = null;
  uploadProgress: number = 0;

  constructor(
    private fb: FormBuilder,
    private storeService: StoreService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.dialogTitle = 'Create New Store';
    this.initForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const storeData = params['store'] ? JSON.parse(params['store']) : null;
      const mode = params['mode'] || 'add';
      this.dialogTitle = mode === 'edit' ? 'Edit Store' : 'Create New Store';
      if (storeData) {
        this.StoreForm.patchValue(storeData);
      }
    });
  }

  initForm(): void {
    this.StoreForm = this.fb.group({
      storeID: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      opening: ['', Validators.required],
      closing: ['', Validators.required],
      logo: [''],
      website: [''],
      image: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      storeType: [StoreType.OTHERS, Validators.required],
      storeStatus: [StoreStatus.OPEN, Validators.required]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.StoreForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  resetForm(): void {
    this.StoreForm.reset();
    this.StoreForm.patchValue({
      storeType: StoreType.OTHERS,
      storeStatus: StoreStatus.OPEN
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (this.selectedFile) {
      this.storeService.uploadFile(this.selectedFile).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          } else if (event.type === HttpEventType.Response) {
            console.log('File uploaded successfully', event.body);
          }
        },
        error: (error) => {
          console.error('Error uploading file', error);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.StoreForm.valid) {
      this.isSubmitting = true;
      const storeData = this.StoreForm.value;

      const formData: FormData = new FormData();
      formData.append('store', new Blob([JSON.stringify(storeData)], { type: 'application/json' }));
      if (this.selectedFile) {
        formData.append('file', this.selectedFile, this.selectedFile.name);
      }

      if (this.dialogTitle === 'Edit Store') {
        this.storeService.updateStore(storeData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/storlist']);
          },
          error: (error) => {
            console.error('Error updating store', error);
            this.isSubmitting = false;
          }
        });
      } else {
        const userId = localStorage.getItem('userId');
        if (userId) {
          storeData.user = parseInt(userId, 10);
        }

        this.storeService.addStore(formData).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/storlist']);
          },
          error: (error) => {
            console.error('Error creating store', error);
            this.isSubmitting = false;
          }
        });
      }
    } else {
      Object.keys(this.StoreForm.controls).forEach(key => {
        this.StoreForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/stores']);
  }
}
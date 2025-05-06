// src/app/models/user-update.dto.ts
export interface UserUpdateDTO {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    address: string;
    sexe?: string;
    role?: string;
  }
export interface User {
    userId?: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
    address?: string;
    dateOfBirth?: Date;
    role?: string;
    profileImageUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
    enabled?: boolean;
    accountNonExpired?: boolean;
    accountNonLocked?: boolean;
    credentialsNonExpired?: boolean;
    username?: string;
    authorities?: any[];
  }
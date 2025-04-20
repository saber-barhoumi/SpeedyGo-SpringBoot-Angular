export interface Recruitment {
    recruitmentId?: number;
    yearsOfExperience: number;
    previousEmployer: string;
    drivingLicenseNumber: string;
    drivingLicenseIssueDate?: Date;
    drivingLicenseCategory: string;
    applicationDate?: Date;
    coverLetter: string;
    resumeFilePath?: string;
    status?: string;
    adminFeedback?: string;
    lastStatusUpdateDate?: Date;
    applicant?: any;
    deliveryVehicle?: {
      vehicleId: number;
      brand?: string;
      model?: string;
    };
  }
export enum ReportStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
  }
  
  export interface Report {
    reportID: number;
    report_name: string;
    report_description: string;
    status: ReportStatus;
  }
  
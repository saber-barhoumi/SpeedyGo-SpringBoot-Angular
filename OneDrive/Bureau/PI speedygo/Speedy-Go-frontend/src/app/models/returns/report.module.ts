
export class ReportModule{ }
export enum ReportStatus {
    ACTIVE = 'ACTIVE',
    INNACTIVE = 'INNACTIVE',
 

}

export class Report {
  report_id?: number;
  report_name?: string;
  report_description?: string;
  status?: ReportStatus;
  
}

import { Component } from '@angular/core';
import { QrScannerService } from 'src/app/services/qrscanner.service';

@Component({
  selector: 'app-qrscanner',
  templateUrl: './qrscanner.component.html',
  styleUrls: ['./qrscanner.component.css']
})
export class QrScannerComponent {
  scannedResult: string = '';
  message: string = '';

  constructor(private qrScannerService: QrScannerService) {}

  onScanSuccess(result: string) {
    this.scannedResult = result;

    const pointRelaisId = Number(result);
    if (!isNaN(pointRelaisId)) {
      this.qrScannerService.confirmerTransfert(pointRelaisId).subscribe(
        (response: any) => {
          this.message = response;
        },
        (error) => {
          this.message = 'Erreur lors de la confirmation du transfert.';
          console.error(error);
        }
      );
    } else {
      this.message = 'QR code invalide.';
    }
  }
}

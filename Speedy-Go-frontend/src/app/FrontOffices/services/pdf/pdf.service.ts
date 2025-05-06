import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PdfService {
  constructor() {}
  
  /**
   * Generate a PDF document from trip form data
   * @param tripData - The form data to include in the PDF
   */
  generateTripPDF(tripData: any): Promise<Blob> {
    // Import dependencies dynamically to avoid issues with SSR
    return import('jspdf').then(jsPDF => {
      return import('html2canvas').then(html2canvas => {
        return this.createTripPDF(tripData, new jsPDF.default(), html2canvas.default);
      });
    });
  }
  
  /**
   * Create a PDF document with trip details
   * @param tripData - The trip data
   * @param jspdf - jsPDF instance
   * @param html2canvas - html2canvas function
   */
  private createTripPDF(tripData: any, jspdf: any, html2canvas: any): Promise<Blob> {
    return new Promise((resolve) => {
      // Create a temporary HTML element to render the trip details
      const element = document.createElement('div');
      element.innerHTML = this.generateTripHtml(tripData);
      element.style.width = '700px';
      element.style.padding = '20px';
      document.body.appendChild(element);
      
      // Convert the HTML to canvas
      html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
      }).then((canvas: HTMLCanvasElement) => {
        // Remove the temporary element
        document.body.removeChild(element);
        
        // Create PDF
        const imgData = canvas.toDataURL('image/png');
        const pdf = jspdf;
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        // Return the PDF as a blob
        const pdfBlob = pdf.output('blob');
        resolve(pdfBlob);
      });
    });
  }
  
  /**
   * Generate HTML content for the PDF
   * @param tripData - The trip data to format as HTML
   */
  private generateTripHtml(tripData: any): string {
    const tripDate = new Date().toLocaleDateString();
    
    // Create a receipt-like HTML template with Bootstrap styling
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; background-color: white;">
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4361ee; padding-bottom: 10px;">
          <h1 style="color: #4361ee; margin: 0;">Speedy Go</h1>
          <h2 style="margin: 10px 0 0;">Trip Details</h2>
          <p style="color: #666; margin: 5px 0;">Generated on: ${tripDate}</p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4361ee; border-bottom: 1px solid #eee; padding-bottom: 5px;">Trip Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Trip Details:</strong></td>
              <td style="padding: 8px;">${tripData.tripDetails || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Departure Location:</strong></td>
              <td style="padding: 8px;">${tripData.departureLocation || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Arrival Location:</strong></td>
              <td style="padding: 8px;">${tripData.arrivalLocation || 'N/A'}</td>
            </tr>
            ${tripData.passThroughLocation ? `
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Pass Through Location:</strong></td>
              <td style="padding: 8px;">${tripData.passThroughLocation}</td>
            </tr>` : ''}
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Departure Date/Time:</strong></td>
              <td style="padding: 8px;">${tripData.departureDate || 'N/A'} ${tripData.departureTime || ''}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Arrival Date/Time:</strong></td>
              <td style="padding: 8px;">${tripData.arrivalDate || 'N/A'} ${tripData.arrivalTime || ''}</td>
            </tr>
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Description:</strong></td>
              <td style="padding: 8px;">${tripData.description || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4361ee; border-bottom: 1px solid #eee; padding-bottom: 5px;">Parcel Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Parcel Type:</strong></td>
              <td style="padding: 8px;">${tripData.parcelType || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Size (kg):</strong></td>
              <td style="padding: 8px;">${tripData.size || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Dimensions:</strong></td>
              <td style="padding: 8px;">${tripData.parcelLength || 'N/A'} × ${tripData.parcelWidth || 'N/A'} × ${tripData.parcelHeight || 'N/A'} cm</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Description:</strong></td>
              <td style="padding: 8px;">${tripData.parcelDescription || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h3 style="color: #4361ee; border-bottom: 1px solid #eee; padding-bottom: 5px;">Receiver Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Full Name:</strong></td>
              <td style="padding: 8px;">${tripData.receiverFullName || 'N/A'}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; width: 40%; color: #666;"><strong>Phone Number:</strong></td>
              <td style="padding: 8px;">${tripData.receiverPhoneNumber || 'N/A'}</td>
            </tr>
          </table>
        </div>
        
        <div style="border-top: 2px solid #4361ee; padding-top: 10px; text-align: center; color: #666; font-size: 14px;">
          <p>Thank you for using Speedy Go services!</p>
          <p>For inquiries, please contact customer service: support@speedygo.com</p>
        </div>
      </div>
    `;
  }
} 
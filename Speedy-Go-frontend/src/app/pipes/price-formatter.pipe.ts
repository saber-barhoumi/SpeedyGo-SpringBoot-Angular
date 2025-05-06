import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormatter',
  standalone: true // Add this line to make the pipe standalone
})
export class PriceFormatterPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || isNaN(value)) {
      return '';
    }
    return `${value.toFixed(2)} TND`;
  }
}
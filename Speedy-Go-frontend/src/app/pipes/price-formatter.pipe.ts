// price-formatter.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceFormatter'
})
export class PriceFormatterPipe implements PipeTransform {
  transform(value: number | null): string {
    if (value === null || isNaN(value)) {
      return '';
    }
    return `${value.toFixed(2)} TND`;
  }
}
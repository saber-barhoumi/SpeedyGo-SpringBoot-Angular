// src/app/shared/pipes/custom-currency.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency',
  standalone: true
})
export class CustomCurrencyPipe implements PipeTransform {
  transform(value: number | undefined, currency: string = '$'): string {
    if (value === undefined || value === null) return '';
    return `${currency}${value.toFixed(2)}`;
  }
}
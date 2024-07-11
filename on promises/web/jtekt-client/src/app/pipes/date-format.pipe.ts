import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return format(new Date(value), 'yyyy-MM-dd');
  }
}

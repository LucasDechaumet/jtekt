import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExcelData } from '../models/excel-data';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  data: any = [
    [
      'N°Armoire',
      'N° SERIE',
      'N° LICENCE',
      'DESIGNATION',
      'TYPE',
      'CODE',
      'ETAT',
    ],
  ];

  FILENAME = 'dataTemplate.xlsx';
  COLUMNWIDTH = 30;
  COLUMNCOUNT = 7;

  createAndDownloadExcelFile() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    const colWidths = Array(this.COLUMNCOUNT).fill({ width: this.COLUMNWIDTH });
    worksheet['!cols'] = colWidths;

    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, this.FILENAME);
  }

  extractJSONfromExcelFile(file: File): Promise<ExcelData[]> {
    return new Promise((resolve, reject) => {
      if (!file) {
        console.error('Aucun fichier sélectionné.');
        reject('Aucun fichier sélectionné.');
        return;
      }

      const reader: FileReader = new FileReader();

      reader.onload = (e: any) => {
        const data: any = new Uint8Array(e.target.result);
        const workbook: XLSX.WorkBook = XLSX.read(data, {
          type: 'array',
          dateNF: 'yyyy-mm-dd',
        });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

        const excelData: ExcelData[] = XLSX.utils.sheet_to_json(worksheet, {
          header: 'A',
          rawNumbers: false,
          defval: null,
        });
        resolve(excelData);
      };

      reader.onerror = (error) => {
        reject(error);
      };

      reader.readAsArrayBuffer(file);
    });
  }
}

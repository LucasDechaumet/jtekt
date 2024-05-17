import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  data: any = [
    [
      'Numéro armoire',
      'Nom',
      'Numéro de série',
      'Numéro de license',
      'Type',
      'Numéro de moyen',
      'Etat',
      'Utilisateur',
      'Date',
    ],
  ];

  FILENAME = 'dataTemplate.xlsx';
  COLUMNWIDTH = 20;
  COLUMNCOUNT = 9;

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

  createJSONfromExcelFile(file: File) {
    if (!file) {
      console.error('Aucun fichier sélectionné.');
      return;
    }

    const reader: FileReader = new FileReader();

    reader.onload = (e: any) => {
      const data: any = new Uint8Array(e.target.result);
      const workbook: XLSX.WorkBook = XLSX.read(data, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet: XLSX.WorkSheet = workbook.Sheets[firstSheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 'A',
      });

      console.log('Données JSON extraites du fichier Excel :', jsonData);
    };

    reader.readAsArrayBuffer(file);
  }
}

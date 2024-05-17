import { Component } from '@angular/core';
import { ExcelService } from '../../services/excel.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  constructor(private excelService: ExcelService) {}

  downloadExcel() {
    this.excelService.createAndDownloadExcelFile();
  }

  onFileChange(event: any) {
    console.log('Fichier sélectionné');
    const selectFile = event.target.files[0];
    this.excelService.createJSONfromExcelFile(selectFile);
  }
}

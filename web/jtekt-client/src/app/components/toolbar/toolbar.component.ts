import { Component } from '@angular/core';
import { ExcelService } from '../../services/excel.service';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css',
})
export class ToolbarComponent {
  constructor(
    private excelService: ExcelService,
    private httpService: HttpService
  ) {}

  downloadExcel() {
    this.excelService.createAndDownloadExcelFile();
  }

  onFileChange(event: any) {
    console.log('Fichier sélectionné');
    const selectFile = event.target.files[0];
    console.log(this.excelService.extractJSONfromExcelFile(selectFile));
    this.excelService.extractJSONfromExcelFile(selectFile).then(
      (JSONdata) => {
        this.httpService.post('/mean/addMeansFromExcel', JSONdata).subscribe(
          (response) => {
            console.log('Réponse du serveur :', response);
          },
          (error) => {
            console.error("Erreur lors de l'envoi des données JSON :", error);
          }
        );
      },
      (error) => {
        console.error("Erreur lors de l'extraction des données JSON :", error);
      }
    );
  }
}

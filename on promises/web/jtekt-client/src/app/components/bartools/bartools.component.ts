import { Component, OnInit } from '@angular/core';
import { FileUploadEvent, FileUploadModule } from 'primeng/fileupload';
import { ExcelService } from '../../services/excel.service';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SharedDataService } from '../../services/shared-data.service';
import { KeycloakService } from '../../services/keycloak.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bartools',
  standalone: true,
  imports: [
    FileUploadModule,
    CalendarModule,
    FormsModule,
    DropdownModule,
    CommonModule,
  ],
  templateUrl: './bartools.component.html',
  styleUrl: './bartools.component.css',
})
export class BartoolsComponent implements OnInit {
  rangeDates: Date[] = [];
  selectedType: any | undefined;
  types: any[] | undefined;
  isAdmin = false;
  constructor(
    private excelService: ExcelService,
    private httpService: HttpService,
    private sharedData: SharedDataService,
    private keycloakService: KeycloakService
  ) {}

  ngOnInit() {
    if (this.keycloakService.hasRole('admin')) {
      this.isAdmin = true;
    }
    this.httpService.get('/mean/getAllMeansType').subscribe((data: any) => {
      this.types = data.map((type: any) => ({ name: type }));
    });
  }

  onTypeChange() {
    this.sharedData.setSelectedType(this.selectedType.name || '');
    console.log('Type sélectionné =====*******======== :', this.selectedType);
  }

  onDateSelect() {
    if (this.rangeDates[1] !== null) {
      this.sharedData.setSelectedDate(this.rangeDates);
    }
  }

  upload(event: FileUploadEvent) {
    console.log('Fichier sélectionné');
    const selectFile = event.files[0];
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

  downloadExcel() {
    this.excelService.createAndDownloadExcelFile();
  }
}

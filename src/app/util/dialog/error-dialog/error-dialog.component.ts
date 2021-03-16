import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ThemingService } from 'src/app/service/theming.service';

@Component({
	selector: 'app-error-dialog',
	template: `
		<h3 mat-dialog-title [appColor]="themingService.warning" [isBackground]="true" class="p-2"> {{data.errorName}} </h3>


		<div mat-dialog-content>
			<h3> {{data.errorMessage}} </h3>
		</div>

		<div mat-dialog-actions>
			<button color="warn" mat-button [mat-dialog-close]="null" >OK</button>
		</div>
	`
})
export class ErrorDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<ErrorDialogComponent, ErrorDialogComponent.Data>,
		public themingService: ThemingService,
		@Inject(MAT_DIALOG_DATA) public data: ErrorDialogComponent.Data
	) { }

	ngOnInit(): void {
	}

}

export namespace ErrorDialogComponent {
	export interface Data {
		errorName: string;
		errorMessage: string;
		errorCode?: string;
	}
}

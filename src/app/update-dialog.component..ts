import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-update-dialog',
	template: `
		<h1 mat-dialog-title> Update Available </h1>

		<div mat-dialog-content>
			<p>An update for 7tv.app is available. Would you like to download and refresh the page?</p>
		</div>

		<div mat-dialog-actions>
			<button mat-raised-button color="accent" [matDialogClose]="true">UPDATE</button>
			<button mat-flat-button [matDialogClose]="false">NOT NOW</button>
		<div>
	`
})

export class UpdateDialogComponent implements OnInit {
	constructor() { }

	ngOnInit(): void { }
}

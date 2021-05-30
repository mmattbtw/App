import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
	selector: 'app-emote-tos-dialog',
	template: `
		<div mat-dialog-title class="d-flex flex-row align-items-center px-2">
			<mat-icon [inline]="true" [style.font-size.em]="3" color="warn">article</mat-icon>
			<h1 class="ml-2 mt-2 text-danger">TERMS OF SERVICE AGREEMENT</h1>
		</div>

		<div mat-dialog-content class="d-flex flex-column py-3">
			<span>
				Before you upload an emote you must read and agree to our <a href="/legal/tos" target="_blank">Terms of Service</a>.
			</span>
		</div>

		<div mat-dialog-actions>
			<button [matDialogClose]="true" mat-button color="primary" [mat-dialog-close]="agreed">I AGREE</button>
			<button mat-button [routerLink]="['/emotes']" [mat-dialog-close]="false">I DISAGREE</button>
		</div>
	`
})

export class TOSDialogComponent implements OnInit {
	agreed = new FormControl(false);

	constructor() {}

	ngOnInit(): void {}
}

export namespace TOSDialogComponent {}

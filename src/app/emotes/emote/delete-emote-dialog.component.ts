

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-delete-dialog',
	template: `
		<h3 class="text-danger" mat-dialog-title> Delete {{data.emote.getName() | async}}? </h3>

		<div mat-dialog-content>
			<h4 class="text-warning">Provide a reason for deleting this emote. This action cannot be undone.</h4>
			<mat-form-field appearance="outline">
				<mat-label>Reason</mat-label>
				<input [formControl]="input" matInput cdkFocusInitial>
			</mat-form-field>
		</div>

		<div mat-dialog-actions>
			<button [disabled]="!input.valid || input.value === originalValue" mat-button color="warn" [mat-dialog-close]="input.value">DELETE</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteDeleteDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	input = new FormControl('', [Validators.required]);
	originalValue = '';

	constructor(
		public dialogRef: MatDialogRef<EmoteDeleteDialogComponent, EmoteDeleteDialogComponent.Data>,
		@Inject(MAT_DIALOG_DATA) public data: EmoteDeleteDialogComponent.Data
	) { }

	ngOnInit(): void {}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteDeleteDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

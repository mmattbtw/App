

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from '@typings/src/Constants';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-rename-dialog',
	template: `
		<h3 mat-dialog-title> Rename {{data.emote.getName() | async}} </h3>

		<form [formGroup]="form" mat-dialog-content class="d-flex flex-column py-3">
			<mat-form-field appearance="outline">
				<mat-label>Name</mat-label>
				<input formControlName="name" matInput cdkFocusInitial [value]="data.emote.getName() | async">
			</mat-form-field>

			<mat-form-field appearance="outline">
				<mat-label>Reason</mat-label>
				<input formControlName="reason" matInput cdkFocusInitial>
				<mat-hint>Provide the reason why you're renaming this emote </mat-hint>
			</mat-form-field>
		</form>

		<div mat-dialog-actions>
			<button [disabled]="!form.valid || form.get('name')?.value === originalValue" mat-button color="primary" [mat-dialog-close]="form.value">RENAME</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteRenameDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	form = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.pattern(Constants.Emotes.NAME_REGEXP)]),
		reason: new FormControl('')
	});
	originalValue = '';

	constructor(
		public dialogRef: MatDialogRef<EmoteRenameDialogComponent, EmoteRenameDialogComponent.Data>,
		@Inject(MAT_DIALOG_DATA) public data: EmoteRenameDialogComponent.Data
	) { }

	ngOnInit(): void {
		this.data.emote.getName().pipe( // Patch input with current emote name
			take(1),
			tap(name => this.form.get('name')?.patchValue(this.originalValue = name ?? ''))
		).subscribe();
	}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteRenameDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

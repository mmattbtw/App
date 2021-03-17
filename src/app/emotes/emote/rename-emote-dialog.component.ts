

import { Component, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from '@typings/src/Constants';
import { Subject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-rename-dialog',
	template: `
		<h3 mat-dialog-title> Rename {{data.emote.getName() | async}} </h3>


		<div mat-dialog-content>
			<mat-form-field appearance="outline">
				<mat-label>Name</mat-label>
				<input [formControl]="input" matInput cdkFocusInitial [value]="data.emote.getName() | async">
			</mat-form-field>
		</div>

		<div mat-dialog-actions>
			<button [disabled]="!input.valid || input.value === originalValue" mat-button color="primary" [mat-dialog-close]="input.value">RENAME</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteRenameDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	input = new FormControl('', [Validators.required, Validators.pattern(Constants.Emotes.NAME_REGEXP)]);
	originalValue = '';

	constructor(
		public dialogRef: MatDialogRef<EmoteRenameDialogComponent, EmoteRenameDialogComponent.Data>,
		@Inject(MAT_DIALOG_DATA) public data: EmoteRenameDialogComponent.Data
	) { }

	ngOnInit(): void {
		this.data.emote.getName().pipe( // Patch input with current emote name
			tap(name => this.input.patchValue(this.originalValue = name ?? ''))
		).subscribe();
	}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteRenameDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

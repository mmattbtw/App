

import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
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
			<button [disabled]="!input.valid" mat-button color="primary" [mat-dialog-close]="input.value">RENAME</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteRenameDialogComponent implements OnInit {
	input = new FormControl('', [Validators.required]);

	constructor(
		public dialogRef: MatDialogRef<EmoteRenameDialogComponent, EmoteRenameDialogComponent.Data>,
		@Inject(MAT_DIALOG_DATA) public data: EmoteRenameDialogComponent.Data
	) { }

	ngOnInit(): void {
		this.data.emote.getName().pipe( // Patch input with current emote name
			tap(name => this.input.patchValue(name))
		).subscribe();
	}
}

export namespace EmoteRenameDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

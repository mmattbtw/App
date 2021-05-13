

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClientService } from 'src/app/service/client.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-editor-dialog',
	template: `
		<h3 mat-dialog-title> Impersonate (Editor Mode) </h3>

		<div mat-dialog-content class="py-3">
			<div *ngFor="let editor of clientService.getEditorIn() | async">

				<div class="editable-user" matRipple (click)="select(editor)">
					<app-user-name [clickable]="false" [user]="editor"></app-user-name>
				</div>
			</div>
		</div>
	`,
	styles: [
		`
			.editable-user:hover {
				border: solid 1px white;
				cursor: pointer;
			}

			.editable-user:first-child {
				padding: 6px;
			}
		`
	]
})

export class EditorDialogComponent implements OnInit {
	constructor(
		public clientService: ClientService,
		public dialogRef: MatDialogRef<EditorDialogComponent, {}>
	) { }

	select(user: UserStructure): void {
		this.dialogRef.close(user);
	}

	ngOnInit(): void { }
}

export namespace EditorDialogComponent {

}

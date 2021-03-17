import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from '@typings/src/Constants';
import { Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { ThemingService } from 'src/app/service/theming.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-transfer-ownership-dialog',
	template: `
		<h3 mat-dialog-title>Transfer Away {{data.emote.getName() | async}} </h3>

		<div mat-dialog-content>
			<span [appColor]="themingService.warning" class="d-flex align-items-center">
				<mat-icon>priority_high</mat-icon>
				Warning, you cannot undo this!
			</span>
			<div class="my-2"></div>

			<mat-form-field appearance="outline">
				<mat-label>Username</mat-label>
				<input [formControl]="input" matInput cdkFocusInitial [value]="data.emote.getName() | async">
			</mat-form-field>
		</div>

		<div mat-dialog-actions>
			<button [disabled]="!input.valid || input.value === originalValue" mat-button color="warn" [mat-dialog-close]="input.value">CONFIRM TRANSFER</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteOwnershipDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	input = new FormControl('', [Validators.required, Validators.pattern(Constants.Users.LOGIN_REGEXP)]);
	originalValue = '';

	constructor(
		public dialogRef: MatDialogRef<EmoteOwnershipDialogComponent, EmoteOwnershipDialogComponent.Data>,
		public themingService: ThemingService,
		@Inject(MAT_DIALOG_DATA) public data: EmoteOwnershipDialogComponent.Data
	) { }

	ngOnInit(): void {}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteOwnershipDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

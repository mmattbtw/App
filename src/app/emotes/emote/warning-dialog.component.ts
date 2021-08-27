import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Constants } from '@typings/src/Constants';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-warning-dialog',
	template: `
		<div mat-dialog-title class="d-flex flex-row align-items-center px-2">
			<mat-icon [inline]="true" [style.font-size.em]="3" color="warn">warning</mat-icon>
			<h1 class="ml-2 mt-2 text-danger">HEADS UP</h1>
		</div>

		<div mat-dialog-content class="d-flex flex-column py-3">
			<span>
				This emote is unlisted. Either it hasn't yet been confirmed by a moderator, or the moderation team
				chose not to confirm this emote.
				As a result, we cannot guarantee it is safe to show on a livestream.
				<p class="mt-2 font-italic">If you are livestreaming, it is recommended to check this emote off-screen before showing it to viewers!</p>
			</span>
		</div>

		<div mat-dialog-actions>
			<button [matDialogClose]="true" mat-button color="primary" [mat-dialog-close]="form.value">ACKNOWLEDGE</button>
			<button mat-button [routerLink]="['/emotes']" [matDialogClose]="false">GO BACK</button>
		</div>
	`
})

export class EmoteWarningDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	form = new FormGroup({
		name: new FormControl('', [Validators.required, Validators.pattern(Constants.Emotes.NAME_REGEXP)]),
		reason: new FormControl('')
	});
	originalValue = '';

	constructor(
		public dialogRef: MatDialogRef<EmoteWarningDialogComponent, EmoteWarningDialogComponent.Data>
	) { }

	ngOnInit(): void {}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteWarningDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}
}

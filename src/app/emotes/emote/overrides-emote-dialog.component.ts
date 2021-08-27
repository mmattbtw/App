

import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BitField } from '@typings/src/BitField';
import { DataStructure } from '@typings/typings/DataStructure';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { EmoteStructure } from 'src/app/util/emote.structure';

@Component({
	selector: 'app-emote-overrides-dialog',
	template: `
		<h3 mat-dialog-title> Configure visibility flags for {{data.emote.getName() | async}} </h3>

		<form [formGroup]="form" mat-dialog-content class="d-flex flex-column py-3">
			<div *ngFor="let checkbox of checkboxes" color="primary">
				<mat-checkbox [formControlName]="checkbox.id" *ngIf="!checkbox.privileged || (clientService.hasPermission('EDIT_EMOTE_ALL') | async)">
					<mat-label> {{ checkbox.label }} </mat-label>
				</mat-checkbox>
			</div>

			<mat-form-field appearance="outline">
				<mat-label>Reason</mat-label>
				<input formControlName="reason" matInput cdkFocusInitial>
				<mat-hint>What is the reason for this change?</mat-hint>
			</mat-form-field>
		</form>

		<div mat-dialog-actions>
			<button [disabled]="!form.valid" mat-button color="primary" [mat-dialog-close]="{ value: computeValue(), reason: form.get('reason')?.value }">CONFIRM</button>
			<button mat-button [mat-dialog-close]="null" >CANCEL</button>
		</div>
	`
})

export class EmoteOverridesDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>().pipe(take(1)) as Subject<void>;
	form = new FormGroup({
		zerowidth: new FormControl(false),
		unlisted: new FormControl(false),
		unlisted_forever: new FormControl(false),
		reason: new FormControl('')
	});
	originalValue = '';

	checkboxes = [
		{
			label: 'Zero-Width',
			id: 'zerowidth',
			privileged: false
		},
		{
			label: 'Unlisted',
			id: 'unlisted',
			privileged: true
		},
		{
			label: 'Permanently Unlisted',
			id: 'unlisted_forever',
			privileged: true
		}
	] as EmoteOverridesDialogComponent.Checkbox[];

	constructor(
		public clientService: ClientService,
		public dialogRef: MatDialogRef<EmoteOverridesDialogComponent, EmoteOverridesDialogComponent.Data>,
		@Inject(MAT_DIALOG_DATA) public data: EmoteOverridesDialogComponent.Data
	) { }

	computeValue(): number {
		let sum = 0;

		for (const { id } of this.checkboxes) {
			const ctrl = this.form.get(id);
			if (!ctrl || !ctrl.value) {
				continue;
			}

			switch (id) {
				case 'unlisted':
					sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.HIDDEN);
					break;
				case 'zerowidth':
					sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.ZERO_WIDTH);
					break;
				case 'unlisted_forever':
					sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.HIDDEN);
					sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.PERMANENTLY_UNLISTED);
					break;
				default:
					break;
			}
		}
		const vis = this.data.emote.getVisibility();
		if (BitField.HasBits(vis, DataStructure.Emote.Visibility.PRIVATE)) {
			sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.PRIVATE);
		}
		if (BitField.HasBits(vis, DataStructure.Emote.Visibility.GLOBAL)) {
			sum = BitField.AddBits(sum, DataStructure.Emote.Visibility.GLOBAL);
		}

		this.data.emote.getVisibilities();
		return sum;
	}

	setDefaults(sum: number): void {
		const getControl = (id: string) => this.form.get(`${id}`);
		if (BitField.HasBits(sum, DataStructure.Emote.Visibility.HIDDEN)) {
			getControl('unlisted')?.setValue(true);
		}
		if (BitField.HasBits(sum, DataStructure.Emote.Visibility.PERMANENTLY_UNLISTED)) {
			getControl('unlisted_forever')?.setValue(true);
		}
		if (BitField.HasBits(sum, DataStructure.Emote.Visibility.ZERO_WIDTH)) {
			getControl('zerowidth')?.setValue(true);
		}
	}

	ngOnInit(): void {
		this.setDefaults(this.data.emote.getVisibility());
	}

	ngOnDestroy(): void { this.destroyed.next(); }
}

export namespace EmoteOverridesDialogComponent {
	export interface Data {
		emote: EmoteStructure;
	}

	export interface Checkbox {
		label: string;
		id: string;
		privileged: boolean;
	}
}

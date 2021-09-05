import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataStructure } from '@typings/typings/DataStructure';
import { BehaviorSubject, defer, noop, of, Subject } from 'rxjs';
import { bufferTime, catchError, filter, map, mergeAll, mergeMap, takeUntil, tap } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-store-subscribe-gift-dialog',
	template: `
		<div mat-dialog-title>
			Gift Subscription
		</div>

		<div mat-dialog-content>
			<form class="d-flex flex-column" [formGroup]="form">
				<mat-form-field>
					<input matInput formControlName="user" autocomplete="off">
					<mat-label> Choose a recipient </mat-label>
				</mat-form-field>
				<span class="text-danger" *ngIf="currentError | async"> {{currentError | async}} </span>
			</form>
		</div>

		<div mat-dialog-actions>
			<button [disabled]="!selectedUser" mat-raised-button color="primary" [mat-dialog-close]="selectedUser">PURCHASE GIFT</button>
			<button mat-flat-button color="warn" [mat-dialog-close]="null">ABORT</button>
		</div>
	`
})

export class StoreSubscribeGiftDialogComponent implements OnInit, OnDestroy {
	destroyed = new Subject<void>();
	form = new FormGroup({
		user: new FormControl('', [Validators.required])
	});
	currentError = new BehaviorSubject<string>('');
	selectedUser: UserStructure | null = null;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: {},
		private restService: RestService,
		private dataService: DataService
	) {}

	ngOnInit(): void {
		const control = this.form.get('user') as FormControl;
		let currentValue = '';

		control.valueChanges.pipe(
			takeUntil(this.destroyed),
			bufferTime(1000),
			map(v => v[v.length - 1]),
			filter(v => typeof v !== 'undefined' && v !== currentValue),
			tap(v => {
				currentValue = v;
			}),

			mergeMap(id => this.restService.v2.GetUser(id).pipe(
				catchError(() => of({ user: null }))
			)),
			map(res => res.user),
			tap(u => {
				this.currentError.next('');
				if (!u) {
					control.setErrors({ unknown_user: true });
					this.currentError.next('Unknown User (perhaps they\'re not on 7TV?)');
				}
			}),

			map(u => this.dataService.add('user', u as DataStructure.TwitchUser)[0])
		).subscribe({
			next: user => {
				this.selectedUser = user;
			}
		});
	}

	ngOnDestroy(): void {
		this.destroyed.next(undefined);
		this.destroyed.complete();
		this.currentError.complete();
	}
}

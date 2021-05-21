
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-ban-dialog',
	templateUrl: 'ban-dialog.component.html'
})

export class BanDialogComponent implements OnInit {
	form = new FormGroup({
		expiration: new FormControl(this.defaultDate),
		reason: new FormControl('')
	});
	MIN_EXPIRATION_DATE = new Date();

	constructor(
		private clientService: ClientService,
		@Inject(MAT_DIALOG_DATA) public data: BanDialogComponent.Data
	) {
		this.MIN_EXPIRATION_DATE.setDate(this.MIN_EXPIRATION_DATE.getDate() + 1);
	}

	get user(): UserStructure {
		return this.data.user;
	}

	get defaultDate(): Date {
		const date = new Date();

		date.setDate(new Date().getDate() + 3);
		return date;
	}

	/**
	 * Ban the user
	 */
	ban(): void {
		this.user.ban(this.form.get('expiration')?.value as Date, this.form.get('reason')?.value as string).pipe(
			tap(() => this.clientService.openSnackBar(`${this.user.getSnapshot()?.display_name} was banned`, '', {}))
		).subscribe();
	}

	ngOnInit(): void { }
}

export namespace BanDialogComponent {
	export interface Data {
		user: UserStructure;
	}
}

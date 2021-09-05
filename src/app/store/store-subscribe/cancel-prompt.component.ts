import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EgVault } from 'src/app/service/rest/egvault.structure';

@Component({
	selector: 'app-store-subscribe-cancel-dialog',
	template: `
		<div mat-dialog-title>
			Cancel Subscription?
		</div>

		<div mat-dialog-content>
			If you cancel your subscription, it will not be renewed, but you will keep your perks until
			{{ data.subscription.ending_at | date }}
		</div>

		<div mat-dialog-actions>
			<button mat-raised-button color="primary" [mat-dialog-close]="false">STAY SUBSCRIBED</button>
			<button mat-flat-button color="warn" [mat-dialog-close]="true">YES, CANCEL NOW</button>
		</div>
	`
})

export class StoreSubscribeCancelDialogComponent {
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: { subscription: EgVault.Subscription }
	) {}
}

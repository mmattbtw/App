import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { WindowRef } from 'src/app/service/window.service';
import { StoreSubscribeGiftDialogComponent } from 'src/app/store/store-subscribe/gift-prompt.component';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-store-subscribe-button',
	templateUrl: 'subscribe-button.component.html',
	styleUrls: ['subscribe-button.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class StoreSubscribeButtonComponent implements OnInit, OnDestroy {
	private destroyed = new Subject<boolean>();

	@Input() provider: 'stripe' | 'paypal' | null = 'stripe';
	@Input() label = 'SUBSCRIBE';
	@Input() icon = 'star';
	@Input() renewable = true;
	@Input() gift = false;
	@Input() disabled: boolean | null = false;

	renewInterval = new FormControl('monthly');
	@ViewChild('planSelector', { static: true }) planSelector: MatSelect | undefined;

	price = new BehaviorSubject<string>('3.99');

	subscribing = new BehaviorSubject<boolean>(false);

	constructor(
		private windowRef: WindowRef,
		private clientService: ClientService,
		private restService: RestService,
		private dialog: MatDialog,
		public themingService: ThemingService
	) { }

	changePlan(): void {
		if (this.disabled) return undefined;
		if (!this.planSelector) return undefined;
		this.planSelector.open();
	}

	/**
	 * Triggers when the user smashes it
	 */
	click(giftUser?: string): void {
		if (this.disabled || this.subscribing.getValue()) {
			return undefined;
		}
		if (!giftUser && this.gift) {
			const dialogRef = this.dialog.open(StoreSubscribeGiftDialogComponent, {
				disableClose: true,
				width: '24em'
			});

			dialogRef.afterClosed().pipe(
				take(1),
				filter(u => !!u),
			).subscribe({
				next: (user: UserStructure) => this.click(user.id)
			});

			return undefined;
		}

		// Request a subscription URL from API
		this.subscribing.next(true);
		this.restService.egvault.Subscriptions.Create(this.provider ?? 'stripe', this.renewInterval.value, giftUser).pipe(
			RestService.onlyResponse(),
			switchMap(res => new Observable<boolean>(observer => {
				const url = res.body?.url ?? '';
				if (url.length === 0) {
					return observer.error(Error('Payment Authorization URL Empty'));
				}
				this.windowRef.getNativeDocument().location.replace(url);
			}))
		).subscribe({
			complete: () => this.subscribing.next(false),
			error: (err: HttpErrorResponse) => {
				this.subscribing.next(false);
				this.clientService.openSnackBar(err.error.Message, 'OK', { duration: 3500, verticalPosition: 'top' });
			}
		});
	}

	ngOnInit(): void {
		this.planSelector?.valueChange.pipe(
			map((val: 'monthly' | 'yearly') => {
				let value = '';
				switch (val) {
					case 'monthly':
						value = '3.99';
						break;
					case 'yearly':
						value = '39.99';
						break;
					default:
						break;
				}

				return value;
			})
		).subscribe({
			next: val => this.price.next(val)
		});
	}

	ngOnDestroy(): void {
		this.destroyed.next(true);
		this.destroyed.complete();
	}
}

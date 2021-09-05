import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BehaviorSubject, iif, Observable, of } from 'rxjs';
import { catchError, delay, filter, map, mapTo, switchMap, take, tap } from 'rxjs/operators';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { EgVault } from 'src/app/service/rest/egvault.structure';
import { ThemingService } from 'src/app/service/theming.service';
import { StoreSubscribeCancelDialogComponent } from 'src/app/store/store-subscribe/cancel-prompt.component';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-store',
	templateUrl: 'store.component.html',
	styleUrls: ['store.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})

export class StoreComponent implements OnInit {
	@ViewChild('gradient', { static: true }) gradient: ElementRef<HTMLDivElement> | undefined;

	available = new BehaviorSubject<boolean | null>(null);
	provider = new BehaviorSubject<'stripe' | 'paypal'>('stripe');
	subscription = new BehaviorSubject<EgVault.Subscription | null>(null);
	gifter: UserStructure | null = null;
	discordInvite = '';

	constructor(
		private restService: RestService,
		private dataService: DataService,
		private clientService: ClientService,
		private cdr: ChangeDetectorRef,
		private router: Router,
		private dialog: MatDialog,
		public appService: AppService,
		public themingService: ThemingService
	) { }

	get bannerHeight(): number {
		return (this.gradient?.nativeElement.scrollHeight ?? 0) - 96;
	}

	/**
	 * Cancel the subscription
	 *
	 */
	cancel(): void {
		const dialogRef = this.dialog.open(StoreSubscribeCancelDialogComponent, {
			data: {
				subscription: this.subscription
			}
		});

		dialogRef.afterClosed().pipe(
			take(1),
			filter(canceled => typeof canceled === 'string' || canceled === true),

			switchMap(c => this.restService.egvault.Subscriptions.Delete(c === 'hard')),

			delay(1000),
			tap(() => this.appService.updateSubscriptionData())
		).subscribe({
			error: (err: HttpErrorResponse) => {
				this.clientService.openSnackBar(err.error, 'OK', { verticalPosition: 'top' });
			}
		});
	}

	isAuth(): Observable<boolean> {
		return this.clientService.isAuthenticated().pipe(take(1));
	}

	setProvider(provider: 'stripe' | 'paypal'): void {
		const current = this.provider.getValue();
		if (current !== provider) {
			this.provider.next(provider);
		}
	}

	isProviderPayPal(): Observable<boolean> {
		return this.provider.pipe(
			take(1),
			map(p => p === 'paypal')
		);
	}

	isProviderStripe(): Observable<boolean> {
		return this.provider.pipe(
			take(1),
			map(p => p === 'stripe')
		);
	}

	ngOnInit(): void {
		this.appService.subscription.pipe(
			filter(sub => sub !== null),
			switchMap(sub => this.restService.Discord.Widget().pipe(
				RestService.onlyResponse(),
				tap(d => this.discordInvite = d.body?.instant_invite ?? ''),
				catchError(() => of(sub)),
				mapTo(sub)
			)),

			// Fetch gifter?
			switchMap(sub => iif(() => !!sub?.gifter_id,
				this.restService.v2.GetUser(sub?.gifter_id as string).pipe(
					map(res => this.dataService.add('user', res.user)[0]),
					tap(u => this.gifter = u),
					mapTo(sub)
				),
				of(sub)
			))
		).subscribe({
			next: sub => {
				this.subscription.next(sub);
			}
		});

		this.appService.egvaultOK.pipe(filter(x => x !== null)).pipe(
			tap(ok => {
				this.available.next(ok);
				if (!ok) {
					this.clientService.openSnackBar('Subscription service is currenty unavailable, try again in a minute', 'OK', { duration: 3000, verticalPosition: 'top' });
					this.router.navigate(['/']);
				}
			})
		).subscribe({
			complete: () => this.cdr.markForCheck()
		});
	}
}

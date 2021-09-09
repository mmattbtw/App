import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { asyncScheduler, BehaviorSubject, Observable, scheduled } from 'rxjs';
import { map, mergeAll, skip, switchMap, take, tap } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { EgVault } from 'src/app/service/rest/egvault.structure';
import { ThemingService } from 'src/app/service/theming.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-store-leaderboards',
	templateUrl: 'store-leaderboards.component.html',
	styleUrls: ['store-leaderboards.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreLeaderboardsComponent implements OnInit {
	@Input() medalists = true;

	gifts = new BehaviorSubject<EgVault.GiftItem[]>([]);
	firstPlace: StoreLeaderboardsComponent.UserWithGiftCount | null = null;
	secondPlace: StoreLeaderboardsComponent.UserWithGiftCount | null = null;
	thirdPlace: StoreLeaderboardsComponent.UserWithGiftCount | null = null;

	constructor(
		public themingService: ThemingService,
		private restService: RestService,
		private dataService: DataService,
		private cdr: ChangeDetectorRef
	) {}

	private getPosition(pos: number): Observable<[UserStructure, number]> {
		return this.gifts.pipe(
			mergeAll(),
			skip(pos - 1),
			take(1),
			switchMap(g => this.restService.v2.GetUser(g.user_id).pipe(
				map(res => ({
					user: this.dataService.add('user', res.user)[0],
					count: g.count
				}))
			)),
			map(x => [x.user, x.count])
		);
	}

	ngOnInit(): void {
		this.restService.egvault.Subscriptions.GetLeaderboards().pipe(
			RestService.onlyResponse(),
			map(res => this.gifts.next(res.body?.gift_subscriptions ?? [])),

			switchMap(() => scheduled([
				this.getPosition(1).pipe(tap(x => this.firstPlace = { user: x[0], count: x[1] })),
				this.getPosition(2).pipe(tap(x => this.secondPlace = { user: x[0], count: x[1] })),
				this.getPosition(3).pipe(tap(x => this.thirdPlace = { user: x[0], count: x[1] }))
			], asyncScheduler).pipe(mergeAll()))
		).subscribe({
			next: () => this.cdr.markForCheck()
		});
	}
}

export namespace StoreLeaderboardsComponent {
	export interface UserWithGiftCount {
		user: UserStructure | null;
		count: number;
	}
}

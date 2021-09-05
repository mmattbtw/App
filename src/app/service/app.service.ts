import { Injectable, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataStructure } from '@typings/typings/DataStructure';
import { asyncScheduler, BehaviorSubject, defer, scheduled, Subject } from 'rxjs';
import { catchError, concatAll, filter, map, mapTo, mergeAll, switchMap, tap } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { EgVault } from 'src/app/service/rest/egvault.structure';

@Injectable({
	providedIn: 'root'
})

export class AppService {
	title = '7tv.app';
	description = 'It\'s like a third party thing';
	currentView = '';
	devStage = 'beta';
	loading = false;

	pageTitleSnapshot = '';
	pageTitle = '';
	pageTitleAttr = new Subject<AppService.PageTitleAttribute[]>();

	contactEmail = 'kathy@7tv.app';
	twitterURL = 'https://twitter.com/Official_7TV';
	githubURL = 'https://github.com/SevenTV';

	featuredBroadcast = new BehaviorSubject<string>('');
	announcement = new BehaviorSubject<string>('');
	egvaultOK = new BehaviorSubject<boolean | null>(null);
	subscription = new BehaviorSubject<EgVault.Subscription | null>(null);

	constructor(
		titleService: Title,
		private restService: RestService,
		private dataService: DataService
	) {
		const attrMap = new Map<string, AppService.PageTitleAttribute>();
		this.pageTitleAttr.pipe(
			// map(attr => lastAttr ? [...lastAttr, ...(lastAttr = attr)] : [...attr]),
			mergeAll(),
			tap(attr => attrMap.set(attr.name, attr)),
			map(attr => [...Array.from(attrMap.values()), attr]),

			map(attr => ({ title: this.pageTitleSnapshot, attributes: attr })),
			map(({ attributes, title }) => {
				attributes.map(attr => title = title.replace(`%${attr.name}`, attr.value));

				titleService.setTitle(title.replace(AppService.PAGE_ATTR_REGEX, ''));
			})
		).subscribe();

		// Query App Meta
		restService.v2.gql.query<{ meta: { featured_broadcast: string; announcement: string; roles: string[]; }; }>({
			query: `
				query GetMeta() {
					meta() {
						announcement,
						featured_broadcast,
						roles
					}
				}
			`
		}).pipe(
			map(res => res?.body?.data.meta)
		).subscribe({
			next: (res) => {
				this.featuredBroadcast.next(res?.featured_broadcast ?? '');
				this.announcement.next(res?.announcement ?? '');

				// Add roles to data service
				if (Array.isArray(res?.roles)) {
					for (const s of res?.roles as string[]) {
						let role: DataStructure.Role;
						try {
							role = JSON.parse(s);
						} catch (err) {
							console.error('could not parse application roles,', err);
							continue;
						}

						this.dataService.add('role', role);
					}
				}
			}
		});

		this.updateSubscriptionData();
	}

	updateSubscriptionData(): void {
		// EgVault - Payment API State
		scheduled([
			this.restService.egvault.Root().pipe(
				RestService.onlyResponse(),
				tap(() => this.egvaultOK.next(true)),
				catchError(() => defer(() => this.egvaultOK.next(false)))
			),
			this.restService.awaitAuth().pipe(
				filter(ok => ok === true),
				switchMap(() => this.restService.egvault.Subscriptions.Get('@me').pipe(RestService.onlyResponse())),
				tap(res => {
					if (!res.body?.subscription) {
						this.subscription.next(null);
						return undefined;
					}

					res.body.subscription.renew = res.body.renew;
					res.body.subscription.ending_at = new Date(res.body.end_at);
					this.subscription.next(res.body.subscription);
					return undefined;
				}),
				mapTo(undefined)
			)
		], asyncScheduler).pipe(mergeAll()).subscribe({
			error: err => console.error(err)
		});
	}

	/**
	 * Set attributes for the page title
	 */
	pushTitleAttributes(...attr: AppService.PageTitleAttribute[]): void {
		this.pageTitleAttr.next(attr);
	}
}

export namespace AppService {
	export interface PageTitleAttribute {
		name: string;
		value: string;
	}

	export const PAGE_ATTR_REGEX = /(%)([A-Za-z]{0,64})/g;
}

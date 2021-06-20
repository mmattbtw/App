import { Injectable, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, mergeAll, tap } from 'rxjs/operators';
import { RestService } from 'src/app/service/rest.service';

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

	featuredBroadcast = new BehaviorSubject<string>('');
	announcement = new BehaviorSubject<string>('');

	constructor(
		titleService: Title,
		restService: RestService
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

		restService.v2.gql.query<{ meta: { featured_broadcast: string; announcement: string;  }; }>({
			query: `
				query GetMeta() {
					meta() {
						announcement,
						featured_broadcast
					}
				}
			`
		}).pipe(
			map(res => res?.body?.data.meta)
		).subscribe({
			next: (res) => {
				console.log(res);
				this.featuredBroadcast.next(res?.featured_broadcast ?? '');
				this.announcement.next(res?.announcement ?? '');
			}
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

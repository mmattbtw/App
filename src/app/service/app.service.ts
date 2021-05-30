import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { map, mergeAll, tap } from 'rxjs/operators';

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

	contactEmail = 'cupofeggy@gmail.com';

	constructor(
		titleService: Title
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

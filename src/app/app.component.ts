import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivationStart, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { iconList } from 'src/app/icons-register';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { LoggerService } from 'src/app/service/logger.service';
import { RestService } from 'src/app/service/rest.service';
import { ViewportService } from 'src/app/service/viewport.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
	static isBrowser = new BehaviorSubject<boolean | null>(null);

	title = 'seventv-app';
	layoutDisabled = false;

	constructor(
		@Inject(PLATFORM_ID) platformId: any,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		restService: RestService,
		clientService: ClientService,
		loggerService: LoggerService,
		router: Router,
		appService: AppService,
		titleService: Title,
		private overlayRef: OverlayContainer,
		public viewportService: ViewportService
	) {
		// Check if platform is browser
		console.log('PLATFORM', platformId);
		AppComponent.isBrowser.next(isPlatformBrowser(platformId));

		for (const iconRef of iconList) {
			if (AppComponent.isBrowser.getValue() === false) continue;
			iconRegistry.addSvgIcon(
				iconRef[0],
				sanitizer.bypassSecurityTrustResourceUrl(`assets/${iconRef[1]}`)
			);
		}

		// Sign in the user?
		{
			const token = clientService.localStorage.getItem('access_token');
			of(token).pipe(
				filter(x => typeof x === 'string'),
				tap(tok => clientService.setToken(tok)),
				switchMap(() => restService.Users.Get('@me')),
				RestService.onlyResponse(),
				switchMap(res => !!res.body?._id ? of(res) : throwError('Unknown Account')),
				tap(res => clientService.pushData(res.body))
			).subscribe({
				error: err => {
					loggerService.error('Could\'nt sign in as user', err);
					clientService.localStorage.removeItem('access_token');
				}
			});
		}

		// Set page title
		{
			router.events.pipe( // Handle "ActivationStart" router event
				filter(ev => ev instanceof ActivationStart),
				map(ev => ev as ActivationStart),

				// Find variables and omit them from the title.
				// Components can call AppService.pushTitleAttributes() to update them
				tap(ev => {
					const title: string = '7TV - ' + (ev.snapshot.data?.title ?? 'Untitled Page' as string);

					appService.pageTitleSnapshot = String(title);
					titleService.setTitle(`${title?.replace(AppService.PAGE_ATTR_REGEX, '')}`);
				})
			).subscribe();
		}

		this.setTheme();
	}

	ngOnInit(): void {

	}

	setTheme(): void {
		this.overlayRef.getContainerElement().classList.add('theme-dark');
	}
}

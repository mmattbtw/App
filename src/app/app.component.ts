import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivationEnd, ActivationStart, NavigationStart, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
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
	title = 'seventv-app';
	layoutDisabled = false;

	constructor(
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		restService: RestService,
		clientService: ClientService,
		loggerService: LoggerService,
		router: Router,
		private appService: AppService,
		titleService: Title,
		private overlayRef: OverlayContainer,
		public viewportService: ViewportService
	) {
		for (const iconRef of iconList) {
			iconRegistry.addSvgIcon(
				iconRef[0],
				sanitizer.bypassSecurityTrustResourceUrl(`assets/${iconRef[1]}`)
			);
		}

		// Sign in the user?
		{
			const token = localStorage.getItem('access_token');
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
					localStorage.removeItem('access_token');
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
					const matches = title?.match(AppService.PAGE_ATTR_REGEX);

					appService.pageTitleSnapshot = String(title);
					titleService.setTitle(`${title?.replace(AppService.PAGE_ATTR_REGEX, '')}`);
				})
				// map(ev => appService.pageTitleAttr.next(ev.snapshot.data?.title?.attributes))
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

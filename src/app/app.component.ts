import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivationStart, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { iconList } from 'src/app/icons-register';
import { AppService } from 'src/app/service/app.service';
import { UserService } from 'src/app/service/user.service';
import { ViewportService } from 'src/app/service/viewport.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
	static isBrowser = new BehaviorSubject<boolean>(false);

	title = 'seventv-app';
	layoutDisabled = false;

	constructor(
		@Inject(PLATFORM_ID) platformId: any,
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		appService: AppService,
		titleService: Title,
		// tslint:disable-next-line:variable-name
		private _userService: UserService,
		private location: Location,
		private router: Router,
		private overlayRef: OverlayContainer,
		public viewportService: ViewportService
	) {
		// Check if platform is browser
		AppComponent.isBrowser.next(isPlatformBrowser(platformId));

		for (const iconRef of iconList) {
			iconRegistry.addSvgIcon(
				iconRef[0],
				sanitizer.bypassSecurityTrustResourceUrl(`assets/${iconRef[1]}`)
			);
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
		// Navigate to current URL in order to trigger a routing event and update the page title
		this.router.navigateByUrl(this.location.path(true));
	}

	setTheme(): void {
		this.overlayRef.getContainerElement().classList.add('theme-dark');
	}
}

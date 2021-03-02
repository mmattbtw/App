import { OverlayContainer } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { iconList } from 'src/app/icons-register';
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
export class AppComponent {
	title = 'seventv-app';
	layoutDisabled = false;

	constructor(
		iconRegistry: MatIconRegistry,
		sanitizer: DomSanitizer,
		restService: RestService,
		clientService: ClientService,
		loggerService: LoggerService,
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
				switchMap(() => restService.Users.GetCurrent()),
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

		this.setTheme();
	}

	setTheme(): void {
		this.overlayRef.getContainerElement().classList.add('theme-dark');
	}
}

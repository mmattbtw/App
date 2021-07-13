import { Component, Input, OnInit } from '@angular/core';
import { asyncScheduler, defer, EMPTY, scheduled } from 'rxjs';
import { map, mergeAll, switchMap, switchMapTo, tap } from 'rxjs/operators';
import { LoggerService } from 'src/app/service/logger.service';
import { OAuthService } from 'src/app/service/oauth.service';
import { ThemingService } from 'src/app/service/theming.service';
import { ClientService } from 'src/app/service/client.service';
import { RestService } from 'src/app/service/rest.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from 'src/app/util/dialog/error-dialog/error-dialog.component';

@Component({
	selector: 'app-twitch-button',
	templateUrl: './twitch-button.component.html',
	styleUrls: ['./twitch-button.component.scss']
})
export class TwitchButtonComponent implements OnInit {
	@Input() size = 1;

	colors = {
		ripple: this.themingService.colors.twitch_purple.darken(.2).alpha(.4).toString(),
		border: this.themingService.colors.twitch_purple.darken(.115),
		bg: this.themingService.colors.twitch_purple
	};

	constructor(
		private oauthService: OAuthService,
		private logger: LoggerService,
		private clientService: ClientService,
		private restService: RestService,
		private dialogRef: MatDialog,
		public themingService: ThemingService
	) { }

	ngOnInit(): void {
	}

	open(): void {
		scheduled([
			this.oauthService.openAuthorizeWindow<{ token: string }>().pipe(
				tap(data => this.clientService.setToken(data.token)),
				switchMap(() => this.restService.v2.GetUser('@me', { includeEditorIn: true }).pipe(
					map(res => this.clientService.pushData(res?.user ?? null))
				))
			),
			defer(() => this.oauthService.navigateTo(this.restService.v2.GetAuthURL()))
		], asyncScheduler).pipe(
			mergeAll(),
			switchMapTo(EMPTY)
		).subscribe({
			error: (err) => {
				this.dialogRef.open(ErrorDialogComponent, {
					data: {
						errorCode: err.status,
						errorMessage: err.error?.error ?? err.message,
						errorName: 'Could not sign in'
					} as ErrorDialogComponent.Data
				});
				this.logger.error('Could not sign in', err);
				this.clientService.logout();
				this.oauthService.openedWindow?.close();
			}
		});
	}
}

export namespace TwitchButtonComponent {

}

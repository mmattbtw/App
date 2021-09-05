import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { EditorDialogComponent } from 'src/app/navigation/editor-dialog.component';
import { NotifyMenuComponent } from 'src/app/notifications/notify-menu.component';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RestService } from 'src/app/service/rest.service';
import { ThemingService } from 'src/app/service/theming.service';
import { ViewportService } from 'src/app/service/viewport.service';
import { WindowRef } from 'src/app/service/window.service';
import { ChangelogDialogComponent } from 'src/app/util/dialog/changelog/changelog-dialog.component';
import { UserStructure } from 'src/app/util/user.structure';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-navigation',
	templateUrl: './navigation.component.html',
	styleUrls: ['navigation.component.scss']
})
export class NavigationComponent implements OnInit {
	envName = environment.name as 'dev' | 'stage';

	// List of navigation buttons which appear
	// on the right side of the toolbar
	navButtons = [
		{
			name: 'home',
			path: '/',
			icon: 'home'
		},
		{
			name: 'about',
			path: '/about',
			icon: 'info'
		},
		{
			name: 'emotes',
			path: '/emotes',
			icon: 'zulul',
			svg: true
		},
		{
			name: 'subscribe',
			path: '/subscribe',
			color: '#ffaa00',
			icon: 'star',
			conditionOnlyDisables: true,
			condition: this.appService.egvaultOK.pipe(filter(ok => ok === true), take(1), map(x => x as boolean))
		},
		{
			name: 'admin',
			path: '/admin',
			color: this.themingService.primary,
			condition: this.clientService.isAuthenticated().pipe(
				filter(yes => yes),
				switchMap(() => this.clientService.canAccessAdminArea())
			),
			icon: 'build'
		}
	] as NavigationComponent.NavButton[];

	constructor(
		private dialogRef: MatDialog,
		private cdr: ChangeDetectorRef,
		private dialog: MatDialog,
		private overlay: Overlay,
		private localStorage: LocalStorageService,
		private restService: RestService,
		public clientService: ClientService,
		public viewportService: ViewportService,
		public themingService: ThemingService,
		public appService: AppService,
	) { }

	/**
	 * Whether the current environment is production
	 */
	get isEnvironmentProd(): boolean {
		return environment.name === 'production';
	}

	openChangelog(): void {
		this.dialog.open(ChangelogDialogComponent, {
			maxWidth: '64em'
		});
	}

	openNotifyMenu(): void {
		const overlayRef = this.overlay.create({
			panelClass: 'overlay-content-top-right',
			hasBackdrop: false
		});

		const portal = new ComponentPortal(NotifyMenuComponent);
		const component = overlayRef.attach(portal);

		component.instance.closed.pipe(
			take(1)
		).subscribe({
			next(): void {
				overlayRef.detach();
				overlayRef.dispose();
			}
		});
	}

	stopImpersonate(): void {
		this.clientService.impersonating.next(null);
		this.clientService.openSnackBar(`You are no longer acting as an editor`, 'OK', {
			verticalPosition: 'top',
			horizontalPosition: 'left'
		});
		this.localStorage.removeItem('impersonated_user');
	}

	impersonate(): void {
		const dialog = this.dialogRef.open(EditorDialogComponent);

		dialog.afterClosed().pipe(
			filter((editor: UserStructure) => !!editor),
			tap(editor => this.clientService.openSnackBar(`You are now impersonating ${editor.getSnapshot()?.display_name}`, 'OK', {
				verticalPosition: 'top',
				horizontalPosition: 'left'
			})),
			tap(e => this.localStorage.setItem('impersonated_user', e.id)),
			map((editor: UserStructure) => this.clientService.impersonating.next(editor)),
			take(1)
		).subscribe({
			complete: () => this.cdr.markForCheck()
		});
	}

	ngOnInit(): void {
		const impersonatedID = this.localStorage.getItem('impersonated_user');
		this.restService.awaitAuth().pipe(
			take(1),
			filter(ok => impersonatedID?.length === 24 && ok),
			switchMap(() => this.clientService.getEditorIn()),
			map(editors => editors.filter(e => e.id === impersonatedID)[0]),
			filter(u => u instanceof UserStructure),
			tap(u => {
				this.clientService.impersonating.next(u);
			})
		).subscribe();
	}
}

export namespace NavigationComponent {
	export interface NavButton {
		name: string;
		icon: string;
		svg?: boolean;
		path: string;
		selected?: boolean;
		color?: string;
		condition?: Observable<boolean>;
		conditionOnlyDisables?: boolean;
	}
}

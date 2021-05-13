import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { delay, map, switchMap, take } from 'rxjs/operators';
import { EditorDialogComponent } from 'src/app/navigation/editor-dialog.component';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { ViewportService } from 'src/app/service/viewport.service';
import { UserStructure } from 'src/app/util/user.structure';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-navigation',
	templateUrl: './navigation.component.html',
	styleUrls: ['navigation.component.scss']
})
export class NavigationComponent implements OnInit {
	envName: ('dev' | 'stage') = 'dev';

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
			name: 'admin',
			path: '/admin',
			color: this.themingService.primary,
			condition: this.clientService.getRole().pipe(
				delay(0),
				switchMap(() => this.clientService.canAccessAdminArea())
			),
			icon: 'build'
		}
	] as NavigationComponent.NavButton[];

	constructor(
		private dialogRef: MatDialog,
		private cdr: ChangeDetectorRef,
		public clientService: ClientService,
		public viewportService: ViewportService,
		public themingService: ThemingService,
		public appService: AppService,
	) { }

	/**
	 * Whether the current environment is production
	 */
	get isEnvironmentProd(): boolean {
		return environment.production === true;
	}

	/**
	 * @returns whether the client user is an editor of at least one channeml
	 */
	isAnEditor(): Observable<boolean> {
		return this.clientService.getEditorIn().pipe(
			take(1),
			map(a => a.length > 0)
		);
	}

	impersonate(): void {
		const dialog = this.dialogRef.open(EditorDialogComponent);

		dialog.afterClosed().pipe(
			map((editor: UserStructure) => this.clientService.impersonating = editor),
			take(1)
		).subscribe({
			complete: () => this.cdr.markForCheck()
		});
	}

	ngOnInit(): void {}

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
	}
}

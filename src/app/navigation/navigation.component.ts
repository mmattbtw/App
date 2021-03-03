import { Component, OnInit } from '@angular/core';
import { Constants } from '@typings/src/Constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from 'src/app/service/app.service';
import { ClientService } from 'src/app/service/client.service';
import { ThemingService } from 'src/app/service/theming.service';
import { ViewportService } from 'src/app/service/viewport.service';
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
			name: '',
			path: '/admin',
			color: this.themingService.primary,
			condition: this.clientService.getRank().pipe(
				map(rank => rank >= Constants.Users.Rank.MODERATOR ? true : false)
			),
			icon: 'build'
		}
	] as NavigationComponent.NavButton[];

	constructor(
		private clientService: ClientService,
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

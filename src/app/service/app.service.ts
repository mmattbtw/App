import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
	providedIn: 'root'
})

export class AppService {
	title = '7tv.app';
	description = '';
	currentView = '';
	devStage = 'alpha';
	loading = false;

	constructor() {}

}

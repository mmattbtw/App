

import { Injectable } from '@angular/core';
import { LocalStorageService } from 'src/app/service/localstorage.service';

@Injectable({providedIn: 'root'})
export class EmoteListService {
	currentPage = Number(this.localStorage.getItem('el_pagination_page')) ?? 0;
	currentPageSize = Number(this.localStorage.getItem('el_pagination_size')) ?? 0;

	constructor(
		private localStorage: LocalStorageService
	) {}

}

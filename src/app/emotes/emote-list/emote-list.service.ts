

import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class EmoteListService {
	currentPage = Number(localStorage.getItem('el_pagination_page')) ?? 0;
	currentPageSize = Number(localStorage.getItem('el_pagination_size')) ?? 0;

	constructor() {}

}

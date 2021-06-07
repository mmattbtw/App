import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { DataService } from 'src/app/service/data.service';
import { RestService } from 'src/app/service/rest.service';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-admin-users',
	templateUrl: './admin-users.component.html',
	styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
	selectedUser = new BehaviorSubject<UserStructure | null>(null);
	users = new BehaviorSubject<UserStructure[]>([]);
	total = new BehaviorSubject<number>(0);

	searchInput = new FormControl('');

	constructor(
		private restService: RestService,
		private dataService: DataService
	) {}

	search(query = ''): Observable<UserStructure[]> {
		return this.restService.v2.SearchUsers(query).pipe(
			map(res => {
				this.total.next(res.total_size);

				return this.dataService.add('user', ...res.users);
			}),
			tap(users => this.users.next(users))
		);
	}

	onSearchInput(): void {
		this.search(this.searchInput.value).subscribe();
	}

	ngOnInit(): void {
		this.search('').subscribe();
	}

}

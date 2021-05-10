import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserStructure } from 'src/app/util/user.structure';

@Component({
	selector: 'app-admin-users',
	templateUrl: './admin-users.component.html',
	styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
	users = new BehaviorSubject<UserStructure[]>([]);

	constructor() {}

	ngOnInit(): void {}

}
